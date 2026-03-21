/// <reference path="../deno.d.ts" />
/**
 * Database Webhook → admin email (registration, newsletter, contact).
 *
 * Two ways to send (pick one):
 *
 * 1) Resend (HTTP API, no SMTP)
 *    RESEND_API_KEY, ADMIN_NOTIFICATION_EMAIL (or EMAIL_USER as fallback inbox)
 *
 * 2) SMTP (same idea as Nodemailer + Gmail: host, port, user, password)
 *    SMTP_HOST, SMTP_USER (or EMAIL_USER), SMTP_PASS (or EMAIL_PASSWORD)
 *    SMTP_PORT (or EMAIL_PORT), default 465
 *    ADMIN_NOTIFICATION_EMAIL = where alerts are sent (or falls back to EMAIL_USER)
 *    SMTP_FROM_EMAIL optional; defaults to SMTP_USER (required by many providers)
 *
 * Always set: ADMIN_NOTIFY_WEBHOOK_SECRET (Bearer token for webhooks)
 *
 * Note: ADMIN_EMAIL / ADMIN_PASSWORD in other apps are usually *app login*, not mail —
 * they are not used here unless you map them yourself to the vars above.
 */

import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function notifyInbox(): string | null {
  const a = Deno.env.get("ADMIN_NOTIFICATION_EMAIL")?.trim();
  if (a) return a;
  return Deno.env.get("EMAIL_USER")?.trim() ?? null;
}

function smtpCredentials(): {
  host: string;
  port: number;
  user: string;
  pass: string;
} | null {
  const host = Deno.env.get("SMTP_HOST")?.trim();
  const user =
    Deno.env.get("SMTP_USER")?.trim() || Deno.env.get("EMAIL_USER")?.trim();
  const pass =
    Deno.env.get("SMTP_PASS")?.trim() || Deno.env.get("EMAIL_PASSWORD")?.trim();
  const portRaw = Deno.env.get("SMTP_PORT")?.trim() ||
    Deno.env.get("EMAIL_PORT")?.trim() ||
    "465";
  const port = parseInt(portRaw, 10);
  if (!host || !user || !pass || Number.isNaN(port)) return null;
  return { host, port, user, pass };
}

function buildEmail(
  table: string,
  r: Record<string, unknown>,
): { subject: string; html: string } | null {
  if (table === "profiles") {
    const email = String(r.email ?? "");
    const name = String(r.full_name ?? "");
    return {
      subject: `[TechBros] New registration: ${email || "unknown"}`,
      html: `<p><strong>New user registered</strong></p>
      <p>Email: ${escapeHtml(email)}<br/>
      Name: ${escapeHtml(name)}<br/>
      User ID: ${escapeHtml(String(r.user_id ?? ""))}</p>`,
    };
  }
  if (table === "newsletter_subscribers") {
    const email = String(r.email ?? "");
    return {
      subject: `[TechBros] Newsletter signup: ${email || "unknown"}`,
      html: `<p><strong>Newsletter subscription</strong></p>
      <p>Email: ${escapeHtml(email)}</p>`,
    };
  }
  if (table === "contact_submissions") {
    const email = String(r.email ?? "");
    const sub = r.subject != null ? String(r.subject) : "";
    const msg = String(r.message ?? "");
    const name = r.full_name != null ? String(r.full_name) : "";
    return {
      subject: `[TechBros] Contact: ${sub.trim() || email || "message"}`,
      html: `<p><strong>Contact form</strong></p>
      <p>From: ${escapeHtml(email)}<br/>
      ${name ? `Name: ${escapeHtml(name)}<br/>` : ""}
      ${sub.trim() ? `Subject: ${escapeHtml(sub)}<br/>` : ""}</p>
      <pre style="white-space:pre-wrap;font-family:sans-serif">${escapeHtml(msg)}</pre>`,
    };
  }
  return null;
}

async function deliverEmail(subject: string, html: string): Promise<{ ok: boolean; detail?: string }> {
  const to = notifyInbox();
  if (!to) {
    console.warn("admin-notify: set ADMIN_NOTIFICATION_EMAIL or EMAIL_USER");
    return { ok: true, detail: "skipped_no_inbox" };
  }

  const resendKey = Deno.env.get("RESEND_API_KEY")?.trim();
  if (resendKey) {
    const from =
      Deno.env.get("RESEND_FROM_EMAIL")?.trim() ||
      "TechBros Network <onboarding@resend.dev>";
    const send = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: [to], subject, html }),
    });
    if (!send.ok) {
      return { ok: false, detail: await send.text() };
    }
    return { ok: true };
  }

  const smtp = smtpCredentials();
  if (!smtp) {
    console.warn(
      "admin-notify: set RESEND_API_KEY or SMTP (SMTP_HOST + SMTP_USER/EMAIL_USER + SMTP_PASS/EMAIL_PASSWORD)",
    );
    return { ok: true, detail: "skipped_no_provider" };
  }

  const fromAddr =
    Deno.env.get("SMTP_FROM_EMAIL")?.trim() || smtp.user;
  const from = fromAddr.includes("<")
    ? fromAddr
    : `TechBros Network <${fromAddr}>`;

  const client = new SMTPClient({
    connection: {
      hostname: smtp.host,
      port: smtp.port,
      tls: smtp.port === 465,
      auth: { username: smtp.user, password: smtp.pass },
    },
  });

  try {
    await client.send({
      from,
      to,
      subject,
      content: subject,
      html,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("SMTP error:", msg);
    return { ok: false, detail: msg };
  } finally {
    await client.close();
  }

  return { ok: true };
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ ok: true, hint: "POST webhook payloads only" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const webhookSecret = Deno.env.get("ADMIN_NOTIFY_WEBHOOK_SECRET");
  const auth = req.headers.get("Authorization");
  if (!webhookSecret || auth !== `Bearer ${webhookSecret}`) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  let payload: {
    type?: string;
    table?: string;
    record?: Record<string, unknown>;
  };
  try {
    payload = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (payload.type !== "INSERT" || !payload.table || !payload.record) {
    return new Response(JSON.stringify({ ok: true, ignored: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const built = buildEmail(payload.table, payload.record);
  if (!built) {
    return new Response(JSON.stringify({ ok: true, ignored: "table" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const result = await deliverEmail(built.subject, built.html);
  if (!result.ok) {
    return new Response(
      JSON.stringify({ error: "Send failed", detail: result.detail }),
      { status: 502, headers: { "Content-Type": "application/json" } },
    );
  }

  return new Response(JSON.stringify({ ok: true, via: result.detail }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
