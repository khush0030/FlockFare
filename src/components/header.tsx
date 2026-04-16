import Link from "next/link";

export type AuthUser = {
  displayName: string | null;
  email: string | null;
  avatarUrl: string | null;
} | null;

export function Header({
  activePage,
  user,
}: {
  activePage?: "deals" | "home" | "profile" | "preferences";
  user?: AuthUser;
}) {
  const initials = user?.displayName
    ? user.displayName
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
        <Link href="/preferences" className={activePage === "preferences" ? "active" : ""}>
          Preferences
        </Link>
        {user && (
          <Link href="/profile" className={activePage === "profile" ? "active" : ""}>
            Profile
          </Link>
        )}
      </div>
      {user ? (
        <Link href="/profile" className="nav-avatar-link">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
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
