import { useState } from "react";
import { Link } from "react-router-dom";
import { z } from "zod";
import { Mail, MessageSquare, ArrowLeft, MapPin, Loader2 } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const CONTACT_EMAIL =
  (import.meta.env.VITE_CONTACT_EMAIL as string | undefined)?.trim() || "lasglowtech@gmail.com";

const contactSchema = z.object({
  full_name: z.string().max(120).optional().default(""),
  email: z.string().trim().email("Enter a valid email").max(320),
  subject: z.string().max(200).optional().default(""),
  message: z
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters")
    .max(8000, "Message is too long"),
});

export default function Contact() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = contactSchema.safeParse({
      full_name: fullName,
      email,
      subject,
      message,
    });
    if (!parsed.success) {
      const err = parsed.error.flatten();
      const msg =
        err.fieldErrors.message?.[0] ||
        err.fieldErrors.email?.[0] ||
        err.fieldErrors.full_name?.[0] ||
        err.fieldErrors.subject?.[0] ||
        "Check your entries.";
      toast({ variant: "destructive", title: "Invalid form", description: msg });
      return;
    }

    setSubmitting(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const fn = parsed.data.full_name.trim();
    const subj = parsed.data.subject.trim();

    const { error } = await supabase.from("contact_submissions").insert({
      email: parsed.data.email,
      full_name: fn.length ? fn : null,
      subject: subj.length ? subj : null,
      message: parsed.data.message,
      user_id: user?.id ?? null,
    });

    setSubmitting(false);

    if (error) {
      toast({
        variant: "destructive",
        title: "Could not send",
        description: error.message,
      });
      return;
    }

    toast({
      title: "Message sent",
      description: "We’ll get back to you as soon as we can.",
    });
    setFullName("");
    setEmail("");
    setSubject("");
    setMessage("");
  };

  return (
    <Layout>
      <div className="container max-w-2xl px-4 py-10 md:py-14">
        <Button variant="ghost" className="mb-6 -ml-2" asChild>
          <Link to="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back home
          </Link>
        </Button>

        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Contact us</h1>
        <p className="text-muted-foreground mb-10">
          Questions about the platform, partnerships, or support  we’re happy to hear from you.
        </p>

        <div className="space-y-8">
          <div className="rounded-2xl border border-border/50 bg-card/40 p-6 flex gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground mb-1">Email</h2>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-primary hover:underline break-all"
              >
                {CONTACT_EMAIL}
              </a>
            </div>
          </div>

          <div className="rounded-2xl border border-border/50 bg-card/40 p-6 flex gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground mb-1">TechBros Network</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Connecting tech freelancers and clients across Africa and beyond,remote-first.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-border/50 bg-card/40 p-6">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="h-5 w-5 text-primary" />
              <h2 className="font-semibold text-foreground">Send a message</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Your message is saved securely. Our team reads every submission.
            </p>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="contact-name">Name (optional)</Label>
                <Input
                  id="contact-name"
                  autoComplete="name"
                  placeholder="Your name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={submitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-email">Email *</Label>
                <Input
                  id="contact-email"
                  type="email"
                  autoComplete="email"
                  placeholder="lasglowtech@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={submitting}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-subject">Subject (optional)</Label>
                <Input
                  id="contact-subject"
                  placeholder="How can we help?"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  disabled={submitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-message">Message *</Label>
                <Textarea
                  id="contact-message"
                  placeholder="Write your message…"
                  className="min-h-[140px] resize-y"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={submitting}
                  required
                />
              </div>
              <Button type="submit" className="w-full sm:w-auto" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Sending…
                  </>
                ) : (
                  "Submit"
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
