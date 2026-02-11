import { useState } from "react";
import { Coins, Sparkles, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useCredits } from "@/hooks/useCredits";
import { useToast } from "@/hooks/use-toast";

const PACKS = [
  { id: "pack_5", credits: 5, price: "₦2,500", popular: false },
  { id: "pack_15", credits: 15, price: "₦6,000", popular: true },
  { id: "pack_50", credits: 50, price: "₦15,000", popular: false },
];

interface BuyCreditsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BuyCreditsModal({ open, onOpenChange }: BuyCreditsModalProps) {
  const [promoCode, setPromoCode] = useState("");
  const [purchasing, setPurchasing] = useState(false);
  const { buyCredits } = useCredits();
  const { toast } = useToast();

  const handleBuy = async (packId: string) => {
    setPurchasing(true);
    try {
      const result = await buyCredits(packId, promoCode || undefined);
      if (result.payment_link) {
        window.open(result.payment_link, "_blank");
        onOpenChange(false);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-primary" />
            Buy Credits
          </DialogTitle>
          <DialogDescription>
            Use credits to unlock freelancer contact details
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          {PACKS.map((pack) => (
            <button
              key={pack.id}
              disabled={purchasing}
              onClick={() => handleBuy(pack.id)}
              className="w-full flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-md transition-all disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-semibold">{pack.credits} Credits</p>
                  <p className="text-sm text-muted-foreground">{pack.price}</p>
                </div>
              </div>
              {pack.popular && (
                <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full font-medium">
                  Popular
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="mt-4">
          <label className="text-sm font-medium mb-2 block">
            <Tag className="h-3 w-3 inline mr-1" />
            Promo Code
          </label>
          <Input
            placeholder="Enter promo code"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            className="uppercase"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
