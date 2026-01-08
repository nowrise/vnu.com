import { Layout } from "@/components/layout";
import { motion } from "framer-motion";
import { Code, Settings, Lightbulb, ArrowRight } from "lucide-react";
import { ProcessStep, SectionHeader } from "@/components/ui/shared-sections";
import { fadeInUp, staggerContainer, staggerItem } from "@/hooks/use-scroll-animation";
import { NeuralNetwork } from "@/components/ui/neural-network";
import { DynamicFormDisplay } from "@/components/DynamicFormDisplay";
import { SEOHead } from "@/components/SEOHead";

const serviceCards = [
  {
    icon: Code,
    title: "IT & Software Development",
    items: ["Web applications", "Mobile apps", "Custom platforms"],
  },
  {
    icon: Settings,
    title: "AI & Automation",
    items: ["AI marketing systems", "Chatbots & CRM automation", "Workflow automation"],
  },
  {
    icon: Lightbulb,
    title: "Consulting & Strategy",
    items: ["Digital transformation", "Tech advisory", "Process optimization"],
  },
];

const Services = () => {
  return (
    <Layout>
      <SEOHead />
      {/* Hero Section - Dark Background with Left-Right Split */}
      <section className="relative min-h-[60vh] md:min-h-[70vh] bg-accent overflow-hidden">
        <div className="container-custom h-full">
          <div className="grid lg:grid-cols-[45%_55%] min-h-[60vh] md:min-h-[70vh] items-center">
            {/* Left Side - Content */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              className="relative z-10 py-16 md:py-20 pr-8 lg:pr-12"
            >
              <h1 className="text-display mb-6 text-accent-foreground">Our IT Services</h1>
              <p className="text-body-large text-accent-foreground/70">
                Scalable technology solutions designed to support business growth.
              </p>
            </motion.div>
            
            {/* Right Side - Interactive Network */}
            <div className="absolute lg:relative inset-0 lg:inset-auto h-full">
              <NeuralNetwork className="w-full h-full" />
              {/* Gradient fade on mobile for text readability */}
              <div className="absolute inset-0 bg-gradient-to-r from-accent via-accent/60 to-transparent lg:hidden" />
            </div>
          </div>
        </div>
      </section>

      {/* Service Cards */}
      <section className="section-padding section-taupe">
        <div className="container-custom">
          <motion.div 
            className="grid md:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            {serviceCards.map((service) => (
              <motion.div
                key={service.title}
                variants={staggerItem}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="service-card"
              >
                <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center mb-6">
                  <service.icon size={20} className="text-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-4">{service.title}</h3>
                <ul className="space-y-3">
                  {service.items.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <ArrowRight size={14} className="text-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Engagement Model */}
      <section className="section-padding">
        <div className="container-custom">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            <SectionHeader
              title="Engagement Model"
              description="Our structured approach ensures clarity and consistent delivery."
              centered={false}
            />
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-4 gap-8 mt-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.div variants={staggerItem}>
              <ProcessStep
                number="01"
                title="Consultation"
                description="Deep dive understanding of requirements and strategic alignment."
              />
            </motion.div>
            <motion.div variants={staggerItem}>
              <ProcessStep
                number="02"
                title="Solution Design"
                description="Architecting scalable frameworks tailored to your needs."
              />
            </motion.div>
            <motion.div variants={staggerItem}>
              <ProcessStep
                number="03"
                title="Execution"
                description="Agile implementation focusing on quality and speed."
              />
            </motion.div>
            <motion.div variants={staggerItem}>
              <ProcessStep
                number="04"
                title="Support & Scaling"
                description="Continuous optimization and growth support."
                isLast
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      <DynamicFormDisplay pageName="services" />
    </Layout>
  );
};

export default Services;
