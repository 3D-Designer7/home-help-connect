import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import HowItWorks from "@/components/HowItWorks";
import CategoryCard from "@/components/CategoryCard";
import { Droplets, Zap, Wind, Pipette, Flame, TreePine, Wrench, Radio, LucideIcon } from "lucide-react";

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

  useEffect(() => {
    supabase.from("categories").select("id, name, slug, icon").then(({ data }) => {
      if (data) setCategories(data);
    });
  }, []);

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
