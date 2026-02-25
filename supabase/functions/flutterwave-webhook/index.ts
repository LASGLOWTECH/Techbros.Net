import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const secretHash = Deno.env.get("FLUTTERWAVE_SECRET_KEY");
    const verifyHash = req.headers.get("verif-hash");

    if (!verifyHash || verifyHash !== secretHash) {
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = await req.json();
    const { event, data } = payload;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    if (event === "charge.completed" && data.status === "successful") {
      const meta = data.meta || {};
      const txRef = data.tx_ref;
      const userId = meta.user_id;
      const purpose = meta.purpose;

      if (!userId) {
        return new Response(JSON.stringify({ error: "Missing user_id in meta" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Idempotency check
      const { data: existing } = await supabase
        .from("credit_transactions")
        .select("id")
        .eq("ref", txRef)
        .maybeSingle();

      if (existing) {
        return new Response(JSON.stringify({ status: "already_processed" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (purpose === "buy_credits") {
        const credits = meta.credits ? parseInt(meta.credits) : 0;
        if (credits <= 0) {
          return new Response(JSON.stringify({ error: "Invalid credits" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const { data: wallet } = await supabase
          .from("credits_wallets")
          .select("balance")
          .eq("user_id", userId)
          .maybeSingle();

        if (wallet) {
          await supabase
            .from("credits_wallets")
            .update({ balance: wallet.balance + credits, updated_at: new Date().toISOString() })
            .eq("user_id", userId);
        } else {
          await supabase
            .from("credits_wallets")
            .insert({ user_id: userId, balance: credits });
        }

        await supabase.from("credit_transactions").insert({
          user_id: userId,
          amount: credits,
          type: "purchase",
          ref: txRef,
        });

        // Record promo redemption if applicable
        if (meta.promo_code) {
          const { data: promo } = await supabase
            .from("promo_codes")
            .select("id, used_count")
            .eq("code", meta.promo_code.toUpperCase())
            .maybeSingle();

          if (promo) {
            await supabase.from("promo_redemptions").insert({
              promo_id: promo.id,
              user_id: userId,
            });
            await supabase
              .from("promo_codes")
              .update({ used_count: (promo.used_count || 0) + 1 })
              .eq("id", promo.id);
          }
        }
      } else if (purpose === "agency_subscribe") {
        const agencyId = meta.agency_id;
        const tier = meta.tier || "pro";

        if (agencyId) {
          await supabase
            .from("agencies")
            .update({ tier, updated_at: new Date().toISOString() })
            .eq("id", agencyId);
        }
      }
    }

    return new Response(JSON.stringify({ status: "ok" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("flutterwave-webhook error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
