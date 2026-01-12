import { useEffect } from "react";
import { useLocation } from "react-router-dom";

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
}

const defaultMeta = {
  title: "VnU IT Solutions - Enterprise Software, AI Consulting & Talent Solutions",
  description: "VnU IT Solutions delivers enterprise software development, AI consulting, and talent solutions. Transform your business with cutting-edge technology.",
  keywords: "IT solutions, software development, AI consulting, talent solutions, enterprise software, digital transformation",
  ogImage: "https://vnuitsolutions.com/og-image.png",
};

const pageMeta: Record<string, { title: string; description: string; keywords?: string }> = {
  "/": {
    title: "VnU IT Solutions - Enterprise Software, AI Consulting & Talent Solutions",
    description: "VnU IT Solutions delivers enterprise software development, AI consulting, and talent solutions. Transform your business with cutting-edge technology.",
  },
  "/services": {
    title: "IT Services & Software Development | VnU IT Solutions",
    description: "Comprehensive IT services including custom software development, cloud solutions, DevOps, and enterprise application development.",
    keywords: "IT services, software development, cloud solutions, DevOps, enterprise applications",
  },
  "/ai-consulting": {
    title: "AI Consulting & Machine Learning Solutions | VnU IT Solutions",
    description: "Expert AI consulting services. Implement machine learning, natural language processing, and intelligent automation for your business.",
    keywords: "AI consulting, machine learning, NLP, intelligent automation, artificial intelligence",
  },
  "/talent-solutions": {
    title: "IT Talent Solutions & Staff Augmentation | VnU IT Solutions",
    description: "Access top IT talent with our staff augmentation and talent solutions. Hire skilled developers, engineers, and tech professionals.",
    keywords: "talent solutions, staff augmentation, IT hiring, tech talent, software developers",
  },
  "/nowrise-institute": {
    title: "NowRise Institute - IT Training & Skill Development | VnU",
    description: "Professional IT training programs. Learn software development, cloud computing, and emerging technologies at NowRise Institute.",
    keywords: "IT training, skill development, software training, tech education, programming courses",
  },
  "/careers": {
    title: "Careers at VnU IT Solutions | Join Our Team",
    description: "Explore exciting career opportunities at VnU IT Solutions. Join a team of innovative professionals building the future of technology.",
    keywords: "IT careers, tech jobs, software developer jobs, VnU careers",
  },
  "/about": {
    title: "About VnU IT Solutions | Our Mission & Values",
    description: "Learn about VnU IT Solutions, our mission to deliver innovative technology solutions, and our commitment to client success.",
    keywords: "about VnU, IT company, technology partner, company values",
  },
  "/contact": {
    title: "Contact VnU IT Solutions | Get in Touch",
    description: "Contact VnU IT Solutions for your technology needs. Reach out for consultations, partnerships, or inquiries.",
    keywords: "contact VnU, IT consultation, get in touch, technology partner",
  },
};

export const SEOHead = ({ title, description, keywords, ogImage }: SEOHeadProps) => {
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

    // Update canonical
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (canonical) {
      canonical.href = canonicalUrl;
    } else {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      canonical.href = canonicalUrl;
      document.head.appendChild(canonical);
    }

    // Standard meta tags
    updateMeta("description", finalDescription);
    updateMeta("keywords", finalKeywords);
    updateMeta("robots", "index, follow");
    updateMeta("googlebot", "index, follow, max-video-preview:-1, max-image-preview:large, max-snippet:-1");

    // Open Graph
    updateMeta("og:title", finalTitle, true);
    updateMeta("og:description", finalDescription, true);
    updateMeta("og:url", canonicalUrl, true);
    updateMeta("og:image", finalOgImage, true);

    // Twitter
    updateMeta("twitter:title", finalTitle);
    updateMeta("twitter:description", finalDescription);
    updateMeta("twitter:url", canonicalUrl);
    updateMeta("twitter:image", finalOgImage);
  }, [finalTitle, finalDescription, finalKeywords, finalOgImage, canonicalUrl]);

  return null;
};
