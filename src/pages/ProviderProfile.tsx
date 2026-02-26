import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Phone, MessageCircle, MapPin, Clock, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const ProviderProfile = () => {
  const { id } = useParams(); // This is user_id
  const { user, profile: myProfile } = useAuth();
  const navigate = useNavigate();
  const [provider, setProvider] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchProvider = async () => {
      const { data: prof } = await supabase
        .from("profiles")
        .select("user_id, full_name, phone, avatar_url")
        .eq("user_id", id)
        .single();

      const { data: details } = await supabase
        .from("provider_details")
        .select("*")
        .eq("user_id", id)
        .single();

      const { data: cats } = await supabase
        .from("provider_categories")
        .select("categories(name)")
        .eq("user_id", id);

      if (prof && details) {
        setProvider({
          ...prof,
          ...details,
          categories: cats?.map((c: any) => c.categories?.name).filter(Boolean) || [],
        });
      }
      setLoading(false);
    };

    fetchProvider();
  }, [id]);

  const handleMessage = async () => {
    if (!user) {
      toast.error("Please sign in to message providers");
      navigate("/auth");
      return;
    }
    if (!id) return;

    // Check for existing conversation
    const { data: existing } = await supabase
      .from("conversations")
      .select("id")
      .eq("customer_id", user.id)
      .eq("provider_id", id)
      .single();

    if (existing) {
      navigate(`/chat/${existing.id}`);
      return;
    }

    // Create new conversation
    const { data: newConv, error } = await supabase
      .from("conversations")
      .insert({ customer_id: user.id, provider_id: id })
      .select("id")
      .single();

    if (error) {
      toast.error("Could not start conversation");
      return;
    }

    navigate(`/chat/${newConv.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-20 text-center text-muted-foreground">Loading...</div>
      </div>
    );
  }

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
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-2xl bg-hero-gradient opacity-80 flex-shrink-0" />
            <div className="flex-1">
              <h1 className="font-display font-bold text-2xl text-foreground">{provider.full_name}</h1>
              <p className="text-sm text-muted-foreground mt-0.5">{provider.categories.join(", ") || "General"}</p>
              <span className={`inline-block mt-2 text-xs font-medium px-3 py-1 rounded-full ${provider.is_available ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"}`}>
                {provider.is_available ? "✓ Available now" : "Currently offline"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin size={16} className="text-primary" />
              <span>{provider.location_lat ? "Location set" : "No location"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Briefcase size={16} className="text-primary" />
              <span>{provider.experience_years || 0}+ years experience</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock size={16} className="text-primary" />
              <span>Usually responds quickly</span>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="font-display font-semibold text-lg text-foreground mb-2">About</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{provider.description || "No description provided"}</p>
          </div>

          <div className="flex gap-3 mt-8">
            {provider.phone && (
              <a href={`tel:${provider.phone.replace(/\s/g, '')}`} className="flex-1">
                <Button className="w-full gap-2" size="lg">
                  <Phone size={18} /> Call Now
                </Button>
              </a>
            )}
            <Button variant="outline" className="flex-1 gap-2" size="lg" onClick={handleMessage}>
              <MessageCircle size={18} /> Send Message
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProviderProfile;
