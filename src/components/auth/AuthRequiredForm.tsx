import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LogIn } from "lucide-react";

interface AuthRequiredFormProps {
  children: React.ReactNode;
  message?: string;
}

export const AuthRequiredForm = ({ children, message = "Please sign in to submit this form" }: AuthRequiredFormProps) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="glass-card p-8 rounded-xl text-center">
        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-6">
          <LogIn size={28} className="text-primary" />
        </div>
        <h3 className="text-xl font-semibold mb-3">Sign In Required</h3>
        <p className="text-muted-foreground mb-6">{message}</p>
        <Link to="/auth" className="btn-gold inline-flex items-center gap-2">
          <LogIn size={16} />
          Sign In to Continue
        </Link>
        <p className="text-sm text-muted-foreground mt-4">
          Don't have an account?{" "}
          <Link to="/auth" className="text-primary hover:underline">
            Sign up here
          </Link>
        </p>
      </div>
    );
  }

  return <>{children}</>;
};
