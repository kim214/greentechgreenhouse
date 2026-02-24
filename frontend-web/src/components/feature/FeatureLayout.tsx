import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

interface FeatureLayoutProps {
  children: React.ReactNode;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  icon: React.ElementType;
  featureLabel: string;
}

export function FeatureLayout({
  children,
  heroTitle,
  heroSubtitle,
  heroImage,
  icon: Icon,
  featureLabel,
}: FeatureLayoutProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-background text-foreground antialiased">
      {/* Navbar */}
      <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6 lg:px-8">
        <nav className="mx-auto flex max-w-6xl items-center justify-between rounded-2xl border border-white/20 bg-white/70 px-6 py-3 shadow-lg shadow-black/5 backdrop-blur-xl">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-3"
          >
            <img
              src="/greentech-logo.png"
              alt="GreenTech"
              className="h-9 w-9 rounded-xl object-contain"
            />
            <span className="font-display text-lg font-semibold tracking-tight text-foreground">
              GreenTech
            </span>
          </button>

          <div className="flex items-center gap-2">
            <span className="hidden rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary md:inline-flex">
              {featureLabel}
            </span>
            <Button
              onClick={() => navigate("/login")}
              size="sm"
              className="rounded-full bg-primary px-6 font-medium hover:bg-primary/90"
            >
              Get Started
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative flex min-h-[50vh] w-full items-end overflow-hidden">
        <img
          src={heroImage}
          alt={heroTitle}
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        <div className="relative z-10 w-full max-w-6xl px-6 pb-16 pt-32 md:px-12 lg:px-16">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <h1 className="max-w-3xl font-display text-4xl font-bold leading-[1.08] tracking-tight text-white md:text-5xl lg:text-6xl">
            {heroTitle}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-white/90">{heroSubtitle}</p>
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="mt-6 rounded-full border-white/30 bg-white/10 text-white backdrop-blur hover:bg-white/20 hover:text-white"
          >
            ← Back to features
          </Button>
        </div>
      </section>

      {/* Main content */}
      <main className="relative">{children}</main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 md:flex-row md:px-12">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
          >
            <img
              src="/greentech-logo.png"
              alt="GreenTech"
              className="h-5 w-5 object-contain"
            />
            <span className="font-display font-semibold text-foreground">GreenTech</span>
          </button>
          <nav className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <a
              href="/#smart-irrigation"
              className="transition-colors hover:text-foreground"
            >
              Smart Irrigation
            </a>
            <a
              href="/#ventilation"
              className="transition-colors hover:text-foreground"
            >
              Ventilation
            </a>
            <a
              href="/#monitoring"
              className="transition-colors hover:text-foreground"
            >
              Monitoring
            </a>
            <a
              href="/#sentry-hub"
              className="transition-colors hover:text-foreground"
            >
              Sentry Hub
            </a>
          </nav>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} GreenTech Systems
          </p>
        </div>
      </footer>
    </div>
  );
}
