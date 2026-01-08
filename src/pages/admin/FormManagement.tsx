import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Trash2,
  Edit2,
  Eye,
  EyeOff,
  Check,
  X,
  GripVertical,
  Copy,
  Settings2,
  ChevronDown,
  ChevronUp,
  Type,
  Mail,
  Phone,
  AlignLeft,
  List,
  CheckSquare,
  Calendar,
  Hash,
  Link as LinkIcon,
  Star,
  ToggleLeft,
  FileText,
  ExternalLink,
  Clipboard,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface FormField {
  id: string;
  label: string;
  type: "text" | "email" | "textarea" | "select" | "phone" | "number" | "date" | "url" | "checkbox" | "radio" | "rating";
  required: boolean;
  options?: string[];
  placeholder?: string;
  helpText?: string;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
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
  created_at: string;
  updated_at: string;
}

const availablePages = [
  { value: "home", label: "Home Page" },
  { value: "services", label: "Services" },
  { value: "ai-consulting", label: "AI Consulting" },
  { value: "talent-solutions", label: "Talent Solutions" },
  { value: "nowrise-institute", label: "NowRise Institute" },
  { value: "careers", label: "Careers" },
  { value: "about", label: "About" },
  { value: "contact", label: "Contact" },
];

const fieldTypes = [
  { value: "text", label: "Short Answer", icon: Type },
  { value: "textarea", label: "Paragraph", icon: AlignLeft },
  { value: "email", label: "Email", icon: Mail },
  { value: "phone", label: "Phone Number", icon: Phone },
  { value: "number", label: "Number", icon: Hash },
  { value: "date", label: "Date", icon: Calendar },
  { value: "url", label: "URL", icon: LinkIcon },
  { value: "select", label: "Dropdown", icon: List },
  { value: "radio", label: "Multiple Choice", icon: CheckSquare },
  { value: "checkbox", label: "Checkboxes", icon: CheckSquare },
  { value: "rating", label: "Rating", icon: Star },
];

