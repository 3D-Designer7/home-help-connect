import { Phone, MessageCircle, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface ProviderCardProps {
  id: string;
  name: string;
  category: string;
  distance: string;
  description: string;
  available: boolean;
  phone?: string;
  imageUrl?: string;
}

const ProviderCard = ({ id, name, category, distance, description, available, phone, imageUrl }: ProviderCardProps) => {
  return (
    <div className="flex gap-4 p-4 rounded-xl bg-card shadow-card hover:shadow-card-hover transition-all duration-300 animate-fade-in">
      <div className="w-16 h-16 rounded-xl bg-muted flex-shrink-0 overflow-hidden">
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-hero-gradient opacity-20" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <Link to={`/provider/${id}`} className="font-display font-semibold text-foreground hover:text-primary transition-colors">
              {name}
            </Link>
            <p className="text-xs text-muted-foreground mt-0.5">{category}</p>
          </div>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${available ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"}`}>
            {available ? "Available" : "Offline"}
          </span>
        </div>

        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
          <MapPin size={12} />
          <span>{distance}</span>
        </div>

        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{description}</p>

        <div className="flex gap-2 mt-3">
          {phone ? (
            <a href={`tel:${phone}`}>
              <Button size="sm" variant="default" className="gap-1.5 h-8 text-xs">
                <Phone size={14} /> Call
              </Button>
            </a>
          ) : (
            <Button size="sm" variant="default" className="gap-1.5 h-8 text-xs" disabled>
              <Phone size={14} /> Call
            </Button>
          )}
          <Link to={`/provider/${id}`}>
            <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs">
              <MessageCircle size={14} /> Message
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProviderCard;
