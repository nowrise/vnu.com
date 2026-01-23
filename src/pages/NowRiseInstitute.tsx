import { Layout } from "@/components/layout";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Code, Briefcase, Award, BookOpen, Brain, Database, Cloud, Shield, Smartphone, Globe, Cpu, Terminal, Layers, Zap, ArrowRight, Calendar, Clock, User } from "lucide-react";
import { SectionHeader } from "@/components/ui/shared-sections";
import heroNowrise from "@/assets/hero-nowrise.jpg";
import { DynamicFormDisplay } from "@/components/DynamicFormDisplay";
import { SEOHead } from "@/components/SEOHead";
import { format } from "date-fns";

// Fallback static programs if no dynamic data
const fallbackPrograms = [
  {
    icon: Code,
    title: "Skill Development Programs",
    description: "Intensive technical training modules covering modern software engineering, data science, and AI application stacks.",
  },
  {
    icon: Briefcase,
    title: "Internships",
    description: "Practical exposure to live business environments, allowing talent to apply theoretical knowledge to real-world challenges.",
  },
  {
    icon: Award,
    title: "Certification Tracks",
    description: "Validated competency assessments and industry-recognized credentials that benchmark professional expertise.",
  },
];

interface Program {
  id: string;
  title: string;
  slug: string;
  description: string;
  icon: string | null;
  duration: string | null;
  level: string | null;
  features: string[];
}

interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image: string | null;
  author_name: string;
  published_at: string | null;
  read_time: number | null;
}

import type { LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  BookOpen, Code, Brain, Database, Cloud, Shield, Smartphone, Globe, Cpu, Terminal, Layers, Zap, Briefcase, Award
};

