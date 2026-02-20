import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import ProviderCard from "@/components/ProviderCard";

const SearchProviders = () => {
  const [searchParams] = useSearchParams();
  const selectedCategory = searchParams.get("category");
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("categories").select("id, name, slug").then(({ data }) => {
      if (data) setCategories(data);
    });
  }, []);

  useEffect(() => {
    const fetchProviders = async () => {
      setLoading(true);

      // Get provider user_ids filtered by category if needed
      let userIds: string[] | null = null;
      if (selectedCategory) {
        const cat = categories.find((c) => c.slug === selectedCategory);
        if (cat) {
          const { data: pcs } = await supabase
            .from("provider_categories")
            .select("user_id")
            .eq("category_id", cat.id);
          userIds = pcs?.map((pc) => pc.user_id) || [];
        }
      }

      // Fetch provider details
      let query = supabase
        .from("provider_details")
        .select("user_id, description, is_available, location_lat, location_lng, experience_years");

      if (userIds !== null) {
        if (userIds.length === 0) {
          setProviders([]);
          setLoading(false);
          return;
        }
        query = query.in("user_id", userIds);
      }

      const { data: details } = await query;
      if (!details || details.length === 0) {
        setProviders([]);
        setLoading(false);
        return;
      }

      const allUserIds = details.map((d) => d.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, phone")
        .in("user_id", allUserIds);

      const { data: provCats } = await supabase
        .from("provider_categories")
        .select("user_id, categories(name)")
        .in("user_id", allUserIds);

      const profileMap = new Map(profiles?.map((p) => [p.user_id, p]) || []);
      const catMap = new Map<string, string[]>();
      provCats?.forEach((pc: any) => {
        const list = catMap.get(pc.user_id) || [];
        list.push(pc.categories?.name || "");
        catMap.set(pc.user_id, list);
      });

      const result = details.map((d) => ({
        id: d.user_id,
        name: profileMap.get(d.user_id)?.full_name || "Unknown",
        phone: profileMap.get(d.user_id)?.phone || "",
        category: (catMap.get(d.user_id) || []).join(", ") || "General",
        distance: d.location_lat ? "Nearby" : "Unknown",
        description: d.description || "No description provided",
        available: d.is_available ?? true,
      }));

      setProviders(result);
      setLoading(false);
    };

    if (categories.length > 0 || !selectedCategory) {
      fetchProviders();
    }
  }, [selectedCategory, categories]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <h1 className="font-display font-bold text-2xl text-foreground">
          {selectedCategory
            ? `${categories.find((c) => c.slug === selectedCategory)?.name || ""} Services`
            : "All Service Providers"}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {providers.length} provider{providers.length !== 1 ? "s" : ""} found
        </p>

        {/* Category pills */}
        <div className="flex gap-2 mt-6 overflow-x-auto pb-2">
          <a
            href="/search"
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              !selectedCategory ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-muted"
            }`}
          >
            All
          </a>
          {categories.map((cat) => (
            <a
              key={cat.slug}
              href={`/search?category=${cat.slug}`}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === cat.slug
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-muted"
              }`}
            >
              {cat.name}
            </a>
          ))}
        </div>

        {/* Results */}
        <div className="mt-8 space-y-4">
          {loading ? (
            <p className="text-center py-16 text-muted-foreground">Loading providers...</p>
          ) : providers.length > 0 ? (
            providers.map((provider) => (
              <ProviderCard key={provider.id} {...provider} />
            ))
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <p className="text-lg font-medium">No providers found</p>
              <p className="text-sm mt-1">Try selecting a different category</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SearchProviders;
