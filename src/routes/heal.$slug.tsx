import { createFileRoute, redirect } from "@tanstack/react-router";
import { getDisease } from "@/lib/diseases";

// Old Heal goal pages now live under Disease Management. Redirect by slug;
// "weight" goes to the dedicated Weight Loss section.
export const Route = createFileRoute("/heal/$slug")({
  beforeLoad: ({ params }) => {
    if (params.slug === "weight") {
      throw redirect({ to: "/section/weight-loss" });
    }
    if (getDisease(params.slug)) {
      throw redirect({ to: "/disease/$slug", params: { slug: params.slug } });
    }
    throw redirect({ to: "/section/disease" });
  },
});
