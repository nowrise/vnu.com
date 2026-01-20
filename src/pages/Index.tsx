import { Layout } from "@/components/layout";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { useRef } from "react";
import {
  Code,
  Settings,
  Users,
  Rocket,
  Building2,
  GraduationCap,
  Briefcase,
  Globe,
  BarChart3,
  Cloud,
} from "lucide-react";
import { ProcessStep, ServiceCard, IndustryCard, SectionHeader } from "@/components/ui/shared-sections";
import { DynamicFormDisplay } from "@/components/DynamicFormDisplay";
import { SEOHead } from "@/components/SEOHead";

const Home = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const dashboardY = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.5]);

  return (
    <Layout>
      <SEOHead />
      {/* Hero Section - Semantic HTML with proper heading hierarchy */}
      <header>
        <section ref={heroRef} className="section-padding pt-32 md:pt-40 overflow-hidden" aria-labelledby="hero-title">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              style={{ opacity: textOpacity }}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 id="hero-title" className="text-display mb-6">Technology, AI & Talent Solutions for Growing Businesses</h1>
              <p className="text-body-large mb-8 max-w-lg">
                Vriddhion & Udaanex IT Solutions Pvt Ltd is an IT and consulting company delivering technology,
                AI-driven growth, and skilled talent solutions for modern businesses.
              </p>
              <div className="flex flex-wrap gap-4">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                  <Link to="/contact" className="btn-gold">
                    Talk to Our Experts
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                  <Link to="/services" className="btn-outline">
                    View Services
                  </Link>
                </motion.div>
              </div>
            </motion.div>

            {/* Right Content - Dashboard Preview with Parallax */}
            <motion.div
              style={{ y: dashboardY }}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <motion.div
                className="glass-card p-6 rounded-xl"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                {/* Mac window buttons */}
                <div className="flex items-center gap-2 mb-4">
                  <motion.div className="w-3 h-3 rounded-full bg-red-400" whileHover={{ scale: 1.3 }} />
                  <motion.div className="w-3 h-3 rounded-full bg-yellow-400" whileHover={{ scale: 1.3 }} />
                  <motion.div className="w-3 h-3 rounded-full bg-green-400" whileHover={{ scale: 1.3 }} />
                  <span className="ml-4 text-xs text-muted-foreground">Enterprise System View</span>
                </div>

                {/* Dashboard content */}
                <div className="grid grid-cols-2 gap-4">
                  <motion.div className="bg-background rounded-lg p-4 hover-lift" whileHover={{ scale: 1.02 }}>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      <BarChart3 size={14} />
                      <span>Growth Metrics</span>
                    </div>
                    <div className="flex gap-1 h-16 items-end">
                      {[40, 55, 35, 70, 45, 80, 60].map((h, i) => (
                        <motion.div
                          key={i}
                          className="flex-1 bg-muted rounded-t"
                          initial={{ height: 0 }}
                          animate={{ height: `${h}%` }}
                          transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
                        />
                      ))}
                    </div>
                  </motion.div>

                  <motion.div className="bg-background rounded-lg p-4 hover-lift" whileHover={{ scale: 1.02 }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground">AI Engine</span>
                      <motion.div
                        className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                      >
                        <Settings size={14} className="text-primary" />
                      </motion.div>
                    </div>
                    <p className="text-xs text-muted-foreground">Optimization Active</p>
                  </motion.div>

                  <motion.div
                    className="bg-background rounded-lg p-4 col-span-2 flex items-center gap-3 hover-lift"
                    whileHover={{ scale: 1.01 }}
                  >
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Cloud size={14} />
                      <span>Talent Deployement</span>
                    </div>
                    <div className="flex gap-2 ml-auto">
                      {["Engineers", "Analysts", "Trainers"].map((cloud, i) => (
                        <motion.span
                          key={cloud}
                          className="text-xs px-2 py-1 bg-muted rounded"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.8 + i * 0.1 }}
                          whileHover={{ scale: 1.1 }}
                        >
                          {cloud}
                        </motion.span>
                      ))}
                    </div>
                  </motion.div>

                  <motion.div
                    className="bg-background rounded-lg p-4 col-span-2 flex items-center justify-between hover-lift"
                    whileHover={{ scale: 1.01 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted" />
                      <div>
                        <p className="text-sm font-medium">Project Lead</p>
                        <p className="text-xs text-muted-foreground">Talent Deployed</p>
                      </div>
                    </div>
                    <motion.span
                      className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded"
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      ● Active
                    </motion.span>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          </div>
          </div>
        </section>
      </header>

      {/* Services Section */}
      <section className="section-padding">
        <div className="container-custom">
          <SectionHeader
            label="OUR EXPERTISE"
            title="Comprehensive IT & Business Solutions"
            description="Driving digital transformation through engineering excellence and strategic consulting."
          />

          <div className="grid md:grid-cols-3 gap-8">
            <ServiceCard
              icon={Code}
              title="IT Services & Engineering"
              items={["Web & App Development", "Custom Software Solutions", "Cloud Infrastructure & Integrations"]}
              onLinkClick={() => {}}
            />
            <ServiceCard
              icon={Settings}
              title="AI & Business Consulting"
              items={["AI-powered Marketing Systems", "Automation & Workflow Optimization", "Business Growth Strategy"]}
              onLinkClick={() => {}}
            />
            <ServiceCard
              icon={Users}
              title="Talent & Resource Solutions"
              items={["Skilled Interns & Freelancers", "Contract IT Resources", "Trainer & Specialist Onboarding"]}
              onLinkClick={() => {}}
            />
          </div>
        </div>
      </section>

      {/* How We Drive Value */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <SectionHeader
            title="How We Drive Value"
            description="A structured approach to solving complex business challenges."
            centered={false}
          />

          <div className="grid md:grid-cols-4 gap-8 mt-12">
            <ProcessStep
              number="01"
              title="Understand"
              description="We analyze your core business challenges and requirements."
            />
            <ProcessStep
              number="02"
              title="Design"
              description="Architecting scalable technology and AI-driven solutions."
            />
            <ProcessStep
              number="03"
              title="Deploy"
              description="Implementing systems and deploying skilled talent rapidly."
            />
            <ProcessStep
              number="04"
              title="Grow"
              description="Driving measurable growth and optimizing for future scale."
              isLast
            />
          </div>
        </div>
      </section>

      {/* Industries We Serve */}
      <section className="section-padding">
        <div className="container-custom">
          <SectionHeader title="Industries We Serve" centered={false} />

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <IndustryCard icon={Rocket} title="Startups" />
            <IndustryCard icon={Building2} title="SMEs" />
            <IndustryCard icon={Briefcase} title="Enterprises" />
            <IndustryCard icon={GraduationCap} title="Education" />
            <IndustryCard icon={Globe} title="Digital Business" />
          </div>
        </div>
      </section>

      {/* Education Vertical CTA */}
      <section className="section-slate py-20">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col md:flex-row items-center justify-between gap-8"
          >
            <div>
              <span className="text-xs uppercase tracking-widest text-primary mb-2 block">TALENT PIPELINE</span>
              <h2 className="text-2xl md:text-3xl font-bold text-accent-foreground mb-3">
                Our Education & Training Vertical
              </h2>
              <p className="text-accent-foreground/80 max-w-xl">
                Through <span className="font-semibold">NowRise Institute</span>, we train industry-ready talent aligned
                with real business and project needs.
              </p>
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Link
                to="/nowrise-institute"
                className="btn-outline border-accent-foreground text-accent-foreground hover:bg-accent-foreground hover:text-accent whitespace-nowrap"
              >
                Explore NowRise Institute
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Dynamic Forms Section */}
      <DynamicFormDisplay pageName="home" />

      {/* Final CTA */}
      <section className="section-padding text-center">
        <div className="container-custom max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-heading mb-4">Looking for Technology, Talent, or Growth?</h2>
            <p className="text-body-large mb-8">
              Partner with Vriddhion & Udaanex IT Solutions for enterprise-grade outcomes.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                <Link to="/contact" className="btn-gold">
                  Contact Us
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                <Link to="/talent-solutions" className="btn-outline">
                  Hire Talent
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Home;
