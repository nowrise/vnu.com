import { useParams, useSearchParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Star, Loader2 } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";

interface FormField {
  id: string;
  type: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  options?: string[];
}

interface CustomForm {
  id: string;
  form_name: string;
  description: string | null;
  fields: FormField[];
  is_published: boolean;
}

const FormPage = () => {
  const { formId } = useParams();
  const [searchParams] = useSearchParams();
  const source = searchParams.get("src") || "direct";
  
  const [formData, setFormData] = useState<Record<string, string | string[]>>({});
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [honeypot, setHoneypot] = useState("");

  const { data: form, isLoading, error } = useQuery({
    queryKey: ["public-form", formId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("custom_forms")
        .select("*")
        .eq("id", formId)
        .eq("is_published", true)
        .single();
      
      if (error) throw error;
      return {
        ...data,
        fields: data.fields as unknown as FormField[]
      } as CustomForm;
    },
    enabled: !!formId,
  });

  const submitMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      // Submit through edge function with all security controls
      const response = await supabase.functions.invoke('submit-form', {
        body: {
          formType: 'form_submissions',
          formId: formId,
          data: {
            submission_data: { ...data, source }
          },
          honeypot: honeypot
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to submit form');
      }

      const result = response.data;
      if (result?.error) {
        throw new Error(result.error);
      }

      return result;
    },
    onSuccess: () => {
      setIsSubmitted(true);
      toast.success("Form submitted successfully!");
    },
    onError: (error: Error) => {
      const message = error.message.includes('Too many requests')
        ? "Too many submissions. Please wait a moment and try again."
        : "Failed to submit form. Please try again.";
      toast.error(message);
    }
  });

  const handleInputChange = (fieldId: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleCheckboxChange = (fieldId: string, option: string, checked: boolean) => {
    setFormData(prev => {
      const current = (prev[fieldId] as string[]) || [];
      if (checked) {
        return { ...prev, [fieldId]: [...current, option] };
      } else {
        return { ...prev, [fieldId]: current.filter(v => v !== option) };
      }
    });
  };

  const handleRatingChange = (fieldId: string, value: number) => {
    setRatings(prev => ({ ...prev, [fieldId]: value }));
    setFormData(prev => ({ ...prev, [fieldId]: value.toString() }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitMutation.mutate(formData);
  };

  const renderField = (field: FormField) => {
    switch (field.type) {
      case "text":
      case "short_answer":
      case "email":
      case "phone":
      case "number":
      case "url":
      case "date":
        return (
          <Input
            type={field.type === "short_answer" || field.type === "text" ? "text" : field.type}
            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
            value={(formData[field.id] as string) || ""}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            required={field.required}
            className="bg-background border-border"
          />
        );
      case "paragraph":
        return (
          <Textarea
            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
            value={(formData[field.id] as string) || ""}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            required={field.required}
            rows={4}
            className="bg-background border-border"
          />
        );
      case "dropdown":
        return (
          <Select
            value={(formData[field.id] as string) || ""}
            onValueChange={(value) => handleInputChange(field.id, value)}
            required={field.required}
          >
            <SelectTrigger className="bg-background border-border">
              <SelectValue placeholder={field.placeholder || "Select an option"} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case "multiple_choice":
        return (
          <RadioGroup
            value={(formData[field.id] as string) || ""}
            onValueChange={(value) => handleInputChange(field.id, value)}
          >
            {field.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${field.id}-${option}`} />
                <Label htmlFor={`${field.id}-${option}`} className="text-foreground">{option}</Label>
              </div>
            ))}
          </RadioGroup>
        );
      case "checkboxes":
        return (
          <div className="space-y-2">
            {field.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={`${field.id}-${option}`}
                  checked={((formData[field.id] as string[]) || []).includes(option)}
                  onCheckedChange={(checked) => handleCheckboxChange(field.id, option, !!checked)}
                />
                <Label htmlFor={`${field.id}-${option}`} className="text-foreground">{option}</Label>
              </div>
            ))}
          </div>
        );
      case "rating":
        return (
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleRatingChange(field.id, star)}
                className="p-1 hover:scale-110 transition-transform"
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= (ratings[field.id] || 0)
                      ? "fill-primary text-primary"
                      : "text-muted-foreground"
                  }`}
                />
              </button>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (error || !form) {
    return (
      <Layout>
        <SEOHead title="Form Not Found" description="The requested form is not available." />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">Form Not Found</h1>
            <p className="text-muted-foreground">This form may have been removed or is no longer available.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEOHead title={form.form_name} description={form.description || `Fill out the ${form.form_name} form`} />
      <div className="min-h-screen py-24 px-4">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-xl p-8 shadow-lg"
          >
            <AnimatePresence mode="wait">
              {isSubmitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-foreground mb-2">Thank You!</h2>
                  <p className="text-muted-foreground">Your response has been recorded.</p>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  <div className="mb-8">
                    <h1 className="text-2xl font-bold text-foreground mb-2">{form.form_name}</h1>
                    {form.description && (
                      <p className="text-muted-foreground">{form.description}</p>
                    )}
                  </div>

                  {/* Honeypot field - hidden from users, visible to bots */}
                  <input
                    type="text"
                    name="website"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                    style={{ position: 'absolute', left: '-9999px', opacity: 0 }}
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                  />

                  {form.fields.map((field) => (
                    <div key={field.id} className="space-y-2">
                      <Label className="text-foreground">
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </Label>
                      {renderField(field)}
                    </div>
                  ))}

                  <Button
                    type="submit"
                    disabled={submitMutation.isPending}
                    className="w-full btn-gold"
                  >
                    {submitMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit"
                    )}
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default FormPage;
