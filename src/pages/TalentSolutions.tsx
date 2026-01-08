import { Layout } from "@/components/layout";
import { motion } from "framer-motion";
import { Users, UserCheck, Award, Settings, ArrowRight } from "lucide-react";
import { ProcessStep, SectionHeader } from "@/components/ui/shared-sections";
import heroTalent from "@/assets/hero-talent.jpg";
import { DynamicFormDisplay } from "@/components/DynamicFormDisplay";
import { SEOHead } from "@/components/SEOHead";

const solutions = [
  {
    icon: Users,
    title: "Intern Hiring",
    description:
      "Curated pipeline of ambitious early-career talent ready for professional mentorship and output.",
  },
  {
    icon: UserCheck,
    title: "Freelancers & Contractors",
    description:
      "Specialized independent professionals available for project-specific needs.",
  },
  {
    icon: Award,
    title: "Trainer & Expert Onboarding",
    description:
      "Subject matter experts deployed to upscale your internal teams efficiently.",
  },
  {
    icon: Settings,
    title: "Resource Outsourcing",
    description:
      "End-to-end management of dedicated teams to handle specific business functions.",
  },
];

const TalentSolutions = () => {
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
              <h1 className="text-display mb-6">
                Flexible Talent & Resource Solutions
              </h1>
              <p className="text-body-large">
                Access skilled interns, freelancers, and professionals without
                long hiring cycles.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <img
                src={heroTalent}
                alt="Professional working"
                className="rounded-xl shadow-hover w-full"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Solutions */}
      <section className="section-padding">
        <div className="container-custom">
          <SectionHeader
            title="Our Solutions"
            description="Strategic workforce augmentation designed for enterprise scalability and immediate impact."
            centered={false}
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {solutions.map((solution, index) => (
              <motion.div
                key={solution.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="service-card card-hover"
              >
                <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center mb-6">
                  <solution.icon size={20} className="text-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-3">{solution.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {solution.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <SectionHeader title="Process" centered={false} />

          <div className="grid md:grid-cols-4 gap-8 mt-12">
            <ProcessStep
              number="1"
              title="Requirement"
              description="Detailed analysis of your technical needs and cultural fit parameters."
            />
            <ProcessStep
              number="2"
              title="Matching"
              description="Precision screening to identify candidates aligned with your goals."
            />
            <ProcessStep
              number="3"
              title="Deployment"
              description="Structured onboarding to ensure immediate productivity from day one."
            />
            <ProcessStep
              number="4"
              title="Support"
              description="Ongoing engagement management and performance optimization."
              isLast
            />
          </div>
        </div>
      </section>

      <DynamicFormDisplay pageName="talent-solutions" />
    </Layout>
  );
};

export default TalentSolutions;
