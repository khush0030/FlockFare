"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

export function Header({
  activePage,
}: {
  activePage?: "deals" | "home" | "profile" | "preferences";
}) {
  const { data: session } = useSession();
  const user = session?.user;

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : null;

  return (
    <nav className="ff-nav">
      <Link href="/" className="nav-logo">
        Flock<span>Fare</span>
      </Link>
      <div className="nav-links">
        <Link href="/deals" className={activePage === "deals" ? "active" : ""}>
          Deals
        </Link>
        {user ? (
          <>
            <Link href="/preferences" className={activePage === "preferences" ? "active" : ""}>
              Preferences
            </Link>
            <Link href="/profile" className={activePage === "profile" ? "active" : ""}>
              Profile
            </Link>
          </>
        ) : (
          <>
            <Link href="/#join">Pricing</Link>
            <Link href="/#proof">About</Link>
          </>
        )}
      </div>
      {user ? (
        <Link href="/profile" className="nav-avatar-link">
          {user.image ? (
            <img
              src={user.image}
              alt=""
              width={34}
              height={34}
              style={{ borderRadius: "50%", border: "2px solid var(--color-cream)" }}
            />
          ) : (
            <span className="nav-avatar-circle">{initials ?? "?"}</span>
          )}
        </Link>
      ) : (
        <Link href="/login" className="nav-cta">
          Sign in →
        </Link>
      )}
    </nav>
  );
}