const FormManagement = () => {
  const queryClient = useQueryClient();
  const [selectedForm, setSelectedForm] = useState<CustomForm | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newFormName, setNewFormName] = useState("");
  const [editingForm, setEditingForm] = useState<Partial<CustomForm> | null>(null);
  const [expandedField, setExpandedField] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showFieldTypes, setShowFieldTypes] = useState(false);

  const { data: forms, isLoading } = useQuery({
    queryKey: ["admin-custom-forms"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("custom_forms")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []).map((form) => ({
        ...form,
        fields: (form.fields as unknown as FormField[]) || [],
        target_pages: form.target_page ? form.target_page.split(",").filter(Boolean) : [],
        display_types: form.display_type ? form.display_type.split(",").filter(Boolean) : ["popup"],
      })) as CustomForm[];
    },
  });

  const createForm = useMutation({
    mutationFn: async (formName: string) => {
      const { data, error } = await supabase
        .from("custom_forms")
        .insert({
          form_name: formName,
          target_page: "home",
          display_type: "popup",
          fields: [] as unknown as never,
        })
        .select()
        .single();

      if (error) throw error;
      return {
        ...data,
        fields: (data.fields as unknown as FormField[]) || [],
        target_pages: data.target_page ? data.target_page.split(",").filter(Boolean) : [],
        display_types: data.display_type ? data.display_type.split(",").filter(Boolean) : ["popup"],
      } as CustomForm;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-custom-forms"] });
      toast({ title: "Form created successfully!" });
      setNewFormName("");
      setIsCreating(false);
      setSelectedForm(data);
      setEditingForm(data);
    },
    onError: () => {
      toast({ title: "Failed to create form", variant: "destructive" });
    },
  });

  const updateForm = useMutation({
    mutationFn: async (form: Partial<CustomForm> & { id: string }) => {
      const { error } = await supabase
        .from("custom_forms")
        .update({
          form_name: form.form_name,
          description: form.description,
          fields: form.fields as unknown as never,
          target_page: form.target_pages?.filter(Boolean).join(",") || "",
          display_type: form.display_types?.filter(Boolean).join(",") || "popup",
          is_published: form.is_published,
          popup_trigger_text: form.popup_trigger_text,
          section_title: form.section_title,
        })
        .eq("id", form.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-custom-forms"] });
      queryClient.invalidateQueries({ queryKey: ["published-forms"] });
      toast({ title: "Form saved successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to save form", variant: "destructive" });
    },
  });

  const deleteForm = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("custom_forms").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-custom-forms"] });
      toast({ title: "Form deleted" });
      setSelectedForm(null);
      setEditingForm(null);
    },
    onError: () => {
      toast({ title: "Failed to delete form", variant: "destructive" });
    },
  });

  const duplicateForm = useMutation({
    mutationFn: async (form: CustomForm) => {
      const { data, error } = await supabase
        .from("custom_forms")
        .insert({
          form_name: `${form.form_name} (Copy)`,
          description: form.description,
          target_page: form.target_pages.join(","),
          display_type: form.display_types.join(","),
          fields: form.fields as unknown as never,
          is_published: false,
          popup_trigger_text: form.popup_trigger_text,
          section_title: form.section_title,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-custom-forms"] });
      toast({ title: "Form duplicated" });
    },
  });

  const handleAddField = (type: FormField["type"]) => {
    if (!editingForm) return;

    const field: FormField = {
      id: crypto.randomUUID(),
      label: getDefaultLabel(type),
      type,
      required: false,
      placeholder: "",
      options: ["select", "radio", "checkbox"].includes(type) ? ["Option 1", "Option 2", "Option 3"] : undefined,
    };

    setEditingForm({
      ...editingForm,
      fields: [...(editingForm.fields || []), field],
    });

    setExpandedField(field.id);
    setShowFieldTypes(false);
  };

  const getDefaultLabel = (type: FormField["type"]): string => {
    const labels: Record<string, string> = {
      text: "Short Answer",
      textarea: "Long Answer",
      email: "Email Address",
      phone: "Phone Number",
      number: "Number",
      date: "Date",
      url: "Website URL",
      select: "Select Option",
      radio: "Choose One",
      checkbox: "Select Multiple",
      rating: "Rating",
    };
    return labels[type] || "Question";
  };

  const handleRemoveField = (fieldId: string) => {
    if (!editingForm) return;
    setEditingForm({
      ...editingForm,
      fields: editingForm.fields?.filter((f) => f.id !== fieldId) || [],
    });
    if (expandedField === fieldId) setExpandedField(null);
  };

  const handleDuplicateField = (field: FormField) => {
    if (!editingForm) return;
    const fieldIndex = editingForm.fields?.findIndex((f) => f.id === field.id) || 0;
    const newField = { ...field, id: crypto.randomUUID(), label: `${field.label} (Copy)` };
    const newFields = [...(editingForm.fields || [])];
    newFields.splice(fieldIndex + 1, 0, newField);
    setEditingForm({ ...editingForm, fields: newFields });
  };

  const handleUpdateField = (fieldId: string, updates: Partial<FormField>) => {
    if (!editingForm) return;
    setEditingForm({
      ...editingForm,
      fields: editingForm.fields?.map((f) => (f.id === fieldId ? { ...f, ...updates } : f)) || [],
    });
  };

  const handleUpdateOption = (fieldId: string, optionIndex: number, value: string) => {
    if (!editingForm) return;
    setEditingForm({
      ...editingForm,
      fields: editingForm.fields?.map((f) => {
        if (f.id === fieldId && f.options) {
          const newOptions = [...f.options];
          newOptions[optionIndex] = value;
          return { ...f, options: newOptions };
        }
        return f;
      }) || [],
    });
  };

  const handleAddOption = (fieldId: string) => {
    if (!editingForm) return;
    setEditingForm({
      ...editingForm,
      fields: editingForm.fields?.map((f) => {
        if (f.id === fieldId) {
          return { ...f, options: [...(f.options || []), `Option ${(f.options?.length || 0) + 1}`] };
        }
        return f;
      }) || [],
    });
  };

  const handleRemoveOption = (fieldId: string, optionIndex: number) => {
    if (!editingForm) return;
    setEditingForm({
      ...editingForm,
      fields: editingForm.fields?.map((f) => {
        if (f.id === fieldId && f.options) {
          return { ...f, options: f.options.filter((_, i) => i !== optionIndex) };
        }
        return f;
      }) || [],
    });
  };

  const handleReorder = (newOrder: FormField[]) => {
    if (!editingForm) return;
    setEditingForm({ ...editingForm, fields: newOrder });
  };

  const handleSave = () => {
    if (editingForm && editingForm.id) {
      updateForm.mutate(editingForm as CustomForm);
    }
  };

  const togglePublish = () => {
    if (editingForm) {
      const newState = !editingForm.is_published;
      setEditingForm({ ...editingForm, is_published: newState });
      // Auto-save when publishing
      if (editingForm.id) {
        updateForm.mutate({ ...editingForm, is_published: newState } as CustomForm);
      }
    }
  };

  const renderFieldPreview = (field: FormField) => {
    const baseInputClass = "w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50";
    
    switch (field.type) {
      case "textarea":
        return <textarea placeholder={field.placeholder || "Your answer..."} rows={4} className={`${baseInputClass} resize-none`} disabled />;
      case "select":
        return (
          <select className={baseInputClass} disabled>
            <option>{field.placeholder || "Select an option"}</option>
            {field.options?.map((opt) => <option key={opt}>{opt}</option>)}
          </select>
        );
      case "radio":
        return (
          <div className="space-y-2">
            {field.options?.map((opt) => (
              <label key={opt} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-secondary/50 cursor-pointer">
                <input type="radio" name={field.id} className="w-4 h-4" disabled />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        );
      case "checkbox":
        return (
          <div className="space-y-2">
            {field.options?.map((opt) => (
              <label key={opt} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-secondary/50 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded" disabled />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        );
      case "rating":
        return (
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} className="p-2 hover:bg-secondary rounded-lg" disabled>
                <Star size={24} className="text-muted-foreground" />
              </button>
            ))}
          </div>
        );
      case "date":
        return <input type="date" className={baseInputClass} disabled />;
      default:
        return <input type={field.type} placeholder={field.placeholder || "Your answer..."} className={baseInputClass} disabled />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Form Builder</h1>
        <div className="flex gap-2">
          {editingForm && (
            <>
              <button
                onClick={() => setShowPreview(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm border border-border rounded-lg hover:bg-secondary transition-colors"
              >
                <Eye size={16} />
                Preview
              </button>
            </>
          )}
          <button
            onClick={() => setIsCreating(true)}
            className="btn-gold flex items-center gap-2 text-sm"
          >
            <Plus size={16} />
            New Form
          </button>
        </div>
      </div>

      {isCreating && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 bg-secondary/50 rounded-lg flex items-center gap-4"
        >
          <input
            type="text"
            placeholder="Enter form name..."
            value={newFormName}
            onChange={(e) => setNewFormName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && newFormName.trim() && createForm.mutate(newFormName)}
            autoFocus
            className="flex-1 px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <button
            onClick={() => createForm.mutate(newFormName)}
            disabled={!newFormName.trim()}
            className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors disabled:opacity-50"
          >
            <Check size={20} />
          </button>
          <button
            onClick={() => { setIsCreating(false); setNewFormName(""); }}
            className="p-2 text-muted-foreground hover:bg-secondary rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </motion.div>
      )}

      <div className="flex-1 grid lg:grid-cols-[320px_1fr] gap-4 min-h-0">
        {/* Form List */}
        <div className="bg-secondary/30 rounded-xl p-4 overflow-y-auto">
          <h3 className="font-medium mb-3 text-xs text-muted-foreground uppercase tracking-wider">
            Your Forms ({forms?.length || 0})
          </h3>
          {forms && forms.length > 0 ? (
            <div className="space-y-2">
              {forms.map((form) => (
                <motion.div
                  key={form.id}
                  layout
                  className={`p-3 rounded-lg cursor-pointer transition-all ${
                    selectedForm?.id === form.id
                      ? "bg-primary/10 border-2 border-primary/30"
                      : "hover:bg-secondary border-2 border-transparent"
                  }`}
                  onClick={() => {
                    setSelectedForm(form);
                    setEditingForm(form);
                    setExpandedField(null);
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium truncate">{form.form_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {form.is_published ? (
                          <span className="text-[10px] px-1.5 py-0.5 bg-green-100 text-green-700 rounded font-medium">
                            LIVE
                          </span>
                        ) : (
                          <span className="text-[10px] px-1.5 py-0.5 bg-muted text-muted-foreground rounded font-medium">
                            DRAFT
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {form.fields.length} field{form.fields.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); duplicateForm.mutate(form); }}
                        className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded transition-colors"
                        title="Duplicate"
                      >
                        <Copy size={14} />
                      </button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 text-destructive hover:bg-destructive/10 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Form</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure? This will permanently delete "{form.form_name}" and all its submissions.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteForm.mutate(form.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No forms yet. Create your first form!
            </p>
          )}
        </div>

        {/* Form Editor */}
        <div className="bg-background border border-border rounded-xl overflow-hidden flex flex-col min-h-0">
          {editingForm ? (
            <>
              {/* Editor Header */}
              <div className="flex items-center justify-between p-4 border-b border-border bg-secondary/20">
                <div className="flex-1">
                  <input
                    type="text"
                    value={editingForm.form_name || ""}
                    onChange={(e) => setEditingForm({ ...editingForm, form_name: e.target.value })}
                    className="text-lg font-semibold bg-transparent border-b-2 border-transparent hover:border-border focus:border-primary focus:outline-none transition-colors w-full max-w-md"
                    placeholder="Form name..."
                  />
                </div>
                <div className="flex items-center gap-3">
                  {editingForm.id && editingForm.is_published && (
                    <div className="flex items-center gap-1 bg-secondary/50 rounded-lg px-2 py-1">
                      <span className="text-xs text-muted-foreground hidden sm:inline">
                        {window.location.origin}/f/{editingForm.id.slice(0, 8)}...
                      </span>
                      <button
                        onClick={() => {
                          const url = `${window.location.origin}/f/${editingForm.id}`;
                          navigator.clipboard.writeText(url);
                          toast({ title: "Link copied!", description: "Share this link anywhere" });
                        }}
                        className="p-1.5 text-primary hover:bg-primary/10 rounded transition-colors"
                        title="Copy form link"
                      >
                        <Clipboard size={14} />
                      </button>
                      <a
                        href={`/f/${editingForm.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded transition-colors"
                        title="Open in new tab"
                      >
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {editingForm.is_published ? "Published" : "Draft"}
                    </span>
                    <Switch
                      checked={editingForm.is_published}
                      onCheckedChange={togglePublish}
                    />
                  </div>
                  <button
                    onClick={handleSave}
                    disabled={updateForm.isPending}
                    className="btn-gold text-sm"
                  >
                    {updateForm.isPending ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>

              {/* Editor Content */}
              <div className="flex-1 overflow-y-auto p-4">
                <Tabs defaultValue="fields" className="h-full">
                  <TabsList className="mb-4">
                    <TabsTrigger value="fields">Fields</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                  </TabsList>

                  <TabsContent value="fields" className="mt-0">
                    {/* Form Description */}
                    <div className="mb-6">
                      <textarea
                        value={editingForm.description || ""}
                        onChange={(e) => setEditingForm({ ...editingForm, description: e.target.value })}
                        placeholder="Add a description for your form (optional)..."
                        rows={2}
                        className="w-full px-4 py-3 rounded-lg border border-border bg-secondary/30 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none text-sm"
                      />
                    </div>

                    {/* Fields List */}
                    <div className="space-y-3 mb-4">
                      {editingForm.fields && editingForm.fields.length > 0 ? (
                        <Reorder.Group
                          axis="y"
                          values={editingForm.fields}
                          onReorder={handleReorder}
                          className="space-y-3"
                        >
                          {editingForm.fields.map((field) => (
                            <Reorder.Item
                              key={field.id}
                              value={field}
                              className="bg-secondary/30 rounded-xl border border-border overflow-hidden"
                            >
                              <div className="p-4">
                                <div className="flex items-start gap-3">
                                  <div className="cursor-grab active:cursor-grabbing p-1 mt-1 hover:bg-secondary rounded">
                                    <GripVertical size={16} className="text-muted-foreground" />
                                  </div>
                                  
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-3">
                                      <input
                                        type="text"
                                        value={field.label}
                                        onChange={(e) => handleUpdateField(field.id, { label: e.target.value })}
                                        className="flex-1 font-medium bg-transparent border-b border-transparent hover:border-border focus:border-primary focus:outline-none transition-colors"
                                        placeholder="Question..."
                                      />
                                      {field.required && (
                                        <span className="text-destructive">*</span>
                                      )}
                                    </div>
                                    
                                    {/* Field Preview */}
                                    <div className="mb-3 opacity-60 pointer-events-none">
                                      {renderFieldPreview(field)}
                                    </div>

                                    {/* Field Options for select/radio/checkbox */}
                                    {["select", "radio", "checkbox"].includes(field.type) && (
                                      <div className="space-y-2 mb-3">
                                        {field.options?.map((opt, i) => (
                                          <div key={i} className="flex items-center gap-2">
                                            <span className="text-xs text-muted-foreground w-4">{i + 1}.</span>
                                            <input
                                              type="text"
                                              value={opt}
                                              onChange={(e) => handleUpdateOption(field.id, i, e.target.value)}
                                              className="flex-1 px-3 py-2 text-sm rounded border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                                            />
                                            <button
                                              onClick={() => handleRemoveOption(field.id, i)}
                                              className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                                              disabled={(field.options?.length || 0) <= 1}
                                            >
                                              <X size={14} />
                                            </button>
                                          </div>
                                        ))}
                                        <button
                                          onClick={() => handleAddOption(field.id)}
                                          className="text-sm text-primary hover:underline"
                                        >
                                          + Add option
                                        </button>
                                      </div>
                                    )}
                                  </div>

                                  {/* Field Actions */}
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => setExpandedField(expandedField === field.id ? null : field.id)}
                                      className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded transition-colors"
                                      title="Settings"
                                    >
                                      <Settings2 size={16} />
                                    </button>
                                    <button
                                      onClick={() => handleDuplicateField(field)}
                                      className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded transition-colors"
                                      title="Duplicate"
                                    >
                                      <Copy size={16} />
                                    </button>
                                    <button
                                      onClick={() => handleRemoveField(field.id)}
                                      className="p-2 text-destructive hover:bg-destructive/10 rounded transition-colors"
                                      title="Delete"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                </div>

                                {/* Expanded Field Settings */}
                                <AnimatePresence>
                                  {expandedField === field.id && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: "auto", opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      className="overflow-hidden"
                                    >
                                      <div className="pt-4 mt-4 border-t border-border grid md:grid-cols-3 gap-4">
                                        <div>
                                          <label className="block text-xs text-muted-foreground mb-1">Field Type</label>
                                          <Select
                                            value={field.type}
                                            onValueChange={(value: FormField["type"]) => handleUpdateField(field.id, { type: value })}
                                          >
                                            <SelectTrigger className="text-sm">
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {fieldTypes.map((type) => (
                                                <SelectItem key={type.value} value={type.value}>
                                                  <div className="flex items-center gap-2">
                                                    <type.icon size={14} />
                                                    {type.label}
                                                  </div>
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                        </div>
                                        <div>
                                          <label className="block text-xs text-muted-foreground mb-1">Placeholder</label>
                                          <input
                                            type="text"
                                            value={field.placeholder || ""}
                                            onChange={(e) => handleUpdateField(field.id, { placeholder: e.target.value })}
                                            placeholder="Placeholder text..."
                                            className="w-full px-3 py-2 text-sm rounded border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                                          />
                                        </div>
                                        <div className="flex items-end">
                                          <label className="flex items-center gap-2 text-sm cursor-pointer">
                                            <Switch
                                              checked={field.required}
                                              onCheckedChange={(checked) => handleUpdateField(field.id, { required: checked })}
                                            />
                                            Required
                                          </label>
                                        </div>
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            </Reorder.Item>
                          ))}
                        </Reorder.Group>
                      ) : (
                        <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
                          <FileText size={40} className="mx-auto text-muted-foreground mb-3" />
                          <p className="text-muted-foreground mb-4">No fields yet. Add your first question!</p>
                        </div>
                      )}
                    </div>

                    {/* Add Field Button */}
                    <div className="relative">
                      <button
                        onClick={() => setShowFieldTypes(!showFieldTypes)}
                        className="w-full p-4 border-2 border-dashed border-border rounded-xl text-muted-foreground hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
                      >
                        <Plus size={20} />
                        Add Question
                        {showFieldTypes ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>

                      <AnimatePresence>
                        {showFieldTypes && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute left-0 right-0 mt-2 p-4 bg-background border border-border rounded-xl shadow-lg z-10 grid grid-cols-3 gap-2"
                          >
                            {fieldTypes.map((type) => (
                              <button
                                key={type.value}
                                onClick={() => handleAddField(type.value as FormField["type"])}
                                className="flex items-center gap-2 p-3 rounded-lg hover:bg-secondary text-left transition-colors"
                              >
                                <type.icon size={18} className="text-primary" />
                                <span className="text-sm">{type.label}</span>
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </TabsContent>

                  <TabsContent value="settings" className="mt-0">
                    <div className="space-y-6">
                      {/* Target Pages */}
                      <div>
                        <label className="block text-sm font-medium mb-2">Display on Pages</label>
                        <p className="text-xs text-muted-foreground mb-3">Select where this form should appear</p>
                        <div className="flex flex-wrap gap-2">
                          {availablePages.map((page) => {
                            const isSelected = editingForm.target_pages?.includes(page.value);
                            return (
                              <button
                                key={page.value}
                                type="button"
                                onClick={() => {
                                  const currentPages = editingForm.target_pages || [];
                                  const newPages = isSelected
                                    ? currentPages.filter((p) => p !== page.value)
                                    : [...currentPages, page.value];
                                  setEditingForm({ ...editingForm, target_pages: newPages });
                                }}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                  isSelected
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                                }`}
                              >
                                {page.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Display Type */}
                      <div>
                        <label className="block text-sm font-medium mb-2">Display Style</label>
                        <p className="text-xs text-muted-foreground mb-3">How should this form be displayed?</p>
                        <div className="grid grid-cols-2 gap-4">
                          {[
                            { value: "popup", label: "Popup Modal", desc: "Floating button that opens form in a modal" },
                            { value: "section", label: "Page Section", desc: "Embedded section within the page" },
                          ].map((type) => {
                            const isSelected = editingForm.display_types?.includes(type.value);
                            return (
                              <button
                                key={type.value}
                                type="button"
                                onClick={() => {
                                  const currentTypes = editingForm.display_types || [];
                                  let newTypes: string[];
                                  if (isSelected) {
                                    // Don't allow deselecting if it's the only one selected
                                    if (currentTypes.length <= 1) {
                                      toast({ title: "At least one display type is required", variant: "destructive" });
                                      return;
                                    }
                                    newTypes = currentTypes.filter((t) => t !== type.value);
                                  } else {
                                    newTypes = [...currentTypes, type.value];
                                  }
                                  setEditingForm({ ...editingForm, display_types: newTypes });
                                }}
                                className={`p-4 rounded-xl border-2 text-left transition-all ${
                                  isSelected
                                    ? "border-primary bg-primary/5"
                                    : "border-border hover:border-primary/50"
                                }`}
                              >
                                <div className="font-medium mb-1">{type.label}</div>
                                <div className="text-xs text-muted-foreground">{type.desc}</div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Popup Settings */}
                      {editingForm.display_types?.includes("popup") && (
                        <div>
                          <label className="block text-sm font-medium mb-2">Popup Button Text</label>
                          <input
                            type="text"
                            value={editingForm.popup_trigger_text || ""}
                            onChange={(e) => setEditingForm({ ...editingForm, popup_trigger_text: e.target.value })}
                            placeholder="e.g., Get Started, Contact Us"
                            className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                          />
                        </div>
                      )}

                      {/* Section Settings */}
                      {editingForm.display_types?.includes("section") && (
                        <div>
                          <label className="block text-sm font-medium mb-2">Section Title</label>
                          <input
                            type="text"
                            value={editingForm.section_title || ""}
                            onChange={(e) => setEditingForm({ ...editingForm, section_title: e.target.value })}
                            placeholder="e.g., Contact Us, Get In Touch"
                            className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                          />
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Edit2 size={48} className="mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Select a Form</h3>
                <p className="text-muted-foreground mb-4">
                  Choose a form from the list or create a new one
                </p>
                <button
                  onClick={() => setIsCreating(true)}
                  className="btn-gold inline-flex items-center gap-2"
                >
                  <Plus size={16} />
                  Create Form
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingForm?.form_name}</DialogTitle>
          </DialogHeader>
          {editingForm && (
            <div className="space-y-4 py-4">
              {editingForm.description && (
                <p className="text-muted-foreground text-sm">{editingForm.description}</p>
              )}
              {editingForm.fields?.map((field) => (
                <div key={field.id}>
                  <label className="block text-sm font-medium mb-2">
                    {field.label}
                    {field.required && <span className="text-destructive ml-1">*</span>}
                  </label>
                  {renderFieldPreview(field)}
                </div>
              ))}
              <button className="btn-gold w-full" disabled>
                Submit
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FormManagement;
