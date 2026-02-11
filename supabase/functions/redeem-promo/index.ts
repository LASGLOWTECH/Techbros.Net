import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;
    const { code } = await req.json();

    if (!code) {
      return new Response(JSON.stringify({ error: "Code required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: promo } = await adminClient
      .from("promo_codes")
      .select("*")
      .eq("code", code.toUpperCase())
      .eq("is_active", true)
      .maybeSingle();

    if (!promo) {
      return new Response(JSON.stringify({ error: "Invalid promo code" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const now = new Date();
    if (promo.expires_at && new Date(promo.expires_at) <= now) {
      return new Response(JSON.stringify({ error: "Promo code expired" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (promo.max_redemptions && promo.used_count >= promo.max_redemptions) {
      return new Response(JSON.stringify({ error: "Promo code fully redeemed" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if already redeemed
    const { data: existing } = await adminClient
      .from("promo_redemptions")
      .select("id")
      .eq("promo_id", promo.id)
      .eq("user_id", userId)
      .maybeSingle();

    if (existing) {
      return new Response(JSON.stringify({ error: "Already redeemed" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Apply benefits
    const benefits: string[] = [];

    if (promo.credit_bonus > 0) {
      const { data: wallet } = await adminClient
        .from("credits_wallets")
        .select("balance")
        .eq("user_id", userId)
        .maybeSingle();

      if (wallet) {
        await adminClient
          .from("credits_wallets")
          .update({ balance: wallet.balance + promo.credit_bonus, updated_at: now.toISOString() })
          .eq("user_id", userId);
      } else {
        await adminClient
          .from("credits_wallets")
          .insert({ user_id: userId, balance: promo.credit_bonus });
      }

      await adminClient.from("credit_transactions").insert({
        user_id: userId,
        amount: promo.credit_bonus,
        type: "purchase",
        ref: `promo_${promo.code}`,
      });

      benefits.push(`${promo.credit_bonus} credits added`);
    }

    if (promo.trial_days && promo.trial_days > 0) {
      const { data: existingTrial } = await adminClient
        .from("premium_trials")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (!existingTrial) {
        const expiresAt = new Date(now.getTime() + promo.trial_days * 24 * 60 * 60 * 1000);
        await adminClient.from("premium_trials").insert({
          user_id: userId,
          started_at: now.toISOString(),
          expires_at: expiresAt.toISOString(),
        });
        benefits.push(`${promo.trial_days}-day premium trial activated`);
      }
    }

    // Record redemption
    await adminClient.from("promo_redemptions").insert({
      promo_id: promo.id,
      user_id: userId,
    });

    await adminClient
      .from("promo_codes")
      .update({ used_count: promo.used_count + 1 })
      .eq("id", promo.id);

    return new Response(
      JSON.stringify({ status: "redeemed", benefits, discount_percent: promo.discount_percent }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
