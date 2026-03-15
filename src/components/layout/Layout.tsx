import { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { MobileNav } from "./MobileNav";
import { useAuth } from "@/hooks/useAuth";

interface LayoutProps {
  children: ReactNode;
  showMobileNav?: boolean;
  /** When true, hide the main site navbar (e.g. for standalone portfolio / talent profile). */
  hideNav?: boolean;
}

export function Layout({ children, showMobileNav = true, hideNav = false }: LayoutProps) {
  const { user } = useAuth();

  return (
    <div className="min-h-screen gradient-page">
      {!hideNav && <Navbar />}
      <main className={`${hideNav ? "" : "pt-16"} ${user && showMobileNav ? "pb-20 md:pb-0" : ""}`}>
        {children}
      </main>
      {showMobileNav && <MobileNav />}
    </div>
  );
}
