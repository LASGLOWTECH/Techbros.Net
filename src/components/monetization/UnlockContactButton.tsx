import { useState } from "react";
import { Lock, Unlock, Mail, Loader2, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCredits } from "@/hooks/useCredits";
import { useToast } from "@/hooks/use-toast";

interface UnlockContactButtonProps {
  expertId: string;
  expertName: string;
  roleTitle?: string | null;
  onBuyCredits: () => void;
}

export function UnlockContactButton({ expertId, expertName, roleTitle, onBuyCredits }: UnlockContactButtonProps) {
  const { unlockContact, checkUnlock, balance } = useCredits();
  const { toast } = useToast();
  const [unlocked, setUnlocked] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);

  // Check on mount if already unlocked
  useState(() => {
    checkUnlock(expertId).then((isUnlocked) => {
      if (isUnlocked) {
        setUnlocked(true);
      }
      setChecked(true);
    });
  });

  const handleUnlock = async () => {
    if (balance < 1) {
      toast({ title: "Not enough credits", description: "Buy credits to unlock contact info." });
      onBuyCredits();
      return;
    }
    setLoading(true);
    try {
      const result = await unlockContact(expertId);
      setEmail(result.email);
      setUnlocked(true);
      toast({ title: "Contact unlocked!", description: `You can now contact ${expertName}` });
    } catch (error: any) {
      if (error.message === "Insufficient credits") {
        onBuyCredits();
      }
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (!checked) return null;

  if (unlocked && email) {
    return (
      <a
        href={`mailto:${email}?subject=${encodeURIComponent(`Hiring Inquiry - ${roleTitle || 'Freelancer'}`)}&body=${encodeURIComponent(`Hi ${expertName},\n\nI came across your profile on TechBros Network and I'm interested in working with you.\n\nLooking forward to hearing from you!`)}`}
      >
        <Button variant="hero" size="lg">
          <Mail className="h-4 w-4 mr-2" />
          Contact {expertName.split(" ")[0]}
        </Button>
      </a>
    );
  }

  if (unlocked) {
    return (
      <Button variant="hero" size="lg" disabled>
        <Unlock className="h-4 w-4 mr-2" />
        Unlocked
      </Button>
    );
  }

  return (
    <Button variant="hero" size="lg" onClick={handleUnlock} disabled={loading}>
      {loading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Lock className="h-4 w-4 mr-2" />
      )}
      Unlock Contact
      <span className="ml-1 text-xs opacity-70 flex items-center gap-0.5">
        <Coins className="h-3 w-3" /> 1
      </span>
    </Button>
  );
}
