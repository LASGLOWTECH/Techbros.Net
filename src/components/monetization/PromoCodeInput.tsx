import { useState } from "react";
import { Tag, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTrial } from "@/hooks/useTrial";
import { useToast } from "@/hooks/use-toast";

export function PromoCodeInput({ onSuccess }: { onSuccess?: () => void }) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [redeemed, setRedeemed] = useState(false);
  const { redeemPromo } = useTrial();
  const { toast } = useToast();

  const handleRedeem = async () => {
    if (!code.trim()) return;
    setLoading(true);
    try {
      const result = await redeemPromo(code.trim());
      setRedeemed(true);
      toast({
        title: "Promo redeemed!",
        description: result.benefits?.join(", ") || "Benefits applied to your account.",
      });
      onSuccess?.();
    } catch (error: any) {
      toast({ title: "Invalid code", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (redeemed) {
    return (
      <div className="flex items-center gap-2 text-sm text-primary">
        <Check className="h-4 w-4" />
        Promo code applied
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Enter promo code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          className="pl-9 uppercase"
        />
      </div>
      <Button onClick={handleRedeem} disabled={loading || !code.trim()} size="sm">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
      </Button>
    </div>
  );
}
