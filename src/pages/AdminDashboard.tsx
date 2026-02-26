import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Pencil, Trash2, Shield, Search, Users } from "lucide-react";



interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  role: string;
  avatar_url: string | null;
  created_at: string;
}

const AdminDashboard = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editUser, setEditUser] = useState<UserProfile | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editRole, setEditRole] = useState<"customer" | "provider">("customer");
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate("/admin");
    }
  }, [user, isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (isAdmin) fetchUsers();
  }, [isAdmin]);

  const fetchUsers = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setUsers(data as UserProfile[]);
    setLoading(false);
  };

  const handleEdit = (u: UserProfile) => {
    setEditUser(u);
    setEditName(u.full_name);
    setEditPhone(u.phone);
    setEditRole(u.role as "customer" | "provider");
    setEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editUser) return;
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: editName, phone: editPhone, role: editRole })
      .eq("id", editUser.id);
    if (error) {
      toast.error("Failed to update user");
    } else {
      toast.success("User updated");
      setEditOpen(false);
      fetchUsers();
    }
  };

  const handleDelete = async (u: UserProfile) => {
    if (!confirm(`Delete user "${u.full_name}"? This cannot be undone.`)) return;
    const { error } = await supabase.from("profiles").delete().eq("id", u.id);
    if (error) {
      toast.error("Failed to delete user");
    } else {
      toast.success("User deleted");
      fetchUsers();
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phone.includes(searchQuery)
  );

  if (authLoading || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8 max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="text-primary" size={28} />
          <h1 className="font-display font-bold text-2xl text-foreground">Admin Dashboard</h1>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search users by name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users size={16} />
            <span>{users.length} users</span>
          </div>
        </div>

        {loading ? (
          <p className="text-center py-16 text-muted-foreground">Loading users...</p>
        ) : (
          <div className="bg-card rounded-xl shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 font-medium text-muted-foreground">Name</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Phone</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Role</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Joined</th>
                    <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="p-4 font-medium text-foreground">{u.full_name || "—"}</td>
                      <td className="p-4 text-muted-foreground">{u.phone || "—"}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          u.role === "provider"
                            ? "bg-accent text-accent-foreground"
                            : "bg-secondary text-secondary-foreground"
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(u)}>
                            <Pencil size={14} />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(u)} className="text-destructive hover:text-destructive">
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <Label>Full Name</Label>
                <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
              </div>
              <div>
                <Label>Role</Label>
                <div className="grid grid-cols-2 gap-3 mt-1.5">
                  <button
                    type="button"
                    onClick={() => setEditRole("customer")}
                    className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                      editRole === "customer"
                        ? "border-primary bg-accent text-accent-foreground"
                        : "border-border text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    🏠 Customer
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditRole("provider")}
                    className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                      editRole === "provider"
                        ? "border-primary bg-accent text-accent-foreground"
                        : "border-border text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    🔧 Provider
                  </button>
                </div>
              </div>
              <Button onClick={handleSaveEdit} className="w-full">Save Changes</Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default AdminDashboard;
