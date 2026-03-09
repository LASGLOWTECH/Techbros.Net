import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CREDIT_PACKS = [
  { id: "pack_5", credits: 5, price: 2500, label: "5 Credits" },
  { id: "pack_15", credits: 15, price: 6000, label: "15 Credits" },
  { id: "pack_50", credits: 50, price: 15000, label: "50 Credits" },
];

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

    const userId = user.id;
    const userEmail = user.email;
    const { pack_id, promo_code } = await req.json();

    const pack = CREDIT_PACKS.find((p) => p.id === pack_id);
    if (!pack) {
      return new Response(JSON.stringify({ error: "Invalid pack" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let finalPrice = pack.price;
    let bonusCredits = 0;

    // Apply promo code if provided
    if (promo_code) {
      const adminClient = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      const { data: promo } = await adminClient
        .from("promo_codes")
        .select("*")
        .eq("code", promo_code.toUpperCase())
        .eq("is_active", true)
        .maybeSingle();

      if (promo) {
        const now = new Date();
        const notExpired = !promo.expires_at || new Date(promo.expires_at) > now;
        const notMaxed = !promo.max_redemptions || promo.used_count < promo.max_redemptions;

        const { data: redeemed } = await adminClient
          .from("promo_redemptions")
          .select("id")
          .eq("promo_id", promo.id)
          .eq("user_id", userId)
          .maybeSingle();

        if (notExpired && notMaxed && !redeemed) {
          if (promo.discount_percent > 0) {
            finalPrice = Math.round(pack.price * (1 - promo.discount_percent / 100));
          }
          if (promo.credit_bonus > 0) {
            bonusCredits = promo.credit_bonus;
          }
        }
      }
    }

    const txRef = `credits_${userId}_${Date.now()}`;
    const flutterwaveKey = Deno.env.get("FLUTTERWAVE_SECRET_KEY");
    
    if (!flutterwaveKey) {
      return new Response(JSON.stringify({ error: "Payment service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const flwResponse = await fetch("https://api.flutterwave.com/v3/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${flutterwaveKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tx_ref: txRef,
        amount: finalPrice,
        currency: "NGN",
        redirect_url: `${Deno.env.get("SUPABASE_URL")}/functions/v1/flutterwave-webhook`,
        customer: { email: userEmail },
        meta: {
          user_id: userId,
          purpose: "buy_credits",
          credits: (pack.credits + bonusCredits).toString(),
          promo_code: promo_code || "",
        },
        customizations: {
          title: "TechBros Network Credits",
          description: `${pack.label}${bonusCredits > 0 ? ` + ${bonusCredits} bonus` : ""}`,
        },
      }),
    });

    const contentType = flwResponse.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      const text = await flwResponse.text();
      console.error("Non-JSON response from Flutterwave:", text);
      return new Response(JSON.stringify({ error: "Payment gateway returned an unexpected response" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const flwData = await flwResponse.json();

    if (flwData.status === "success") {
      return new Response(
        JSON.stringify({ payment_link: flwData.data.link, tx_ref: txRef }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ error: "Payment initialization failed", details: flwData.message || flwData }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("buy-credits error:", error);
    return new Response(JSON.stringify({ error: "An internal server error occurred. Please try again." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
