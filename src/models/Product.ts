import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProduct extends Document {
  title: string;
  category: string;
  medium: string;
  year: string;
  size: string;
  description: string;
  media: string[];
  tags: string[];
  available: boolean;
  featured: boolean;
  showInProfile: boolean;
  heroProduct: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    title: { type: String, required: true },
    category: { type: String, required: true },
    medium: { type: String, required: true },
    year: { type: String, required: true },
    size: { type: String, default: "" },
    description: { type: String, required: true },
    media: [{ type: String }],
    tags: [{ type: String }],
    available: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
    showInProfile: { type: Boolean, default: false },
    heroProduct: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// In development, delete the cached model on every hot-reload so schema
// changes (like new fields) are always picked up by Mongoose.
if (process.env.NODE_ENV !== "production") {
  delete (mongoose.models as Record<string, unknown>).Product;
}

const ProductModel: Model<IProduct> =
  mongoose.models.Product ??
  mongoose.model<IProduct>("Product", ProductSchema);

export default ProductModel;
