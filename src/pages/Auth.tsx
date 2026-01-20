import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, ArrowRight, Mail, Loader2, ShieldCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signupSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const resetPasswordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormData = z.infer<typeof loginSchema>;
type SignupFormData = z.infer<typeof signupSchema>;
type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

const Auth = () => {
  const [searchParams] = useSearchParams();
  const isResetMode = searchParams.get("reset") === "true";
  
  const [authMode, setAuthMode] = useState<"login" | "signup" | "forgot" | "reset" | "otp">(
    isResetMode ? "reset" : "login"
  );
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [pendingLoginData, setPendingLoginData] = useState<LoginFormData | null>(null);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpResendTimer, setOtpResendTimer] = useState(0);
  const [awaitingOtpVerification, setAwaitingOtpVerification] = useState(false);
  const navigate = useNavigate();
  const { signIn, signUp, signInWithGoogle, resetPassword, user } = useAuth();

  // Redirect if already logged in (but not if awaiting OTP verification)
  useEffect(() => {
    if (user && !isResetMode && !awaitingOtpVerification && authMode !== "otp") {
      navigate("/");
    }
  }, [user, navigate, isResetMode, awaitingOtpVerification, authMode]);

  // OTP resend timer countdown
  useEffect(() => {
    if (otpResendTimer > 0) {
      const timer = setTimeout(() => setOtpResendTimer(otpResendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpResendTimer]);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const forgotPasswordForm = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const resetPasswordForm = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const sendOTP = async (email: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("send-otp", {
        body: { action: "send", email },
      });

      if (error) {
        console.error("OTP send error:", error);
        return { success: false, error: error.message };
      }

      if (data?.error) {
        return { success: false, error: data.error };
      }

      return { success: true };
    } catch (error) {
      console.error("OTP send error:", error);
      return { success: false, error: "Failed to send OTP" };
    }
  };

  const verifyOTP = async (email: string, otp: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("send-otp", {
        body: { action: "verify", email, otp },
      });

      if (error) {
        console.error("OTP verify error:", error);
        return { success: false, error: error.message };
      }

      if (data?.error) {
        return { success: false, error: data.error, attemptsLeft: data.attemptsLeft };
      }

      return { success: true, verified: data?.verified };
    } catch (error) {
      console.error("OTP verify error:", error);
      return { success: false, error: "Failed to verify OTP" };
    }
  };

  const checkUserExists = async (email: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("send-otp", {
        body: { action: "check-user", email },
      });

      if (error) {
        console.error("User check error:", error);
        return false;
      }

      return data?.exists === true;
    } catch (error) {
      console.error("User check error:", error);
      return false;
    }
  };

  const handleLogin = async (data: LoginFormData) => {
    setIsSubmitting(true);
    try {
      // Set flag to prevent redirect during OTP verification
      setAwaitingOtpVerification(true);
      
      // First verify credentials with Supabase (but don't complete login)
      const { error } = await signIn(data.email, data.password);
      
      if (error) {
        setAwaitingOtpVerification(false);
        toast({
          title: "Authentication failed",
          description: "Invalid email or password. Please try again.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Sign out immediately - we need OTP verification first
      await supabase.auth.signOut();
      
      // Store credentials and send OTP
      setPendingLoginData(data);
      setIsSendingOtp(true);
      
      const otpResult = await sendOTP(data.email);
      
      if (!otpResult.success) {
        setAwaitingOtpVerification(false);
        toast({
          title: "Failed to send OTP",
          description: otpResult.error || "Please try again.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        setIsSendingOtp(false);
        return;
      }

      toast({
        title: "OTP Sent",
        description: "Please check your email for the verification code.",
      });
      
      setAuthMode("otp");
      setOtpResendTimer(60);
      setIsSubmitting(false);
      setIsSendingOtp(false);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Login error:", error);
      }
      setAwaitingOtpVerification(false);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      setIsSendingOtp(false);
    }
  };

  const handleOTPVerification = async () => {
    if (otpValue.length !== 6 || !pendingLoginData) return;

    setIsSubmitting(true);
    try {
      const result = await verifyOTP(pendingLoginData.email, otpValue);

      if (!result.success) {
        toast({
          title: "Invalid OTP",
          description: result.error || "Please try again.",
          variant: "destructive",
        });
        setOtpValue("");
        setIsSubmitting(false);
        return;
      }

      // OTP verified, clear flag and complete the login
      setAwaitingOtpVerification(false);
      const { error } = await signIn(pendingLoginData.email, pendingLoginData.password);
      
      if (error) {
        toast({
          title: "Login failed",
          description: "Please try again.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
      
      setPendingLoginData(null);
      setOtpValue("");
      setTimeout(() => {
        navigate("/");
      }, 100);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("OTP verification error:", error);
      }
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  const handleResendOTP = async () => {
    if (!pendingLoginData || otpResendTimer > 0) return;

    setIsSendingOtp(true);
    const result = await sendOTP(pendingLoginData.email);
    
    if (result.success) {
      toast({
        title: "OTP Resent",
        description: "Please check your email for the new verification code.",
      });
      setOtpResendTimer(60);
      setOtpValue("");
    } else {
      toast({
        title: "Failed to resend OTP",
        description: result.error || "Please try again.",
        variant: "destructive",
      });
    }
    setIsSendingOtp(false);
  };

  const handleSignup = async (data: SignupFormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await signUp(data.email, data.password, data.fullName);
      if (error) {
        toast({
          title: "Registration failed",
          description: "Unable to create account. Please try a different email or contact support.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Account created!",
          description: "Welcome to Vriddhion & Udaanex.",
        });
        navigate("/");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        toast({
          title: "Google sign-in failed",
          description: "Unable to sign in with Google. Please try again.",
          variant: "destructive",
        });
        setIsGoogleLoading(false);
      }
      // Don't set loading to false on success - redirect will happen
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
      setIsGoogleLoading(false);
    }
  };

  const handleForgotPassword = async (data: ForgotPasswordFormData) => {
    setIsSubmitting(true);
    try {
      // Check if user exists
      const userExists = await checkUserExists(data.email);
      
      if (!userExists) {
        toast({
          title: "Account not found",
          description: "No account exists with this email address.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // User exists, send password reset email
      await resetPassword(data.email);
      
      toast({
        title: "Reset link sent!",
        description: "Check your email for the password reset link.",
      });
      setAuthMode("login");
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (data: ResetPasswordFormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });
      if (error) {
        toast({
          title: "Error",
          description: "Unable to update password. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Password updated!",
          description: "Your password has been successfully changed.",
        });
        navigate("/");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const LoadingSpinner = () => (
    <Loader2 className="w-5 h-5 animate-spin" />
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Brand */}
        <Link to="/" className="flex flex-col items-center mb-8">
          <span className="font-bold text-xl tracking-tight text-foreground">
            VnU
          </span>
          <span className="text-xs text-muted-foreground tracking-wide">
            IT SOLUTIONS PVT LTD
          </span>
        </Link>

        {/* Card */}
        <div className="glass-card p-8 rounded-xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={authMode}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {authMode === "otp" ? (
                <>
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                      <ShieldCheck className="w-8 h-8 text-primary" />
                    </div>
                  </div>
                  <h1 className="text-2xl font-bold text-center mb-2">
                    Verify OTP
                  </h1>
                  <p className="text-muted-foreground text-center mb-2">
                    Enter the 6-digit code sent to
                  </p>
                  <p className="text-foreground text-center font-medium mb-6">
                    {pendingLoginData?.email}
                  </p>
                </>
              ) : authMode === "reset" ? (
                <>
                  <h1 className="text-2xl font-bold text-center mb-2">
                    Reset Password
                  </h1>
                  <p className="text-muted-foreground text-center mb-8">
                    Enter your new password
                  </p>
                </>
              ) : authMode === "forgot" ? (
                <>
                  <h1 className="text-2xl font-bold text-center mb-2">
                    Forgot Password
                  </h1>
                  <p className="text-muted-foreground text-center mb-8">
                    Enter your email to receive reset instructions
                  </p>
                </>
              ) : (
                <>
                  <h1 className="text-2xl font-bold text-center mb-2">
                    {authMode === "login" ? "Welcome back" : "Create account"}
                  </h1>
                  <p className="text-muted-foreground text-center mb-8">
                    {authMode === "login"
                      ? "Sign in to access your account"
                      : "Join Vriddhion & Udaanex"}
                  </p>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Toggle - only show for login/signup */}
          {(authMode === "login" || authMode === "signup") && (
            <div className="flex mb-6 bg-secondary rounded-lg p-1">
              <button
                onClick={() => setAuthMode("login")}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                  authMode === "login"
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setAuthMode("signup")}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                  authMode === "signup"
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                Sign Up
              </button>
            </div>
          )}

          {/* Google Sign In - only show for login/signup */}
          {(authMode === "login" || authMode === "signup") && (
            <>
              <button
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-lg border border-border bg-background hover:bg-secondary transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-6"
              >
                {isGoogleLoading ? (
                  <LoadingSpinner />
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                )}
                <span className="font-medium">
                  {isGoogleLoading ? "Connecting..." : "Continue with Google"}
                </span>
              </button>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-card px-4 text-muted-foreground">
                    or continue with email
                  </span>
                </div>
              </div>
            </>
          )}

          {/* OTP Verification Form */}
          {authMode === "otp" && (
            <div className="space-y-6">
              <div className="flex justify-center">
                <InputOTP
                  value={otpValue}
                  onChange={setOtpValue}
                  maxLength={6}
                  onComplete={handleOTPVerification}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <button
                onClick={handleOTPVerification}
                disabled={isSubmitting || otpValue.length !== 6}
                className="btn-gold w-full flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? <LoadingSpinner /> : null}
                {isSubmitting ? "Verifying..." : "Verify & Login"}
              </button>

              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Didn't receive the code?
                </p>
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={isSendingOtp || otpResendTimer > 0}
                  className="text-sm text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSendingOtp
                    ? "Sending..."
                    : otpResendTimer > 0
                    ? `Resend in ${otpResendTimer}s`
                    : "Resend OTP"}
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setAuthMode("login");
                  setPendingLoginData(null);
                  setOtpValue("");
                  setAwaitingOtpVerification(false);
                }}
                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Back to login
              </button>
            </div>
          )}

          {/* Reset Password Form */}
          {authMode === "reset" && (
            <form onSubmit={resetPasswordForm.handleSubmit(handleResetPassword)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">New Password</label>
                <div className="relative">
                  <input
                    {...resetPasswordForm.register("password")}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {resetPasswordForm.formState.errors.password && (
                  <p className="text-destructive text-sm mt-1">
                    {resetPasswordForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Confirm Password</label>
                <input
                  {...resetPasswordForm.register("confirmPassword")}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
                {resetPasswordForm.formState.errors.confirmPassword && (
                  <p className="text-destructive text-sm mt-1">
                    {resetPasswordForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-gold w-full flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? <LoadingSpinner /> : null}
                {isSubmitting ? "Updating..." : "Update Password"}
              </button>
            </form>
          )}

          {/* Forgot Password Form */}
          {authMode === "forgot" && (
            <form onSubmit={forgotPasswordForm.handleSubmit(handleForgotPassword)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <div className="relative">
                  <input
                    {...forgotPasswordForm.register("email")}
                    type="email"
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 pl-12 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                </div>
                {forgotPasswordForm.formState.errors.email && (
                  <p className="text-destructive text-sm mt-1">
                    {forgotPasswordForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-gold w-full flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? <LoadingSpinner /> : null}
                {isSubmitting ? "Sending..." : "Send Reset Link"}
              </button>

              <button
                type="button"
                onClick={() => setAuthMode("login")}
                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Back to login
              </button>
            </form>
          )}

          {/* Login Form */}
          {authMode === "login" && (
            <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  {...loginForm.register("email")}
                  type="email"
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
                {loginForm.formState.errors.email && (
                  <p className="text-destructive text-sm mt-1">
                    {loginForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <div className="relative">
                  <input
                    {...loginForm.register("password")}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {loginForm.formState.errors.password && (
                  <p className="text-destructive text-sm mt-1">
                    {loginForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => setAuthMode("forgot")}
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-gold w-full flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? <LoadingSpinner /> : null}
                {isSubmitting ? (isSendingOtp ? "Sending OTP..." : "Verifying...") : "Sign In"}
                {!isSubmitting && <ArrowRight size={16} />}
              </button>
            </form>
          )}

          {/* Signup Form */}
          {authMode === "signup" && (
            <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <input
                  {...signupForm.register("fullName")}
                  type="text"
                  placeholder="John Doe"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
                {signupForm.formState.errors.fullName && (
                  <p className="text-destructive text-sm mt-1">
                    {signupForm.formState.errors.fullName.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  {...signupForm.register("email")}
                  type="email"
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
                {signupForm.formState.errors.email && (
                  <p className="text-destructive text-sm mt-1">
                    {signupForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <div className="relative">
                  <input
                    {...signupForm.register("password")}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {signupForm.formState.errors.password && (
                  <p className="text-destructive text-sm mt-1">
                    {signupForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Confirm Password
                </label>
                <input
                  {...signupForm.register("confirmPassword")}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
                {signupForm.formState.errors.confirmPassword && (
                  <p className="text-destructive text-sm mt-1">
                    {signupForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-gold w-full flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? <LoadingSpinner /> : null}
                {isSubmitting ? "Creating account..." : "Create Account"}
                {!isSubmitting && <ArrowRight size={16} />}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          <Link to="/" className="hover:text-foreground transition-colors">
            ← Back to home
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Auth;
