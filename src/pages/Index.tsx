import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import HowItWorks from "@/components/HowItWorks";
import CategoryCard from "@/components/CategoryCard";
import { Droplets, Zap, Wind, Pipette, Flame, TreePine, Wrench, Radio, LucideIcon, MapPin } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  droplets: Droplets,
  zap: Zap,
  wind: Wind,
  pipette: Pipette,
  flame: Flame,
  "tree-pine": TreePine,
  wrench: Wrench,
  radio: Radio,
};

const colorMap: Record<string, string> = {
  plumber: "--cat-plumber",
  electrician: "--cat-electrician",
  "ac-technician": "--cat-ac",
  drainage: "--cat-drainage",
  "stove-repair": "--cat-stove",
  "wood-worker": "--cat-wood",
  "metal-worker": "--cat-metal",
  telecom: "--cat-telecom",
};

const Index = () => {
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string; icon: string }[]>([]);
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [nearbyProviders, setNearbyProviders] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("categories").select("id, name, slug, icon").then(({ data }) => {
      if (data) setCategories(data);
    });
  }, []);

  // Redirect to complete-profile if profile is incomplete (e.g. after Google sign-in)
  useEffect(() => {
    if (user && profile && !profile.phone) {
      navigate("/complete-profile");
    }
  }, [user, profile, navigate]);

  // Request location on login
  useEffect(() => {
    if (user && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {} // silently fail
      );
    }
  }, [user]);

  // Fetch nearby providers when location is available
  useEffect(() => {
    if (!userLocation) return;
    const fetchNearby = async () => {
      const { data } = await supabase
        .from("provider_details")
        .select("user_id, location_lat, location_lng, is_available, description")
        .eq("is_available", true)
        .not("location_lat", "is", null);
      if (!data || data.length === 0) return;

      // Calculate distance and sort
      const withDistance = data
        .map((p) => {
          const dlat = (p.location_lat! - userLocation.lat) * 111;
          const dlng = (p.location_lng! - userLocation.lng) * 111 * Math.cos((userLocation.lat * Math.PI) / 180);
          return { ...p, distance: Math.sqrt(dlat * dlat + dlng * dlng) };
        })
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 4);

      // Fetch profiles
      const ids = withDistance.map((p) => p.user_id);
      const { data: profiles } = await supabase.from("profiles").select("user_id, full_name").in("user_id", ids);
      const pMap = new Map(profiles?.map((p) => [p.user_id, p.full_name]) || []);

      const { data: provCats } = await supabase.from("provider_categories").select("user_id, categories(name)").in("user_id", ids);
      const cMap = new Map<string, string[]>();
      provCats?.forEach((pc: any) => {
        const list = cMap.get(pc.user_id) || [];
        list.push(pc.categories?.name || "");
        cMap.set(pc.user_id, list);
      });

      setNearbyProviders(
        withDistance.map((p) => ({
          ...p,
          name: pMap.get(p.user_id) || "Unknown",
          categories: (cMap.get(p.user_id) || []).join(", ") || "General",
        }))
      );
    };
    fetchNearby();
  }, [userLocation]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />

        <section className="py-20">
          <div className="container">
            <h2 className="font-display font-bold text-3xl text-center text-foreground">
              What do you need help with?
            </h2>
            <p className="text-center text-muted-foreground mt-2">Browse our service categories</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-10">
              {categories.map((cat) => (
                <CategoryCard
                  key={cat.slug}
                  name={cat.name}
                  icon={iconMap[cat.icon] || Wrench}
                  color={colorMap[cat.slug] || "--cat-plumber"}
                  slug={cat.slug}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Nearby providers section - only shown when logged in and location available */}
        {user && nearbyProviders.length > 0 && (
          <section className="py-12">
            <div className="container">
              <div className="flex items-center gap-2 mb-6">
                <MapPin className="text-primary" size={22} />
                <h2 className="font-display font-bold text-2xl text-foreground">Services Near You</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {nearbyProviders.map((p) => (
                  <div
                    key={p.user_id}
                    onClick={() => navigate(`/provider/${p.user_id}`)}
                    className="bg-card rounded-xl shadow-card p-5 cursor-pointer hover:shadow-card-hover transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-hero-gradient opacity-80 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-sm text-foreground">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.categories}</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3 line-clamp-2">{p.description || "Available for service"}</p>
                    <p className="text-xs text-primary mt-2 font-medium">{p.distance.toFixed(1)} km away</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <HowItWorks />

        <section className="py-20">
          <div className="container">
            <div className="bg-hero-gradient rounded-2xl p-10 md:p-16 text-center">
              <h2 className="font-display font-bold text-3xl md:text-4xl text-primary-foreground">
                Are you a service provider?
              </h2>
              <p className="text-primary-foreground/80 mt-3 max-w-md mx-auto">
                Join HomeFix to reach more customers in your area and grow your business.
              </p>
              <a href="/auth">
                <button className="mt-6 px-8 py-3 bg-card text-foreground font-semibold rounded-lg hover:bg-card/90 transition-colors">
                  Register as Provider
                </button>
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8">
        <div className="container text-center text-sm text-muted-foreground">
          © 2026 HomeFix. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Index;
