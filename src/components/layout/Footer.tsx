import { Link } from "react-router-dom";
import { MapPin, Mail } from "lucide-react";

const footerLinks = {
  company: [
    { name: "About Us", path: "/about" },
    { name: "Services", path: "/services" },
    { name: "Careers", path: "/careers" },
    { name: "Contact", path: "/contact" },
  ],
  contact: [
    { name: "LinkedIn", path: "https://www.linkedin.com/company/vnuitsolutions" },
    { name: "Email Us", path: "mailto:info@vnuitsolutions.com" },
  ],
};

export const Footer = () => {
  return (
    <footer className="bg-accent text-accent-foreground">
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex flex-col mb-4">
              <span className="font-bold text-lg tracking-tight">
                VnU
              </span>
              <span className="text-xs text-accent-foreground/70 tracking-wide">
                IT SOLUTIONS PVT LTD
              </span>
            </div>
            <p className="text-accent-foreground/80 max-w-md mb-6">
              Providing enterprise-grade technology solutions and talent
              development for the modern digital economy.
            </p>
            <div className="flex items-start gap-3 text-accent-foreground/80 mb-3">
              <MapPin size={18} className="mt-0.5 flex-shrink-0" />
              <span className="text-sm">
                Hyderabad
                <br />
                Hyderabad, Telangana, 500081, India
              </span>
            </div>
            <div className="flex items-center gap-3 text-accent-foreground/80">
              <Mail size={18} className="flex-shrink-0" />
              <a
                href="mailto:hello@vriddhion.com"
                className="text-sm hover:text-accent-foreground transition-colors"
              >
                info@vnuitsolutions.com
              </a>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">
              Company
            </h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-accent-foreground/80 hover:text-accent-foreground transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Links */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">
              Contact
            </h4>
            <ul className="space-y-3">
              {footerLinks.contact.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.path}
                    className="text-accent-foreground/80 hover:text-accent-foreground transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-accent-foreground/10">
        <div className="container-custom py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-accent-foreground/60">
            © {new Date().getFullYear()} VnU IT Solutions Pvt
            Ltd. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link
              to="/privacy"
              className="text-sm text-accent-foreground/60 hover:text-accent-foreground transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              className="text-sm text-accent-foreground/60 hover:text-accent-foreground transition-colors"
            >
              Terms of Service
            </Link>
            <button
              onClick={() => {
                localStorage.removeItem('cookie-consent');
                window.location.reload();
              }}
              className="text-sm text-accent-foreground/60 hover:text-accent-foreground transition-colors"
            >
              Cookie Settings
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
