import Image from "next/image";
import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { artist, skills, workshops, qualifications } from "@/data/artist";
import { connectToDatabase } from "@/lib/mongodb";
import ProductModel from "@/models/Product";

export const dynamic = "force-dynamic";

/* ── Data ─────────────────────────────────────── */
const stats = [
  { value: "5+",                        label: "Years of Practice" },
  { value: String(workshops.length),    label: "Workshops Attended" },
  { value: String(qualifications.length), label: "Qualifications" },
  { value: String(skills.length),       label: "Core Skills" },
];

/* ── Page ─────────────────────────────────────── */
export default async function HomePage() {
  type FeaturedWork = { id: string; title: string; category: string; media: string[] };
  type HeroWork = { id: string; title: string; medium: string; year: string; media: string[] };
  let featuredWorks: FeaturedWork[] = [];
  let heroWork: HeroWork | null = null;
  try {
    await connectToDatabase();
    const [featuredRaw, heroRaw] = await Promise.all([
      ProductModel.find({ featured: true }).sort({ createdAt: -1 }).lean(),
      ProductModel.findOne({ heroProduct: true }).lean(),
    ]);
    featuredWorks = featuredRaw.map((p) => ({
      id: String((p as unknown as { _id: { toString(): string } })._id),
      title: p.title,
      category: p.category,
      media: p.media,
    }));
    if (heroRaw) {
      heroWork = {
        id: String((heroRaw as unknown as { _id: { toString(): string } })._id),
        title: heroRaw.title,
        medium: heroRaw.medium,
        year: heroRaw.year,
        media: heroRaw.media,
      };
    }
  } catch {
    featuredWorks = [];
    heroWork = null;
  }

  const ALLOWED_EMAILS = [
    process.env.NEXT_PUBLIC_OWNER_EMAIL ?? "",
    process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "",
  ].filter(Boolean);
  const viewer = await currentUser();
  const isOwner = ALLOWED_EMAILS.includes(viewer?.emailAddresses[0]?.emailAddress ?? "");

  const processSteps = [
    {
      step: "01",
      title: "Consultation",
      desc: "We discuss your vision, space, budget, and timeline through a relaxed chat or email exchange.",
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      ),
    },
    {
      step: "02",
      title: "Concept & Sketch",
      desc: "Initial sketches and colour studies are shared for your feedback before any final work begins.",
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      ),
    },
    {
      step: "03",
      title: "Creation",
      desc: "The artwork is produced with regular progress updates so you're involved at every stage.",
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      ),
    },
    {
      step: "04",
      title: "Delivery",
      desc: "Your finished piece is carefully packaged and delivered — or available for studio pickup.",
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      ),
    },
  ];

  return (
    <div style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-base)' }} className="overflow-x-hidden">

      {/* ═══════════════════════════════════════
          HERO
      ═══════════════════════════════════════ */}
      <section className="relative min-h-[92vh] flex items-center">
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=1600&q=80"
            alt="Hero artwork"
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
          {/* Theme-aware gradient overlay */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, var(--hero-overlay-from), var(--hero-overlay-mid), transparent)' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, var(--bg-base), transparent, var(--hero-overlay-top))' }} />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <p className="text-[#C8813A] text-sm font-semibold uppercase tracking-[0.3em] mb-4">
            {artist.title}
          </p>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.08] max-w-2xl" style={{ color: 'var(--text-primary)' }}>
            Where Hands<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C8813A] to-[#E8B07A]">
              Speak Art
            </span>
          </h1>
          <p className="mt-6 text-#C8A882 text-lg max-w-lg leading-relaxed">
            I'm <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{artist.name.split(" ")[0]}</span> — a {artist.location}-based {artist.title.toLowerCase()} whose work breathes life through sculpture, painting, and craft. {artist.tagline}
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-[#C8813A] hover:bg-[#D4925A] text-white font-bold px-7 py-3.5 rounded-full shadow-lg shadow-[#C8813A]/30 transition-all duration-200 hover:scale-105"
            >
              Explore Collection
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="/profile"
              className="inline-flex items-center gap-2 border border-[#C8813A]/60 hover:bg-[#C8813A]/10 font-semibold px-7 py-3.5 rounded-full transition-all duration-200"
              style={{ color: 'var(--text-base)' }}
            >
              About the Artist
            </Link>
          </div>

          {/* Scroll cue */}
          <div className="mt-16 flex items-center gap-3 text-xs uppercase tracking-widest" style={{ color: 'var(--text-faint)' }}>
            <div className="w-px h-10 bg-gradient-to-b from-transparent to-[#7A5038]" />
            Scroll to explore
          </div>
        </div>

        {/* Right: floating artwork badge — only render when hero is set OR viewer is owner */}
        {(heroWork || isOwner) && (
        <div className="hidden lg:flex absolute right-12 top-1/2 -translate-y-1/2 z-10 flex-col items-center gap-2">
          {heroWork && heroWork.media[0] ? (
            <Link href={`/products/${heroWork.id}`} className="flex flex-col items-center gap-2 group">
              <div className="w-64 h-80 rounded-2xl overflow-hidden border-2 border-[#C8813A]/40 shadow-2xl rotate-3 group-hover:rotate-0 transition-transform duration-500">
                <Image
                  src={heroWork.media[0]}
                  alt={heroWork.title}
                  width={256}
                  height={320}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="rounded-xl px-4 py-2 text-center backdrop-blur-sm border" style={{ backgroundColor: 'var(--badge-panel-bg)', borderColor: 'var(--border)' }}>
                <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{heroWork.title}</p>
                <p className="text-[#C8813A] text-xs">{heroWork.medium} · {heroWork.year}</p>
              </div>
            </Link>
          ) : isOwner ? (
            <div className="w-64 h-80 rounded-2xl overflow-hidden border-2 border-[#C8813A]/20 shadow-2xl rotate-3 flex items-center justify-center" style={{ backgroundColor: 'var(--bg-card)' }}>
              <p className="text-xs text-center px-4" style={{ color: 'var(--text-muted)' }}>Set a product as Hero<br />from the gallery</p>
            </div>
          ) : null}
        </div>
        )}
      </section>

      {/* ═══════════════════════════════════════
          STATS RIBBON
      ═══════════════════════════════════════ */}
      <section className="transition-colors" style={{ backgroundColor: 'var(--bg-card)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-4xl font-extrabold text-[#C8813A]">{s.value}</p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FEATURED WORKS — only show when data exists OR viewer is owner
      ═══════════════════════════════════════ */}
      {(featuredWorks.length > 0 || isOwner) && (
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <p className="text-[#C8813A] text-sm font-semibold uppercase tracking-widest mb-1">Portfolio</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold" style={{ color: 'var(--text-primary)' }}>Featured Works</h2>
          </div>
          <Link
            href="/products"
            className="text-[#C8813A] hover:text-[#E8B07A] font-semibold text-sm flex items-center gap-1.5 transition-colors"
          >
            View All
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredWorks.length === 0 ? (
            isOwner ? (
            <div className="col-span-3 py-20 text-center" style={{ color: 'var(--text-muted)' }}>
              <svg className="w-12 h-12 mx-auto mb-4 opacity-40" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              <p className="text-lg font-semibold">No featured works yet.</p>
              <p className="text-sm mt-1">Mark products as Featured from the gallery.</p>
            </div>
            ) : null
          ) : (
            featuredWorks.map((p, i) => (
            <Link
              key={p.id}
              href={`/products/${p.id}`}
              className={`group relative rounded-2xl overflow-hidden border border-[#4A2510] shadow-lg hover:border-[#C8813A] hover:shadow-[#C8813A]/20 hover:shadow-xl transition-all duration-300 ${
                i === 0 ? "md:row-span-2" : ""
              }`}
            >
              <div className={`relative overflow-hidden ${i === 0 ? "h-[500px]" : "h-56"}`}>
                {(p.media?.[0]) && (
                <Image
                  src={p.media[0]}
                  alt={p.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A0C04]/90 via-[#1A0C04]/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <span className="text-xs bg-[#C8813A]/90 text-white px-2.5 py-1 rounded-full font-semibold">
                    {p.category}
                  </span>
                  <h3 className="text-white font-bold text-lg mt-2 leading-snug">{p.title}</h3>
                </div>
                {/* hover cta */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="bg-[#C8813A] text-white text-sm font-bold px-5 py-2.5 rounded-full shadow-lg">
                    View Details →
                  </span>
                </div>
              </div>
            </Link>
            ))
          )}
        </div>
      </section>
      )}

      {/* ═══════════════════════════════════════
          ABOUT STRIP
      ═══════════════════════════════════════ */}
      <section className="border-y transition-colors" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Image collage */}
          <div className="relative h-80 lg:h-[420px]">
            <div className="absolute top-0 left-0 w-56 h-72 rounded-2xl overflow-hidden border-2 shadow-xl" style={{ borderColor: 'var(--border)' }}>
              <Image
                src={artist.avatar}
                alt={artist.name}
                fill
                sizes="(max-width: 1024px) 224px, 224px"
                className="object-cover"
              />
            </div>
            <div className="absolute bottom-0 right-0 w-52 h-64 rounded-2xl overflow-hidden border-2 border-[#C8813A]/40 shadow-xl">
              <Image
                src="https://images.unsplash.com/photo-1549490349-8643362247b5?w=600&q=80"
                alt="Studio work"
                fill
                sizes="(max-width: 1024px) 208px, 208px"
                className="object-cover"
              />
            </div>
            {/* Floating badge */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#C8813A] text-white rounded-full w-20 h-20 flex flex-col items-center justify-center shadow-2xl z-10">
              <span className="text-2xl font-extrabold leading-none">BFA</span>
              <span className="text-[10px] font-semibold uppercase tracking-wide">2026</span>
            </div>
          </div>

          {/* Text */}
          <div>
            <p className="text-[#C8813A] text-sm font-semibold uppercase tracking-widest mb-2">The Artist</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight" style={{ color: 'var(--text-primary)' }}>
              Art Born From<br />Passion &amp; Purpose
            </h2>
            <p className="mt-4 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              {artist.bio}
            </p>
            <p className="mt-3 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Based in {artist.location}, her practice spans sculpture, painting, sketching, 3D modelling, and handcrafting —
              united by a deep devotion to authentic expression and the transformative energy of art.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/profile"
                className="bg-[#C8813A] hover:bg-[#D4925A] text-white font-bold px-6 py-3 rounded-full transition-all duration-200 hover:scale-105 shadow-lg shadow-[#C8813A]/20"
              >
                Full Profile
              </Link>
              <Link
                href="/products"
                className="border hover:border-[#C8813A] font-semibold px-6 py-3 rounded-full transition-all duration-200"
                style={{ borderColor: 'var(--border)', color: 'var(--text-base)' }}
              >
                Browse Works
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          COMMISSION PROCESS
      ═══════════════════════════════════════ */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-14">
          <p className="text-[#C8813A] text-sm font-semibold uppercase tracking-widest mb-2">How It Works</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight" style={{ color: 'var(--text-primary)' }}>Commission a Piece</h2>
              <p className="mt-3 max-w-xl mx-auto" style={{ color: 'var(--text-muted)' }}>
            A smooth, personal process from first idea to final delivery — tailored to your vision.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {processSteps.map((step) => (
            <div
              key={step.step}
              className="group rounded-2xl p-6 border transition-all duration-300"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl bg-[#C8813A]/20 border border-[#C8813A]/30 flex items-center justify-center group-hover:bg-[#C8813A]/40 transition-colors">
                  <svg className="w-5 h-5 text-[#C8813A]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    {step.icon}
                  </svg>
                </div>
                <span className="text-3xl font-extrabold text-[#4A2510] group-hover:text-[#5C3A20] transition-colors leading-none">
                  {step.step}
                </span>
              </div>
              <h3 className="font-bold text-base mb-2" style={{ color: 'var(--text-primary)' }}>{step.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{step.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/profile#contact"
            className="inline-flex items-center gap-2 bg-[#C8813A] hover:bg-[#D4925A] text-white font-bold px-8 py-3.5 rounded-full shadow-lg shadow-[#C8813A]/20 transition-all duration-200 hover:scale-105"
          >
            Start a Commission
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SKILLS HIGHLIGHT
      ═══════════════════════════════════════ */}
      <section className="border-t transition-colors" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <p className="text-[#C8813A] text-sm font-semibold uppercase tracking-widest mb-2">Expertise</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight" style={{ color: 'var(--text-primary)' }}>Skills &amp; Craft</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {skills.map((s) => (
              <div key={s.label} className="rounded-2xl p-5 border transition-colors" style={{ backgroundColor: 'var(--bg-base)', borderColor: 'var(--border)' }}>
                <div className="flex items-center justify-between mb-3">
                  <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{s.label}</p>
                  <span className="text-xs font-bold text-[#C8813A]">{s.level}%</span>
                </div>
                <div className="w-full rounded-full h-2" style={{ backgroundColor: 'var(--border)' }}>
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-[#C8813A] to-[#E8B07A] transition-all duration-700"
                    style={{ width: `${s.level}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          CTA BANNER
      ═══════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=1600&q=80"
            alt="CTA background"
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0" style={{ backgroundColor: 'var(--cta-overlay)' }} />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <p className="text-[#C8813A] text-sm font-semibold uppercase tracking-widest mb-3">Ready to Begin?</p>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight">
            Experience the Art of {artist.name.split(" ")[0]}
          </h2>
          <p className="mt-4 text-[#A0785A] text-lg max-w-xl mx-auto">
            Every piece in this collection carries a story, a feeling, a moment. Browse available works or reach out to discuss a commission.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/products"
              className="bg-[#C8813A] hover:bg-[#D4925A] text-white font-bold px-8 py-4 rounded-full shadow-2xl shadow-[#C8813A]/30 transition-all duration-200 hover:scale-105"
            >
              See the Collection
            </Link>
            <Link
              href="/profile"
              className="border border-white/20 hover:border-[#C8813A] text-white font-semibold px-8 py-4 rounded-full transition-all duration-200"
            >
              Meet the Artist
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}

