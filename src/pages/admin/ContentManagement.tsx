import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FileText, Save, Plus, Trash2, Edit2, X, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
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

interface ContentPage {
  id: string;
  page_name: string;
  content_json: Record<string, string> | null;
  updated_at: string;
}

const ContentManagement = () => {
  const queryClient = useQueryClient();
  const [selectedPage, setSelectedPage] = useState<ContentPage | null>(null);
  const [editingContent, setEditingContent] = useState<Record<string, string>>({});
  const [newPageName, setNewPageName] = useState("");
  const [isAddingPage, setIsAddingPage] = useState(false);
  const [newFieldKey, setNewFieldKey] = useState("");
  const [newFieldValue, setNewFieldValue] = useState("");

  const { data: pages, isLoading } = useQuery({
    queryKey: ["admin-content-pages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("content_pages")
        .select("*")
        .order("page_name");

      if (error) throw error;
      return data as ContentPage[];
    },
  });

  const createPage = useMutation({
    mutationFn: async (pageName: string) => {
      const { error } = await supabase
        .from("content_pages")
        .insert({ page_name: pageName, content_json: {} });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-content-pages"] });
      toast({ title: "Page created" });
      setNewPageName("");
      setIsAddingPage(false);
    },
    onError: () => {
      toast({ title: "Failed to create page", variant: "destructive" });
    },
  });

  const updatePage = useMutation({
    mutationFn: async ({ id, content }: { id: string; content: Record<string, string> }) => {
      const { error } = await supabase
        .from("content_pages")
        .update({ content_json: content, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-content-pages"] });
      toast({ title: "Content saved" });
    },
    onError: () => {
      toast({ title: "Failed to save", variant: "destructive" });
    },
  });

  const deletePage = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("content_pages")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-content-pages"] });
      toast({ title: "Page deleted" });
      setSelectedPage(null);
    },
    onError: () => {
      toast({ title: "Failed to delete", variant: "destructive" });
    },
  });

  useEffect(() => {
    if (selectedPage) {
      setEditingContent((selectedPage.content_json as Record<string, string>) || {});
    }
  }, [selectedPage]);

  const handleFieldChange = (key: string, value: string) => {
    setEditingContent((prev) => ({ ...prev, [key]: value }));
  };

  const handleDeleteField = (key: string) => {
    setEditingContent((prev) => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
  };

  const handleAddField = () => {
    if (newFieldKey.trim()) {
      setEditingContent((prev) => ({ ...prev, [newFieldKey]: newFieldValue }));
      setNewFieldKey("");
      setNewFieldValue("");
    }
  };

  const handleSave = () => {
    if (selectedPage) {
      updatePage.mutate({ id: selectedPage.id, content: editingContent });
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
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Content Management</h1>
        <button
          onClick={() => setIsAddingPage(true)}
          className="btn-gold flex items-center gap-2 text-sm"
        >
          <Plus size={16} />
          Add Page
        </button>
      </div>

      {isAddingPage && (
        <div className="mb-6 p-4 bg-secondary rounded-lg flex items-center gap-4">
          <input
            type="text"
            placeholder="Page name (e.g., homepage, about)"
            value={newPageName}
            onChange={(e) => setNewPageName(e.target.value)}
            className="flex-1 px-4 py-2 rounded border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <button
            onClick={() => createPage.mutate(newPageName)}
            disabled={!newPageName.trim()}
            className="p-2 text-primary hover:bg-primary/10 rounded transition-colors disabled:opacity-50"
          >
            <Check size={20} />
          </button>
          <button
            onClick={() => {
              setIsAddingPage(false);
              setNewPageName("");
            }}
            className="p-2 text-muted-foreground hover:bg-secondary rounded transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      )}

      <div className="grid lg:grid-cols-[300px_1fr] gap-6">
        {/* Page List */}
        <div className="bg-secondary/30 rounded-lg p-4">
          <h3 className="font-medium mb-4 text-sm text-muted-foreground uppercase tracking-wider">
            Pages
          </h3>
          {pages && pages.length > 0 ? (
            <div className="space-y-2">
              {pages.map((page) => (
                <div
                  key={page.id}
                  className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedPage?.id === page.id
                      ? "bg-primary/10 border border-primary/20"
                      : "hover:bg-secondary"
                  }`}
                  onClick={() => setSelectedPage(page)}
                >
                  <div className="flex items-center gap-3">
                    <FileText size={16} className="text-muted-foreground" />
                    <span className="font-medium">{page.page_name}</span>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 text-destructive hover:bg-destructive/10 rounded transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={14} />
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Page</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{page.page_name}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deletePage.mutate(page.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No pages yet. Create one to get started.</p>
          )}
        </div>

        {/* Content Editor */}
        <div className="bg-background border border-border rounded-lg p-6">
          {selectedPage ? (
            <>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold">{selectedPage.page_name}</h2>
                  <p className="text-sm text-muted-foreground">
                    Edit the content fields for this page
                  </p>
                </div>
                <button
                  onClick={handleSave}
                  disabled={updatePage.isPending}
                  className="btn-gold flex items-center gap-2 text-sm"
                >
                  <Save size={16} />
                  {updatePage.isPending ? "Saving..." : "Save Changes"}
                </button>
              </div>

              <div className="space-y-4">
                {Object.entries(editingContent).map(([key, value]) => (
                  <div key={key} className="group">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-muted-foreground">
                        {key}
                      </label>
                      <button
                        onClick={() => handleDeleteField(key)}
                        className="p-1 text-destructive hover:bg-destructive/10 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    {value.length > 100 ? (
                      <textarea
                        value={value}
                        onChange={(e) => handleFieldChange(key, e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
                      />
                    ) : (
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => handleFieldChange(key, e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      />
                    )}
                  </div>
                ))}

                {/* Add new field */}
                <div className="border-t border-border pt-4 mt-6">
                  <h4 className="text-sm font-medium mb-3">Add New Field</h4>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Field name"
                      value={newFieldKey}
                      onChange={(e) => setNewFieldKey(e.target.value)}
                      className="flex-1 px-4 py-2 rounded border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                    <input
                      type="text"
                      placeholder="Value"
                      value={newFieldValue}
                      onChange={(e) => setNewFieldValue(e.target.value)}
                      className="flex-1 px-4 py-2 rounded border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                    <button
                      onClick={handleAddField}
                      disabled={!newFieldKey.trim()}
                      className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded transition-colors disabled:opacity-50"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <Edit2 size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Select a Page</h3>
              <p className="text-muted-foreground">
                Choose a page from the left to edit its content
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentManagement;
