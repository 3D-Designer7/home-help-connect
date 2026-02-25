import { useEffect, useState, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { Link } from "react-router-dom";
import { Phone } from "lucide-react";

// Category icon map (lucide icon name -> emoji for map markers)
const categoryEmojiMap: Record<string, string> = {
  wind: "❄️",        // AC Technician
  pipette: "🚰",     // Drainage
  zap: "⚡",          // Electrician
  wrench: "🔧",      // Metal Worker
  droplets: "🔵",    // Plumber
  flame: "🔥",       // Stove Repair
  radio: "📡",       // Telecom
  "tree-pine": "🪵", // Wood Worker
};

const createCategoryIcon = (emoji: string) => {
  return L.divIcon({
    html: `<div style="font-size:24px;line-height:1;text-align:center;width:36px;height:36px;display:flex;align-items:center;justify-content:center;background:white;border-radius:50%;border:2px solid hsl(24,95%,53%);box-shadow:0 2px 6px rgba(0,0,0,0.3)">${emoji}</div>`,
    className: "",
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
};

// Fix leaflet default marker icon
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = defaultIcon;

interface ProviderOnMap {
  user_id: string;
  full_name: string;
  phone: string;
  description: string | null;
  location_lat: number;
  location_lng: number;
  is_available: boolean;
  categories: string[];
  category_icons: string[];
}

const MapView = () => {
  const [providers, setProviders] = useState<ProviderOnMap[]>([]);
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current).setView([33.6844, 73.0479], 12);
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    // Try user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        map.setView([pos.coords.latitude, pos.coords.longitude], 12);
      });
    }

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const fetchProviders = async () => {
      const { data: details } = await supabase
        .from("provider_details")
        .select("user_id, description, location_lat, location_lng, is_available")
        .eq("is_available", true)
        .not("location_lat", "is", null);

      if (!details || details.length === 0) return;

      const userIds = details.map((d) => d.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, phone")
        .in("user_id", userIds);

      const { data: provCats } = await supabase
        .from("provider_categories")
        .select("user_id, category_id, categories(name, icon)")
        .in("user_id", userIds);

      const profileMap = new Map(profiles?.map((p) => [p.user_id, p]) || []);
      const catMap = new Map<string, string[]>();
      const iconMap = new Map<string, string[]>();
      provCats?.forEach((pc: any) => {
        const names = catMap.get(pc.user_id) || [];
        names.push(pc.categories?.name || "");
        catMap.set(pc.user_id, names);

        const icons = iconMap.get(pc.user_id) || [];
        icons.push(pc.categories?.icon || "wrench");
        iconMap.set(pc.user_id, icons);
      });

      const result: ProviderOnMap[] = details
        .filter((d) => d.location_lat && d.location_lng)
        .map((d) => ({
          user_id: d.user_id,
          full_name: profileMap.get(d.user_id)?.full_name || "Unknown",
          phone: profileMap.get(d.user_id)?.phone || "",
          description: d.description,
          location_lat: d.location_lat!,
          location_lng: d.location_lng!,
          is_available: d.is_available ?? true,
          categories: catMap.get(d.user_id) || [],
          category_icons: iconMap.get(d.user_id) || [],
        }));

      setProviders(result);
    };

    fetchProviders();
  }, []);

  // Add markers when providers or map change
  useEffect(() => {
    const map = mapRef.current;
    if (!map || providers.length === 0) return;

    const markers: L.Marker[] = [];
    providers.forEach((p) => {
      const iconKey = p.category_icons[0] || "wrench";
      const emoji = categoryEmojiMap[iconKey] || "🔧";
      const markerIcon = createCategoryIcon(emoji);
      const marker = L.marker([p.location_lat, p.location_lng], { icon: markerIcon }).addTo(map);
      marker.bindPopup(`
        <div style="min-width:180px">
          <h3 style="font-weight:600;font-size:14px;margin:0">${p.full_name}</h3>
          <p style="font-size:12px;color:#666;margin:2px 0">${p.categories.join(", ")}</p>
          ${p.description ? `<p style="font-size:12px;margin:4px 0">${p.description}</p>` : ""}
          <div style="display:flex;gap:4px;margin-top:8px">
            ${p.phone ? `<a href="tel:${p.phone}" style="font-size:12px;background:#f97316;color:white;padding:4px 8px;border-radius:4px;text-decoration:none">📞 Call</a>` : ""}
            <a href="/provider/${p.user_id}" style="font-size:12px;background:#e5e7eb;padding:4px 8px;border-radius:4px;text-decoration:none">View</a>
          </div>
        </div>
      `);
      markers.push(marker);
    });

    return () => {
      markers.forEach((m) => m.remove());
    };
  }, [providers]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 relative">
        <div ref={mapContainerRef} style={{ height: "calc(100vh - 64px)", width: "100%" }} />
      </main>
    </div>
  );
};

export default MapView;
