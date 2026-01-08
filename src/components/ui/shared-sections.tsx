import { motion, useScroll, useTransform } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { useRef } from "react";

interface ProcessStepProps {
  number: string;
  title: string;
  description: string;
  isLast?: boolean;
}

export const ProcessStep = ({
  number,
  title,
  description,
  isLast = false,
}: ProcessStepProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="flex-1 relative group"
    >
      <div className="flex items-center mb-6">
        <motion.div
          className="process-number group-hover:border-primary group-hover:text-primary transition-colors"
          whileHover={{ scale: 1.1 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {number}
        </motion.div>
        {!isLast && (
          <div className="hidden md:block flex-1 h-px bg-border ml-4 group-hover:bg-primary/30 transition-colors" />
        )}
      </div>
      <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
        {title}
      </h3>
      <p className="text-muted-foreground text-sm leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
};

interface ServiceCardProps {
  icon: LucideIcon;
  title: string;
  items: string[];
  linkText?: string;
  onLinkClick?: () => void;
}

export const ServiceCard = ({
  icon: Icon,
  title,
  items,
  linkText = "Learn More →",
  onLinkClick,
}: ServiceCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -8 }}
      className="service-card card-hover group cursor-pointer"
    >
      <motion.div
        className="w-10 h-10 rounded-lg bg-background flex items-center justify-center mb-6"
        whileHover={{ scale: 1.1, rotate: 5 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <Icon size={20} className="text-foreground group-hover:text-primary transition-colors" />
      </motion.div>
      <h3 className="text-subheading mb-4 group-hover:text-primary transition-colors">{title}</h3>
      <ul className="space-y-3 mb-6">
        {items.map((item, index) => (
          <motion.li
            key={index}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="flex items-start gap-2 text-sm text-muted-foreground"
          >
            <span className="text-primary">✓</span>
            {item}
          </motion.li>
        ))}
      </ul>
      {onLinkClick && (
        <button
          onClick={onLinkClick}
          className="text-sm font-medium text-foreground hover:text-primary transition-colors story-link"
        >
          {linkText}
        </button>
      )}
    </motion.div>
  );
};

interface IndustryCardProps {
  icon: LucideIcon;
  title: string;
}

export const IndustryCard = ({ icon: Icon, title }: IndustryCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="industry-card flex flex-col items-center text-center cursor-pointer group"
    >
      <motion.div
        whileHover={{ scale: 1.2, rotate: 10 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <Icon size={28} className="mb-3 text-foreground group-hover:text-primary transition-colors" />
      </motion.div>
      <span className="font-medium text-sm group-hover:text-primary transition-colors">{title}</span>
    </motion.div>
  );
};

interface SectionHeaderProps {
  label?: string;
  title: string;
  description?: string;
  centered?: boolean;
  light?: boolean;
}

export const SectionHeader = ({
  label,
  title,
  description,
  centered = true,
  light = false,
}: SectionHeaderProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={`mb-12 ${centered ? "text-center max-w-3xl mx-auto" : ""}`}
    >
      {label && (
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3 }}
          className={`text-label mb-4 block ${light ? "text-primary" : ""}`}
        >
          {label}
        </motion.span>
      )}
      <h2 className={`text-heading mb-4 ${light ? "text-accent-foreground" : ""}`}>
        {title}
      </h2>
      {description && (
        <p className={`text-body-large ${light ? "text-accent-foreground/80" : ""}`}>
          {description}
        </p>
      )}
    </motion.div>
  );
};

interface ParallaxSectionProps {
  children: React.ReactNode;
  className?: string;
  speed?: number;
}

export const ParallaxSection = ({ children, className = "", speed = 0.3 }: ParallaxSectionProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, speed * 100]);

  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  );
};
