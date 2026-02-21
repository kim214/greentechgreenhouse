import { useNavigate } from "react-router-dom";
import {
  Leaf,
  Droplets,
  Wind,
  Activity,
  Thermometer,
  Shield,
  Zap,
  BarChart3,
  ChevronRight,
  Wifi,
  Sun,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Droplets,
    title: "Smart Irrigation",
    description:
      "Precision water delivery per zone. Automated schedules with soil-moisture feedback loops keep your crops perfectly hydrated.",
  },
  {
    icon: Wind,
    title: "Ventilation Control",
    description:
      "Automated fan and vent management maintain ideal airflow, CO₂ levels, and temperature gradients across all zones.",
  },
  {
    icon: Activity,
    title: "Live Monitoring",
    description:
      "Real-time sensor dashboards for temperature, humidity, PAR light, and CO₂ — with historical trend charts.",
  },
  {
    icon: Thermometer,
    title: "Climate Automation",
    description:
      "Rule-based automation triggers respond instantly to environmental changes, reducing manual intervention.",
  },
  {
    icon: Shield,
    title: "Smart Alerts",
    description:
      "Receive instant notifications when sensors breach thresholds so you can act before crops are affected.",
  },
  {
    icon: BarChart3,
    title: "Analytics & Reports",
    description:
      "Visualise yield data, resource consumption, and system health over time with detailed reporting tools.",
  },
];

const stats = [
  { value: "4 Zones", label: "Independent crop zones" },
  { value: "12+", label: "Sensor data points" },
  { value: "99.9%", label: "System uptime" },
  { value: "40%", label: "Water saved vs manual" },
];

