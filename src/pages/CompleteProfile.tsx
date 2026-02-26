import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import PhoneInput from "@/components/PhoneInput";

const CompleteProfile = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"customer" | "provider">("customer");

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    // Pre-fill name from Google metadata
    const meta = user.user_metadata;
    if (meta?.full_name) setFullName(meta.full_name);
    else if (meta?.name) setFullName(meta.name);
  }, [user, navigate]);

  useEffect(() => {
    // If profile already complete, redirect
    if (profile && profile.phone) {
      navigate("/");
    }
  }, [profile, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      // Update profile
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: fullName, phone, role })
        .eq("user_id", user.id);

      if (error) throw error;

      // If provider, create provider_details
      if (role === "provider") {
        const { data: existing } = await supabase
          .from("provider_details")
          .select("id")
          .eq("user_id", user.id)
          .single();

        if (!existing) {
          await supabase.from("provider_details").insert({ user_id: user.id });
        }
      }

      toast.success("Profile completed!");
      navigate(role === "provider" ? "/provider-setup" : "/");
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="w-9 h-9 rounded-lg bg-hero-gradient flex items-center justify-center">
            <span className="text-primary-foreground font-display font-bold text-lg">H</span>
          </div>
          <span className="font-display font-bold text-xl text-foreground">HomeFix</span>
        </div>

        <div className="bg-card rounded-2xl shadow-card p-8">
          <h1 className="font-display font-bold text-2xl text-foreground text-center">
            Complete your profile
          </h1>
          <p className="text-muted-foreground text-sm text-center mt-1">
            Tell us a bit more about yourself
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required placeholder="John Doe" />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <PhoneInput value={phone} onChange={setPhone} required />
            </div>
            <div>
              <Label>I am a...</Label>
              <div className="grid grid-cols-2 gap-3 mt-1.5">
                <button
                  type="button"
                  onClick={() => setRole("customer")}
                  className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                    role === "customer"
                      ? "border-primary bg-accent text-accent-foreground"
                      : "border-border text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  🏠 Customer
                </button>
                <button
                  type="button"
                  onClick={() => setRole("provider")}
                  className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                    role === "provider"
                      ? "border-primary bg-accent text-accent-foreground"
                      : "border-border text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  🔧 Service Provider
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Saving..." : "Continue"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfile;
