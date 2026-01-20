/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

const DOMAIN = "https://vnuitsolutions.com";

// Page configuration with SEO metadata
const pages = [
  {
    path: "/",
    priority: 1.0,
    changefreq: "weekly",
    title: "VnU IT Solutions - Technology, AI & Talent Solutions",
    image: "/og-image.png",
  },
  {
    path: "/services",
    priority: 0.9,
    changefreq: "monthly",
    title: "IT Services & Software Development",
    image: "/assets/hero-services.jpg",
  },
  {
    path: "/ai-consulting",
    priority: 0.9,
    changefreq: "monthly",
    title: "AI Consulting & Machine Learning Solutions",
    image: "/assets/hero-consulting.jpg",
  },
  {
    path: "/talent-solutions",
    priority: 0.9,
    changefreq: "monthly",
    title: "IT Talent Solutions & Staff Augmentation",
    image: "/assets/hero-talent.jpg",
  },
  {
    path: "/nowrise-institute",
    priority: 0.8,
    changefreq: "monthly",
    title: "NowRise Institute - IT Training & Skill Development",
    image: "/assets/hero-nowrise.jpg",
  },
  {
    path: "/careers",
    priority: 0.8,
    changefreq: "weekly",
    title: "Careers at VnU IT Solutions",
    image: "/assets/hero-careers.jpg",
  },
  {
    path: "/about",
    priority: 0.7,
    changefreq: "monthly",
    title: "About VnU IT Solutions",
  },
  {
    path: "/contact",
    priority: 0.7,
    changefreq: "monthly",
    title: "Contact VnU IT Solutions",
  },
];

function getCurrentDate(): string {
  return new Date().toISOString().split("T")[0];
}

function generateSitemap(): string {
  const lastmod = getCurrentDate();

  const urlEntries = pages
    .map((page) => {
      const imageTag = page.image
        ? `
    <image:image>
      <image:loc>${DOMAIN}${page.image}</image:loc>
      <image:title>${escapeXml(page.title)}</image:title>
    </image:image>`
        : "";

      return `  <url>
    <loc>${DOMAIN}${page.path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>${imageTag}
  </url>`;
    })
    .join("\n\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  
${urlEntries}

</urlset>`;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  try {
    const sitemap = generateSitemap();

    return new Response(sitemap, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
        "Access-Control-Allow-Origin": "*",
        "X-Robots-Tag": "noindex",
      },
    });
  } catch (error) {
    console.error("Sitemap generation error:", error);
    return new Response("Error generating sitemap", {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
  }
});
