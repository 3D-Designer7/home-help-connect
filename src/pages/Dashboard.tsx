import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Link } from "react-router-dom";
import { MessageCircle, Settings, MapPin } from "lucide-react";
import { toast } from "sonner";

const Dashboard = () => {
  const { user, profile } = useAuth();
  const [providerDetails, setProviderDetails] = useState<any>(null);
  const [conversations, setConversations] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    // Fetch conversations
    const fetchConversations = async () => {
      const { data } = await supabase
        .from("conversations")
        .select("*, messages(content, created_at, sender_id)")
        .or(`customer_id.eq.${user.id},provider_id.eq.${user.id}`)
        .order("updated_at", { ascending: false });

      if (data) {
        // Fetch profile names for other participants
        const otherIds = data.map((c) =>
          c.customer_id === user.id ? c.provider_id : c.customer_id
        );
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name")
          .in("user_id", otherIds);

        const profileMap = new Map(profiles?.map((p) => [p.user_id, p.full_name]) || []);
        setConversations(
          data.map((c) => ({
            ...c,
            otherName: profileMap.get(c.customer_id === user.id ? c.provider_id : c.customer_id) || "Unknown",
            lastMessage: c.messages?.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0],
          }))
        );
      }
    };

    fetchConversations();

    if (profile?.role === "provider") {
      supabase
        .from("provider_details")
        .select("*")
        .eq("user_id", user.id)
        .single()
        .then(({ data }) => setProviderDetails(data));
    }
  }, [user, profile]);

  const toggleAvailability = async () => {
    if (!providerDetails) return;
    const newStatus = !providerDetails.is_available;
    const { error } = await supabase
      .from("provider_details")
      .update({ is_available: newStatus })
      .eq("user_id", user!.id);

    if (!error) {
      setProviderDetails({ ...providerDetails, is_available: newStatus });
      toast.success(newStatus ? "You're now online!" : "You're now offline");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8 max-w-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display font-bold text-2xl text-foreground">
              Hello, {profile?.full_name || "User"} 👋
            </h1>
            <p className="text-muted-foreground text-sm capitalize">{profile?.role} account</p>
          </div>

          {profile?.role === "provider" && providerDetails && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{providerDetails.is_available ? "Online" : "Offline"}</span>
              <Switch checked={providerDetails.is_available} onCheckedChange={toggleAvailability} />
            </div>
          )}
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          {profile?.role === "customer" && (
            <>
              <Link to="/search" className="flex items-center gap-2 p-4 rounded-xl bg-card shadow-card hover:shadow-card-hover transition-all">
                <MapPin size={20} className="text-primary" />
                <span className="font-medium text-sm">Find Services</span>
              </Link>
              <Link to="/map" className="flex items-center gap-2 p-4 rounded-xl bg-card shadow-card hover:shadow-card-hover transition-all">
                <MapPin size={20} className="text-primary" />
                <span className="font-medium text-sm">Map View</span>
              </Link>
            </>
          )}
          {profile?.role === "provider" && (
            <Link to="/provider-setup" className="flex items-center gap-2 p-4 rounded-xl bg-card shadow-card hover:shadow-card-hover transition-all">
              <Settings size={20} className="text-primary" />
              <span className="font-medium text-sm">Edit Profile</span>
            </Link>
          )}
        </div>

        {/* Conversations */}
        <h2 className="font-display font-semibold text-lg text-foreground mt-8 mb-4">Messages</h2>
        {conversations.length > 0 ? (
          <div className="space-y-2">
            {conversations.map((conv) => (
              <Link
                key={conv.id}
                to={`/chat/${conv.id}`}
                className="flex items-center gap-3 p-4 rounded-xl bg-card shadow-card hover:shadow-card-hover transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-hero-gradient opacity-80 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground">{conv.otherName}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {conv.lastMessage?.content || "No messages yet"}
                  </p>
                </div>
                <MessageCircle size={16} className="text-muted-foreground" />
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">No conversations yet</p>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
