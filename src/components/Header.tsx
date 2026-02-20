import { Link } from "react-router-dom";
import { Menu, X, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
      <div className="container flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-hero-gradient flex items-center justify-center">
            <span className="text-primary-foreground font-display font-bold text-lg">H</span>
          </div>
          <span className="font-display font-bold text-xl text-foreground">HomeFix</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Home</Link>
          <Link to="/search" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Find Services</Link>
          <Link to="#how" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">How It Works</Link>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" size="sm">Log In</Button>
          <Button size="sm">Sign Up</Button>
        </div>

        <button className="md:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-card border-b border-border px-4 pb-4 space-y-3">
          <Link to="/" className="block text-sm font-medium text-foreground py-2" onClick={() => setMobileOpen(false)}>Home</Link>
          <Link to="/search" className="block text-sm font-medium text-foreground py-2" onClick={() => setMobileOpen(false)}>Find Services</Link>
          <div className="flex gap-2 pt-2">
            <Button variant="ghost" size="sm" className="flex-1">Log In</Button>
            <Button size="sm" className="flex-1">Sign Up</Button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
