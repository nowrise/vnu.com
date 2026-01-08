import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Mail, Briefcase, GraduationCap, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const AdminOverview = () => {
  const { data: contactCount } = useQuery({
    queryKey: ["admin-contacts-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("contact_requests")
        .select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: careerCount } = useQuery({
    queryKey: ["admin-careers-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("career_applications")
        .select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: nowriseCount } = useQuery({
    queryKey: ["admin-nowrise-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("nowrise_applications")
        .select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: userCount } = useQuery({
    queryKey: ["admin-users-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const stats = [
    {
      title: "Contact Requests",
      value: contactCount ?? 0,
      icon: Mail,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Career Applications",
      value: careerCount ?? 0,
      icon: Briefcase,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "NowRise Applications",
      value: nowriseCount ?? 0,
      icon: GraduationCap,
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "Registered Users",
      value: userCount ?? 0,
      icon: Users,
      color: "bg-orange-100 text-orange-600",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-background border border-border rounded-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon size={20} />
              </div>
            </div>
            <h3 className="text-3xl font-bold mb-1">{stat.value}</h3>
            <p className="text-sm text-muted-foreground">{stat.title}</p>
          </motion.div>
        ))}
      </div>

      <div className="bg-secondary/50 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-2">Welcome to the Admin Dashboard</h2>
        <p className="text-muted-foreground">
          Manage contact requests, career applications, NowRise enrollments, and site content
          from this central dashboard. Use the sidebar to navigate between sections.
        </p>
      </div>
    </div>
  );
};

export default AdminOverview;
