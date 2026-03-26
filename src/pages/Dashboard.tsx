import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import logo from "@/assets/logo.png";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30 text-foreground flex flex-col">
      <header className="bg-white/70 backdrop-blur-md sticky top-0 z-50 border-b border-border/50 p-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Flashspace Logo" className="h-10 object-contain" />
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="px-4 py-1.5 bg-accent/20 text-primary rounded-full font-semibold shadow-inner border border-accent/40">
              Quotation Generator
            </span>
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
          
          <Button asChild size="lg" className="w-full shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl h-14 text-lg">
            <Link to="/create-quotation">
              Create New Quotation
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
