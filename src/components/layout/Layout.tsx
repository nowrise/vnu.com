import { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

interface LayoutProps {
  children: ReactNode;
  showFooter?: boolean;
  showBreadcrumbs?: boolean;
}

export const Layout = ({ children, showFooter = true, showBreadcrumbs = true }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20">
        {showBreadcrumbs && (
          <div className="container-custom pt-4">
            <Breadcrumbs />
          </div>
        )}
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );
};
