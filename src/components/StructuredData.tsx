import { useLocation } from "react-router-dom";
import { useEffect } from "react";

// Organization Schema - Core business identity
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://vnuitsolutions.com/#organization",
  name: "VnU IT Solutions",
  alternateName: ["Vriddhion & Udaanex IT Solutions Pvt Ltd", "VnU"],
  url: "https://vnuitsolutions.com",
  logo: {
    "@type": "ImageObject",
    url: "https://vnuitsolutions.com/logo.png",
    width: 512,
    height: 512,
  },
  image: "https://vnuitsolutions.com/og-image.png",
  description: "VnU IT Solutions delivers enterprise software development, AI consulting, and talent solutions for modern businesses.",
  email: "hello@vriddhion.com",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Hyderabad",
    addressLocality: "Hyderabad",
    addressRegion: "Telangana",
    postalCode: "500081",
    addressCountry: "IN",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: "28.4595",
    longitude: "77.0266",
  },
  areaServed: [
    { "@type": "Country", name: "India" },
    { "@type": "Country", name: "United States" },
    { "@type": "Country", name: "United Kingdom" },
  ],
  sameAs: [
    "https://www.linkedin.com/company/vnuitsolutions",
  ],
  contactPoint: [
    {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: "hello@vriddhion.com",
      availableLanguage: ["English", "Hindi"],
    },
    {
      "@type": "ContactPoint",
      contactType: "sales",
      email: "hello@vriddhion.com",
      availableLanguage: ["English", "Hindi"],
    },
  ],
  foundingDate: "2023",
  numberOfEmployees: {
    "@type": "QuantitativeValue",
    minValue: 25,
    maxValue: 50,
  },
  slogan: "Technology, AI & Talent Solutions for Growing Businesses",
};

// Website Schema - Site-wide search and navigation
const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://vnuitsolutions.com/#website",
  url: "https://vnuitsolutions.com",
  name: "VnU IT Solutions",
  description: "Enterprise software development, AI consulting, and talent solutions",
  publisher: {
    "@id": "https://vnuitsolutions.com/#organization",
  },
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://vnuitsolutions.com/search?q={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
  inLanguage: "en-US",
};

// Service schemas for each service page
const serviceSchemas: Record<string, object> = {
  "/services": {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": "https://vnuitsolutions.com/services/#service",
    name: "IT Services & Software Development",
    description: "Comprehensive IT services including custom software development, cloud solutions, DevOps, and enterprise application development.",
    provider: { "@id": "https://vnuitsolutions.com/#organization" },
    serviceType: "Software Development",
    areaServed: { "@type": "Country", name: "India" },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "IT Services",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Custom Software Development",
            description: "Tailored software solutions for enterprise needs",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Cloud Solutions",
            description: "Cloud infrastructure and migration services",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "DevOps & CI/CD",
            description: "Streamlined development operations and deployment",
          },
        },
      ],
    },
  },
  "/ai-consulting": {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": "https://vnuitsolutions.com/ai-consulting/#service",
    name: "AI Consulting & Machine Learning Solutions",
    description: "Expert AI consulting services including machine learning, natural language processing, and intelligent automation for business transformation.",
    provider: { "@id": "https://vnuitsolutions.com/#organization" },
    serviceType: "AI Consulting",
    areaServed: { "@type": "Country", name: "India" },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "AI Services",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Machine Learning Solutions",
            description: "Custom ML models for business intelligence",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Process Automation",
            description: "AI-powered workflow automation",
          },
        },
      ],
    },
  },
  "/talent-solutions": {
    "@context": "https://schema.org",
    "@type": "EmploymentAgency",
    "@id": "https://vnuitsolutions.com/talent-solutions/#service",
    name: "IT Talent Solutions & Staff Augmentation",
    description: "Access top IT talent with staff augmentation services. Hire skilled developers, engineers, and tech professionals.",
    provider: { "@id": "https://vnuitsolutions.com/#organization" },
    areaServed: { "@type": "Country", name: "India" },
  },
  "/nowrise-institute": {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "@id": "https://vnuitsolutions.com/nowrise-institute/#organization",
    name: "NowRise Institute",
    description: "Professional IT training programs for software development, cloud computing, and emerging technologies.",
    parentOrganization: { "@id": "https://vnuitsolutions.com/#organization" },
    address: {
      "@type": "PostalAddress",
      streetAddress: "Tech Park Plaza, Sector 45",
      addressLocality: "Gurugram",
      addressRegion: "Haryana",
      postalCode: "122003",
      addressCountry: "IN",
    },
  },
};

