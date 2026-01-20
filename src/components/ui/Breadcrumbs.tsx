import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

const routeLabels: Record<string, string> = {
  "/": "Home",
  "/services": "IT Services",
  "/ai-consulting": "AI Consulting",
  "/talent-solutions": "Talent Solutions",
  "/nowrise-institute": "NowRise Institute",
  "/careers": "Careers",
  "/about": "About Us",
  "/contact": "Contact",
  "/auth": "Sign In",
  "/profile": "Profile",
};

interface BreadcrumbsProps {
  className?: string;
}

export const Breadcrumbs = ({ className }: BreadcrumbsProps) => {
  const location = useLocation();
  const pathname = location.pathname;

  // Don't show breadcrumbs on homepage
  if (pathname === "/") {
    return null;
  }

  // Build breadcrumb items
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbItems: { label: string; path: string; isLast: boolean }[] = [
    { label: "Home", path: "/", isLast: false },
  ];

  let currentPath = "";
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const label = routeLabels[currentPath] || segment.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
    breadcrumbItems.push({
      label,
      path: currentPath,
      isLast: index === segments.length - 1,
    });
  });

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <Breadcrumb>
        <BreadcrumbList className="text-sm">
          {breadcrumbItems.map((item, index) => (
            <BreadcrumbItem key={item.path}>
              {item.isLast ? (
                <BreadcrumbPage className="font-medium">
                  {item.label}
                </BreadcrumbPage>
              ) : (
                <>
                  <BreadcrumbLink asChild>
                    <Link 
                      to={item.path} 
                      className="flex items-center gap-1 hover:text-primary transition-colors"
                    >
                      {index === 0 && <Home className="h-3.5 w-3.5" aria-hidden="true" />}
                      <span>{item.label}</span>
                    </Link>
                  </BreadcrumbLink>
                  <BreadcrumbSeparator>
                    <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </BreadcrumbSeparator>
                </>
              )}
            </BreadcrumbItem>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </nav>
  );
};
