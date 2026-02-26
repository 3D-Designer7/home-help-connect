import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-image.jpg";
import LocationSearch from "@/components/LocationSearch";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden">
      {/* Background image with overlay */}
      <div className="absolute inset-0">
        <img src={heroImage} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-foreground/60" />
      </div>

      <div className="relative container py-24 md:py-36 text-center">
        <h1 className="font-display font-extrabold text-4xl md:text-6xl text-primary-foreground leading-tight max-w-3xl mx-auto animate-fade-in">
          Home repairs,{" "}
          <span className="text-gradient">made simple.</span>
        </h1>
        <p className="mt-5 text-lg md:text-xl text-primary-foreground/80 max-w-xl mx-auto animate-fade-in" style={{ animationDelay: "0.1s" }}>
          Find trusted plumbers, electricians, and technicians near you — in seconds.
        </p>

        <div
          className="mt-8 flex flex-col sm:flex-row items-center gap-3 max-w-lg mx-auto animate-fade-in"
          style={{ animationDelay: "0.2s" }}
        >
          <LocationSearch onSelect={() => {}} />
          <Button
            size="lg"
            className="w-full sm:w-auto gap-2 shadow-hero"
            onClick={() => navigate("/search")}
          >
            <Search size={18} />
            Search
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