// Breadcrumb schemas for each page
const getBreadcrumbSchema = (pathname: string) => {
  const breadcrumbMap: Record<string, { name: string; url: string }[]> = {
    "/": [{ name: "Home", url: "https://vnuitsolutions.com" }],
    "/services": [
      { name: "Home", url: "https://vnuitsolutions.com" },
      { name: "Services", url: "https://vnuitsolutions.com/services" },
    ],
    "/ai-consulting": [
      { name: "Home", url: "https://vnuitsolutions.com" },
      { name: "AI Consulting", url: "https://vnuitsolutions.com/ai-consulting" },
    ],
    "/talent-solutions": [
      { name: "Home", url: "https://vnuitsolutions.com" },
      { name: "Talent Solutions", url: "https://vnuitsolutions.com/talent-solutions" },
    ],
    "/nowrise-institute": [
      { name: "Home", url: "https://vnuitsolutions.com" },
      { name: "NowRise Institute", url: "https://vnuitsolutions.com/nowrise-institute" },
    ],
    "/careers": [
      { name: "Home", url: "https://vnuitsolutions.com" },
      { name: "Careers", url: "https://vnuitsolutions.com/careers" },
    ],
    "/about": [
      { name: "Home", url: "https://vnuitsolutions.com" },
      { name: "About", url: "https://vnuitsolutions.com/about" },
    ],
    "/contact": [
      { name: "Home", url: "https://vnuitsolutions.com" },
      { name: "Contact", url: "https://vnuitsolutions.com/contact" },
    ],
  };

  const items = breadcrumbMap[pathname] || breadcrumbMap["/"];

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
};

// FAQ Schema for pages with FAQ content
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What IT services does VnU IT Solutions provide?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "VnU IT Solutions provides comprehensive IT services including custom software development, cloud solutions, DevOps, enterprise application development, AI consulting, machine learning solutions, and talent augmentation services.",
      },
    },
    {
      "@type": "Question",
      name: "Where is VnU IT Solutions located?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "VnU IT Solutions is headquartered in Gurugram, Haryana, India at Tech Park Plaza, Sector 45. We serve clients globally across India, United States, and United Kingdom.",
      },
    },
    {
      "@type": "Question",
      name: "What is NowRise Institute?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "NowRise Institute is VnU IT Solutions' education and training vertical that provides professional IT training programs in software development, cloud computing, and emerging technologies to build industry-ready talent.",
      },
    },
  ],
};

export const StructuredData = () => {
  const location = useLocation();
  const pathname = location.pathname;

  useEffect(() => {
    // Remove existing structured data scripts
    const existingScripts = document.querySelectorAll('script[data-structured-data]');
    existingScripts.forEach(script => script.remove());

    // Always add Organization and Website schemas
    const addScript = (schema: object, id: string) => {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.setAttribute("data-structured-data", id);
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
    };

    addScript(organizationSchema, "organization");
    addScript(websiteSchema, "website");
    addScript(getBreadcrumbSchema(pathname), "breadcrumb");

    // Add page-specific service schema
    if (serviceSchemas[pathname]) {
      addScript(serviceSchemas[pathname], "service");
    }

    // Add FAQ schema to homepage
    if (pathname === "/") {
      addScript(faqSchema, "faq");
    }

    return () => {
      const scripts = document.querySelectorAll('script[data-structured-data]');
      scripts.forEach(script => script.remove());
    };
  }, [pathname]);

  return null;
};
