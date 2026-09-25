import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";

const featureLinks = [
  { id: "smart-irrigation", label: "Smart Irrigation" },
  { id: "ventilation", label: "Ventilation" },
  { id: "monitoring", label: "Live Monitoring" },
  { id: "sentry-hub", label: "Sentry Hub" },
];

export function MarketingNav({
  home = false,
  active,
}: {
  home?: boolean;
  active?: string;
}) {
  const navigate = useNavigate();

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6 lg:px-8">
      <nav className="mx-auto flex max-w-6xl items-center justify-between rounded-2xl border border-white/20 bg-white/70 px-6 py-3 shadow-lg shadow-black/5 backdrop-blur-xl">
        <a href="/" className="flex items-center gap-3">
          <img src="/greentech-logo.png" alt="GreenTech" className="h-9 w-9 rounded-xl object-contain" />
          <span className="font-display text-lg font-semibold tracking-tight text-foreground">GreenTech</span>
        </a>

        <div className="hidden items-center gap-1 lg:flex">
          {featureLinks.map((f) => (
            <a
              key={f.id}
              href={home ? `#${f.id}` : `/#${f.id}`}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-primary/5 hover:text-foreground"
            >
              {f.label}
            </a>
          ))}
          <a
            href={home ? "#how-it-works" : "/#how-it-works"}
            className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-primary/5 hover:text-foreground"
          >
            How it works
          </a>
          <a
            href="/pricing"
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active === "pricing"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-primary/5 hover:text-foreground"
            )}
          >
            Pricing
          </a>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full lg:hidden"
            onClick={() => navigate("/pricing")}
          >
            Pricing
          </Button>
          <Button
            onClick={() => navigate("/pricing")}
            size="sm"
            className="rounded-full bg-primary px-6 font-medium hover:bg-primary/90"
          >
            See plans
          </Button>
        </div>
      </nav>
    </header>
  );
}

export function MarketingFooter() {
  return (
    <footer className="border-t border-border/40 py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 md:flex-row md:px-12">
        <a href="/" className="flex items-center gap-2">
          <img src="/greentech-logo.png" alt="GreenTech" className="h-5 w-5 object-contain" />
          <span className="font-display font-semibold text-foreground">GreenTech</span>
        </a>
        <nav className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
          {featureLinks.map((f) => (
            <a key={f.id} href={`/#${f.id}`} className="transition-colors hover:text-foreground">
              {f.label}
            </a>
          ))}
          <a href="/pricing" className="transition-colors hover:text-foreground">
            Pricing
          </a>
          <a href="/#faq" className="transition-colors hover:text-foreground">
            FAQ
          </a>
          <a href="/#contact" className="transition-colors hover:text-foreground">
            Talk to us
          </a>
        </nav>
        <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} GreenTech Systems</p>
      </div>
    </footer>
  );
}
