import Link from "next/link";

export function Header({
  activePage,
}: {
  activePage?: "deals" | "home";
}) {
  return (
    <nav className="ff-nav">
      <Link href="/" className="nav-logo">
        Flock<span>Fare</span>
      </Link>
      <div className="nav-links">
        <Link href="/deals" className={activePage === "deals" ? "active" : ""}>
          Deals
        </Link>
        <Link href="/#how">How it works</Link>
        <Link href="/#join">Pro</Link>
        <Link href="/#proof">About</Link>
      </div>
      <Link href="/#join" className="nav-cta">
        Join the flock →
      </Link>
    </nav>
  );
}
