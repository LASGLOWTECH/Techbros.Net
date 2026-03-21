import { useState } from "react";
import { z } from "zod";
import { Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const emailSchema = z.string().trim().email("Enter a valid email address").max(320);

export function NewsletterSubscribe() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      toast({
        variant: "destructive",
        title: "Invalid email",
        description: parsed.error.flatten().formErrors[0] ?? "Check the address and try again.",
      });
      return;
    }

    setSubmitting(true);
    const { error } = await supabase
      .from("newsletter_subscribers")
      .insert({ email: parsed.data });

    setSubmitting(false);

    if (error) {
      if (error.code === "23505") {
        toast({
          title: "You’re already subscribed",
          description: "This email is on our list. Thanks for your interest!",
        });
        setEmail("");
        return;
      }
      toast({
        variant: "destructive",
        title: "Could not subscribe",
        description: error.message,
      });
      return;
    }

    toast({
      title: "You’re subscribed",
      description: "We’ll share updates about TechBros Network.",
    });
    setEmail("");
  };

  return (
    <section
      className="py-20 md:py-24 px-6 md:px-24 border-t border-border/30"
      style={{ background: "linear-gradient(180deg, hsl(220 50% 11%) 0%, hsl(222 47% 8%) 100%)" }}
    >
      <div className="container max-w-2xl mx-auto px-4 text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary mb-4">
          <Mail className="h-6 w-6" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
          Subscribe <span className="text-gradient">now</span>
        </h2>
        <p className="text-muted-foreground mb-8">
          Get product news, job highlights, and community updates. No spam — unsubscribe anytime
          from future mailings.
        </p>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
        >
          <Input
            type="email"
            name="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 bg-background/60 border-border/60"
            disabled={submitting}
          />
          <Button type="submit" className="h-11 shrink-0" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Sending…
              </>
            ) : (
              "Subscribe"
            )}
          </Button>
        </form>
      </div>
    </section>
  );
}
