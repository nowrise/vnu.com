import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout";
import { SEOHead } from "@/components/SEOHead";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, BarChart, CheckCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BookOpen, Code, Brain, Database, Cloud, Shield, Smartphone, Globe, Cpu, Terminal, Layers, Zap } from "lucide-react";
import { DynamicFormDisplay } from "@/components/DynamicFormDisplay";

interface Program {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string | null;
  icon: string | null;
  duration: string | null;
  level: string | null;
  price: number | null;
  features: string[];
  image_url: string | null;
}

export default function ProgramDetail() {
  const { slug } = useParams<{ slug: string }>();

  const { data: program, isLoading, error } = useQuery({
    queryKey: ["program", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("nowrise_programs")
        .select("*")
        .eq("slug", slug)
        .eq("is_active", true)
        .single();
      if (error) throw error;
      return data as Program;
    },
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      </Layout>
    );
  }

  if (error || !program) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Program Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The program you're looking for doesn't exist or is no longer available.
          </p>
          <Button asChild>
            <Link to="/nowrise-institute">View All Programs</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    BookOpen, Code, Brain, Database, Cloud, Shield, Smartphone, Globe, Cpu, Terminal, Layers, Zap
  };
  const IconComponent = iconMap[program.icon || "BookOpen"] || BookOpen;

  // Simple markdown rendering
  const renderContent = (content: string) => {
    return content.split("\n\n").map((paragraph, i) => {
      if (paragraph.startsWith("### ")) {
        return <h3 key={i} className="text-xl font-semibold mt-8 mb-4">{paragraph.slice(4)}</h3>;
      }
      if (paragraph.startsWith("## ")) {
        return <h2 key={i} className="text-2xl font-bold mt-10 mb-4">{paragraph.slice(3)}</h2>;
      }
      if (paragraph.startsWith("- ") || paragraph.startsWith("* ")) {
        const items = paragraph.split("\n").filter(l => l.startsWith("- ") || l.startsWith("* "));
        return (
          <ul key={i} className="list-disc list-inside space-y-2 my-4">
            {items.map((item, j) => (
              <li key={j}>{item.slice(2)}</li>
            ))}
          </ul>
        );
      }
      return <p key={i} className="text-muted-foreground leading-relaxed my-4">{paragraph}</p>;
    });
  };

  return (
    <Layout>
      <SEOHead
        title={`${program.title} | NowRise Institute`}
        description={program.description}
        keywords={`${program.title}, IT training, NowRise Institute, ${program.level}`}
        ogImage={program.image_url || undefined}
      />

      {/* Hero */}
      <section className="relative py-20 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="container mx-auto px-4">
          <Link
            to="/nowrise-institute"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            All Programs
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid lg:grid-cols-2 gap-12 items-center"
          >
            <div>
              <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <IconComponent className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                {program.title}
              </h1>
              <p className="text-xl text-muted-foreground mb-6">
                {program.description}
              </p>

              <div className="flex flex-wrap gap-4 mb-8">
                {program.duration && (
                  <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-lg border">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>{program.duration}</span>
                  </div>
                )}
                {program.level && (
                  <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-lg border">
                    <BarChart className="h-4 w-4 text-primary" />
                    <span>{program.level}</span>
                  </div>
                )}
                {program.price !== null && (
                  <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-lg border">
                    <span className="font-semibold text-primary">
                      {program.price === 0 ? "Free" : `₹${program.price.toLocaleString()}`}
                    </span>
                  </div>
                )}
              </div>

              <Button size="lg" asChild>
                <a href="#enroll">Enroll Now</a>
              </Button>
            </div>

            {program.image_url && (
              <div className="aspect-video rounded-xl overflow-hidden shadow-lg">
                <img
                  src={program.image_url}
                  alt={program.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      {program.features && program.features.length > 0 && (
        <section className="py-16 bg-card">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-8 text-center">What You'll Learn</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {program.features.map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-3 p-4 bg-background rounded-lg"
                >
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Content */}
      {program.content && (
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="prose prose-lg max-w-none">
              {renderContent(program.content)}
            </div>
          </div>
        </section>
      )}

      {/* Enrollment Form */}
      <section id="enroll" className="py-16 bg-primary/5">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <Users className="h-12 w-12 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Ready to Get Started?</h2>
          <p className="text-muted-foreground mb-8">
            Fill out the form below and our team will get in touch with you.
          </p>
          <DynamicFormDisplay pageName="nowrise-institute" />
        </div>
      </section>
    </Layout>
  );
}
