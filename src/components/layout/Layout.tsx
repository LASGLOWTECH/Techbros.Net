import { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { MobileNav } from "./MobileNav";
import { useAuth } from "@/hooks/useAuth";

interface LayoutProps {
  children: ReactNode;
  showMobileNav?: boolean;
}

export function Layout({ children, showMobileNav = true }: LayoutProps) {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className={`pt-16 ${user && showMobileNav ? "pb-20 md:pb-0" : ""}`}>
        {children}
      </main>
      {showMobileNav && <MobileNav />}
    </div>
  );
}
