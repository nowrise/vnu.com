import { Layout } from "@/components/layout";
import { motion } from "framer-motion";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MapPin, Mail, Briefcase, GraduationCap, Handshake, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { AuthRequiredForm } from "@/components/auth/AuthRequiredForm";
import { DynamicFormDisplay } from "@/components/DynamicFormDisplay";
import { SEOHead } from "@/components/SEOHead";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address").max(255),
  purpose: z.string().min(1, "Please select a purpose"),
  message: z.string().min(10, "Message must be at least 10 characters").max(1000),
});

type ContactFormData = z.infer<typeof contactSchema>;

const enquiryTypes = [
  {
    icon: Briefcase,
    title: "Business Enquiry",
    description: "Connect for enterprise AI solutions and growth strategies.",
  },
  {
    icon: GraduationCap,
    title: "Training Enquiry",
    description: "Join our learning programs at NowRise Institute.",
  },
  {
    icon: Handshake,
    title: "Hiring / Partnership",
    description: "Collaborate on talent deployment and hiring needs.",
  },
];

const ContactForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [honeypot, setHoneypot] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      const response = await supabase.functions.invoke('submit-form', {
        body: {
          formType: 'contact_requests',
          honeypot: honeypot,
          data: {
            name: data.name,
            email: data.email,
            purpose: data.purpose,
            message: data.message,
          }
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Submission failed');
      }

      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      toast({
        title: "Message sent!",
        description: "We'll get back to you as soon as possible.",
      });
      reset();
    } catch (error: any) {
      const message = error?.message?.includes('Too many requests') 
        ? "Too many submissions. Please wait a moment and try again."
        : "Failed to send message. Please try again.";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-card p-8 rounded-xl">
      <h2 className="text-2xl font-bold mb-8">Send a Message</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Honeypot field - hidden from users, catches bots */}
        <div className="absolute -left-[9999px] opacity-0 h-0 overflow-hidden" aria-hidden="true">
          <label htmlFor="website">Website</label>
          <input
            type="text"
            id="website"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Name
            </label>
            <input
              {...register("name")}
              placeholder="Your full name"
              className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
            {errors.name && (
              <p className="text-destructive text-sm mt-1">
                {errors.name.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Email
            </label>
            <input
              {...register("email")}
              type="email"
              placeholder="email@example.com"
              className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
            {errors.email && (
              <p className="text-destructive text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Purpose
          </label>
          <select
            {...register("purpose")}
            className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          >
            <option value="">Select enquiry type</option>
            <option value="business">Business Enquiry</option>
            <option value="training">Training Enquiry</option>
            <option value="hiring">Hiring / Partnership</option>
            <option value="careers">Career Application</option>
            <option value="other">Other</option>
          </select>
          {errors.purpose && (
            <p className="text-destructive text-sm mt-1">
              {errors.purpose.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Message
          </label>
          <textarea
            {...register("message")}
            rows={5}
            placeholder="How can we help you?"
            className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
          />
          {errors.message && (
            <p className="text-destructive text-sm mt-1">
              {errors.message.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-gold flex items-center justify-center gap-2 w-full md:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Sending..." : "Send Message"}
          <ArrowRight size={16} />
        </button>
      </form>
    </div>
  );
};

const Contact = () => {
  return (
    <Layout>
      <SEOHead />
      <section className="section-padding pt-32 md:pt-40">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Left Side */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-display mb-6">Contact Us</h1>
              <p className="text-body-large mb-12">
                Let's talk careers, talent, or business growth. We are here to
                help you scale and succeed.
              </p>

              <div className="border-t border-border pt-8 space-y-8">
                {enquiryTypes.map((type) => (
                  <div key={type.title} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                      <type.icon size={18} className="text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">{type.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {type.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-12 p-6 bg-secondary rounded-lg">
                <h4 className="font-semibold mb-4">VnU IT Solutions Pvt Ltd</h4>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-start gap-3">
                    <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                    <span>
                      Hyderabad
                      <br />
                      Hyderabad, Telangana 500081, India
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail size={16} className="flex-shrink-0" />
                    <a
                      href="mailto:hello@vriddhion.com"
                      className="hover:text-foreground transition-colors"
                    >
                      info@vriddhion.com
                    </a>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-6">
                  © {new Date().getFullYear()} VnU. All Rights Reserved.
                </p>
              </div>
            </motion.div>

            {/* Right Side - Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <AuthRequiredForm message="Please sign in to send us a message. This helps us serve you better.">
                <ContactForm />
              </AuthRequiredForm>
            </motion.div>
          </div>
        </div>
      </section>

      <DynamicFormDisplay pageName="contact" />
    </Layout>
  );
};

export default Contact;
