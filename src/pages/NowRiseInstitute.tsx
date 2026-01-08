import { Layout } from "@/components/layout";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { useRef } from "react";
import { Code, Briefcase, Award } from "lucide-react";
import { SectionHeader } from "@/components/ui/shared-sections";
import heroNowrise from "@/assets/hero-nowrise.jpg";
import { DynamicFormDisplay } from "@/components/DynamicFormDisplay";
import { SEOHead } from "@/components/SEOHead";

const programs = [
  {
    icon: Code,
    title: "Skill Development Programs",
    description:
      "Intensive technical training modules covering modern software engineering, data science, and AI application stacks.",
  },
  {
    icon: Briefcase,
    title: "Internships",
    description:
      "Practical exposure to live business environments, allowing talent to apply theoretical knowledge to real-world challenges.",
  },
  {
    icon: Award,
    title: "Certification Tracks",
    description:
      "Validated competency assessments and industry-recognized credentials that benchmark professional expertise.",
  },
];

const NowRiseInstitute = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, 50]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.3]);

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
                {/* Floating badge */}
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

      {/* Our Programs */}
      <section className="section-padding">
        <div className="container-custom">
          <SectionHeader
            title="Our Programs"
            description="Comprehensive education pathways built for the modern digital economy."
            centered={false}
          />

          <div className="grid md:grid-cols-3 gap-8 mt-12">
            {programs.map((program, index) => (
              <motion.div
                key={program.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                whileHover={{ y: -8 }}
                className="service-card card-hover group cursor-pointer"
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
                projects and talent requirements from Vriddhion & Udaanex.
              </p>
            </div>
            <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 300 }}>
              <Link to="/contact" className="btn-gold whitespace-nowrap">
                View Programs
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
