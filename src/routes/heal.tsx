import { createFileRoute, redirect } from "@tanstack/react-router";

// The Heal hub was merged into Disease Management — its condition content now
// lives in src/lib/diseases.ts. Kept as a redirect so old links/bookmarks work.
export const Route = createFileRoute("/heal")({
  beforeLoad: () => {
    throw redirect({ to: "/section/disease" });
  },
});