const NowRiseInstitute = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, 50]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.3]);

  // Fetch dynamic programs
  const { data: programs = [] } = useQuery({
    queryKey: ["public-programs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("nowrise_programs")
        .select("id, title, slug, description, icon, duration, level, features")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as Program[];
    },
  });

  // Fetch latest blogs
  const { data: blogs = [] } = useQuery({
    queryKey: ["public-blogs-latest"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("nowrise_blogs")
        .select("id, title, slug, excerpt, cover_image, author_name, published_at, read_time")
        .eq("is_published", true)
        .order("published_at", { ascending: false })
        .limit(3);
      if (error) throw error;
      return data as Blog[];
    },
  });

  const hasPrograms = programs.length > 0;

  return (
    <Layout>
      <SEOHead />
      {/* Hero Section with Parallax */}
      <section ref={heroRef} className="section-padding pt-32 md:pt-40 overflow-hidden">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              style={{ y: textY, opacity }}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-display mb-6">
                Industry-Aligned Training & Skill Development
              </h1>
              <p className="text-body-large">
                NowRise Institute is our education arm focused on preparing talent
                for real-world industry requirements.
              </p>
            </motion.div>

            <motion.div
              style={{ y: imageY }}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative overflow-hidden rounded-xl">
                <motion.img
                  src={heroNowrise}
                  alt="Analytics Dashboard"
                  className="w-full hover-scale"
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.4 }}
                />
                <motion.div
                  className="absolute -bottom-4 -left-4 glass-card p-4 rounded-lg shadow-hover"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <span className="text-xs text-muted-foreground">Industry Ready</span>
                  <p className="text-lg font-bold text-primary">100+ Trained</p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* What We Offer Section - Static */}
      <section className="section-padding">
        <div className="container-custom">
          <SectionHeader
            title="What We Offer"
            description="Comprehensive education pathways built for the modern digital economy."
            centered={false}
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            {fallbackPrograms.map((program, index) => (
              <motion.div
                key={program.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                whileHover={{ y: -8 }}
                className="service-card card-hover group"
              >
                <motion.div
                  className="w-12 h-12 rounded-lg bg-background flex items-center justify-center mb-6"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <program.icon size={24} className="text-foreground group-hover:text-primary transition-colors" />
                </motion.div>
                <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                  {program.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {program.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* View Programs CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-center mt-12"
          >
            <Link to="#programs" onClick={(e) => {
              e.preventDefault();
              document.getElementById('programs-section')?.scrollIntoView({ behavior: 'smooth' });
            }} className="btn-gold inline-flex items-center gap-2">
              View All Programs <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Dynamic Programs Section */}
      <section id="programs-section" className="section-padding section-taupe">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-12">
            <SectionHeader
              title="Our Courses & Programs"
              description="Explore our industry-aligned training courses and start your journey today."
              centered={false}
            />
          </div>

          {hasPrograms ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {programs.map((program, index) => {
                const IconComponent = iconMap[program.icon || "BookOpen"] || BookOpen;
                return (
                  <motion.div
                    key={program.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -8 }}
                  >
                    <div className="service-card card-hover group cursor-pointer block h-full bg-background">
                      <Link to={`/program/${program.slug}`} className="block">
                        <motion.div
                          className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mb-6"
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <IconComponent size={24} className="text-foreground group-hover:text-primary transition-colors" />
                        </motion.div>
                        <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                          {program.title}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-4">
                          {program.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                          {program.duration && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{program.duration}</span>}
                          {program.level && <span className="text-primary">{program.level}</span>}
                        </div>
                      </Link>
                      <Link 
                        to={`/contact?purpose=training&program=${encodeURIComponent(program.title)}`}
                        className="inline-flex items-center gap-2 text-primary text-sm font-medium hover:underline"
                      >
                        Enroll Now <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">Programs coming soon. Stay tuned!</p>
              <Link to="/contact" className="btn-outline inline-flex items-center gap-2">
                Get Notified <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="section-padding section-taupe">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "100+", label: "Students Trained" },
              { value: "15+", label: "Programs Offered" },
              { value: "90%", label: "Placement Rate" },
              { value: "50+", label: "Industry Partners" },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="text-center"
              >
                <motion.span
                  className="block text-4xl md:text-5xl font-bold text-primary mb-2"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {stat.value}
                </motion.span>
                <span className="text-sm text-muted-foreground">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Blogs Section */}
      {blogs.length > 0 && (
        <section className="section-padding">
          <div className="container-custom">
            <div className="flex items-center justify-between mb-12">
              <SectionHeader
                title="Latest from Our Blog"
                description="Insights, tutorials, and career guidance from our experts"
                centered={false}
              />
              <Link to="/blog" className="btn-outline hidden md:flex items-center gap-2">
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogs.map((blog, index) => (
                <motion.article
                  key={blog.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group"
                >
                  <Link to={`/blog/${blog.slug}`} className="block">
                    {blog.cover_image && (
                      <div className="aspect-video rounded-xl overflow-hidden mb-4">
                        <img
                          src={blog.cover_image}
                          alt={blog.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {blog.title}
                    </h3>
                    {blog.excerpt && (
                      <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                        {blog.excerpt}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {blog.author_name}
                      </span>
                      {blog.read_time && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {blog.read_time} min
                        </span>
                      )}
                      {blog.published_at && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(blog.published_at), "MMM d")}
                        </span>
                      )}
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>

            <div className="text-center mt-8 md:hidden">
              <Link to="/blog" className="btn-outline inline-flex items-center gap-2">
                View All Posts <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Aligned with Industry */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col md:flex-row items-center justify-between gap-8"
          >
            <div className="max-w-2xl">
              <h2 className="text-heading mb-4">Aligned with Industry Needs</h2>
              <p className="text-body-large">
                Our training programs are designed in alignment with real business
                projects and talent requirements from VnU IT Solutions.
              </p>
            </div>
            <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 300 }}>
              <Link to="/contact" className="btn-gold whitespace-nowrap">
                Get Started
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <DynamicFormDisplay pageName="nowrise-institute" />
    </Layout>
  );
};

export default NowRiseInstitute;
