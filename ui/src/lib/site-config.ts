import { env } from "@/env.mjs";

export const siteConfig = {
  title: "AI HR Assistant",
  description:
    "AI HR Assistant",
  keywords: ["Next.js", "TypeScript", "Tailwind CSS", "Next-auth"],
  url: env.NEXT_PUBLIC_BACKEND_URL,
  // googleSiteVerificationId: env.GOOGLE_SITE_VERIFICATION_ID || "",
};
