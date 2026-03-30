import { Link, useLocation } from "wouter";
import { Activity, TrendingDown, Clock, BarChart2 } from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-card/80 backdrop-blur-md">
        <div className="container flex h-14 max-w-screen-2xl items-center px-4">
          <div className="mr-8 flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <span className="font-bold tracking-tight text-lg">Pinnacle<span className="text-primary">Tracker</span></span>
          </div>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link href="/" className={`transition-colors hover:text-foreground/80 ${location === "/" ? "text-foreground font-semibold" : "text-foreground/60"}`}>
              Live Feed
            </Link>
            <Link href="/top-movers" className={`transition-colors hover:text-foreground/80 ${location === "/top-movers" ? "text-foreground font-semibold" : "text-foreground/60"}`}>
              Top Movers
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 w-full max-w-screen-2xl mx-auto p-4 md:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
