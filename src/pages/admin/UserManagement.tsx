import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Users, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const UserManagement = () => {
  const { data: profiles, isLoading } = useQuery({
    queryKey: ["admin-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const { data: userRoles } = useQuery({
    queryKey: ["admin-user-roles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("*");

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const getUserRoles = (userId: string) => {
    return userRoles?.filter((r) => r.user_id === userId).map((r) => r.role) || [];
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <span className="text-sm text-muted-foreground">
          {profiles?.length || 0} users
        </span>
      </div>

      {profiles && profiles.length > 0 ? (
        <div className="bg-background border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                    User
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                    Email
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                    Roles
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {profiles.map((profile) => {
                  const roles = getUserRoles(profile.id);
                  return (
                    <tr
                      key={profile.id}
                      className="hover:bg-secondary/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="font-medium">
                          {profile.full_name || "No name"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {profile.email}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {roles.length > 0 ? (
                            roles.map((role) => (
                              <span
                                key={role}
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  role === "admin"
                                    ? "bg-red-100 text-red-700"
                                    : role === "editor"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {role === "admin" && <Shield size={12} />}
                                {role}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              No roles
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {format(new Date(profile.created_at), "MMM d, yyyy")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-secondary/30 rounded-lg">
          <Users size={48} className="mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No users yet</h3>
          <p className="text-muted-foreground">
            Users will appear here when they register for an account.
          </p>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
