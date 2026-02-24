import { useNavigate } from "react-router-dom";
import { ArrowRight, Droplets, Wind, Activity, Shield } from "lucide-react";
import { Button } from "../components/ui/button";
import heroImg from "@/assets/hero-greenhouse.jpg";
import irrigationImg from "@/assets/irrigation-system.jpg";
import ventilationImg from "@/assets/ventilation-system.jpg";
import monitoringImg from "@/assets/monitoring-sensors.jpg";
import overviewImg from "@/assets/greenhouse-overview.jpg";

const features = [
  {
    id: "smart-irrigation",
    label: "Smart Irrigation",
    title: "Precision water delivery system",
    description:
      "Automated drip and spray irrigation with per-zone control, soil-moisture feedback loops, and scheduling intelligence that reduces water waste by up to 40%.",
    image: irrigationImg,
    icon: Droplets,
    route: "/feature/irrigation",
    align: "left",
  },
  {
    id: "ventilation",
    label: "Ventilation Control",
    title: "Automated climate management",
    description:
      "Intelligent fan and vent control maintains ideal airflow, CO₂ levels, and temperature gradients. Automatic mode responds instantly to environmental changes.",
    image: ventilationImg,
    icon: Wind,
    route: "/feature/ventilation",
    align: "right",
  },
  {
    id: "monitoring",
    label: "Live Monitoring",
    title: "Real-time sensor intelligence",
    description:
      "12+ environmental data points tracked in real-time — temperature, humidity, CO₂, PAR light, soil moisture, and more — with historical trend analytics and instant anomaly alerts.",
    image: monitoringImg,
    icon: Activity,
    route: "/feature/monitoring",
    align: "left",
  },
  {
    id: "sentry-hub",
    label: "Sentry Hub",
    title: "The future of greenhouse security",
    description:
      "Powered by solar panels, the GreenTech Sentry Hub autonomously monitors perimeter security, tracks environmental conditions, and provides 24/7 surveillance across your entire operation.",
    image: overviewImg,
    icon: Shield,
    route: "/feature/sentry",
    align: "right",
  },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-background text-foreground antialiased">
      {/* Navbar */}
      <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6 lg:px-8">
        <nav className="mx-auto flex max-w-6xl items-center justify-between rounded-2xl border border-white/20 bg-white/70 px-6 py-3 shadow-lg shadow-black/5 backdrop-blur-xl">
          <a href="/" className="flex items-center gap-3">
            <img
              src="/greentech-logo.png"
              alt="GreenTech"
              className="h-9 w-9 rounded-xl object-contain"
            />
            <span className="font-display text-lg font-semibold tracking-tight text-foreground">
              GreenTech
            </span>
          </a>

          <div className="hidden items-center gap-1 md:flex">
            {features.map((f) => (
              <a
                key={f.id}
                href={`#${f.id}`}
                className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-primary/5 hover:text-foreground"
              >
                {f.label}
              </a>
            ))}
          </div>

          <Button
            onClick={() => navigate("/login")}
            size="sm"
            className="rounded-full bg-primary px-6 font-medium hover:bg-primary/90"
          >
            Get Started
          </Button>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative flex min-h-screen w-full items-end overflow-hidden">
        <img
          src={heroImg}
          alt="Smart greenhouse facility aerial view"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,hsl(155_30%_12%_/0.3)_100%)]" />

        <div className="relative z-10 w-full max-w-6xl px-6 pb-24 pt-32 md:px-12 lg:px-16">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-white/80">
            Intelligent Greenhouse Systems
          </p>
          <h1 className="max-w-3xl font-display text-4xl font-bold leading-[1.08] tracking-tight text-white md:text-5xl lg:text-6xl xl:text-7xl">
            Grow smarter.
            <br />
            <span className="text-primary/90">Sustainability meets precision.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/90 md:text-xl">
            GreenTech gives growers the technological edge for precision irrigation,
            climate control, and real-time monitoring — reducing waste while
            increasing yield.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Button
              size="lg"
              onClick={() => navigate("/auth")}
              className="gap-2 rounded-full bg-primary px-8 py-6 text-base font-medium hover:bg-primary/90"
            >
              Start Free Trial
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => document.getElementById("smart-irrigation")?.scrollIntoView({ behavior: "smooth" })}
              className="rounded-full border-white/30 bg-white/10 px-8 py-6 text-base font-medium text-white backdrop-blur hover:bg-white/20 hover:text-white"
            >
              Explore Features
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      {features.map((feature) => {
        const Icon = feature.icon;
        const isLeft = feature.align === "left";

        return (
          <section
            key={feature.id}
            id={feature.id}
            className="border-t border-border/40 bg-gradient-to-b from-background to-muted/30"
          >
            <div
              className={`mx-auto grid max-w-6xl gap-12 px-6 py-20 md:px-12 lg:grid-cols-2 lg:gap-16 lg:py-28 ${
                !isLeft ? "lg:grid-flow-dense" : ""
              }`}
            >
              <div
                className={`flex flex-col justify-center ${!isLeft ? "lg:col-start-2" : ""}`}
              >
                <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5">
                  <Icon className="h-4 w-4 text-primary" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                    {feature.label}
                  </span>
                </div>
                <h2 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                  {feature.title}
                </h2>
                <p className="mt-4 max-w-lg text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
                <Button
                  variant="ghost"
                  onClick={() => navigate(feature.route)}
                  className="mt-8 w-fit gap-2 rounded-full pl-0 text-primary hover:bg-primary/10 hover:text-primary"
                >
                  Learn more
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>

              <div
                className={`relative min-h-[320px] overflow-hidden rounded-2xl lg:min-h-[400px] ${
                  !isLeft ? "lg:col-start-1 lg:row-start-1" : ""
                }`}
              >
                <img
                  src={feature.image}
                  alt={feature.title}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                />
                <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-black/5" />
              </div>
            </div>
          </section>
        );
      })}

      {/* Testimonial */}
      <section className="border-t border-border/40 bg-muted/20 py-20 md:py-28">
        <div className="mx-auto max-w-4xl px-6 md:px-12">
          <blockquote className="text-center">
            <p className="font-display text-2xl font-semibold leading-snug text-foreground md:text-3xl lg:text-4xl">
              "GreenTech's real-time monitoring and automated irrigation transformed our
              yield. We reduced water usage by 40% while increasing crop output —
              all from a single dashboard."
            </p>
            <footer className="mt-8">
              <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm font-medium text-muted-foreground">
                <span>AgriVerde Farms</span>
                <span>NovaCrop Solutions</span>
                <span>EcoHarvest Global</span>
              </div>
            </footer>
          </blockquote>
        </div>
      </section>

      {/* CTA */}
      <section id="cta" className="border-t border-border/40 bg-gradient-to-b from-muted/20 to-background py-24 md:py-32">
        <div className="mx-auto max-w-3xl px-6 text-center md:px-12">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl overflow-hidden">
            <img src="/greentech-logo.png" alt="GreenTech" className="h-full w-full object-contain" />
          </div>
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">
            Ready to grow smarter?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            Join GreenTech today and take full control of your greenhouse with
            intelligent automation, live monitoring, and powerful analytics.
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/auth")}
            className="mt-10 gap-2 rounded-full bg-primary px-10 py-6 text-base font-medium hover:bg-primary/90"
          >
            Get Started — It's Free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 md:flex-row md:px-12">
          <a href="/" className="flex items-center gap-2">
            <img
              src="/greentech-logo.png"
              alt="GreenTech"
              className="h-5 w-5 object-contain"
            />
            <span className="font-display font-semibold text-foreground">GreenTech</span>
          </a>
          <nav className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            {features.map((f) => (
              <a
                key={f.id}
                href={`#${f.id}`}
                className="transition-colors hover:text-foreground"
              >
                {f.label}
              </a>
            ))}
          </nav>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} GreenTech Systems
          </p>
        </div>
      </footer>
    </div>
  );
}
