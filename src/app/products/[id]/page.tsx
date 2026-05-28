import Link from "next/link";
import { notFound } from "next/navigation";
import { connectToDatabase } from "@/lib/mongodb";
import ProductModel from "@/models/Product";
import MediaGallery from "@/components/MediaGallery";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getProduct(id: string) {
  await connectToDatabase();
  try {
    const product = await ProductModel.findById(id).lean();
    return product;
  } catch {
    return null;
  }
}

async function getRelated(category: string, excludeId: string) {
  await connectToDatabase();
  try {
    return await ProductModel.find({ category, _id: { $ne: excludeId } })
      .limit(3)
      .lean();
  } catch {
    return [];
  }
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  const productId = String(product._id);
  const related = await getRelated(product.category, productId);
  const media: string[] = product.media ?? [];

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--bg-base)", color: "var(--text-base)" }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-[#7A5038] mb-8">
          <Link href="/" className="hover:text-[#C8813A] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-[#C8813A] transition-colors">Products</Link>
          <span>/</span>
          <span className="text-[#C8A882] truncate max-w-xs">{product.title}</span>
        </nav>

        {/* Main Detail Card */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Media Gallery */}
          <div className="relative">
            <MediaGallery media={media} title={product.title} />
            <div className="absolute top-4 right-4 bg-[#C8813A]/90 text-white text-xs font-semibold px-3 py-1.5 rounded-full z-20 pointer-events-none">
              {product.category}
            </div>
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight" style={{ color: "var(--text-primary)" }}>
                {product.title}
              </h1>
              {!product.available && (
                <span className="flex-shrink-0 mt-1 text-xs font-semibold px-3 py-1 rounded-full bg-[#4A2510] text-[#C8A882]">Sold</span>
              )}
            </div>
            <p className="text-[#A0785A] font-medium mt-1">{product.medium}</p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              {[
                { label: "Year", value: product.year },
                { label: "Size", value: product.size },
                { label: "Medium", value: product.medium },
                { label: "Category", value: product.category },
              ].filter((item) => item.value).map((item) => (
                <div key={item.label} className="rounded-xl px-4 py-3 border" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
                  <p className="text-xs uppercase tracking-wider" style={{ color: "var(--text-faint)" }}>{item.label}</p>
                  <p className="font-semibold text-sm mt-0.5" style={{ color: "var(--text-base)" }}>{item.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <h3 className="font-semibold mb-2 text-sm uppercase tracking-wider" style={{ color: "var(--text-primary)" }}>About this piece</h3>
              <p className="text-[#A0785A] leading-relaxed text-sm">{product.description}</p>
            </div>

            <div className="flex flex-wrap gap-2 mt-5">
              {product.tags.map((tag) => (
                <span key={tag} className="text-xs px-3 py-1 rounded-full border" style={{ backgroundColor: "var(--badge-bg)", color: "var(--text-muted)", borderColor: "var(--border)" }}>
                  #{tag}
                </span>
              ))}
            </div>

            {media.length > 1 && (
              <p className="mt-4 text-xs text-[#7A5038]">{media.length} media files � use the gallery to explore all</p>
            )}
          </div>
        </div>

        {/* Related Works */}
        {related.length > 0 && (
          <section className="mt-16">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-1 h-7 rounded-full bg-[#C8813A] inline-block" />
              <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>More in {product.category}</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((rel) => {
                const relCover = rel.media?.find((u: string) => u && u.trim() !== "");
                const relIsVideo = relCover && (relCover.includes("/video/upload/") || /\.(mp4|mov|webm)(\?|$)/i.test(relCover));
                return (
                  <Link
                    key={String(rel._id)}
                    href={`/products/${String(rel._id)}`}
                    className="group block rounded-2xl overflow-hidden border shadow-lg hover:border-[#C8813A] transition-all duration-300"
                    style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}
                  >
                    <div className="relative h-48 overflow-hidden bg-[#2A1008]">
                      {relCover && (relIsVideo ? (
                        <video src={relCover} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" muted />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={relCover} alt={rel.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      ))}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-sm group-hover:!text-[#E8B07A] transition-colors line-clamp-1" style={{ color: "var(--text-primary)" }}>{rel.title}</h3>
                      <p className="text-[#7A5038] text-xs mt-0.5">{rel.medium} � {rel.year}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        <div className="mt-12">
          <Link href="/products" className="inline-flex items-center gap-2 text-[#C8813A] hover:text-[#E8B07A] font-semibold transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to All Products
          </Link>
        </div>
      </div>
    </div>
  );
}
