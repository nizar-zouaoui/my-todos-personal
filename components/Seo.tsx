import Head from "next/head";
import { useRouter } from "next/router";

const DEFAULT_TITLE = "Taskflow - Daily Planner";
const DEFAULT_DESCRIPTION =
  "A cozy daily planner for your tasks, notes, and gentle reminders.";

const getSiteUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl && envUrl.length > 0) return envUrl.replace(/\/$/, "");
  return "http://localhost:3000";
};

type SeoProps = {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  noIndex?: boolean;
};

export default function Seo({
  title,
  description,
  canonical,
  ogImage,
  noIndex = false,
}: SeoProps) {
  const router = useRouter();
  const siteUrl = getSiteUrl();
  const path = router.asPath ? router.asPath.split("?")[0] : "";
  const resolvedTitle = title || DEFAULT_TITLE;
  const resolvedDescription = description || DEFAULT_DESCRIPTION;
  const resolvedCanonical = canonical || `${siteUrl}${path}`;
  const resolvedOgImage = ogImage
    ? ogImage.startsWith("http")
      ? ogImage
      : `${siteUrl}${ogImage}`
    : `${siteUrl}/favicon.ico`;

  return (
    <Head>
      <title>{resolvedTitle}</title>
      <meta name="description" content={resolvedDescription} />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"
      />
      <link rel="canonical" href={resolvedCanonical} />
      <link rel="icon" href="/favicon.ico" />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      <meta property="og:title" content={resolvedTitle} />
      <meta property="og:description" content={resolvedDescription} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content={resolvedOgImage} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={resolvedTitle} />
      <meta name="twitter:description" content={resolvedDescription} />
      <meta name="twitter:image" content={resolvedOgImage} />
    </Head>
  );
}
