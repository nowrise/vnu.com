import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout";
import { SEOHead } from "@/components/SEOHead";
import { motion } from "framer-motion";
import { Calendar, Clock, User, ArrowLeft, Tag } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  author_name: string;
  author_image: string | null;
  published_at: string | null;
  tags: string[];
  read_time: number | null;
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();

  const { data: blog, isLoading, error } = useQuery({
    queryKey: ["blog", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("nowrise_blogs")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .single();
      if (error) throw error;
      return data as Blog;
    },
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      </Layout>
    );
  }

  if (error || !blog) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Blog Post Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The blog post you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild>
            <Link to="/blog">Back to Blog</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  // Simple markdown-like rendering (headings, bold, links, code blocks)
  const renderContent = (content: string) => {
    return content.split("\n\n").map((paragraph, i) => {
      // Headings
      if (paragraph.startsWith("### ")) {
        return <h3 key={i} className="text-xl font-semibold mt-8 mb-4">{paragraph.slice(4)}</h3>;
      }
      if (paragraph.startsWith("## ")) {
        return <h2 key={i} className="text-2xl font-bold mt-10 mb-4">{paragraph.slice(3)}</h2>;
      }
      if (paragraph.startsWith("# ")) {
        return <h1 key={i} className="text-3xl font-bold mt-12 mb-6">{paragraph.slice(2)}</h1>;
      }
      // Code blocks
      if (paragraph.startsWith("```")) {
        const code = paragraph.replace(/```\w*\n?/g, "").trim();
        return (
          <pre key={i} className="bg-muted p-4 rounded-lg overflow-x-auto my-4 text-sm">
            <code>{code}</code>
          </pre>
        );
      }
      // Lists
      if (paragraph.startsWith("- ") || paragraph.startsWith("* ")) {
        const items = paragraph.split("\n").filter(l => l.startsWith("- ") || l.startsWith("* "));
        return (
          <ul key={i} className="list-disc list-inside space-y-2 my-4">
            {items.map((item, j) => (
              <li key={j}>{item.slice(2)}</li>
            ))}
          </ul>
        );
      }
      // Regular paragraph
      return <p key={i} className="text-muted-foreground leading-relaxed my-4">{paragraph}</p>;
    });
  };

  return (
    <Layout>
      <SEOHead
        title={`${blog.title} | NowRise Institute Blog`}
        description={blog.excerpt || blog.content.slice(0, 160)}
        keywords={blog.tags?.join(", ")}
        ogImage={blog.cover_image || undefined}
      />

      <article className="py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Back link */}
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Tags */}
            {blog.tags && blog.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {blog.tags.map(tag => (
                  <span key={tag} className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              {blog.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-6 text-muted-foreground mb-8 pb-8 border-b">
              <div className="flex items-center gap-3">
                {blog.author_image ? (
                  <img src={blog.author_image} alt={blog.author_name} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                )}
                <span className="font-medium text-foreground">{blog.author_name}</span>
              </div>
              {blog.published_at && (
                <span className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(blog.published_at), "MMMM d, yyyy")}
                </span>
              )}
              {blog.read_time && (
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {blog.read_time} min read
                </span>
              )}
            </div>

            {/* Cover Image */}
            {blog.cover_image && (
              <div className="aspect-video rounded-xl overflow-hidden mb-10">
                <img
                  src={blog.cover_image}
                  alt={blog.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Content */}
            <div className="prose prose-lg max-w-none">
              {renderContent(blog.content)}
            </div>
          </motion.div>

          {/* Footer CTA */}
          <div className="mt-16 p-8 bg-primary/5 rounded-xl text-center">
            <h3 className="text-xl font-semibold mb-2">Ready to Start Your IT Journey?</h3>
            <p className="text-muted-foreground mb-4">
              Explore our programs and take the first step toward your tech career.
            </p>
            <Button asChild>
              <Link to="/nowrise-institute">View Programs</Link>
            </Button>
          </div>
        </div>
      </article>
    </Layout>
  );
}
