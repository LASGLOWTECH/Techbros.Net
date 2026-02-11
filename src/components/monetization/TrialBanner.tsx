import { useState, useEffect } from "react";
import { Sparkles, Clock, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTrial } from "@/hooks/useTrial";
import { useToast } from "@/hooks/use-toast";

export function TrialBanner() {
  const { checkTrial, activateTrial, loading } = useTrial();
  const { toast } = useToast();
  const [trial, setTrial] = useState<any>(null);
  const [checked, setChecked] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    checkTrial().then((data) => {
      setTrial(data);
      setChecked(true);
    });
  }, []);

  useEffect(() => {
    if (!trial?.expires_at) return;
    const update = () => {
      const diff = new Date(trial.expires_at).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft("Expired"); return; }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      setTimeLeft(`${days}d ${hours}h remaining`);
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [trial]);

  if (!checked) return null;

  // Active trial
  if (trial && new Date(trial.expires_at) > new Date()) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/10 border border-primary/20 mb-6">
        <Sparkles className="h-5 w-5 text-primary" />
        <div className="flex-1">
          <p className="text-sm font-semibold">Premium Trial Active</p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {timeLeft}
          </p>
        </div>
      </div>
    );
  }

  // No trial used yet
  if (!trial) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-card border border-border mb-6">
        <Zap className="h-5 w-5 text-warning" />
        <div className="flex-1">
          <p className="text-sm font-semibold">Try Premium Free for 7 Days</p>
          <p className="text-xs text-muted-foreground">Unlock unlimited contacts during your trial</p>
        </div>
        <Button
          size="sm"
          onClick={async () => {
            try {
              const result = await activateTrial();
              setTrial({ expires_at: result.expires_at });
              toast({ title: "Trial activated!", description: "Enjoy 7 days of premium access." });
            } catch (e: any) {
              toast({ title: "Error", description: e.message, variant: "destructive" });
            }
          }}
          disabled={loading}
        >
          Start Trial
        </Button>
      </div>
    );
  }

  return null;
}
