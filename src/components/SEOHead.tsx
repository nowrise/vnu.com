import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import logoImage from "../assets/logo.png";

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  noIndex?: boolean;
  articlePublishedTime?: string;
  articleModifiedTime?: string;
}

const defaultMeta = {
  title: "VnU IT Solutions - Enterprise Software, AI Consulting & Talent Solutions",
  description: "VnU IT Solutions delivers enterprise software development, AI consulting, and talent solutions. Transform your business with cutting-edge technology.",
  keywords: "IT solutions, software development, AI consulting, talent solutions, enterprise software, digital transformation, Gurugram, India",
  ogImage: "https://vnuitsolutions.com/og-image.png",
};

const pageMeta: Record<string, { title: string; description: string; keywords?: string }> = {
  "/": {
    title: "VnU IT Solutions - Enterprise Software, AI Consulting & Talent Solutions",
    description: "VnU IT Solutions delivers enterprise software development, AI consulting, and talent solutions. Transform your business with cutting-edge technology.",
    keywords: "IT solutions, software development, AI consulting, talent solutions, enterprise software, digital transformation",
  },
  "/services": {
    title: "IT Services & Software Development | VnU IT Solutions",
    description: "Comprehensive IT services including custom software development, cloud solutions, DevOps, and enterprise application development. Get a free consultation.",
    keywords: "IT services, software development, cloud solutions, DevOps, enterprise applications, custom software, web development India",
  },
  "/ai-consulting": {
    title: "AI Consulting & Machine Learning Solutions | VnU IT Solutions",
    description: "Expert AI consulting services. Implement machine learning, natural language processing, and intelligent automation to transform your business operations.",
    keywords: "AI consulting, machine learning, NLP, intelligent automation, artificial intelligence, AI solutions India, ML development",
  },
  "/talent-solutions": {
    title: "IT Talent Solutions & Staff Augmentation | VnU IT Solutions",
    description: "Access top IT talent with our staff augmentation services. Hire skilled developers, engineers, and tech professionals for your projects.",
    keywords: "talent solutions, staff augmentation, IT hiring, tech talent, software developers, contract developers India",
  },
  "/nowrise-institute": {
    title: "NowRise Institute - IT Training & Skill Development | VnU",
    description: "Professional IT training programs. Learn software development, cloud computing, and emerging technologies. Industry-ready curriculum with placement support.",
    keywords: "IT training, skill development, software training, tech education, programming courses, coding bootcamp India",
  },
  "/careers": {
    title: "Careers at VnU IT Solutions | Join Our Team",
    description: "Explore exciting career opportunities at VnU IT Solutions. Join a team of innovative professionals building the future of technology.",
    keywords: "IT careers, tech jobs, software developer jobs, VnU careers, IT jobs Gurugram",
  },
  "/about": {
    title: "About VnU IT Solutions | Our Mission & Values",
    description: "Learn about VnU IT Solutions, our mission to deliver innovative technology solutions, and our commitment to client success since 2023.",
    keywords: "about VnU, IT company, technology partner, company values, Vriddhion Udaanex",
  },
  "/contact": {
    title: "Contact VnU IT Solutions | Get in Touch",
    description: "Contact VnU IT Solutions for your technology needs. Reach out for consultations, partnerships, or inquiries. Based in Gurugram, serving globally.",
    keywords: "contact VnU, IT consultation, get in touch, technology partner, Gurugram IT company",
  },
};

export const SEOHead = ({ 
  title, 
  description, 
  keywords, 
  ogImage,
  noIndex = false,
  articlePublishedTime,
  articleModifiedTime,
}: SEOHeadProps) => {
  const location = useLocation();
  const pathname = location.pathname;
  
  const currentPageMeta = pageMeta[pathname];
  const finalTitle = title || currentPageMeta?.title || defaultMeta.title;
  const finalDescription = description || currentPageMeta?.description || defaultMeta.description;
  const finalKeywords = keywords || currentPageMeta?.keywords || defaultMeta.keywords;
  const finalOgImage = ogImage || defaultMeta.ogImage;
  const canonicalUrl = `https://vnuitsolutions.com${pathname === "/" ? "" : pathname}`;

  useEffect(() => {
    // Update document title
    document.title = finalTitle;
    
    // Update meta tags
    const updateMeta = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? "property" : "name";
      let meta = document.querySelector(`meta[${attr}="${name}"]`);
      if (meta) {
        meta.setAttribute("content", content);
      } else {
        meta = document.createElement("meta");
        meta.setAttribute(attr, name);
        meta.setAttribute("content", content);
        document.head.appendChild(meta);
      }
    };

    const updateLink = (rel: string, href: string, type?: string) => {
      let link = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
      if (link) {
        link.href = href;
        if (type) link.type = type;
      } else {
        link = document.createElement("link");
        link.rel = rel;
        link.href = href;
        if (type) link.type = type;
        document.head.appendChild(link);
      }
    };

    const removeMeta = (name: string, isProperty = false) => {
      const attr = isProperty ? "property" : "name";
      const meta = document.querySelector(`meta[${attr}="${name}"]`);
      if (meta) meta.remove();
    };

    // Update canonical
    updateLink("canonical", canonicalUrl);

    // Update favicon and logo links
    updateLink("icon", "/favicon.ico", "image/x-icon");
    updateLink("apple-touch-icon", logoImage);
    updateLink("shortcut icon", "/favicon.ico");

    // Standard meta tags
    updateMeta("description", finalDescription);
    updateMeta("keywords", finalKeywords);
    
    // Robots directive
    const robotsContent = noIndex 
      ? "noindex, nofollow" 
      : "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1";
    updateMeta("robots", robotsContent);
    updateMeta("googlebot", robotsContent);

    // Open Graph - Enhanced
    updateMeta("og:title", finalTitle, true);
    updateMeta("og:description", finalDescription, true);
    updateMeta("og:url", canonicalUrl, true);
    updateMeta("og:image", finalOgImage, true);
    updateMeta("og:image:width", "1200", true);
    updateMeta("og:image:height", "630", true);
    updateMeta("og:image:alt", finalTitle, true);
    updateMeta("og:type", "website", true);
    updateMeta("og:site_name", "VnU IT Solutions", true);
    updateMeta("og:locale", "en_US", true);
    updateMeta("og:logo", logoImage, true);

    // Article-specific OG tags
    if (articlePublishedTime) {
      updateMeta("article:published_time", articlePublishedTime, true);
    } else {
      removeMeta("article:published_time", true);
    }
    if (articleModifiedTime) {
      updateMeta("article:modified_time", articleModifiedTime, true);
    } else {
      removeMeta("article:modified_time", true);
    }

    // Twitter - Enhanced
    updateMeta("twitter:card", "summary_large_image");
    updateMeta("twitter:title", finalTitle);
    updateMeta("twitter:description", finalDescription);
    updateMeta("twitter:url", canonicalUrl);
    updateMeta("twitter:image", finalOgImage);
    updateMeta("twitter:image:alt", finalTitle);

    // Additional SEO meta tags
    updateMeta("author", "VnU IT Solutions");
    updateMeta("publisher", "VnU IT Solutions");
    updateMeta("copyright", `© ${new Date().getFullYear()} VnU IT Solutions`);
    updateMeta("geo.region", "IN-HR");
    updateMeta("geo.placename", "Hyderabad");
    updateMeta("geo.position", "17.366° N;78.476° E");
    updateMeta("ICBM", "17.366, 78.476");
    
  }, [finalTitle, finalDescription, finalKeywords, finalOgImage, canonicalUrl, noIndex, articlePublishedTime, articleModifiedTime]);

  return null;
};