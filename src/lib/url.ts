/** Prefix a public/ path with the configured base (GitHub Pages deploys under /repo/). */
export const asset = (path: string) =>
  `${import.meta.env.BASE_URL.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
