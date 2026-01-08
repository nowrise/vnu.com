import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Trash2, Eye, FileText } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FormSubmission {
  id: string;
  created_at: string;
  form_id: string;
  submission_data: Record<string, string>;
  status: string;
  custom_forms: {
    form_name: string;
  } | null;
}

const FormSubmissions = () => {
  const queryClient = useQueryClient();
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null);
  const [filterFormId, setFilterFormId] = useState<string>("all");

  const { data: forms } = useQuery({
    queryKey: ["admin-forms-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("custom_forms")
        .select("id, form_name")
        .order("form_name");

      if (error) throw error;
      return data;
    },
  });

  const { data: submissions, isLoading } = useQuery({
    queryKey: ["admin-form-submissions", filterFormId],
    queryFn: async () => {
      let query = supabase
        .from("form_submissions")
        .select(`
          *,
          custom_forms (
            form_name
          )
        `)
        .order("created_at", { ascending: false });

      if (filterFormId !== "all") {
        query = query.eq("form_id", filterFormId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as FormSubmission[];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("form_submissions")
        .update({ status })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-form-submissions"] });
      toast({ title: "Status updated" });
    },
    onError: () => {
      toast({ title: "Failed to update status", variant: "destructive" });
    },
  });

  const deleteSubmission = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("form_submissions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-form-submissions"] });
      toast({ title: "Submission deleted" });
    },
    onError: () => {
      toast({ title: "Failed to delete submission", variant: "destructive" });
    },
  });

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    reviewed: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
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
        <h1 className="text-2xl font-bold">Form Submissions</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Filter by form:</span>
          <Select value={filterFormId} onValueChange={setFilterFormId}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All forms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Forms</SelectItem>
              {forms?.map((form) => (
                <SelectItem key={form.id} value={form.id}>
                  {form.form_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {submissions && submissions.length > 0 ? (
        <div className="bg-background border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-secondary/50">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium">Form</th>
                <th className="text-left px-4 py-3 text-sm font-medium">Submitted</th>
                <th className="text-left px-4 py-3 text-sm font-medium">Status</th>
                <th className="text-left px-4 py-3 text-sm font-medium">Preview</th>
                <th className="text-right px-4 py-3 text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((submission) => (
                <tr key={submission.id} className="border-t border-border">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-muted-foreground" />
                      <span className="font-medium">
                        {submission.custom_forms?.form_name || "Unknown Form"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {format(new Date(submission.created_at), "MMM d, yyyy 'at' h:mm a")}
                  </td>
                  <td className="px-4 py-3">
                    <Select
                      value={submission.status}
                      onValueChange={(value) =>
                        updateStatus.mutate({ id: submission.id, status: value })
                      }
                    >
                      <SelectTrigger
                        className={`w-32 h-8 text-xs ${statusColors[submission.status] || ""}`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="reviewed">Reviewed</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground max-w-xs truncate">
                    {Object.values(submission.submission_data).slice(0, 2).join(", ")}
                    {Object.keys(submission.submission_data).length > 2 && "..."}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedSubmission(submission)}
                        className="p-2 hover:bg-secondary rounded transition-colors"
                        title="View details"
                      >
                        <Eye size={16} />
                      </button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button
                            className="p-2 text-destructive hover:bg-destructive/10 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Submission</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this submission? This action cannot be
                              undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteSubmission.mutate(submission.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 bg-secondary/30 rounded-lg">
          <FileText size={48} className="mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Submissions Yet</h3>
          <p className="text-muted-foreground">
            Form submissions will appear here when users fill out your forms.
          </p>
        </div>
      )}

      {/* View Submission Dialog */}
      <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Submission Details
              <span className="block text-sm font-normal text-muted-foreground mt-1">
                {selectedSubmission?.custom_forms?.form_name || "Unknown Form"}
              </span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {selectedSubmission &&
              Object.entries(selectedSubmission.submission_data).map(([key, value]) => (
                <div key={key} className="border-b border-border pb-3 last:border-0">
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">
                    {key}
                  </label>
                  <p className="text-sm mt-1">{value || "-"}</p>
                </div>
              ))}
            <div className="pt-2 text-xs text-muted-foreground">
              Submitted on{" "}
              {selectedSubmission &&
                format(new Date(selectedSubmission.created_at), "MMMM d, yyyy 'at' h:mm a")}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FormSubmissions;