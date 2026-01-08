import { Layout } from "@/components/layout";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Target,
  Workflow,
  BarChart2,
  TrendingDown,
  DollarSign,
  Clock,
  Layers,
  ArrowUpRight,
} from "lucide-react";
import { ProcessStep, SectionHeader } from "@/components/ui/shared-sections";
import heroConsulting from "@/assets/hero-consulting.jpg";
import { DynamicFormDisplay } from "@/components/DynamicFormDisplay";
import { SEOHead } from "@/components/SEOHead";

const painPoints = [
  {
    icon: TrendingDown,
    title: "Low Conversion",
    description:
      "User journeys that drop off before value realization due to lack of personalization.",
  },
  {
    icon: DollarSign,
    title: "High Operational Cost",
    description:
      "Resources drained by repetitive tasks that could be automated intelligently.",
  },
  {
    icon: Clock,
    title: "Manual Workflows",
    description:
      "Slow, error-prone manual processes that delay time-to-market.",
  },
  {
    icon: Layers,
    title: "Poor Scalability",
    description:
      "Legacy systems that break under the pressure of increased demand.",
  },
];

const solutions = [
  {
    icon: Target,
    title: "AI Marketing Systems",
    description:
      "Deploy predictive algorithms to target customer segments with unprecedented accuracy, driving higher ROI.",
  },
  {
    icon: Workflow,
    title: "Automation Workflows",
    description:
      "Streamline operations by replacing manual data entry and processing with intelligent, automated pipelines.",
  },
  {
    icon: BarChart2,
    title: "Data-Driven Consulting",
    description:
      "Transform raw data into actionable strategic insights that guide executive decision-making.",
  },
];

const AIConsulting = () => {
  return (
    <Layout>
      <SEOHead />
      {/* Hero Section */}
      <section className="section-slate pt-32 md:pt-40 pb-20">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-display text-accent-foreground mb-6">
                AI-Driven Business Growth
              </h1>
              <p className="text-accent-foreground/80 text-lg mb-8 max-w-lg">
                We help companies reduce costs, improve efficiency, and scale
                faster using AI and automation.
              </p>
              <Link to="/contact" className="btn-gold">
                Book a Consultation
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <img
                src={heroConsulting}
                alt="Business Consultation"
                className="rounded-xl w-full grayscale"
              />
              <div className="absolute bottom-6 left-6 right-6 glass-card p-4 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">
                  EFFICIENCY GAIN
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-foreground">
                    +42.8%
                  </span>
                  <TrendingDown
                    size={20}
                    className="text-primary rotate-180"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Innovation Gap */}
      <section className="section-padding section-taupe">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-heading mb-4">The Innovation Gap</h2>
              <p className="text-muted-foreground mb-6">
                Modern enterprises often struggle with scalability despite heavy
                investment. We identify and eliminate the friction points holding
                you back.
              </p>
              <div className="w-16 h-1 bg-primary" />
            </div>

            <div className="grid grid-cols-2 gap-6">
              {painPoints.map((point, index) => (
                <motion.div
                  key={point.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="p-6 rounded-lg bg-background"
                >
                  <point.icon size={24} className="text-primary mb-3" />
                  <h4 className="font-semibold mb-2">{point.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {point.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Strategic Intelligence */}
      <section className="section-padding">
        <div className="container-custom">
          <SectionHeader
            label="ENTERPRISE SOLUTIONS"
            title="Strategic Intelligence"
            centered={false}
          />

          <div className="grid md:grid-cols-3 gap-8 mt-12">
            {solutions.map((solution, index) => (
              <motion.div
                key={solution.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="service-card card-hover relative"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center">
                    <solution.icon
                      size={22}
                      className="text-accent-foreground"
                    />
                  </div>
                  <ArrowUpRight size={20} className="text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{solution.title}</h3>
                <p className="text-muted-foreground text-sm">
                  {solution.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Approach */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <SectionHeader
            title="Our Approach"
            description="Systematic execution for predictable outcomes."
            centered={false}
          />

          <div className="grid md:grid-cols-4 gap-8 mt-12">
            <ProcessStep
              number="01"
              title="Audit"
              description="We analyze your current infrastructure and identify bottlenecks hindering growth."
            />
            <ProcessStep
              number="02"
              title="Strategy"
              description="We design a custom roadmap leveraging AI to meet your specific business KPIs."
            />
            <ProcessStep
              number="03"
              title="Implementation"
              description="Our engineers deploy solutions seamlessly into your existing ecosystem."
            />
            <ProcessStep
              number="04"
              title="Optimization"
              description="Continuous monitoring and refining to ensure maximum long-term efficiency."
              isLast
            />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section-slate py-20">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-accent-foreground mb-3">
                Ready to modernize your business?
              </h2>
              <p className="text-accent-foreground/80">
                Schedule a strategic discovery call with our consultants today.
              </p>
            </div>
            <Link to="/contact" className="btn-gold whitespace-nowrap">
              Book a Consultation
            </Link>
          </div>
        </div>
      </section>

      <DynamicFormDisplay pageName="ai-consulting" />
    </Layout>
  );
};

export default AIConsulting;
