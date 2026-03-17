/// <reference path="../deno.d.ts" />
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
};

const UNLOCK_COST = 1;

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
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const clientId = user.id;
    const { expert_id } = await req.json();

    if (!expert_id) {
      return new Response(JSON.stringify({ error: "expert_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SERVICE_ROLE_KEY")!
    );

    // Check if already unlocked
    const { data: existing } = await adminClient
      .from("contact_unlocks")
      .select("id")
      .eq("client_id", clientId)
      .eq("expert_id", expert_id)
      .maybeSingle();

    if (existing) {
      const { data: profile } = await adminClient
        .from("profiles")
        .select("email")
        .eq("user_id", expert_id)
        .maybeSingle();

      return new Response(
        JSON.stringify({ status: "already_unlocked", email: profile?.email }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user has premium trial active
    const { data: trial } = await adminClient
      .from("premium_trials")
      .select("expires_at")
      .eq("user_id", clientId)
      .maybeSingle();

    const isPremium = trial && new Date(trial.expires_at) > new Date();

    if (!isPremium) {
      const { data: wallet } = await adminClient
        .from("credits_wallets")
        .select("balance")
        .eq("user_id", clientId)
        .maybeSingle();

      if (!wallet || wallet.balance < UNLOCK_COST) {
        return new Response(
          JSON.stringify({ error: "Insufficient credits", balance: wallet?.balance || 0 }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      await adminClient
        .from("credits_wallets")
        .update({ balance: wallet.balance - UNLOCK_COST, updated_at: new Date().toISOString() })
        .eq("user_id", clientId);

      await adminClient.from("credit_transactions").insert({
        user_id: clientId,
        amount: -UNLOCK_COST,
        type: "spend",
        ref: `unlock_${expert_id}`,
      });
    }

    await adminClient.from("contact_unlocks").insert({
      client_id: clientId,
      expert_id: expert_id,
    });

    const { data: profile } = await adminClient
      .from("profiles")
      .select("email")
      .eq("user_id", expert_id)
      .maybeSingle();

    return new Response(
      JSON.stringify({ status: "unlocked", email: profile?.email, free: isPremium }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("unlock-contact error:", error);
    return new Response(JSON.stringify({ error: "An internal server error occurred. Please try again." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
