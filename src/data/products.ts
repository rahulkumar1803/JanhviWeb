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

export const products: Product[] = [
  {
    id: "1",
    title: "Echoes of the Sahara",
    category: "Oil",
    medium: "Oil on Canvas",
    year: "2025",
    size: '48" × 36"',
    description:
      "A sweeping panorama of golden dunes at dusk, capturing the silent grandeur of the Sahara. Rendered in rich ochres, deep sienna, and burnt amber, this large-scale oil painting evokes solitude, wonder, and the passage of time. The layered impasto technique gives the surface a textured, almost tactile quality.",
    media: ["https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&q=80"],
    tags: ["landscape", "desert", "warm tones"],
    available: true,
  },
  {
    id: "2",
    title: "Urban Reverie",
    category: "Digital",
    medium: "Digital Illustration",
    year: "2025",
    size: "A2 print",
    description:
      "A dreamlike cityscape where skyscrapers dissolve into painterly brushstrokes. Created entirely in Procreate, this piece blurs the line between photography and painting. Available as a limited edition archival-quality print, signed and numbered.",
    media: ["https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=800&q=80"],
    tags: ["city", "digital", "surreal"],
    available: true,
  },
  {
    id: "3",
    title: "Fractured Light",
    category: "Mixed Media",
    medium: "Mixed Media on Board",
    year: "2024",
    size: '36" × 24"',
    description:
      "Shards of mirror, acrylic paint, and hand-torn newspaper collide in this mixed-media composition. The reflective fragments create shifting patterns of light depending on the viewer's position, making each encounter with the artwork unique.",
    media: ["https://images.unsplash.com/photo-1549490349-8643362247b5?w=800&q=80"],
    tags: ["abstract", "light", "collage"],
    available: true,
  },
  {
    id: "4",
    title: "Roots & Ruins",
    category: "Watercolour",
    medium: "Watercolour on Paper",
    year: "2024",
    size: '30" × 22"',
    description:
      "An ancient banyan tree entwines with crumbling stone walls in this delicate watercolour. Soft washes of green, terracotta, and grey build a sense of history and quiet resilience. Framed in reclaimed teak wood.",
    media: ["https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800&q=80"],
    tags: ["nature", "architecture", "soft"],
    available: false,
  },
  {
    id: "5",
    title: "Silent Corridor",
    category: "Photography",
    medium: "Fine Art Photography",
    year: "2023",
    size: "A1 print",
    description:
      "Captured at the abandoned Palermo train station, this long-exposure photograph transforms an eerie corridor into a poem of light and shadow. Printed on Hahnemühle Photo Rag paper, it carries a certificate of authenticity.",
    media: ["https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=800&q=80"],
    tags: ["photography", "light", "architecture"],
    available: true,
  },
  {
    id: "6",
    title: "The Weight of Gold",
    category: "Oil",
    medium: "Oil on Linen",
    year: "2023",
    size: '60" × 48"',
    description:
      "A monumental figurative painting exploring themes of burden and ambition. A solitary figure stands beneath a rain of golden coins, face lifted. The contrast of earthy flesh tones against the luminous gold creates a powerful visual tension.",
    media: ["https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=800&q=80"],
    tags: ["figurative", "gold", "conceptual"],
    available: true,
  },
  {
    id: "7",
    title: "Woven Horizons",
    category: "Craft",
    medium: "Hand-woven Textile",
    year: "2024",
    size: '40" × 30"',
    description:
      "A hand-woven wall hanging crafted from natural linen, raw wool, and silk threads in deep browns, rusts, and creams. Inspired by the texture of desert sand dunes, each horizontal band shifts slightly in tone, evoking a setting sun over an open landscape.",
    media: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80"],
    tags: ["textile", "handmade", "warm"],
    available: true,
  },
  {
    id: "8",
    title: "Ceramic Vessel Series I",
    category: "Craft",
    medium: "Stoneware Ceramic",
    year: "2024",
    size: "32 cm height",
    description:
      "A set of three hand-thrown stoneware vessels with a matte ash glaze. The organic forms reference ancient pottery traditions while maintaining a clean, modern silhouette. Each piece is unique — no two are identical.",
    media: ["https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&q=80"],
    tags: ["ceramic", "handmade", "vessel"],
    available: true,
  },
  {
    id: "9",
    title: "Rain on Glass",
    category: "Watercolour",
    medium: "Watercolour on Paper",
    year: "2023",
    size: '24" × 18"',
    description:
      "Raindrops streak a window pane, distorting the city lights beyond into neon halos. The fluid nature of watercolour was used intentionally here — wet-on-wet bleeds mimic the actual blurring of rain on glass.",
    media: ["https://images.unsplash.com/photo-1501139083538-0139583c060f?w=800&q=80"],
    tags: ["rain", "urban", "moody"],
    available: false,
  },
  {
    id: "10",
    title: "Neon Botanic",
    category: "Digital",
    medium: "Digital Illustration",
    year: "2025",
    size: "A2 print",
    description:
      "Tropical foliage rendered in electric neon against a pitch-black canvas. A vibrant collision between the natural world and synthetic light. Available as a limited run of 20 archival prints.",
    media: ["https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&q=80"],
    tags: ["digital", "neon", "botanical"],
    available: true,
  },
  {
    id: "11",
    title: "Harbour at Dawn",
    category: "Oil",
    medium: "Oil on Canvas",
    year: "2023",
    size: '40" × 30"',
    description:
      "Fishing boats bob gently in a misty harbour as the first light of day breaks. The restrained palette — pearl greys, rose blush, and soft gold — captures the quiet magic of early morning on the water.",
    media: ["https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=800&q=80"],
    tags: ["seascape", "dawn", "impressionist"],
    available: true,
  },
  {
    id: "12",
    title: "Paper Garden",
    category: "Craft",
    medium: "Paper Sculpture",
    year: "2025",
    size: 'Approx. 20" × 16" × 4"',
    description:
      "An intricate three-dimensional garden scene created from hand-cut and folded paper. Hundreds of individual paper flowers, leaves, and butterflies are arranged in a shadow box frame, lit from behind to create a glowing, ethereal effect.",
    media: ["https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=800&q=80"],
    tags: ["paper", "sculpture", "3D"],
    available: true,
  },
];
