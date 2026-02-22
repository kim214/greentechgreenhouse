import { useNavigate } from "react-router-dom";
import { Leaf, ChevronRight, ArrowRight, Users } from "lucide-react";
import { Button } from "../components/ui/button";
import heroImg from "@/assets/hero-greenhouse.jpg";
import irrigationImg from "@/assets/irrigation-system.jpg";
import ventilationImg from "@/assets/ventilation-system.jpg";
import monitoringImg from "@/assets/monitoring-sensors.jpg";
import overviewImg from "@/assets/greenhouse-overview.jpg";

const team = [
  {
    name: "Dr. Sarah Okonkwo",
    role: "CEO & Agronomist",
    bio: "15 years in precision agriculture. PhD in Plant Sciences from Wageningen University.",
  },
  {
    name: "Marcus Tan",
    role: "CTO & IoT Engineer",
    bio: "Former lead engineer at Bosch IoT. Architect of the GreenTech sensor network.",
  },
  {
    name: "Amara Diallo",
    role: "Head of Operations",
    bio: "Operational excellence specialist with deep expertise in sustainable farming systems.",
  },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      {/* ── NAVBAR ── */}
      <header className="fixed inset-x-0 top-0 z-50">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8 rounded-full border border-border/40 bg-background/60 backdrop-blur-xl px-6 py-2.5 shadow-lg">
            <div className="flex items-center gap-2.5">
              <img src= "/logo.png"  alt="GreenTech Logo" className="h-8 w-8 rounded-lg" />
              <span className="font-display text-sm font-bold tracking-wide text-foreground">
                GreenTech
              </span>
            </div>
            <nav className="hidden items-center gap-5 md:flex">
              {[
                "Smart Irrigation",
                "Ventilation",
                "Monitoring",
                "Sentry Hub",
              ].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item}
                </a>
              ))}
            </nav>
          </div>
          <Button
            onClick={() => navigate("/login")}
            variant="outline"
            className="rounded-full border-border/50 bg-background/60 backdrop-blur-xl text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
          >
            Get Started
          </Button>
        </div>
      </header>

      {/* ── HERO (full-bleed image) ── */}
      <section className="relative h-screen w-full overflow-hidden">
        <img
          src={heroImg}
          alt="Smart greenhouse facility aerial view"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />

        <div className="relative z-10 flex h-full flex-col justify-end px-6 pb-20 md:px-16 lg:px-24">
          <h1 className="max-w-3xl text-left font-display text-4xl font-bold leading-[1.1] tracking-tight text-background md:text-6xl lg:text-7xl">
            Intelligent greenhouse farming for a sustainable future
          </h1>
          <p className="mt-6 max-w-xl text-left text-base text-background leading-relaxed md:text-lg">
            Agriculture loses billions annually to inefficient growing.
            GreenTech gives growers the technological edge needed for precision
            irrigation, climate control, and real-time monitoring.
          </p>
        </div>
      </section>

      {/* ── PRODUCT CARDS ── */}
      {/* Smart Irrigation */}
      <section
        id="smart-irrigation"
        className="border-t border-border/30 pt-20"
      >
        <div className="mx-auto grid max-w-[1400px] lg:grid-cols-2">
          <div className="flex flex-col text-left text-left justify-center px-6 py-16 md:px-16 lg:py-24">
            <p className="mb-2 text-xs uppercase tracking-[0.3em] text-primary font-medium">
              Smart Irrigation
            </p>
            <h3 className="mb-3 font-display text-2xl font-bold text-foreground md:text-4xl">
              Precision water delivery system
            </h3>
            <p className="max-w-md text-muted-foreground leading-relaxed">
              Automated drip and spray irrigation with per-zone control,
              soil-moisture feedback loops, and scheduling intelligence that
              reduces water waste by up to 40%.
            </p>
          </div>
          <div className="relative min-h-[400px] lg:min-h-[500px]">
            <img
              src={irrigationImg}
              alt="Smart irrigation system inside greenhouse"
              className="absolute inset-0 h-full w-full rounded-[30px] object-cover"
            />
          </div>
        </div>
      </section>

      {/* Ventilation */}
      <section id="ventilation" className="border-t border-border/30 pt-20">
        <div className="mx-auto grid max-w-[1400px] lg:grid-cols-2">
          <div className="relative min-h-[400px] lg:min-h-[500px] order-2 lg:order-1">
            <img
              src={ventilationImg}
              alt="Ventilation fans inside greenhouse"
              className="absolute inset-0 h-full w-full rounded-[30px] object-cover"
            />
          </div>
          <div className="flex flex-col text-left justify-center px-6 py-16 md:px-16 lg:py-24 order-1 lg:order-2">
            <p className="mb-2 text-xs uppercase tracking-[0.3em] text-primary font-medium">
              Ventilation Control
            </p>
            <h3 className="mb-3 font-display text-2xl font-bold text-foreground md:text-4xl">
              Automated climate management
            </h3>
            <p className="max-w-md text-muted-foreground leading-relaxed">
              Intelligent fan and vent control maintains ideal airflow, CO₂
              levels, and temperature gradients. Automatic mode responds
              instantly to environmental changes.
            </p>
          </div>
        </div>
      </section>

      {/* Live Monitoring */}
      <section id="monitoring" className="border-t border-border/30 pt-20">
        <div className="mx-auto grid max-w-[1400px] lg:grid-cols-2">
          <div className="flex flex-col text-left justify-center px-6 py-16 md:px-16 lg:py-24">
            <p className="mb-2 text-xs uppercase tracking-[0.3em] text-primary font-medium">
              Live Monitoring
            </p>
            <h3 className="mb-3 font-display text-2xl font-bold text-foreground md:text-4xl">
              Real-time sensor intelligence
            </h3>
            <p className="max-w-md text-muted-foreground leading-relaxed">
              12+ environmental data points tracked in real-time — temperature,
              humidity, CO₂, PAR light, soil moisture, and more — with
              historical trend analytics and instant anomaly alerts.
            </p>
          </div>
          <div className="relative min-h-[400px] lg:min-h-[500px]">
            <img
              src={monitoringImg}
              alt="Real-time sensor monitoring dashboard inside greenhouse"
              className="absolute inset-0 h-full w-full rounded-[30px] object-cover"
            />
          </div>
        </div>
      </section>

      {/* Sentry Hub */}
      <section id="sentry-hub" className="border-t border-border/30 pt-20">
        <div className="mx-auto grid max-w-[1400px] lg:grid-cols-2">
          <div className="relative min-h-[400px] lg:min-h-[500px] order-2 lg:order-1">
            <img
              src={overviewImg}
              alt="Sentry tower overlooking greenhouse complex"
              className="absolute inset-0 h-full w-full rounded-[30px] object-cover"
            />
          </div>
          <div className="flex flex-col text-left justify-center px-6 py-16 md:px-16 lg:py-24 order-1 lg:order-2">
            <p className="mb-2 text-xs uppercase tracking-[0.3em] text-primary font-medium">
              Sentry Hub
            </p>
            <h3 className="mb-3 font-display text-2xl font-bold text-foreground md:text-4xl">
              The future of greenhouse security
            </h3>
            <p className="max-w-md text-muted-foreground leading-relaxed">
              Powered by solar panels, the GreenTech Sentry Hub autonomously
              monitors perimeter security, tracks environmental conditions, and
              provides 24/7 surveillance across your entire greenhouse
              operation.
            </p>
          </div>
        </div>
      </section>

      {/* ── CUSTOMER FEEDBACK ── 
      <section className="border-t border-border/30 py-24 md:py-32 pt-20">
        <div className="mx-auto max-w-[1400px] px-6 md:px-16">
          <p className="mb-4 text-xs uppercase tracking-[0.3em] text-primary font-medium">
            Customer Feedback
          </p>
          <blockquote className="max-w-3xl font-display text-2xl font-bold leading-snug text-foreground md:text-4xl">
            "GreenTech's real-time monitoring and automated irrigation transformed our yield.
            We reduced water usage by 40% while increasing crop output — all from a single dashboard."
          </blockquote>
          <div className="mt-8 flex flex-wrap gap-8">
            {["AgriVerde Farms", "NovaCrop Solutions", "EcoHarvest Global"].map((name) => (
              <span key={name} className="text-sm text-muted-foreground font-medium">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>
    */}

      {/* 
      <section id="team" className="border-t border-border/30 py-24 md:py-32 pt-20">
        <div className="mx-auto max-w-[1400px] px-6 md:px-16">
          <div className="mb-16">
            <p className="mb-2 text-xs uppercase tracking-[0.3em] text-primary font-medium">
              <Users size={11} className="inline mr-1.5" />
              The Team
            </p>
            <h2 className="font-display text-3xl font-bold text-foreground md:text-5xl">
              The people behind GreenTech
            </h2>
            <p className="mt-4 max-w-xl text-muted-foreground">
              A passionate team of agronomists, engineers, and sustainability experts
              dedicated to the future of food production.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {team.map((member) => (
              <div
                key={member.name}
                className="group overflow-hidden rounded-2xl border border-border/40 bg-secondary/20 transition-all duration-300 hover:border-primary/40"
              >
                <div className="relative h-72 w-full bg-secondary/60 flex items-center justify-center overflow-hidden">
                  <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-2 border-primary/40 bg-primary/15 group-hover:border-primary/70 transition-colors">
                    <span className="font-display text-3xl font-bold gradient-text">
                      {member.name
                        .split(" ")
                        .filter((_, i) => i < 2)
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <div className="absolute bottom-3 right-3 rounded-lg border border-border/60 bg-background/70 backdrop-blur px-2 py-1 text-[10px] text-muted-foreground">
                    📷 Add photo
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-display text-lg font-semibold text-foreground">
                    {member.name}
                  </h3>
                  <p className="mb-3 text-xs font-medium text-primary mt-0.5">
                    {member.role}
                  </p>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {member.bio}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      */}

      {/* ── CTA ── */}
      <section className="border-t border-border/30 py-24 md:py-32">
        <div className="mx-auto max-w-[1400px] px-6 md:px-16 text-center">
          <Leaf className="mx-auto mb-6 h-12 w-12 text-primary" />
          <h2 className="mb-4 font-display text-3xl font-bold text-foreground md:text-5xl">
            Ready to grow smarter?
          </h2>
          <p className="mx-auto mb-10 max-w-lg text-muted-foreground">
            Join GreenTech today and take full control of your greenhouse with
            intelligent automation, live monitoring, and powerful analytics.
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/auth")}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full text-base px-10"
          >
            Get Started — It's Free
          </Button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-border/30 py-12">
        <div className="mx-auto max-w-[1400px] px-6 md:px-16 flex flex-col items-center gap-6 md:flex-row md:justify-between">
          <div className="flex items-center gap-2.5">
            <img src= "/logo.png"  alt="GreenTech Logo" className="h-7 w-7 rounded-md" />
            <span className="font-display font-bold text-foreground text-sm">GreenTech</span>
          </div>
          <nav className="flex gap-6 text-sm text-muted-foreground">
            {[
              "Smart Irrigation",
              "Ventilation",
              "Monitoring",
              "Sentry Hub",
            ].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                className="hover:text-foreground transition-colors"
              >
                {item}
              </a>
            ))}
          </nav>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} GreenTech Systems
          </p>
        </div>
      </footer>
    </div>
  );
}
