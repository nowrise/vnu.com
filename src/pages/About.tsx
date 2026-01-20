import { Layout } from "@/components/layout";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Target,
  Users,
  Award,
  Globe,
  CheckCircle,
} from "lucide-react";
import { SectionHeader } from "@/components/ui/shared-sections";
import { DynamicFormDisplay } from "@/components/DynamicFormDisplay";
import { SEOHead } from "@/components/SEOHead";

const values = [
  {
    icon: Target,
    title: "Excellence",
    description: "We strive for excellence in every project, delivering solutions that exceed expectations.",
  },
  {
    icon: Users,
    title: "Collaboration",
    description: "Building strong partnerships with clients and within our team to achieve shared goals.",
  },
  {
    icon: Award,
    title: "Innovation",
    description: "Continuously exploring new technologies and approaches to drive business value.",
  },
  {
    icon: Globe,
    title: "Global Impact",
    description: "Creating solutions that help businesses thrive in the global digital economy.",
  },
];

const About = () => {
  return (
    <Layout>
      <SEOHead />
      {/* Hero Section */}
      <section className="section-padding pt-32 md:pt-40">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl"
          >
            <h1 className="text-display mb-6">About VnU</h1>
            <p className="text-body-large mb-8">
              We are an IT and consulting company dedicated to delivering
              technology, AI-driven growth, and skilled talent solutions for
              modern businesses. Our mission is to empower organizations with
              enterprise-grade technology and strategic insights.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="section-padding section-taupe">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-heading mb-6">Our Mission</h2>
              <p className="text-body-large mb-6">
                To bridge the gap between technology potential and business
                reality, helping organizations of all sizes leverage digital
                transformation for sustainable growth.
              </p>
              <ul className="space-y-4">
                {[
                  "Deliver scalable technology solutions",
                  "Provide strategic AI and automation consulting",
                  "Connect businesses with top-tier talent",
                  "Foster industry-aligned skill development",
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle size={20} className="text-primary flex-shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-2 gap-6"
            >
              <div className="bg-background p-8 rounded-lg text-center">
                <div className="text-4xl font-bold text-primary mb-2">50+</div>
                <p className="text-sm text-muted-foreground">Projects Delivered</p>
              </div>
              <div className="bg-background p-8 rounded-lg text-center">
                <div className="text-4xl font-bold text-primary mb-2">25+</div>
                <p className="text-sm text-muted-foreground">Expert Team Members</p>
              </div>
              <div className="bg-background p-8 rounded-lg text-center">
                <div className="text-4xl font-bold text-primary mb-2">100+</div>
                <p className="text-sm text-muted-foreground">Talents Trained</p>
              </div>
              <div className="bg-background p-8 rounded-lg text-center">
                <div className="text-4xl font-bold text-primary mb-2">15+</div>
                <p className="text-sm text-muted-foreground">Industry Sectors</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="section-padding">
        <div className="container-custom">
          <SectionHeader
            title="Our Values"
            description="The principles that guide our work and relationships."
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-6">
                  <value.icon size={28} className="text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-3">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-slate py-20">
        <div className="container-custom text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-accent-foreground mb-4">
            Ready to work with us?
          </h2>
          <p className="text-accent-foreground/80 mb-8 max-w-2xl mx-auto">
            Let's discuss how we can help transform your business with our
            technology and talent solutions.
          </p>
          <Link to="/contact" className="btn-gold">
            Get in Touch
          </Link>
        </div>
      </section>

      <DynamicFormDisplay pageName="about" />
    </Layout>
  );
};

export default About;
