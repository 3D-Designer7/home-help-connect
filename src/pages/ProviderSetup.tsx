import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const ProviderSetup = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [experience, setExperience] = useState("1");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.from("categories").select("id, name, slug").then(({ data }) => {
      if (data) setCategories(data);
    });
  }, []);

  const useCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(pos.coords.latitude.toString());
          setLng(pos.coords.longitude.toString());
          toast.success("Location detected!");
        },
        () => toast.error("Could not get location")
      );
    }
  };

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id)
        ? prev.filter((c) => c !== id)
        : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("You must be logged in");
      return;
    }

    if (selectedCategories.length === 0) {
      toast.error("Please select at least one category");
      return;
    }

    setLoading(true);

    try {
      const { error: detailsError } = await supabase
        .from("provider_details")
        .update({
          description,
          experience_years: parseInt(experience),
          location_lat: lat ? parseFloat(lat) : null,
          location_lng: lng ? parseFloat(lng) : null,
          is_available: true,
        })
        .eq("user_id", user.id);

      if (detailsError) throw detailsError;

      const categoryInserts = selectedCategories.map((cid) => ({
        user_id: user.id,
        category_id: cid,
      }));

      const { error: catError } = await supabase
        .from("provider_categories")
        .insert(categoryInserts);

      if (catError) throw catError;

      toast.success("Profile setup complete!");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8 max-w-lg">
        <h1 className="font-display font-bold text-2xl text-foreground">
          Set Up Your Profile
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Complete your provider profile to start receiving customers
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <Label>Service Categories</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggleCategory(cat.id)}
                  className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                    selectedCategories.includes(cat.id)
                      ? "border-primary bg-accent text-accent-foreground"
                      : "border-border text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="description">Work Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your services..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="experience">Years of Experience</Label>
            <Input
              id="experience"
              type="number"
              min="0"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
            />
          </div>

          <div>
            <Label>Location</Label>
            <div className="flex gap-2 mt-1.5">
              <Input
                placeholder="Latitude"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
              />
              <Input
                placeholder="Longitude"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={useCurrentLocation}
            >
              📍 Use Current Location
            </Button>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving..." : "Complete Setup"}
          </Button>
        </form>
      </main>
    </div>
  );
};

export default ProviderSetup;