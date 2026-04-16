import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex-1 flex items-center justify-center bg-coral-tint">
      <div className="text-center px-6 py-20 max-w-md">
        <Image
          src="/mascots/penny-confused-404-600.png"
          alt="Penny confused"
          width={240}
          height={240}
          className="mx-auto"
        />
        <h1 className="font-display font-black text-[3.75rem] leading-none tracking-[-0.03em] mt-6">
          404
        </h1>
        <p className="font-display font-bold text-xl mt-3">
          This page flew off.
        </p>
        <p className="text-ffgray-500 mt-2">
          Penny looked everywhere but couldn&apos;t find it. Let&apos;s go back to the nest.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-display font-bold text-base mt-8 px-6 py-3 rounded-full border-4 border-ink bg-violet text-cream shadow-brut no-underline transition-transform duration-[120ms] ease-[var(--ease-ff-out)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-brut-lg active:translate-x-[3px] active:translate-y-[3px] active:shadow-brut-sm"
        >
          Back to home &rarr;
        </Link>
      </div>
    </main>
  );
}
