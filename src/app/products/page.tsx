"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { categories, type Product } from "@/data/products";
import { isVideoUrl } from "@/components/MediaGallery";

const ALLOWED_EMAILS = [
  process.env.NEXT_PUBLIC_OWNER_EMAIL ?? "",
  process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "",
].filter(Boolean);

const emptyForm = {
  title: "",
  category: categories[1],
  medium: "",
  year: "",
  size: "",
  description: "",
  tags: "",
  available: true,
};

export default function ProductsPage() {
  const { user } = useUser();
  const isOwner = ALLOWED_EMAILS.includes(
    user?.primaryEmailAddress?.emailAddress ?? ""
  );

  const [active, setActive] = useState("All");
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [editExistingMedia, setEditExistingMedia] = useState<string[]>([]);
  const [editMediaFiles, setEditMediaFiles] = useState<File[]>([]);
  const [editDragOver, setEditDragOver] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data: unknown) => {
        if (!Array.isArray(data)) return;
        const mapped: Product[] = (data as (Product & { _id: string })[]).map(
          (p) => ({ ...p, id: p._id })
        );
        setAllProducts(mapped);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  function closeModal() {
    setModalOpen(false);
    setForm(emptyForm);
    setMediaFiles([]);
    setDragOver(false);
    setSubmitError("");
  }

  const filtered =
    active === "All"
      ? allProducts
      : allProducts.filter((p) => p.category === active);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError("");
    try {
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("category", form.category);
      fd.append("medium", form.medium);
      fd.append("year", form.year);
      fd.append("size", form.size);
      fd.append("description", form.description);
      fd.append("tags", form.tags);
      fd.append("available", String(form.available));
      for (const file of mediaFiles) fd.append("media", file);

      const res = await fetch("/api/products", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Upload failed");

      const saved = (await res.json()) as Product & { _id: string };
      setAllProducts((prev) => [{ ...saved, id: saved._id }, ...prev]);
      closeModal();
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function openEdit(product: Product) {
    setEditingProduct(product);
    setEditForm({
      title: product.title,
      category: product.category,
      medium: product.medium,
      year: product.year,
      size: product.size,
      description: product.description,
      tags: product.tags.join(", "),
      available: product.available,
    });
    setEditExistingMedia(product.media?.filter((u) => u.trim() !== "") ?? []);
    setEditMediaFiles([]);
    setEditError("");
  }

  function closeEdit() {
    setEditingProduct(null);
    setEditForm(emptyForm);
    setEditExistingMedia([]);
    setEditMediaFiles([]);
    setEditDragOver(false);
    setEditError("");
  }

  async function handleToggle(
    id: string,
    field: "featured" | "showInProfile" | "heroProduct",
    current: boolean
  ) {
    setTogglingId(`${id}-${field}`);
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: !current }),
      });
      if (!res.ok) throw new Error("Toggle failed");
      const updated = (await res.json()) as Product & { _id: string };
      setAllProducts((prev) =>
        prev.map((p) => {
          // heroProduct is exclusive — clear it from all other products
          if (field === "heroProduct" && !current && p.id !== id) {
            return { ...p, heroProduct: false };
          }
          return p.id === id ? { ...updated, id: updated._id } : p;
        })
      );
    } catch (err) {
      console.error("Toggle failed:", err);
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setAllProducts((prev) => prev.filter((p) => p.id !== id));
      setConfirmDeleteId(null);
    } catch {
      // ignore
    } finally {
      setDeletingId(null);
    }
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingProduct) return;
    setEditSubmitting(true);
    setEditError("");
    try {
      const fd = new FormData();
      fd.append("title", editForm.title);
      fd.append("category", editForm.category);
      fd.append("medium", editForm.medium);
      fd.append("year", editForm.year);
      fd.append("size", editForm.size);
      fd.append("description", editForm.description);
      fd.append("tags", editForm.tags);
      fd.append("available", String(editForm.available));
      for (const url of editExistingMedia) fd.append("existingMedia", url);
      for (const file of editMediaFiles) fd.append("media", file);
      const res = await fetch(`/api/products/${editingProduct.id}`, {
        method: "PATCH",
        body: fd,
      });
      if (!res.ok) throw new Error("Update failed");
      const updated = (await res.json()) as Product & { _id: string };
      setAllProducts((prev) =>
        prev.map((p) =>
          p.id === editingProduct.id ? { ...updated, id: updated._id } : p
        )
      );
      closeEdit();
    } catch {
      setEditError("Something went wrong. Please try again.");
    } finally {
      setEditSubmitting(false);
    }
  }

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--bg-base)", color: "var(--text-base)" }}
    >
      {/* Page Header */}
      <div
        className="pt-12 pb-16 relative"
        style={{ background: "var(--section-header-bg)" }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[#C8813A] text-sm font-semibold uppercase tracking-widest mb-2">
            The Collection
          </p>
          <h1
            className="text-4xl sm:text-5xl font-extrabold leading-tight"
            style={{ color: "var(--text-primary)" }}
          >
            Artworks &amp; Gallery
          </h1>
          <p className="mt-3 text-[#A0785A] max-w-xl mx-auto">
            Each piece is a conversation — between colour and silence, form and
            feeling. Browse the full collection below.
          </p>
        </div>
        <div
          className="absolute bottom-0 left-0 right-0 h-8 rounded-t-[40px]"
          style={{ backgroundColor: "var(--bg-base)" }}
        />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {/* Category Filter Tabs */}
        <div className="flex flex-wrap gap-2 justify-center mb-10 -mt-1 pt-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`px-5 py-2 rounded-full text-sm font-semibold border transition-all duration-200 ${
                active === cat
                  ? "bg-[#C8813A] border-[#C8813A] text-white shadow-lg shadow-[#C8813A]/30 scale-105"
                  : "hover:border-[#C8813A]"
              }`}
              style={
                active === cat
                  ? {}
                  : {
                      backgroundColor: "var(--bg-card)",
                      borderColor: "var(--border)",
                      color: "var(--text-muted)",
                    }
              }
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Count + Add button */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-[#7A5038] text-sm">
            Showing{" "}
            <span className="text-[#C8813A] font-semibold">
              {filtered.length}
            </span>{" "}
            {filtered.length === 1 ? "artwork" : "artworks"}
            {active !== "All" && (
              <span>
                {" "}in{" "}
                <span style={{ color: "var(--text-base)" }}>{active}</span>
              </span>
            )}
          </p>
          {isOwner && (
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#C8813A] hover:bg-[#D4925A] text-white text-sm font-semibold shadow-lg shadow-[#C8813A]/30 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Artwork
            </button>
          )}
        </div>

        {/* Gallery Grid */}
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-10 h-10 border-4 border-[#C8813A]/30 border-t-[#C8813A] rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-[#7A5038]">
            <svg
              className="w-12 h-12 mb-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-lg font-semibold">
              No artworks in this category yet.
            </p>
          </div>
        ) : (
          <>
            {openDropdownId && (
              <div
                className="fixed inset-0 z-[15]"
                onClick={() => setOpenDropdownId(null)}
              />
            )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((product) => {
              const coverUrl = product.media?.find((u) => typeof u === "string" && u.trim() !== "");
              const coverIsVideo = coverUrl ? isVideoUrl(coverUrl) : false;
              const mediaCount = product.media?.filter((u) => u && u.trim() !== "").length ?? 0;
              return (
                <div key={product.id} className="relative group">
                <Link
                  href={`/products/${product.id}`}
                  className="block rounded-2xl overflow-hidden border shadow-lg hover:border-[#C8813A] hover:shadow-[#C8813A]/20 hover:shadow-xl transition-all duration-300"
                  style={{
                    borderColor: "var(--border)",
                    backgroundColor: "var(--bg-card)",
                  }}
                >
                  <div className="relative h-56 overflow-hidden bg-[#2A1008]">
                    {coverUrl ? (
                      coverIsVideo ? (
                        <>
                          <video
                            src={coverUrl}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            muted
                            loop
                            playsInline
                          />
                          <div className="absolute top-3 right-3 bg-black/60 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                            Video
                          </div>
                        </>
                      ) : (
                        <Image
                          src={coverUrl}
                          alt={product.title}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      )
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#4A2510]">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1A0C04]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <span className="absolute top-3 left-3 bg-[#C8813A]/90 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                      {product.category}
                    </span>
                    {mediaCount > 1 && (
                      <span className="absolute bottom-3 right-3 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full">
                        +{mediaCount - 1} more
                      </span>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                      <span className="bg-[#C8813A] text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View Details
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3
                      className="font-bold text-base leading-snug group-hover:!text-[#E8B07A] transition-colors line-clamp-1"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {product.title}
                    </h3>
                    <p className="text-[#7A5038] text-xs mt-0.5">
                      {product.medium} · {product.year}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-3">
                      {product.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] px-2 py-0.5 rounded-full border"
                          style={{
                            backgroundColor: "var(--badge-bg)",
                            color: "var(--text-muted)",
                            borderColor: "var(--border)",
                          }}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
                {isOwner && (
                  <div
                    className="absolute top-2 right-2 z-20"
                  >
                    <button
                      onClick={(e) => { e.stopPropagation(); setOpenDropdownId(openDropdownId === product.id ? null : product.id); }}
                      className="w-8 h-8 rounded-full bg-black/55 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-sm transition-all shadow-lg cursor-pointer"
                      title="Options"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                      </svg>
                    </button>
                    {openDropdownId === product.id && (
                      <div
                        className="absolute right-0 top-10 w-52 rounded-xl shadow-2xl border overflow-hidden z-50"
                        style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}
                      >
                        {/* Edit */}
                        <button
                          onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); openEdit(product); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-[#C8813A]/10 hover:text-[#C8813A] cursor-pointer"
                          style={{ color: "var(--text-primary)" }}
                        >
                          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit Artwork
                        </button>
                        {/* Featured toggle */}
                        <button
                          onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); handleToggle(product.id, "featured", !!product.featured); }}
                          disabled={togglingId === `${product.id}-featured`}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-[#C8813A]/10 hover:text-[#C8813A] disabled:opacity-50 cursor-pointer"
                          style={{ color: product.featured ? "#C8813A" : "var(--text-primary)" }}
                        >
                          <svg className="w-4 h-4 shrink-0" fill={product.featured ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                          {product.featured ? "Remove from Featured" : "Add to Featured"}
                        </button>
                        {/* Profile toggle */}
                        <button
                          onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); handleToggle(product.id, "showInProfile", !!product.showInProfile); }}
                          disabled={togglingId === `${product.id}-showInProfile`}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-indigo-500/10 hover:text-indigo-400 disabled:opacity-50 cursor-pointer"
                          style={{ color: product.showInProfile ? "rgb(129,140,248)" : "var(--text-primary)" }}
                        >
                          <svg className="w-4 h-4 shrink-0" fill={product.showInProfile ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          {product.showInProfile ? "Remove from Profile" : "Add to Profile"}
                        </button>
                        {/* Hero toggle */}
                        <button
                          onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); handleToggle(product.id, "heroProduct", !!product.heroProduct); }}
                          disabled={togglingId === `${product.id}-heroProduct`}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-amber-500/10 hover:text-amber-400 disabled:opacity-50 cursor-pointer"
                          style={{ color: product.heroProduct ? "rgb(251,191,36)" : "var(--text-primary)" }}
                        >
                          <svg className="w-4 h-4 shrink-0" fill={product.heroProduct ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                          </svg>
                          {product.heroProduct ? "Remove from Hero" : "Set as Hero"}
                        </button>
                        {/* Divider */}
                        <div className="h-px mx-3 my-1" style={{ backgroundColor: "var(--border)" }} />
                        {/* Delete */}
                        <button
                          onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); setConfirmDeleteId(product.id); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                        >
                          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}
                </div>
              );
            })}
          </div>
          </>
        )}
      </div>

      {/* ── Add Artwork Modal ── */}
      {isOwner && modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
        >
          <div
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl"
            style={{
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border)",
            }}
          >
            {/* Modal Header */}
            <div
              className="flex items-center justify-between px-6 py-4"
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                Add New Artwork
              </h2>
              <button
                onClick={closeModal}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#C8813A]/20 transition-colors"
                style={{ color: "var(--text-muted)" }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Title */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-muted)" }}>Title *</label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Echoes of the Sahara"
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#C8813A] transition"
                  style={{ backgroundColor: "var(--bg-base)", border: "1px solid var(--border)", color: "var(--text-base)" }}
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-muted)" }}>Category *</label>
                <select
                  required
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#C8813A] transition"
                  style={{ backgroundColor: "var(--bg-base)", border: "1px solid var(--border)", color: "var(--text-base)" }}
                >
                  {categories.filter((c) => c !== "All").map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Medium */}
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-muted)" }}>Medium *</label>
                <input
                  required
                  value={form.medium}
                  onChange={(e) => setForm({ ...form, medium: e.target.value })}
                  placeholder="e.g. Oil on Canvas"
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#C8813A] transition"
                  style={{ backgroundColor: "var(--bg-base)", border: "1px solid var(--border)", color: "var(--text-base)" }}
                />
              </div>

              {/* Year */}
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-muted)" }}>Year *</label>
                <input
                  required
                  value={form.year}
                  onChange={(e) => setForm({ ...form, year: e.target.value })}
                  placeholder="e.g. 2025"
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#C8813A] transition"
                  style={{ backgroundColor: "var(--bg-base)", border: "1px solid var(--border)", color: "var(--text-base)" }}
                />
              </div>

              {/* Size */}
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-muted)" }}>Size</label>
                <input
                  value={form.size}
                  onChange={(e) => setForm({ ...form, size: e.target.value })}
                  placeholder='e.g. 24" × 18"'
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#C8813A] transition"
                  style={{ backgroundColor: "var(--bg-base)", border: "1px solid var(--border)", color: "var(--text-base)" }}
                />
              </div>

              {/* Media Upload */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-muted)" }}>
                  Images &amp; Videos
                </label>
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    const files = Array.from(e.dataTransfer.files).filter(
                      (f) => f.type.startsWith("image/") || f.type.startsWith("video/")
                    );
                    setMediaFiles((prev) => [...prev, ...files]);
                  }}
                  onClick={() => document.getElementById("media-upload")?.click()}
                  className={`flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
                    dragOver ? "bg-[#C8813A]/10" : "hover:bg-[#C8813A]/5"
                  }`}
                  style={{ borderColor: dragOver ? "#C8813A" : "var(--border)" }}
                >
                  <svg className="w-8 h-8" style={{ color: "var(--text-muted)" }} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  <p className="text-sm font-medium" style={{ color: "var(--text-base)" }}>
                    Drop files here or <span className="text-[#C8813A] font-semibold">browse</span>
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    JPG, PNG, WEBP, GIF · MP4, MOV, WEBM — multiple files allowed
                  </p>
                  <input
                    id="media-upload"
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      const files = Array.from(e.target.files ?? []);
                      setMediaFiles((prev) => [...prev, ...files]);
                      e.target.value = "";
                    }}
                  />
                </div>

                {/* Previews */}
                {mediaFiles.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {mediaFiles.map((file, i) => {
                      const url = URL.createObjectURL(file);
                      const isVideo = file.type.startsWith("video/");
                      return (
                        <div
                          key={i}
                          className="relative group rounded-lg overflow-hidden border"
                          style={{ borderColor: "var(--border)", aspectRatio: "1" }}
                        >
                          {isVideo ? (
                            <video src={url} className="w-full h-full object-cover" muted />
                          ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={url} alt={file.name} className="w-full h-full object-cover" />
                          )}
                          {isVideo && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <svg className="w-6 h-6 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setMediaFiles((prev) => prev.filter((_, j) => j !== i)); }}
                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                          <span className="absolute bottom-0 left-0 right-0 text-[9px] px-1 py-0.5 truncate bg-black/60 text-white">
                            {isVideo ? "▶ " : ""}{file.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Tags */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-muted)" }}>
                  Tags <span className="font-normal">(comma separated)</span>
                </label>
                <input
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  placeholder="e.g. abstract, warm, landscape"
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#C8813A] transition"
                  style={{ backgroundColor: "var(--bg-base)", border: "1px solid var(--border)", color: "var(--text-base)" }}
                />
              </div>

              {/* Description */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-muted)" }}>Description *</label>
                <textarea
                  required
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe this artwork..."
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#C8813A] transition resize-none"
                  style={{ backgroundColor: "var(--bg-base)", border: "1px solid var(--border)", color: "var(--text-base)" }}
                />
              </div>

              {/* Available toggle */}
              <div className="sm:col-span-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, available: !form.available })}
                  className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${form.available ? "bg-[#C8813A]" : "bg-[#4A2510]"}`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
                      form.available ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
                <span className="text-sm font-medium" style={{ color: "var(--text-base)" }}>
                  {form.available ? "Available for purchase" : "Not available"}
                </span>
              </div>

              {/* Error */}
              {submitError && (
                <p className="sm:col-span-2 text-sm text-red-400">{submitError}</p>
              )}

              {/* Actions */}
              <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={submitting}
                  className="px-5 py-2 rounded-lg text-sm font-semibold border transition-colors"
                  style={{ backgroundColor: "var(--bg-base)", borderColor: "var(--border)", color: "var(--text-muted)" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-6 py-2 rounded-lg bg-[#C8813A] hover:bg-[#D4925A] text-white text-sm font-semibold transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Uploading…
                    </>
                  ) : (
                    "Save Artwork"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {confirmDeleteId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
        >
          <div
            className="w-full max-w-sm rounded-2xl shadow-2xl p-6"
            style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
          >
            <h2 className="text-lg font-bold mb-2" style={{ color: "var(--text-primary)" }}>
              Delete Artwork
            </h2>
            <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
              Are you sure you want to delete this artwork? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                disabled={!!deletingId}
                className="flex-1 py-2 rounded-lg text-sm font-semibold border transition-colors"
                style={{ backgroundColor: "var(--bg-base)", borderColor: "var(--border)", color: "var(--text-muted)" }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                disabled={!!deletingId}
                className="flex-1 inline-flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold bg-red-500 hover:bg-red-600 text-white transition-colors disabled:opacity-60"
              >
                {deletingId ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Deleting…
                  </>
                ) : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Artwork Modal ── */}
      {isOwner && editingProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
        >
          <div
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl"
            style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-6 py-4"
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                Edit Artwork
              </h2>
              <button
                onClick={closeEdit}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#C8813A]/20 transition-colors"
                style={{ color: "var(--text-muted)" }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleEditSubmit} className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-muted)" }}>Title *</label>
                <input required value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} placeholder="e.g. Echoes of the Sahara" className="w-full px-3 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#C8813A] transition" style={{ backgroundColor: "var(--bg-base)", border: "1px solid var(--border)", color: "var(--text-base)" }} />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-muted)" }}>Category *</label>
                <select required value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} className="w-full px-3 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#C8813A] transition" style={{ backgroundColor: "var(--bg-base)", border: "1px solid var(--border)", color: "var(--text-base)" }}>
                  {categories.filter((c) => c !== "All").map((c) => (<option key={c} value={c}>{c}</option>))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-muted)" }}>Medium *</label>
                <input required value={editForm.medium} onChange={(e) => setEditForm({ ...editForm, medium: e.target.value })} placeholder="e.g. Oil on Canvas" className="w-full px-3 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#C8813A] transition" style={{ backgroundColor: "var(--bg-base)", border: "1px solid var(--border)", color: "var(--text-base)" }} />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-muted)" }}>Year *</label>
                <input required value={editForm.year} onChange={(e) => setEditForm({ ...editForm, year: e.target.value })} placeholder="e.g. 2025" className="w-full px-3 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#C8813A] transition" style={{ backgroundColor: "var(--bg-base)", border: "1px solid var(--border)", color: "var(--text-base)" }} />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-muted)" }}>Size</label>
                <input value={editForm.size} onChange={(e) => setEditForm({ ...editForm, size: e.target.value })} placeholder='e.g. 24" × 18"' className="w-full px-3 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#C8813A] transition" style={{ backgroundColor: "var(--bg-base)", border: "1px solid var(--border)", color: "var(--text-base)" }} />
              </div>

              {/* Current media */}
              {editExistingMedia.length > 0 && (
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-muted)" }}>Current Media</label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {editExistingMedia.map((url, i) => {
                      const isVid = isVideoUrl(url);
                      return (
                        <div key={i} className="relative group rounded-lg overflow-hidden border" style={{ borderColor: "var(--border)", aspectRatio: "1" }}>
                          {isVid ? (
                            <video src={url} className="w-full h-full object-cover" muted />
                          ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={url} alt={`media ${i + 1}`} className="w-full h-full object-cover" />
                          )}
                          <button type="button" onClick={() => setEditExistingMedia((prev) => prev.filter((_, j) => j !== i))} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Add more media */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-muted)" }}>
                  Add More Images &amp; Videos
                </label>
                <div
                  onDragOver={(e) => { e.preventDefault(); setEditDragOver(true); }}
                  onDragLeave={() => setEditDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setEditDragOver(false);
                    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/") || f.type.startsWith("video/"));
                    setEditMediaFiles((prev) => [...prev, ...files]);
                  }}
                  onClick={() => document.getElementById("edit-media-upload")?.click()}
                  className={`flex flex-col items-center justify-center gap-2 p-5 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${editDragOver ? "bg-[#C8813A]/10" : "hover:bg-[#C8813A]/5"}`}
                  style={{ borderColor: editDragOver ? "#C8813A" : "var(--border)" }}
                >
                  <svg className="w-7 h-7" style={{ color: "var(--text-muted)" }} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  <p className="text-sm font-medium" style={{ color: "var(--text-base)" }}>
                    Drop files or <span className="text-[#C8813A] font-semibold">browse</span>
                  </p>
                  <input id="edit-media-upload" type="file" accept="image/*,video/*" multiple className="hidden" onChange={(e) => { const files = Array.from(e.target.files ?? []); setEditMediaFiles((prev) => [...prev, ...files]); e.target.value = ""; }} />
                </div>
                {editMediaFiles.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {editMediaFiles.map((file, i) => {
                      const url = URL.createObjectURL(file);
                      const isVideo = file.type.startsWith("video/");
                      return (
                        <div key={i} className="relative group rounded-lg overflow-hidden border" style={{ borderColor: "var(--border)", aspectRatio: "1" }}>
                          {isVideo ? (
                            <video src={url} className="w-full h-full object-cover" muted />
                          ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={url} alt={file.name} className="w-full h-full object-cover" />
                          )}
                          <button type="button" onClick={() => setEditMediaFiles((prev) => prev.filter((_, j) => j !== i))} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-muted)" }}>
                  Tags <span className="font-normal">(comma separated)</span>
                </label>
                <input value={editForm.tags} onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })} placeholder="e.g. abstract, warm, landscape" className="w-full px-3 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#C8813A] transition" style={{ backgroundColor: "var(--bg-base)", border: "1px solid var(--border)", color: "var(--text-base)" }} />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-muted)" }}>Description *</label>
                <textarea required rows={3} value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} placeholder="Describe this artwork..." className="w-full px-3 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#C8813A] transition resize-none" style={{ backgroundColor: "var(--bg-base)", border: "1px solid var(--border)", color: "var(--text-base)" }} />
              </div>

              <div className="sm:col-span-2 flex items-center gap-3">
                <button type="button" onClick={() => setEditForm({ ...editForm, available: !editForm.available })} className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${editForm.available ? "bg-[#C8813A]" : "bg-[#4A2510]"}`}>
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${editForm.available ? "translate-x-5" : "translate-x-0"}`} />
                </button>
                <span className="text-sm font-medium" style={{ color: "var(--text-base)" }}>
                  {editForm.available ? "Available for purchase" : "Not available"}
                </span>
              </div>

              {editError && (
                <p className="sm:col-span-2 text-sm text-red-400">{editError}</p>
              )}

              <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeEdit} disabled={editSubmitting} className="px-5 py-2 rounded-lg text-sm font-semibold border transition-colors" style={{ backgroundColor: "var(--bg-base)", borderColor: "var(--border)", color: "var(--text-muted)" }}>
                  Cancel
                </button>
                <button type="submit" disabled={editSubmitting} className="inline-flex items-center gap-2 px-6 py-2 rounded-lg bg-[#C8813A] hover:bg-[#D4925A] text-white text-sm font-semibold transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed">
                  {editSubmitting ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Saving…
                    </>
                  ) : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
