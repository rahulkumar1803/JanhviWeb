"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import { Show, SignInButton } from "@clerk/nextjs";
import { useUser, useClerk } from "@clerk/nextjs";
import Image from "next/image";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Profile", href: "/profile" },
  { label: "Products", href: "/products" },
];

function UserMenu() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (!user) return null;

  const initials = [user.firstName, user.lastName]
    .filter(Boolean)
    .map((n) => n![0].toUpperCase())
    .join("") || user.emailAddresses[0]?.emailAddress[0].toUpperCase() || "U";

  return (
    <div ref={ref} className="relative">
      {/* Avatar trigger */}
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-9 h-9 rounded-full overflow-hidden border-2 border-[#C8813A] hover:border-[#D4925A] transition-colors focus:outline-none focus:ring-2 focus:ring-[#C8813A] cursor-pointer"
        aria-label="User menu"
        aria-expanded={open}
      >
        {user.imageUrl ? (
          <Image src={user.imageUrl} alt={initials} width={36} height={36} className="object-cover w-full h-full" />
        ) : (
          <span className="flex items-center justify-center w-full h-full bg-[#C8813A] text-white text-sm font-bold">
            {initials}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 mt-2 w-64 rounded-2xl shadow-2xl z-50 overflow-hidden"
          style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
        >
          {/* Name + email */}
          <div className="px-4 py-4 flex items-center gap-3" style={{ borderBottom: "1px solid var(--border)" }}>
            <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-[#C8813A]">
              {user.imageUrl ? (
                <Image src={user.imageUrl} alt={initials} width={40} height={40} className="object-cover w-full h-full" />
              ) : (
                <span className="flex items-center justify-center w-full h-full bg-[#C8813A] text-white text-sm font-bold">
                  {initials}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                {user.fullName || user.username || "User"}
              </p>
              <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                {user.emailAddresses[0]?.emailAddress}
              </p>
            </div>
          </div>

          {/* Sign out */}
          <div className="p-2">
            <button
              onClick={() => { setOpen(false); signOut({ redirectUrl: "/" }); }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors hover:bg-[#C8813A]/15 cursor-pointer"
              style={{ color: "var(--text-base)" }}
            >
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
              </svg>
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
    <header className="shadow-lg sticky top-0 z-50 transition-colors" style={{ backgroundColor: 'var(--bg-nav)', borderBottom: '1px solid var(--border)' }}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo — left */}
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-9 h-9 rounded-full bg-[#C8813A] flex items-center justify-center shadow-md group-hover:bg-[#D4925A] transition-colors">
              <span className="text-white font-extrabold text-lg leading-none">B</span>
            </div>
            <span className="font-bold text-xl tracking-wide transition-colors" style={{ color: 'var(--accent-light)' }}>
              BrownCo
            </span>
          </Link>

          {/* Desktop nav links + avatar — right */}
          <ul className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="relative font-medium px-4 py-2 rounded-lg transition-all duration-200 after:absolute after:bottom-1 after:left-4 after:right-4 after:h-[2px] after:rounded-full after:transition-transform after:duration-200"
                  style={{
                    color: pathname === link.href ? '#C8813A' : 'var(--text-base)',
                    ...(pathname === link.href ? {} : {}),
                  }}
                >
                  {link.label}
                </Link>
              </li>
            ))}

            {/* Theme toggle */}
            <li>
              <ThemeToggle />
            </li>

            {/* Auth controls */}
            <Show when="signed-out">
              <li>
                <SignInButton mode="modal">
                  <button className="ml-2 px-4 py-2 rounded-full text-sm font-bold bg-[#C8813A] hover:bg-[#D4925A] text-white transition-all duration-200 cursor-pointer">
                    Sign In
                  </button>
                </SignInButton>
              </li>
            </Show>
            <Show when="signed-in">
              <li className="ml-3">
                <UserMenu />
              </li>
            </Show>
          </ul>

          {/* Hamburger — mobile */}
          <div className="md:hidden flex items-center gap-3">
            <button
              className="flex flex-col justify-center items-center gap-1.5 w-9 h-9 rounded-lg transition-colors"
              style={{ color: 'var(--text-base)' }}
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
            >
              <span
                className={`block w-5 h-0.5 bg-[#E8CCAA] rounded transition-all duration-300 ${
                  menuOpen ? "rotate-45 translate-y-2" : ""
                }`}
              />
              <span
                className={`block w-5 h-0.5 bg-[#E8CCAA] rounded transition-all duration-300 ${
                  menuOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`block w-5 h-0.5 bg-[#E8CCAA] rounded transition-all duration-300 ${
                  menuOpen ? "-rotate-45 -translate-y-2" : ""
                }`}
              />
            </button>
          </div>
        </div>

        {/* Mobile nav dropdown */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ${
            menuOpen ? "max-h-80 pb-4" : "max-h-0"
          }`}
        >
          <ul className="flex flex-col gap-1 pt-2">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="block font-medium px-4 py-2.5 rounded-lg transition-colors"
                  style={{ color: pathname === link.href ? '#C8813A' : 'var(--text-base)' }}
                >
                  {link.label}
                </Link>
              </li>
            ))}

            {/* Mobile auth row */}
            <Show when="signed-out">
              <li className="mt-1" style={{ borderTop: '1px solid var(--border)' }}>
                <SignInButton mode="modal">
                  <button className="w-full text-left px-4 py-2.5 text-sm font-bold text-[#C8813A] cursor-pointer">
                    Sign In
                  </button>
                </SignInButton>
              </li>
            </Show>
            <Show when="signed-in">
              <li className="mt-1 px-4 py-2.5" style={{ borderTop: '1px solid var(--border)' }}>
                <UserMenu />
              </li>
            </Show>
          </ul>
        </div>
      </nav>
    </header>

    </>
  );
}
