import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout";
import { SEOHead } from "@/components/SEOHead";
import { motion } from "framer-motion";
import { Calendar, Clock, User, ArrowRight } from "lucide-react";
import { format } from "date-fns";

interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image: string | null;
  author_name: string;
  author_image: string | null;
  published_at: string | null;
  tags: string[];
  read_time: number | null;
}

export default function Blogs() {
  const { data: blogs = [], isLoading } = useQuery({
    queryKey: ["public-blogs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("nowrise_blogs")
        .select("id, title, slug, excerpt, cover_image, author_name, author_image, published_at, tags, read_time")
        .eq("is_published", true)
        .order("published_at", { ascending: false });
      if (error) throw error;
      return data as Blog[];
    },
  });

  return (
    <Layout>
      <SEOHead
        title="Blog | NowRise Institute - IT Education Insights"
        description="Explore articles on IT education, career development, and technology trends from NowRise Institute experts."
        keywords="IT blog, technology education, career tips, programming tutorials, NowRise Institute"
      />

      {/* Hero */}
      <section className="relative py-20 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              NowRise <span className="text-primary">Blog</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Insights, tutorials, and career guidance from our expert instructors
            </p>
          </motion.div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : blogs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No blog posts available yet. Check back soon!
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogs.map((blog, index) => (
                <motion.article
                  key={blog.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group bg-card rounded-xl overflow-hidden border shadow-sm hover:shadow-lg transition-all duration-300"
                >
                  <Link to={`/blog/${blog.slug}`}>
                    {blog.cover_image && (
                      <div className="aspect-video overflow-hidden">
                        <img
                          src={blog.cover_image}
                          alt={blog.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      {blog.tags && blog.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {blog.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <h2 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {blog.title}
                      </h2>
                      {blog.excerpt && (
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                          {blog.excerpt}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-4">
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
                        </div>
                        {blog.published_at && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(blog.published_at), "MMM d")}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
