import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Menu, X, LogOut, LayoutDashboard, User, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.png";
const navLinks = [
  { name: "Home", path: "/" },
  { name: "Services", path: "/services" },
  { name: "AI & Consulting", path: "/ai-consulting" },
  { name: "Talent Solutions", path: "/talent-solutions" },
  { name: "NowRise Institute", path: "/nowrise-institute" },
  { name: "About Us", path: "/about" },
  { name: "Careers", path: "/careers" },
];

export const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);
  const { user, isAdmin, signOut, isLoading } = useAuth();

  // Fetch profile data for real-time name updates
  const { data: profile } = useQuery({
    queryKey: ["navbar-profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();
      return data;
    },
    enabled: !!user?.id,
    staleTime: 0, // Always refetch when component mounts
  });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close profile menu on outside click (without blocking the trigger/menu)
  useEffect(() => {
    if (!isProfileOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (profileMenuRef.current && !profileMenuRef.current.contains(target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown, true);
    return () => document.removeEventListener("pointerdown", handlePointerDown, true);
  }, [isProfileOpen]);

  // Close profile menu when route changes
  useEffect(() => {
    setIsProfileOpen(false);
  }, [location.pathname]);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut();
    setIsSigningOut(false);
    setIsProfileOpen(false);
    // Use replace to prevent admin URL from staying in history
    navigate("/", { replace: true });
  };

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email || "User";

  const getUserInitial = () => {
    return displayName.charAt(0).toUpperCase();
  };

  const isActivePath = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? "glass-card py-3 shadow-lg" 
          : "bg-gradient-to-b from-background/80 to-transparent py-4"
      }`}
    >
      <nav className="container-custom flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3">
  <img src={logo} alt="VU Logo" className="w-10 h-10 object-contain" />
  <div className="flex flex-col">
    <span className="font-bold text-base tracking-tight text-foreground leading-tight">
      VnU
    </span>
    <span className="text-[10px] text-muted-foreground tracking-widest uppercase">
      IT Solutions Pvt Ltd
    </span>
  </div>
</Link>


        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`nav-link text-sm px-3 py-2 rounded-md ${
                isActivePath(link.path) 
                  ? "active bg-primary/10" 
                  : "hover:bg-secondary/50"
              }`}
            >
              {link.name}
            </Link>
          ))}

          {!isLoading && (
            <>
              {user ? (
                <div ref={profileMenuRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setIsProfileOpen((v) => !v)}
                    aria-haspopup="menu"
                    aria-expanded={isProfileOpen}
                    className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm transition-all duration-75 hover:scale-105 active:scale-95"
                  >
                    {getUserInitial()}
                  </button>

                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 5, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                        transition={{ duration: 0.1, ease: "easeOut" }}
                        className="absolute right-0 z-50 mt-2 w-56 glass-card rounded-lg shadow-hover overflow-hidden pointer-events-auto"
                        role="menu"
                      >
                      <div className="p-4 border-b border-border">
                        <p className="font-medium text-sm truncate">
                          {displayName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>
                        <div className="p-2">
                          <Link
                            to="/profile"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-75 hover:bg-secondary active:bg-secondary/80 active:scale-[0.98]"
                          >
                            <User size={16} />
                            Profile
                          </Link>
                          {isAdmin && (
                            <Link
                              to="/admin"
                              onClick={() => setIsProfileOpen(false)}
                              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-75 hover:bg-secondary active:bg-secondary/80 active:scale-[0.98]"
                            >
                              <LayoutDashboard size={16} />
                              Admin Dashboard
                            </Link>
                          )}
                        <button
                          onClick={handleSignOut}
                          disabled={isSigningOut}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-75 hover:bg-secondary active:bg-secondary/80 active:scale-[0.98] text-left disabled:opacity-50"
                        >
                          {isSigningOut ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <LogOut size={16} />
                          )}
                          {isSigningOut ? "Signing out..." : "Sign Out"}
                        </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    to="/auth"
                    className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                  >
                    Login
                  </Link>
                  <Link to="/auth" className="btn-gold text-sm px-5 py-2">
                    Sign Up
                  </Link>
                </div>
              )}
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden p-2 hover:bg-secondary rounded-lg transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden glass-card mt-2 mx-4 rounded-lg overflow-hidden"
          >
            <div className="flex flex-col p-4 gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`py-2 px-3 rounded-md text-sm transition-all ${
                    isActivePath(link.path) 
                      ? "bg-primary/10 text-primary font-semibold" 
                      : "text-foreground/70 hover:bg-secondary/50 hover:text-foreground"
                  }`}
                >
                  {link.name}
                </Link>
              ))}

              {!isLoading && (
                <>
                  {user ? (
                    <>
                      <div className="border-t border-border pt-4 mt-2">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
                            {getUserInitial()}
                          </div>
                          <div>
                            <p className="font-medium text-sm">
                              {displayName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {user.email}
                            </p>
                          </div>
                        </div>
                        <Link
                          to="/profile"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center gap-2 py-2 px-2 rounded-md text-muted-foreground transition-all duration-75 hover:text-foreground hover:bg-secondary active:bg-secondary/80 active:scale-[0.98]"
                        >
                          <User size={16} />
                          Profile
                        </Link>
                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center gap-2 py-2 px-2 rounded-md text-muted-foreground transition-all duration-75 hover:text-foreground hover:bg-secondary active:bg-secondary/80 active:scale-[0.98]"
                          >
                            <LayoutDashboard size={16} />
                            Admin Dashboard
                          </Link>
                        )}
                        <button
                          onClick={() => {
                            handleSignOut();
                            setIsMobileMenuOpen(false);
                          }}
                          disabled={isSigningOut}
                          className="flex items-center gap-2 py-2 px-2 rounded-md text-muted-foreground transition-all duration-75 hover:text-foreground hover:bg-secondary active:bg-secondary/80 active:scale-[0.98] disabled:opacity-50"
                        >
                          {isSigningOut ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <LogOut size={16} />
                          )}
                          {isSigningOut ? "Signing out..." : "Sign Out"}
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="border-t border-border pt-4 mt-2 flex flex-col gap-3">
                      <Link
                        to="/auth"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="btn-outline text-center"
                      >
                        Login
                      </Link>
                      <Link
                        to="/auth"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="btn-gold text-center"
                      >
                        Sign Up
                      </Link>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
