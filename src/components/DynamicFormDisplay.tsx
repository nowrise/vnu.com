import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle, Star, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface FormField {
  id: string;
  label: string;
  type: "text" | "email" | "textarea" | "select" | "phone" | "number" | "date" | "url" | "checkbox" | "radio" | "rating";
  required: boolean;
  options?: string[];
  placeholder?: string;
  helpText?: string;
}

interface CustomForm {
  id: string;
  form_name: string;
  description: string | null;
  fields: FormField[];
  target_pages: string[];
  display_types: string[];
  is_published: boolean;
  popup_trigger_text: string | null;
  section_title: string | null;
}

interface DynamicFormDisplayProps {
  pageName: string;
}

export const DynamicFormDisplay = ({ pageName }: DynamicFormDisplayProps) => {
  const [openPopupId, setOpenPopupId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, string | string[]>>({});
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [honeypot, setHoneypot] = useState("");

  const { data: forms, isLoading } = useQuery({
    queryKey: ["published-forms", pageName],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("custom_forms")
        .select("*")
        .eq("is_published", true);

      if (error) throw error;

      // Filter forms where target_page contains the pageName
      const allForms = (data || []).map((form) => ({
        ...form,
        fields: (form.fields as unknown as FormField[]) || [],
        target_pages: form.target_page ? form.target_page.split(",").map(p => p.trim()) : [],
        display_types: form.display_type ? form.display_type.split(",").map(d => d.trim()) : [],
      })) as CustomForm[];

      // Return only forms targeting this page
      return allForms.filter((form) => form.target_pages.includes(pageName));
    },
  });

  const submitForm = useMutation({
    mutationFn: async ({ formId, data }: { formId: string; data: Record<string, string | string[]> }) => {
      // Check honeypot - if filled, silently succeed (bot detection)
      const response = await supabase.functions.invoke('submit-form', {
        body: {
          formType: 'form_submissions',
          formId,
          data: {
            submission_data: data
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
    onSuccess: (_, variables) => {
      setSubmitted(variables.formId);
      setFormData({});
      setRatings({});
      setHoneypot("");
      setTimeout(() => {
        setSubmitted(null);
        setOpenPopupId(null);
      }, 2500);
      toast({ title: "Form submitted successfully!" });
    },
    onError: (error: Error) => {
      const message = error.message.includes('Too many requests') 
        ? "Too many submissions. Please wait a moment." 
        : "Failed to submit form";
      toast({ title: message, variant: "destructive" });
    },
  });

  const handleSubmit = (form: CustomForm, e: React.FormEvent) => {
    e.preventDefault();
    
    // Combine regular form data with ratings
    const combinedData = { ...formData };
    Object.entries(ratings).forEach(([key, value]) => {
      combinedData[key] = value.toString();
    });
    
    submitForm.mutate({ formId: form.id, data: combinedData });
  };

  const handleInputChange = (fieldLabel: string, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [fieldLabel]: value }));
  };

  const handleCheckboxChange = (fieldLabel: string, option: string, checked: boolean) => {
    setFormData((prev) => {
      const current = (prev[fieldLabel] as string[]) || [];
      if (checked) {
        return { ...prev, [fieldLabel]: [...current, option] };
      } else {
        return { ...prev, [fieldLabel]: current.filter((o) => o !== option) };
      }
    });
  };

  const popupForms = forms?.filter((f) => f.display_types.includes("popup")) || [];
  const sectionForms = forms?.filter((f) => f.display_types.includes("section")) || [];

  const renderField = (field: FormField, formId: string) => {
    const baseClasses =
      "w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all";
    const fieldKey = `${formId}-${field.label}`;

    switch (field.type) {
      case "textarea":
        return (
          <textarea
            value={(formData[field.label] as string) || ""}
            onChange={(e) => handleInputChange(field.label, e.target.value)}
            placeholder={field.placeholder || "Your answer..."}
            required={field.required}
            rows={4}
            className={`${baseClasses} resize-none`}
          />
        );

      case "select":
        return (
          <select
            value={(formData[field.label] as string) || ""}
            onChange={(e) => handleInputChange(field.label, e.target.value)}
            required={field.required}
            className={baseClasses}
          >
            <option value="">{field.placeholder || "Select an option"}</option>
            {field.options?.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        );

      case "radio":
        return (
          <div className="space-y-2">
            {field.options?.map((opt) => (
              <label
                key={opt}
                className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                  formData[field.label] === opt
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50 hover:bg-secondary/50"
                }`}
              >
                <input
                  type="radio"
                  name={fieldKey}
                  value={opt}
                  checked={formData[field.label] === opt}
                  onChange={(e) => handleInputChange(field.label, e.target.value)}
                  required={field.required}
                  className="w-4 h-4 text-primary"
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        );

      case "checkbox":
        return (
          <div className="space-y-2">
            {field.options?.map((opt) => {
              const isChecked = ((formData[field.label] as string[]) || []).includes(opt);
              return (
                <label
                  key={opt}
                  className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                    isChecked
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50 hover:bg-secondary/50"
                  }`}
                >
                  <input
                    type="checkbox"
                    value={opt}
                    checked={isChecked}
                    onChange={(e) => handleCheckboxChange(field.label, opt, e.target.checked)}
                    className="w-4 h-4 rounded text-primary"
                  />
                  <span>{opt}</span>
                </label>
              );
            })}
          </div>
        );

      case "rating":
        const currentRating = ratings[field.label] || 0;
        return (
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRatings((prev) => ({ ...prev, [field.label]: n }))}
                className="p-2 hover:scale-110 transition-transform"
              >
                <Star
                  size={28}
                  className={n <= currentRating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"}
                />
              </button>
            ))}
          </div>
        );

      case "date":
        return (
          <input
            type="date"
            value={(formData[field.label] as string) || ""}
            onChange={(e) => handleInputChange(field.label, e.target.value)}
            required={field.required}
            className={baseClasses}
          />
        );

      case "number":
        return (
          <input
            type="number"
            value={(formData[field.label] as string) || ""}
            onChange={(e) => handleInputChange(field.label, e.target.value)}
            placeholder={field.placeholder || "Enter a number"}
            required={field.required}
            className={baseClasses}
          />
        );

      case "url":
        return (
          <input
            type="url"
            value={(formData[field.label] as string) || ""}
            onChange={(e) => handleInputChange(field.label, e.target.value)}
            placeholder={field.placeholder || "https://example.com"}
            required={field.required}
            className={baseClasses}
          />
        );

      default:
        return (
          <input
            type={field.type}
            value={(formData[field.label] as string) || ""}
            onChange={(e) => handleInputChange(field.label, e.target.value)}
            placeholder={field.placeholder || "Your answer..."}
            required={field.required}
            className={baseClasses}
          />
        );
    }
  };

  const renderForm = (form: CustomForm) => {
    if (submitted === form.id) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-8"
        >
          <CheckCircle size={56} className="mx-auto text-green-500 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Thank You!</h3>
          <p className="text-muted-foreground">Your response has been recorded.</p>
        </motion.div>
      );
    }

    return (
      <form onSubmit={(e) => handleSubmit(form, e)} className="space-y-5">
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
          <motion.div
            key={field.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <label className="block text-sm font-medium mb-2">
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </label>
            {field.helpText && (
              <p className="text-xs text-muted-foreground mb-2">{field.helpText}</p>
            )}
            {renderField(field, form.id)}
          </motion.div>
        ))}
        <button
          type="submit"
          disabled={submitForm.isPending}
          className="btn-gold w-full flex items-center justify-center gap-2 py-3"
        >
          {submitForm.isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit"
          )}
        </button>
      </form>
    );
  };

  if (isLoading) return null;

  if (!forms || forms.length === 0) return null;

  return (
    <>
      {/* Popup Trigger Buttons */}
      {popupForms.length > 0 && (
        <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3">
          {popupForms.map((form) => (
            <motion.button
              key={form.id}
              onClick={() => {
                setOpenPopupId(form.id);
                setFormData({});
                setRatings({});
                setSubmitted(null);
              }}
              className="btn-gold shadow-xl flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              <MessageSquare size={18} />
              {form.popup_trigger_text || "Get Started"}
            </motion.button>
          ))}
        </div>
      )}

      {/* Popup Modals */}
      {popupForms.map((form) => (
        <Dialog
          key={form.id}
          open={openPopupId === form.id}
          onOpenChange={(open) => {
            if (!open) {
              setOpenPopupId(null);
              setFormData({});
              setRatings({});
            }
          }}
        >
          <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl">{form.form_name}</DialogTitle>
              {form.description && (
                <DialogDescription className="text-base">{form.description}</DialogDescription>
              )}
            </DialogHeader>
            <div className="pt-2">{renderForm(form)}</div>
          </DialogContent>
        </Dialog>
      ))}

      {/* Section Forms */}
      {sectionForms.map((form) => (
        <section
          key={form.id}
          className="section-padding bg-gradient-to-br from-primary/5 via-background to-primary/10"
        >
          <div className="container-custom max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="glass-card p-8 md:p-10 rounded-2xl shadow-lg"
            >
              <div className="text-center mb-8">
                <h2 className="text-heading mb-3">{form.section_title || form.form_name}</h2>
                {form.description && (
                  <p className="text-muted-foreground max-w-lg mx-auto">{form.description}</p>
                )}
              </div>
              {renderForm(form)}
            </motion.div>
          </div>
        </section>
      ))}
    </>
  );
};

export default DynamicFormDisplay;
