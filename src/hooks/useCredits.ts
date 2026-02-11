import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function useCredits() {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchBalance = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    const { data } = await (supabase as any)
      .from("credits_wallets")
      .select("balance")
      .eq("user_id", user.id)
      .maybeSingle();
    setBalance(data?.balance || 0);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchBalance(); }, [fetchBalance]);

  const buyCredits = async (packId: string, promoCode?: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Not authenticated");

    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/buy-credits`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ pack_id: packId, promo_code: promoCode }),
      }
    );
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || "Payment failed");
    return result;
  };

  const unlockContact = async (expertId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Not authenticated");

    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/unlock-contact`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ expert_id: expertId }),
      }
    );
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || "Unlock failed");
    await fetchBalance();
    return result;
  };

  const checkUnlock = async (expertId: string) => {
    if (!user) return false;
    const { data } = await (supabase as any)
      .from("contact_unlocks")
      .select("id")
      .eq("client_id", user.id)
      .eq("expert_id", expertId)
      .maybeSingle();
    return !!data;
  };

  return { balance, loading, buyCredits, unlockContact, checkUnlock, refetch: fetchBalance };
}
