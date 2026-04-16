import Image from "next/image";
import Link from "next/link";

export function Header({ variant = "dark" }: { variant?: "dark" | "light" }) {
  const isDark = variant === "dark";

  return (
    <header
      className={`border-b-4 ${
        isDark
          ? "bg-ink text-cream border-cream/20"
          : "bg-cream text-ink border-ink"
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/">
          <Image
            src={
              isDark
                ? "/logos/lockup-horizontal-reversed.svg"
                : "/logos/lockup-horizontal.svg"
            }
            alt="FlockFare"
            width={130}
            height={30}
          />
        </Link>
        <nav className="flex gap-5 items-center">
          <Link
            href="/deals"
            className={`font-display font-bold text-sm no-underline ${
              isDark ? "text-cream hover:text-lime" : "text-ink hover:text-violet"
            }`}
          >
            Deals
          </Link>
          <Link
            href="#join"
            className="inline-flex items-center gap-2 font-display font-bold text-sm px-4 py-2 rounded-full border-4 border-ink bg-lime text-ink shadow-brut-sm no-underline transition-transform duration-[120ms] ease-[var(--ease-ff-out)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-brut"
          >
            Join the flock
          </Link>
        </nav>
      </div>
    </header>
  );
}
