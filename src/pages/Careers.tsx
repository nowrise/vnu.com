import { Layout } from "@/components/layout";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Target, TrendingUp } from "lucide-react";
import { SectionHeader } from "@/components/ui/shared-sections";
import heroCareers from "@/assets/hero-careers.jpg";
import workCulture from "@/assets/work-culture.jpg";
import { DynamicFormDisplay } from "@/components/DynamicFormDisplay";
import { SEOHead } from "@/components/SEOHead";

const opportunities = [
  {
    title: "Internships",
    level: "ENTRY LEVEL",
    description:
      "Engage in rigorous training and live project execution. Ideal for those starting their professional journey in technology.",
  },
  {
    title: "Full-time roles",
    level: "EXPERIENCED",
    description:
      "Drive strategic outcomes and lead technical initiatives. We seek experienced professionals for high-impact roles.",
  },
  {
    title: "Trainer onboarding",
    level: "EDUCATIONAL",
    description:
      "Empower the workforce of tomorrow. Join our NowRise Institute faculty to deliver industry-standard curriculum.",
  },
];

const culturePoints = [
  {
    icon: BookOpen,
    title: "Learning-focused",
    description:
      "We prioritize continuous professional development through structured learning paths and access to advanced technical resources.",
  },
  {
    icon: Target,
    title: "Real responsibility",
    description:
      "Team members are entrusted with significant ownership of client deliverables and strategic projects from day one.",
  },
  {
    icon: TrendingUp,
    title: "Growth-oriented",
    description:
      "Our meritocratic structure ensures that performance and innovation are the primary drivers of career advancement.",
  },
];

const Careers = () => {
  return (
    <Layout>
      <SEOHead />
      {/* Hero Section */}
      <section className="section-padding pt-32 md:pt-40">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-display mb-6">Build Your Career With Us</h1>
              <p className="text-body-large mb-6">
                Learn, grow, and work on real-world problems.
              </p>
              <a
                href="#opportunities"
                className="inline-flex items-center gap-2 text-foreground font-medium border-b-2 border-foreground pb-1 hover:text-primary hover:border-primary transition-colors"
              >
                View Opportunities <ArrowRight size={16} />
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <img
                src={heroCareers}
                alt="Career Discussion"
                className="rounded-xl shadow-hover w-full"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Opportunities */}
      <section id="opportunities" className="section-padding">
        <div className="container-custom">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-1 h-12 bg-primary rounded-full" />
            <h2 className="text-heading">Opportunities</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {opportunities.map((opp, index) => (
              <motion.div
                key={opp.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="service-card card-hover flex flex-col"
              >
                <h3 className="text-xl font-semibold text-primary mb-3">
                  {opp.title}
                </h3>
                <p className="text-muted-foreground text-sm flex-1">
                  {opp.description}
                </p>
                <span className="text-xs uppercase tracking-widest text-foreground font-medium mt-6">
                  {opp.level}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Work Culture */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <SectionHeader title="Work Culture" centered={false} />

          <div className="grid lg:grid-cols-2 gap-12 items-center mt-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <img
                src={workCulture}
                alt="Team Culture"
                className="rounded-xl shadow-card w-full"
              />
            </motion.div>

            <div className="space-y-8">
              {culturePoints.map((point, index) => (
                <motion.div
                  key={point.title}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="border-b border-border pb-6 last:border-0"
                >
                  <h4 className="text-lg font-semibold mb-2">{point.title}</h4>
                  <p className="text-muted-foreground text-sm">
                    {point.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="max-w-2xl">
            <h2 className="text-heading mb-4">Ready to shape the future?</h2>
            <p className="text-body-large mb-8">
              Join a team committed to excellence. Apply for a specific role or
              submit your profile for future consideration in our talent pool.
            </p>
            <Link to="/contact" className="btn-gold">
              APPLY NOW
            </Link>
          </div>
        </div>
      </section>

      <DynamicFormDisplay pageName="careers" />
    </Layout>
  );
};

export default Careers;
