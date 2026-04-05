import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "@/config";
import { Button } from "@/components/ui/button";
import { Plus, User, LogOut, Users } from "lucide-react";
import logo from "@/assets/logo.png";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ name: string; role: string; email: string } | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const res = await axios.get(`${API_URL}/users/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser(res.data);
        } else {
            navigate("/login");
        }
      } catch (err) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        navigate("/login");
      }
    };
    fetchUser();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await axios.post(`${API_URL}/auth/logout`);
    } catch(e) {}
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30 text-foreground flex flex-col">
      <header className="bg-white/70 backdrop-blur-md sticky top-0 z-50 border-b border-border/50 p-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Flashspace Logo" className="h-10 object-contain" />
          </div>
          <div className="flex items-center gap-4 text-sm">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex flex-col text-right hidden sm:flex">
                  <span className="font-semibold text-slate-800">{user.name}</span>
                  <span className="text-xs text-muted-foreground capitalize">{user.role}</span>
                </div>
                <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div className="h-6 w-px bg-border mx-1 hidden sm:block"></div>
                {user.role === "admin" && (
                  <>
                    <Button asChild variant="ghost" size="icon" className="text-slate-500 hover:text-primary hover:bg-primary/5 transition-colors" title="User Management">
                      <Link to="/admin/users">
                        <Users className="h-5 w-5" />
                      </Link>
                    </Button>
                    <div className="h-6 w-px bg-border mx-1 hidden sm:block"></div>
                  </>
                )}
                <Button variant="ghost" size="icon" onClick={handleLogout} className="text-slate-500 hover:text-red-500 hover:bg-red-50 transition-colors" title="Logout">
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            ) : (
               <span className="text-muted-foreground animate-pulse">Loading...</span>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center max-w-md w-full space-y-8 bg-white/80 backdrop-blur-md p-10 rounded-3xl border border-border shadow-xl">
          <div className="space-y-3">
            <div className="flex justify-center mb-6">
              <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center">
                <Plus className="h-10 w-10 text-primary" />
              </div>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">Virtual Office</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Generate a professional, fully customizable PDF quotation for client proposals in seconds.
            </p>
          </div>
          
          <div className="space-y-4">
            <Button asChild size="lg" className="w-full shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl h-14 text-lg">
              <Link to="/create-quotation">
                Create New Quotation
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