const team = [
  {
    name: "Nathan Kimutai",
    role: "CEO, SOftware Engineer",
    bio: "15 years in precision agriculture. PhD in Plant Sciences from Wageningen University.",
  },
  {
    name: "Dylan Kibet",
    role: "CTO & IoT Engineer",
    bio: "Former lead engineer at Bosch IoT. Architect of the GreenTech sensor network.",
  },
  {
    name: "Boaz Omato",
    role: "COO, Head of Operations",
    bio: "Operational excellence specialist with deep expertise in sustainable farming systems.",
  },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* ──────────────── NAVBAR ──────────────── */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-border/50 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          {/* Logo */}
           {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-card border border-border flex items-center justify-center shadow-primary">
              <img 
                src="/logo.png" 
                alt="Logo" 
                className="w-full h-full object-cover"
              
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">GreenTech</h1>
              <p className="text-sm text-muted-foreground">Smart Greenhouse Control</p>
            </div>
          </div>

          {/* Nav links */}
          <nav className="hidden items-center gap-6 md:flex">
            {["Features", "About", "Team"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                {item}
              </a>
            ))}
          </nav>

          {/* Get Started */}
          <Button
            onClick={() => navigate("/auth")}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_hsl(152_72%_40%/0.3)]"
          >
            Get Started
            <ChevronRight size={15} />
          </Button>
        </div>
      </header>

      {/* ──────────────── HERO ──────────────── */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-6 pt-20 text-center">
        {/* background glow blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
          <div className="absolute bottom-0 left-10 h-80 w-80 rounded-full bg-accent/5 blur-[100px]" />
          <div className="absolute bottom-20 right-10 h-72 w-72 rounded-full bg-primary/8 blur-[90px]" />
        </div>



        <h1 className="max-w-4xl font-display text-5xl font-bold leading-tight tracking-tight md:text-7xl">
          The Future of{" "}
          <span className="gradient-text">Smart Greenhouse</span>{" "}
          Farming
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          GreenTech unifies irrigation, ventilation, and live environmental
          monitoring into one intelligent platform — giving growers complete
          control and confidence over every crop, every zone, every day.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Button
            size="lg"
            onClick={() => navigate("/auth")}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 glow-primary text-base px-8"
          >
            <Leaf size={18} />
            Get Started Free
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="gap-2 border-border text-foreground hover:border-primary/50 hover:text-primary text-base px-8"
            onClick={() =>
              document
                .getElementById("features")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Explore Features
          </Button>
        </div>

        {/* hero mockup card */}
        <div className="relative mt-20 w-full max-w-5xl animate-float">
          <div className="card-elevated rounded-2xl p-6 md:p-8">
            {/* top bar */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-destructive/80" />
                <div className="h-3 w-3 rounded-full bg-warning/80" />
                <div className="h-3 w-3 rounded-full bg-primary/80" />
              </div>
              <span className="text-xs text-muted-foreground mono">
                greentech-dashboard · live
              </span>
            </div>
            {/* fake sensor grid */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { label: "Temperature", val: "24.6°C", icon: Thermometer, color: "text-primary" },
                { label: "Humidity", val: "72%", icon: Droplets, color: "text-info" },
                { label: "CO₂ Level", val: "842 ppm", icon: Wind, color: "text-warning" },
                { label: "PAR Light", val: "680 μmol", icon: Sun, color: "text-accent" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl bg-secondary/40 border border-border p-4 text-left"
                >
                  <s.icon size={16} className={`mb-2 ${s.color}`} />
                  <p className="sensor-value text-xl font-bold text-foreground">
                    {s.val}
                  </p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
            {/* fake progress bars */}
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                { zone: "Zone A — Tomatoes", pct: 85 },
                { zone: "Zone B — Lettuce", pct: 62 },
                { zone: "Zone C — Herbs", pct: 91 },
              ].map((z) => (
                <div key={z.zone}>
                  <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                    <span>{z.zone}</span>
                    <span className="text-primary font-medium">{z.pct}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${z.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="pointer-events-none absolute inset-0 rounded-2xl shadow-[0_0_80px_hsl(152_72%_40%/0.15)]" />
        </div>
      </section>

      {/* ──────────────── STATS ──────────────── */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="card-elevated rounded-2xl p-6 text-center"
            >
              <p className="gradient-text font-display text-3xl font-bold md:text-4xl">
                {s.value}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ──────────────── FEATURES ──────────────── */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-14 text-center">
          <span className="mb-3 inline-block rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs text-primary">
            Everything You Need
          </span>
          <h2 className="font-display text-3xl font-bold md:text-5xl">
            Built for modern growers
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Every GreenTech feature is engineered to reduce labour, conserve
            resources, and maximise yield.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="group card-elevated rounded-2xl p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-[0_0_30px_hsl(152_72%_40%/0.12)] cursor-default"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 border border-primary/20 group-hover:bg-primary/25 transition-colors">
                <f.icon size={20} className="text-primary" />
              </div>
              <h3 className="mb-2 font-display text-lg font-semibold">
                {f.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ──────────────── ABOUT ──────────────── */}
      <section id="about" className="relative overflow-hidden py-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[100px]" />
        </div>
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="flex flex-col gap-12 lg:flex-row lg:items-center">
            {/* text side */}
            <div className="flex-1">
              <span className="mb-3 inline-block rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs text-primary">
                About GreenTech
              </span>
              <h2 className="mb-6 font-display text-3xl font-bold md:text-5xl leading-tight">
                Growing smarter,<br />
                not harder.
              </h2>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                Founded in 2021, GreenTech was born from a simple frustration:
                greenhouses were still being managed the same way they were 30
                years ago — by hand, by intuition, by guesswork.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                We built a platform that brings real-time sensor intelligence,
                automated control loops, and actionable analytics into one
                seamless system — so growers can focus on what matters most:
                their crops.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                {[
                  { icon: Zap, text: "Instant automation" },
                  { icon: Shield, text: "Reliable alerts" },
                  { icon: Activity, text: "24/7 monitoring" },
                ].map((item) => (
                  <div
                    key={item.text}
                    className="flex items-center gap-2 rounded-full border border-border bg-secondary/40 px-4 py-2 text-sm text-foreground"
                  >
                    <item.icon size={14} className="text-primary" />
                    {item.text}
                  </div>
                ))}
              </div>
            </div>

            {/* visual side */}
            <div className="flex-1 grid grid-cols-2 gap-4">
              {[
                { label: "Water Efficiency", pct: 94, icon: Droplets },
                { label: "Uptime", pct: 99.9, icon: Wifi },
                { label: "Yield Improvement", pct: 78, icon: Leaf },
                { label: "Energy Savings", pct: 61, icon: Zap },
              ].map((item) => (
                <div
                  key={item.label}
                  className="card-elevated rounded-2xl p-5 flex flex-col items-center gap-3"
                >
                  <item.icon size={22} className="text-primary" />
                  <div className="text-center">
                    <p className="gradient-text font-display text-2xl font-bold">
                      {item.pct}%
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {item.label}
                    </p>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────── TEAM ──────────────── */}
      <section id="team" className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-14 text-center">
          <span className="mb-3 inline-block rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs text-primary">
            <Users size={11} className="inline mr-1" />
            Meet the Team
          </span>
          <h2 className="font-display text-3xl font-bold md:text-5xl">
            The people behind GreenTech
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            A passionate team of agronomists, engineers, and sustainability
            experts dedicated to the future of food production.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          {team.map((member) => (
            <div
              key={member.name}
              className="group card-elevated rounded-2xl overflow-hidden transition-all duration-300 hover:border-primary/30 hover:shadow-[0_0_40px_hsl(152_72%_40%/0.15)]"
            >
              {/* Photo placeholder */}
              <div className="relative h-64 w-full bg-secondary/60 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 shimmer opacity-40" />
                {/* Avatar initial ring */}
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-2 border-primary/40 bg-primary/15 group-hover:border-primary/70 transition-colors">
                  <span className="font-display text-3xl font-bold gradient-text">
                    {member.name
                      .split(" ")
                      .filter((_, i) => i < 2)
                      .map((n) => n[0])
                      .join("")}
                  </span>
                </div>
                {/* Photo upload hint */}
                <div className="absolute bottom-3 right-3 rounded-lg border border-border/60 bg-background/70 backdrop-blur px-2 py-1 text-[10px] text-muted-foreground">
                  📷 Add photo
                </div>
              </div>

              {/* Info */}
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
      </section>

      {/* ──────────────── CTA ──────────────── */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="relative overflow-hidden rounded-3xl border border-primary/25 bg-gradient-to-br from-primary/10 via-background to-background p-12 text-center">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/8 blur-[80px]" />
          </div>
          <Leaf className="mx-auto mb-4 h-12 w-12 text-primary" />
          <h2 className="mb-4 font-display text-3xl font-bold md:text-5xl">
            Ready to grow smarter?
          </h2>
          <p className="mx-auto mb-8 max-w-lg text-muted-foreground">
            Join GreenTech today and take full control of your greenhouse with
            intelligent automation, live monitoring, and powerful analytics.
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/auth")}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 glow-primary text-base px-10"
          > 
            <Leaf size={18} />
            Get Started — It's Free
            <ChevronRight size={15} />
          </Button>
        </div>
      </section>

      {/* ──────────────── FOOTER ──────────────── */}
      <footer className="border-t border-border px-6 py-8 text-center text-xs text-muted-foreground">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Leaf size={13} className="text-primary" />
          <span className="font-display font-semibold text-foreground text-sm">
            GreenTech
          </span>
        </div>
        <p>© {new Date().getFullYear()} GreenTech Systems. All rights reserved.</p>
      </footer>
    </div>
  );
}
