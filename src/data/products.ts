export type Product = {
  id: string;
  _id?: string;
  title: string;
  category: string;
  medium: string;
  year: string;
  size: string;
  description: string;
  media: string[];
  tags: string[];
  available: boolean;
  featured?: boolean;
  showInProfile?: boolean;
  heroProduct?: boolean;
};

export const categories = [
  "All",
  "Oil",
  "Watercolour",
  "Digital",
  "Mixed Media",
  "Craft",
  "Photography",
];
