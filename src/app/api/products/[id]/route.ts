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

interface RouteContext {
  params: Promise<{ id: string }>;
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

export async function PUT(request: Request, { params }: RouteContext) {
  if (!(await isAllowed()))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  try {
    await connectToDatabase();
    const body = (await request.json()) as {
      featured?: boolean;
      showInProfile?: boolean;
      heroProduct?: boolean;
    };
    // heroProduct is exclusive — unset all others first
    if (body.heroProduct === true) {
      await ProductModel.updateMany({}, { heroProduct: false });
    }
    const updated = await ProductModel.findByIdAndUpdate(id, body, {
      returnDocument: 'after',
    }).lean();
    if (!updated)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (err) {
    console.error("Error toggling product flag:", err);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  if (!(await isAllowed()))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  try {
    await connectToDatabase();
    await ProductModel.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error deleting product:", err);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  if (!(await isAllowed()))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
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

    const existingMedia = formData.getAll("existingMedia") as string[];

    const newFiles = formData.getAll("media") as File[];
    const newUrls: string[] = [];
    for (const file of newFiles) {
      if (file && file.size > 0) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const resourceType = file.type.startsWith("video/") ? "video" : "image";
        const url = await uploadToCloudinary(buffer, resourceType);
        newUrls.push(url);
      }
    }

    const updated = await ProductModel.findByIdAndUpdate(
      id,
      {
        title,
        category,
        medium,
        year,
        size,
        description,
        media: [...existingMedia, ...newUrls],
        tags: tagsStr
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        available,
      },
      { returnDocument: 'after' }
    ).lean();

    if (!updated) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updated);
  } catch (err) {
    console.error("Error updating product:", err);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}
