import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Coins, TrendingUp, Clock, Tag, Plus, Trash2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface PromoCode {
  id: string;
  code: string;
  discount_percent: number;
  credit_bonus: number;
  trial_days: number;
  expires_at: string | null;
  max_redemptions: number | null;
  used_count: number;
  is_active: boolean;
  created_at: string;
}

export function AdminMonetization() {
  const [creditStats, setCreditStats] = useState({ totalPurchased: 0, totalSpent: 0, totalWalletBalance: 0 });
  const [trialStats, setTrialStats] = useState({ total: 0, active: 0 });
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [unlockCount, setUnlockCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showCreatePromo, setShowCreatePromo] = useState(false);
  const { toast } = useToast();

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    const sb = supabase as any;

    const [txRes, walletRes, trialRes, promoRes, unlockRes] = await Promise.all([
      sb.from("credit_transactions").select("amount, type"),
      sb.from("credits_wallets").select("balance"),
      sb.from("premium_trials").select("expires_at"),
      sb.from("promo_codes").select("*").order("created_at", { ascending: false }),
      sb.from("contact_unlocks").select("id", { count: "exact", head: true }),
    ]);

    const txs = txRes.data || [];
    const totalPurchased = txs.filter((t: any) => t.type === "purchase").reduce((s: number, t: any) => s + t.amount, 0);
    const totalSpent = txs.filter((t: any) => t.type === "spend").reduce((s: number, t: any) => s + Math.abs(t.amount), 0);
    const totalWalletBalance = (walletRes.data || []).reduce((s: number, w: any) => s + w.balance, 0);
    setCreditStats({ totalPurchased, totalSpent, totalWalletBalance });

    const trials = trialRes.data || [];
    const now = new Date();
    setTrialStats({
      total: trials.length,
      active: trials.filter((t: any) => new Date(t.expires_at) > now).length,
    });

    setPromoCodes(promoRes.data || []);
    setUnlockCount(unlockRes.count || 0);
    setLoading(false);
  };

  const deletePromo = async (id: string) => {
    await (supabase as any).from("promo_codes").delete().eq("id", id);
    setPromoCodes(prev => prev.filter(p => p.id !== id));
    toast({ title: "Promo code deleted" });
  };

  const togglePromo = async (id: string, active: boolean) => {
    await (supabase as any).from("promo_codes").update({ is_active: !active }).eq("id", id);
    setPromoCodes(prev => prev.map(p => p.id === id ? { ...p, is_active: !active } : p));
  };

  if (loading) {
    return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Revenue Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credits Purchased</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{creditStats.totalPurchased}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credits Spent</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{creditStats.totalSpent}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contact Unlocks</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unlockCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Trials</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trialStats.active}</div>
            <p className="text-xs text-muted-foreground">{trialStats.total} total</p>
          </CardContent>
        </Card>
      </div>

      {/* Promo Codes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Promo Codes
          </CardTitle>
          <Button size="sm" onClick={() => setShowCreatePromo(true)}>
            <Plus className="h-4 w-4 mr-1" /> Create
          </Button>
        </CardHeader>
        <CardContent>
          {promoCodes.length === 0 ? (
            <p className="text-muted-foreground text-sm">No promo codes created yet.</p>
          ) : (
            <div className="space-y-3">
              {promoCodes.map((promo) => (
                <div key={promo.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div>
                    <div className="flex items-center gap-2">
                      <code className="font-mono font-bold">{promo.code}</code>
                      <Badge variant={promo.is_active ? "default" : "secondary"}>
                        {promo.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {promo.discount_percent > 0 && `${promo.discount_percent}% off • `}
                      {promo.credit_bonus > 0 && `${promo.credit_bonus} bonus credits • `}
                      {promo.trial_days > 0 && `${promo.trial_days} trial days • `}
                      Used {promo.used_count}{promo.max_redemptions ? `/${promo.max_redemptions}` : ""} times
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => togglePromo(promo.id, promo.is_active)}>
                      {promo.is_active ? "Disable" : "Enable"}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => deletePromo(promo.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <CreatePromoDialog open={showCreatePromo} onOpenChange={setShowCreatePromo} onCreated={fetchAll} />
    </div>
  );
}

function CreatePromoDialog({ open, onOpenChange, onCreated }: { open: boolean; onOpenChange: (o: boolean) => void; onCreated: () => void }) {
  const [code, setCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [creditBonus, setCreditBonus] = useState(0);
  const [trialDays, setTrialDays] = useState(0);
  const [maxRedemptions, setMaxRedemptions] = useState<number | "">("");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleCreate = async () => {
    if (!code.trim()) return;
    setSaving(true);
    const { error } = await (supabase as any).from("promo_codes").insert({
      code: code.toUpperCase().trim(),
      discount_percent: discountPercent,
      credit_bonus: creditBonus,
      trial_days: trialDays,
      max_redemptions: maxRedemptions || null,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Promo code created!" });
      onOpenChange(false);
      setCode(""); setDiscountPercent(0); setCreditBonus(0); setTrialDays(0); setMaxRedemptions("");
      onCreated();
    }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Promo Code</DialogTitle>
          <DialogDescription>Set up a new promotional code with custom benefits.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div>
            <label className="text-sm font-medium">Code</label>
            <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="TECHBROS50" className="uppercase" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Discount %</label>
              <Input type="number" min={0} max={100} value={discountPercent} onChange={(e) => setDiscountPercent(Number(e.target.value))} />
            </div>
            <div>
              <label className="text-sm font-medium">Bonus Credits</label>
              <Input type="number" min={0} value={creditBonus} onChange={(e) => setCreditBonus(Number(e.target.value))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Trial Days</label>
              <Input type="number" min={0} value={trialDays} onChange={(e) => setTrialDays(Number(e.target.value))} />
            </div>
            <div>
              <label className="text-sm font-medium">Max Uses (empty = unlimited)</label>
              <Input type="number" min={0} value={maxRedemptions} onChange={(e) => setMaxRedemptions(e.target.value ? Number(e.target.value) : "")} />
            </div>
          </div>
          <Button onClick={handleCreate} disabled={saving || !code.trim()} className="w-full">
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Create Promo Code
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
