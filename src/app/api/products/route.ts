import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/mongodb";
import ProductModel from "@/models/Product";
import cloudinary from "@/lib/cloudinary";

const ALLOWED_EMAILS = [
  process.env.NEXT_PUBLIC_OWNER_EMAIL ?? "",
  process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "",
].filter(Boolean);

async function isAllowed(): Promise<boolean> {
  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress ?? "";
  return ALLOWED_EMAILS.includes(email);
}

function uploadToCloudinary(
  buffer: Buffer,
  resourceType: "image" | "video"
): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: resourceType, folder: "artgallery" },
      (error, result) => {
        if (error || !result) reject(error ?? new Error("Upload failed"));
        else resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const filter: Record<string, boolean> = {};
    if (searchParams.get("featured") === "true") filter.featured = true;
    if (searchParams.get("profile") === "true") filter.showInProfile = true;
    const products = await ProductModel.find(filter).sort({ createdAt: -1 }).lean();
    return NextResponse.json(products);
  } catch {
    // Always return an array so the client-side .map() never throws
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  if (!(await isAllowed()))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    await connectToDatabase();

    const formData = await request.formData();

    const title = formData.get("title") as string;
    const category = formData.get("category") as string;
    const medium = formData.get("medium") as string;
    const year = formData.get("year") as string;
    const size = (formData.get("size") as string) || "";
    const description = formData.get("description") as string;
    const tagsStr = (formData.get("tags") as string) || "";
    const available = formData.get("available") === "true";

    const mediaFiles = formData.getAll("media") as File[];
    const mediaUrls: string[] = [];

    for (const file of mediaFiles) {
      if (file && file.size > 0) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const resourceType = file.type.startsWith("video/") ? "video" : "image";
        const url = await uploadToCloudinary(buffer, resourceType);
        mediaUrls.push(url);
      }
    }

    const product = await ProductModel.create({
      title,
      category,
      medium,
      year,
      size,
      description,
      media: mediaUrls,
      tags: tagsStr
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      available,
    });

    return NextResponse.json(product, { status: 201 });
  } catch (err) {
    console.error("Error creating product:", err);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
