import { useState } from "react";
import { Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Mail,
  Briefcase,
  GraduationCap,
  Users,
  FileText,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ClipboardList,
  Inbox,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

// Import admin pages
import AdminOverview from "./Overview";
import ContactRequests from "./ContactRequests";
import CareerApplications from "./CareerApplications";
import NowRiseApplications from "./NowRiseApplications";
import UserManagement from "./UserManagement";
import ContentManagement from "./ContentManagement";
import FormManagement from "./FormManagement";
import FormSubmissions from "./FormSubmissions";

const sidebarLinks = [
  { name: "Overview", path: "/admin", icon: LayoutDashboard },
  { name: "Contact Requests", path: "/admin/contacts", icon: Mail },
  { name: "Career Applications", path: "/admin/careers", icon: Briefcase },
  { name: "NowRise Applications", path: "/admin/nowrise", icon: GraduationCap },
  { name: "Users", path: "/admin/users", icon: Users },
  { name: "Content", path: "/admin/content", icon: FileText },
  { name: "Forms", path: "/admin/forms", icon: ClipboardList },
  { name: "Form Submissions", path: "/admin/submissions", icon: Inbox },
];

const AdminDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    // Use replace to prevent admin URL from staying in history
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-accent text-accent-foreground transform transition-transform duration-300 lg:relative lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Brand */}
          <div className="p-6 border-b border-accent-foreground/10">
            <Link to="/" replace className="flex flex-col">
              <span className="font-bold text-lg tracking-tight">
                VRIDDHION & UDAANEX
              </span>
              <span className="text-xs text-accent-foreground/70 tracking-wide">
                Admin Dashboard
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {sidebarLinks.map((link) => {
              const isActive =
                location.pathname === link.path ||
                (link.path !== "/admin" && location.pathname.startsWith(link.path));

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-accent-foreground/10 text-accent-foreground"
                      : "text-accent-foreground/70 hover:bg-accent-foreground/5 hover:text-accent-foreground"
                  }`}
                >
                  <link.icon size={18} />
                  <span className="text-sm font-medium">{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User & Sign Out */}
          <div className="p-4 border-t border-accent-foreground/10">
            <div className="text-sm text-accent-foreground/70 mb-3 truncate">
              {user?.email}
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-accent-foreground/70 hover:bg-accent-foreground/5 hover:text-accent-foreground transition-colors"
            >
              <LogOut size={18} />
              <span className="text-sm font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-background border-b border-border px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden p-2 -ml-2"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Admin</span>
              <ChevronRight size={14} className="text-muted-foreground" />
              <span className="font-medium">
                {sidebarLinks.find((l) => 
                  location.pathname === l.path || 
                  (l.path !== "/admin" && location.pathname.startsWith(l.path))
                )?.name || "Overview"}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          <Routes>
            <Route path="/" element={<AdminOverview />} />
            <Route path="/contacts" element={<ContactRequests />} />
            <Route path="/careers" element={<CareerApplications />} />
            <Route path="/nowrise" element={<NowRiseApplications />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/content" element={<ContentManagement />} />
            <Route path="/forms" element={<FormManagement />} />
            <Route path="/submissions" element={<FormSubmissions />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
