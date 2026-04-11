import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "@/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/sonner";
import { ArrowLeft, UserPlus, Users as UsersIcon, Edit2, Trash2, X } from "lucide-react";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  phone: string;
  officeAddress: string;
  isActive: boolean;
}

const emptyForm = {
  name: "",
  email: "",
  password: "",
  role: "sales",
  phone: "",
  officeAddress: "",
};

export default function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyForm);

  const token = () => localStorage.getItem("token");

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token()}` }
      });
      setUsers(res.data.users || res.data);
    } catch (error) {
      toast.error("Failed to fetch users. You might not have admin privileges.");
      navigate("/dashboard");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "admin") {
      toast.error("Unauthorized access");
      navigate("/dashboard");
      return;
    }
    fetchUsers();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (val: string) => {
    setFormData({ ...formData, role: val });
  };

  const handleEditClick = (user: User) => {
    setIsEditing(user._id);
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      phone: user.phone || "",
      officeAddress: user.officeAddress || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setIsEditing(null);
    setFormData(emptyForm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditing) {
        // Edit mode: PUT, omit password entirely
        const payload: any = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          phone: formData.phone,
          officeAddress: formData.officeAddress,
        };
        await axios.put(`${API_URL}/api/users/${isEditing}`, payload, {
          headers: { Authorization: `Bearer ${token()}` }
        });
        toast.success(`User ${formData.name} updated successfully!`);
        handleCancelEdit();
      } else {
        // Create mode: POST with password
        await axios.post(`${API_URL}/api/users`, formData, {
          headers: { Authorization: `Bearer ${token()}` }
        });
        toast.success(`User ${formData.name} created successfully!`);
        setFormData(emptyForm);
      }
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || (isEditing ? "Failed to update user" : "Failed to create user"));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (user: User) => {
    if (!window.confirm(`Are you sure you want to permanently delete ${user.name}?`)) return;
    setDeletingId(user._id);
    try {
      await axios.delete(`${API_URL}/api/users/${user._id}`, {
        headers: { Authorization: `Bearer ${token()}` }
      });
      toast.success(`${user.name} deleted successfully.`);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete user.");
    } finally {
      setDeletingId(null);
    }
  };

  if (fetching) return <div className="p-8 text-center text-muted-foreground">Loading users...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/80 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
        <div className="flex items-center gap-4">
          <Button variant="ghost" className="hover:bg-transparent hover:text-primary transition-colors" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center">
            <UsersIcon className="mr-3 h-8 w-8 text-primary" /> Admin Portal
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create / Edit User Form */}
          <Card className="lg:col-span-1 shadow-2xl shadow-slate-200/50 border-slate-200/60 rounded-3xl h-fit sticky top-6">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-6 pt-6 px-6">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center text-xl font-bold">
                  {isEditing ? <Edit2 className="mr-2 h-5 w-5 text-primary" /> : <UserPlus className="mr-2 h-5 w-5 text-primary" />}
                  {isEditing ? "Edit User" : "Create New User"}
                </CardTitle>
                {isEditing && (
                  <Button variant="ghost" size="icon" onClick={handleCancelEdit} className="h-8 w-8 text-slate-500 hover:text-red-500">
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <CardDescription>
                {isEditing ? "Update user details. Password is not editable here." : "Add new sales team members or other admins."}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input name="name" value={formData.name} onChange={handleChange} required placeholder="Jane Doe" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input name="email" type="email" value={formData.email} onChange={handleChange} required placeholder="jane@flashspace.in" />
                </div>
                {/* Password field only shown in Create mode */}
                {!isEditing && (
                  <div className="space-y-2">
                    <Label>Password</Label>
                    <Input name="password" type="password" value={formData.password} onChange={handleChange} required placeholder="minimum 6 characters" minLength={6} />
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select value={formData.role} onValueChange={handleRoleChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input name="phone" value={formData.phone} onChange={handleChange} placeholder="+91 9876543210" />
                </div>
                <div className="space-y-2">
                  <Label>Office Address</Label>
                  <Textarea name="officeAddress" value={formData.officeAddress} onChange={handleChange} placeholder="Mumbai Office..." className="min-h-[80px]" />
                </div>
                <Button type="submit" className="w-full mt-2" disabled={loading}>
                  {loading
                    ? (isEditing ? "Saving..." : "Creating...")
                    : (isEditing ? "Save Changes" : "Create User")}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* User List */}
          <Card className="lg:col-span-2 shadow-2xl shadow-slate-200/50 border-slate-200/60 rounded-3xl">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-6 pt-6 px-6">
              <CardTitle className="text-xl font-bold">Existing Users</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {users.map((user) => (
                  <div key={user._id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-900">{user.name}</span>
                      <span className="text-sm text-muted-foreground">{user.email}</span>
                      <span className="text-sm text-muted-foreground mt-1">{user.phone || 'No phone'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${user.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-slate-200 text-slate-700'}`}>
                          {user.role}
                        </span>
                        <span className={`text-xs ${user.isActive ? 'text-green-600' : 'text-red-500'}`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditClick(user)}
                          className="text-slate-400 hover:text-primary hover:bg-primary/5 transition-colors h-8 w-8"
                          title="Edit user"
                          disabled={loading}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        {user.role !== 'admin' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(user)}
                            className="text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors h-8 w-8"
                            title="Delete user"
                            disabled={deletingId === user._id}
                          >
                            {deletingId === user._id
                              ? <span className="h-4 w-4 animate-spin border-2 border-red-400 border-t-transparent rounded-full inline-block" />
                              : <Trash2 className="h-4 w-4" />}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {users.length === 0 && (
                  <div className="p-8 text-center text-slate-500">No users found.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
