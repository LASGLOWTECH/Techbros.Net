import { Coins } from "lucide-react";
import { useCredits } from "@/hooks/useCredits";

export function CreditBalanceWidget({ onClick }: { onClick?: () => void }) {
  const { balance, loading } = useCredits();

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-card hover:border-primary/30 transition-all text-sm"
    >
      <Coins className="h-4 w-4 text-primary" />
      <span className="font-semibold">{loading ? "…" : balance}</span>
      <span className="text-muted-foreground hidden sm:inline">credits</span>
    </button>
  );
}
