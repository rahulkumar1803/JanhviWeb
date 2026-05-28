import Image from "next/image";
import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { artist, skills, qualifications, workshops } from "@/data/artist";
import { connectToDatabase } from "@/lib/mongodb";
import ProductModel from "@/models/Product";

/* ─── Sub-components ─────────────────────────────────────── */

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <span className="w-1 h-7 rounded-full bg-[#C8813A] inline-block" />
      <h2 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>{children}</h2>
    </div>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl p-6 ${className}`} style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      {children}
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────── */
export default async function ProfilePage() {
  type RecentWork = { id: string; title: string; medium: string; year: string; media: string[] };
  let recentWorks: RecentWork[] = [];
  try {
    await connectToDatabase();
    const raw = await ProductModel.find({ showInProfile: true }).sort({ createdAt: -1 }).lean();
    recentWorks = raw.map((p) => ({
      id: String((p as unknown as { _id: { toString(): string } })._id),
      title: p.title,
      medium: p.medium,
      year: p.year,
      media: p.media,
    }));
  } catch {
    recentWorks = [];
  }

  const ALLOWED_EMAILS = [
    process.env.NEXT_PUBLIC_OWNER_EMAIL ?? "",
    process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "",
  ].filter(Boolean);
  const viewer = await currentUser();
  const isOwner = ALLOWED_EMAILS.includes(viewer?.emailAddresses[0]?.emailAddress ?? "");

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-base)' }}>

      {/* ── Hero / Cover ── */}
      <section className="relative" style={{ background: 'var(--section-header-bg)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-20">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full ring-4 ring-[#C8813A] overflow-hidden shadow-2xl">
                <Image
                  src={artist.avatar}
                  alt={artist.name}
                  width={160}
                  height={160}
                  className="object-cover w-full h-full"
                  priority
                />
              </div>
              {/* Online badge */}
              <span className="absolute bottom-2 right-2 w-4 h-4 bg-green-400 rounded-full ring-2 ring-[#3B1F0E]" />
            </div>

            {/* Name & title */}
            <div className="text-center sm:text-left">
              <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight" style={{ color: 'var(--text-primary)' }}>
                {artist.name}
              </h1>
              <p className="mt-1 text-[#C8813A] font-semibold text-lg">{artist.title}</p>
              <p className="mt-2 italic max-w-xl" style={{ color: 'var(--text-muted)' }}>"{artist.tagline}"</p>
              <div className="mt-4 flex flex-wrap justify-center sm:justify-start gap-3">
                <span className="flex items-center gap-1.5 text-sm px-3 py-1 rounded-full" style={{ color: 'var(--text-base)', backgroundColor: 'var(--badge-bg)' }}>
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                  </svg>
                  {artist.location}
                </span>
                <span className="flex items-center gap-1.5 text-sm px-3 py-1 rounded-full" style={{ color: 'var(--text-base)', backgroundColor: 'var(--badge-bg)' }}>
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                  </svg>
                  {artist.email}
                </span>
              </div>
            </div>
          </div>
        </div>
        {/* bottom wave */}
        <div className="absolute bottom-0 left-0 right-0 h-8 rounded-t-[40px]" style={{ backgroundColor: 'var(--bg-base)' }} />
      </section>

      {/* ── Main Content ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 space-y-14">

        {/* ── Bio + Personal Details ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bio */}
          <Card className="lg:col-span-2">
            <SectionTitle>About Me</SectionTitle>
            <p className="leading-relaxed" style={{ color: 'var(--text-muted)' }}>{artist.bio}</p>

            {/* Skills */}
            <div className="mt-6">
              <h3 className="font-semibold mb-4 text-sm uppercase tracking-widest" style={{ color: 'var(--text-primary)' }}>Skills &amp; Expertise</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {skills.map((s) => (
                  <div key={s.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span style={{ color: 'var(--text-base)' }}>{s.label}</span>
                      <span className="text-[#C8813A] font-medium">{s.level}%</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--track-bg)' }}>
                      <div
                        className="h-full bg-gradient-to-r from-[#C8813A] to-[#E8B07A] rounded-full"
                        style={{ width: `${s.level}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Personal Details */}
          <Card>
            <SectionTitle>Personal Details</SectionTitle>
            <ul className="space-y-3 text-sm">
              {[
                { label: "Date of Birth", value: artist.dob },
                { label: "Nationality", value: artist.nationality },
                { label: "Location", value: artist.location },
                { label: "Languages", value: artist.languages.join(", ") },
                { label: "Website", value: artist.website },
              ].map((item) => (
                <li key={item.label} className="flex flex-col gap-0.5 border-b pb-3 last:border-0" style={{ borderColor: 'var(--border)' }}>
                  <span className="uppercase tracking-wider text-xs" style={{ color: 'var(--text-faint)' }}>{item.label}</span>
                  <span className="font-medium" style={{ color: 'var(--text-base)' }}>{item.value}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* — Recent Works — only show when data exists OR viewer is owner */}
        {(recentWorks.length > 0 || isOwner) && (
        <section>
          <SectionTitle>Recent Works</SectionTitle>
          {recentWorks.length === 0 ? (
            isOwner ? (
            <div className="py-16 text-center" style={{ color: 'var(--text-muted)' }}>
              <svg className="w-12 h-12 mx-auto mb-4 opacity-40" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-lg font-semibold">No works added to profile yet.</p>
              <p className="text-sm mt-1">Mark products as Profile from the gallery.</p>
            </div>
            ) : null
          ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {recentWorks.map((work) => (
              <Link
                key={work.id}
                href={`/products/${work.id}`}
                className="group relative rounded-2xl overflow-hidden border shadow-lg cursor-pointer"
                style={{ borderColor: 'var(--border)' }}>
                <div className="relative h-56">
                  {(work.media?.[0]) && (
                  <Image
                    src={work.media[0]}
                    alt={work.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  )}
                  {/* overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1A0C04]/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <p className="text-white font-bold text-base leading-tight">{work.title}</p>
                    <p className="text-[#C8813A] text-sm">{work.medium} · {work.year}</p>
                  </div>
                </div>
                <div className="px-4 py-3" style={{ backgroundColor: 'var(--bg-card)' }}>
                  <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-base)' }}>{work.title}</p>
                  <p className="text-xs" style={{ color: 'var(--text-faint)' }}>{work.medium} · {work.year}</p>
                </div>
              </Link>
            ))}
          </div>
          )}
        </section>
        )}

        {/* ── Qualifications ── */}
        <section>
          <SectionTitle>Education & Qualifications</SectionTitle>
          <div className="space-y-4">
            {qualifications.map((q, i) => (
              <Card key={i} className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="shrink-0 w-12 h-12 rounded-xl border border-[#C8813A]/40 flex items-center justify-center" style={{ backgroundColor: 'var(--badge-bg)' }}>
                  <svg className="w-6 h-6 text-[#C8813A]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0v6m-4-3.5l4 2 4-2" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>{q.degree}</h3>
                    <span className="text-xs bg-[#C8813A]/20 text-[#C8813A] px-2 py-0.5 rounded-full border border-[#C8813A]/30">
                      {q.year}
                    </span>
                  </div>
                  <p className="text-[#C8813A] text-sm font-medium mt-0.5">{q.institution}</p>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{q.desc}</p>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* ── Workshops ── */}
        <section>
          <SectionTitle>Workshops</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {workshops.map((w, i) => (
              <Card key={i} className="flex items-start gap-4 py-4">
                <div className="shrink-0 w-9 h-9 rounded-full bg-[#C8813A]/20 flex items-center justify-center border border-[#C8813A]/30">
                  <svg className="w-5 h-5 text-[#C8813A]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{w.title}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{w.org} · {w.year}</p>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* ── Contact Details ── */}
        <section>
          <SectionTitle>Contact</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                ),
                label: "Email",
                value: artist.email,
                href: `mailto:${artist.email}`,
              },
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                ),
                label: "Phone",
                value: artist.phone,
                href: `tel:${artist.phone}`,
              },
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z M4 6a2 2 0 100-4 2 2 0 000 4z"/>
                ),
                label: "LinkedIn",
                value: "@" + artist.linkedin.split("/in/").pop(),
                href: artist.linkedin,
              },
              {
                icon: (
                  <>
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" strokeWidth={2}/>
                    <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" strokeWidth={2}/>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" strokeWidth={2} strokeLinecap="round"/>
                  </>
                ),
                label: "Instagram",
                value: "@" + artist.instagram.split("instagram.com/").pop(),
                href: artist.instagram,
              },
            ].map((c) => (
              <a
                key={c.label}
                href={c.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group block"
              >
                <Card className="flex flex-col items-center text-center gap-3 hover:border-[#C8813A] hover:bg-[var(--badge-bg)] transition-all duration-200">
                  <div className="w-11 h-11 rounded-full bg-[#C8813A]/20 flex items-center justify-center border border-[#C8813A]/30 group-hover:bg-[#C8813A]/40 transition-colors">
                    <svg className="w-5 h-5 text-[#C8813A]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                      {c.icon}
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-faint)' }}>{c.label}</p>
                    <p className="text-sm font-medium mt-0.5 break-all" style={{ color: 'var(--text-base)' }}>{c.value}</p>
                  </div>
                </Card>
              </a>
            ))}
          </div>
        </section>
      </div>

    </div>
  );
}
