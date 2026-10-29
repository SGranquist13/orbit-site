// Resolves a capture by filename from src/assets/raw. A planned shot that has not been captured yet
// (see "Shot list" in FEATURES-AUDIT.md) resolves to a labelled placeholder so the build keeps working.
import type { ImageMetadata } from "astro";
import placeholder from "../assets/placeholder-shot.png";

const raw = import.meta.glob<{ default: ImageMetadata }>("../assets/raw/*.png", { eager: true });

export const isPending = (name: string): boolean => !raw[`../assets/raw/${name}`];

export const shot = (name: string): ImageMetadata => {
  const m = raw[`../assets/raw/${name}`];
  if (m) return m.default;
  console.warn(`[shots] pending capture, showing placeholder: ${name}`);
  return placeholder as unknown as ImageMetadata;
};
