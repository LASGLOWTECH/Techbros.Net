import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";





export function useTrial() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const checkTrial = async () => {
    if (!user) return null;
    const { data } = await (supabase as any)
      .from("premium_trials")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    return data;
  };

  const activateTrial = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/activate-trial`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({}),
        }
      );
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to activate trial");
      return result;
    } finally {
      setLoading(false);
    }
  };

  const redeemPromo = async (code: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Not authenticated");

    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/redeem-promo`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ code }),
      }
    );
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || "Redemption failed");
    return result;
  };

  return { checkTrial, activateTrial, redeemPromo, loading };
}
