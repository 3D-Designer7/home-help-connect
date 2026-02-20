import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Phone, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

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
}

const MapView = () => {
  const [providers, setProviders] = useState<ProviderOnMap[]>([]);
  const [center, setCenter] = useState<[number, number]>([33.6844, 73.0479]); // Default: Islamabad

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
        .select("user_id, category_id, categories(name)")
        .in("user_id", userIds);

      const profileMap = new Map(profiles?.map((p) => [p.user_id, p]) || []);
      const catMap = new Map<string, string[]>();
      provCats?.forEach((pc: any) => {
        const list = catMap.get(pc.user_id) || [];
        list.push(pc.categories?.name || "");
        catMap.set(pc.user_id, list);
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
        }));

      setProviders(result);
    };

    fetchProviders();

    // Try to use user's location as center
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setCenter([pos.coords.latitude, pos.coords.longitude]);
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 relative">
        <MapContainer
          center={center}
          zoom={12}
          style={{ height: "calc(100vh - 64px)", width: "100%" }}
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {providers.map((p) => (
            <Marker key={p.user_id} position={[p.location_lat, p.location_lng]}>
              <Popup>
                <div className="min-w-[180px]">
                  <h3 className="font-semibold text-sm">{p.full_name}</h3>
                  <p className="text-xs text-gray-500">{p.categories.join(", ")}</p>
                  {p.description && <p className="text-xs mt-1">{p.description}</p>}
                  <div className="flex gap-1 mt-2">
                    {p.phone && (
                      <a href={`tel:${p.phone}`} className="text-xs bg-orange-500 text-white px-2 py-1 rounded inline-flex items-center gap-1">
                        <Phone size={12} /> Call
                      </a>
                    )}
                    <Link to={`/provider/${p.user_id}`} className="text-xs bg-gray-200 px-2 py-1 rounded">
                      View
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </main>
    </div>
  );
};

export default MapView;
