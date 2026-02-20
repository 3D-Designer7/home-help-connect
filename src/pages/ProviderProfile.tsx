import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Phone, MessageCircle, MapPin, Clock, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import { mockProviders } from "@/data/mockData";

const ProviderProfile = () => {
  const { id } = useParams();
  const provider = mockProviders.find((p) => p.id === id);

  if (!provider) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-20 text-center">
          <p className="text-muted-foreground">Provider not found</p>
          <Link to="/search" className="text-primary mt-4 inline-block">← Back to search</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8 max-w-2xl">
        <Link to="/search" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft size={16} /> Back to results
        </Link>

        <div className="bg-card rounded-2xl shadow-card p-6 md:p-8">
          {/* Profile header */}
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-2xl bg-hero-gradient opacity-80 flex-shrink-0" />
            <div className="flex-1">
              <h1 className="font-display font-bold text-2xl text-foreground">{provider.name}</h1>
              <p className="text-sm text-muted-foreground mt-0.5">{provider.category}</p>
              <span className={`inline-block mt-2 text-xs font-medium px-3 py-1 rounded-full ${provider.available ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"}`}>
                {provider.available ? "✓ Available now" : "Currently offline"}
              </span>
            </div>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin size={16} className="text-primary" />
              <span>{provider.distance} away</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Briefcase size={16} className="text-primary" />
              <span>5+ years experience</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock size={16} className="text-primary" />
              <span>Usually responds in 10 min</span>
            </div>
          </div>

          {/* Description */}
          <div className="mt-8">
            <h2 className="font-display font-semibold text-lg text-foreground mb-2">About</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{provider.description}</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-8">
            <Button className="flex-1 gap-2" size="lg">
              <Phone size={18} /> Call Now
            </Button>
            <Button variant="outline" className="flex-1 gap-2" size="lg">
              <MessageCircle size={18} /> Send Message
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProviderProfile;
