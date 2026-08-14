"use client";

import Image from "next/image";
import { useState } from "react";

type BrandLogoProps = {
  /** Logo.dev URL (or any other external image URL) — primary source */
  logoSrc?: string | null;
  /** Brand color used for the monogram fallback */
  color: string;
  /** Used for the monogram fallback letter */
  name: string;
  /** Tile size in px (square) */
  size?: number;
  className?: string;
  /** Override radius (default rounded-[10px]) */
  rounded?: string;
  /** Optional alt text (defaults to "{name} logo") */
  alt?: string;
};

/**
 * Renders a brand logo from Logo.dev (or any image URL) in a clean
 * neutral tile. Falls back to a colored monogram on error or when
 * no logo URL is provided.
 *
 * Tile is intentionally neutral (not brand-colored) — the logo image
 * already carries the brand's color, so a colored frame would make the
 * logo disappear into the background.
 */
export default function BrandLogo({
  logoSrc,
  color,
  name,
  size = 40,
  className,
  rounded = "rounded-[10px]",
  alt,
}: BrandLogoProps) {
  const [errored, setErrored] = useState(false);
  const letter = (name.trim().charAt(0) || "?").toUpperCase();
  const altText = alt ?? `${name} logo`;

  if (logoSrc && !errored) {
    return (
      <span
        className={`inline-flex shrink-0 items-center justify-center overflow-hidden bg-clay-100 ${rounded} ${className ?? ""}`}
        style={{ width: size, height: size }}
        aria-hidden
      >
        <Image
          src={logoSrc}
          alt={altText}
          width={size}
          height={size}
          unoptimized
          className="block object-contain"
          style={{ width: size * 0.7, height: size * 0.7 }}
          onError={() => setErrored(true)}
        />
      </span>
    );
  }

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center font-display font-bold text-white ${rounded} ${className ?? ""}`}
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        fontSize: size * 0.45,
        lineHeight: 1,
      }}
      aria-label={altText}
    >
      {letter}
    </span>
  );
}
