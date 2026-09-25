import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  Cloud,
  Droplets,
  Gauge,
  Leaf,
  Smartphone,
  Thermometer,
  Users,
  Warehouse,
  Wind,
} from "lucide-react";
import { Button } from "../ui/button";
import { homeImages } from "../../lib/homeImages";
import { ContactForm } from "./ContactForm";

export function HowItWorks() {
  const steps = [
    {
      n: "01",
      title: "Sense",
      text: "Temperature, humidity, soil moisture, light, and CO₂ are read continuously inside the house.",
      icon: Activity,
    },
    {
      n: "02",
      title: "Decide in the cloud",
      text: "The GreenTech engine applies rules and AI recommendations — irrigation, vents, lighting, alerts.",
      icon: Cloud,
    },
    {
      n: "03",
      title: "Act",
      text: "Pumps, valves, and fans run automatically. This is hardware on the farm, not an app by itself.",
      icon: Wind,
    },
    {
      n: "04",
      title: "See it on the phone",
      text: "The farmer watches live conditions, overrides a cycle, and gets SMS or in-app alerts from anywhere.",
      icon: Smartphone,
    },
  ];

  return (
    <section id="how-it-works" className="border-t border-border/40 bg-background">
      <div className="mx-auto max-w-6xl px-6 py-20 md:px-12 lg:py-24">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">How it works</p>
        <h2 className="mt-3 max-w-2xl font-display text-3xl font-bold tracking-tight md:text-4xl">
          Sensors, cloud, and actuators — then the dashboard
        </h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          GreenTech is a house you install, plus software that runs it. Farmers are not buying a login only.
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div key={step.n} className="rounded-2xl border border-border/50 bg-card p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-display text-sm font-semibold text-primary">{step.n}</span>
                <step.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ProofStrip() {
  const stats = [
    {
      value: "Up to 40%",
      label: "Less water",
      detail: "Target for sensor-scheduled drip versus manual watering.",
    },
    {
      value: "Lower labour",
      label: "On daily chores",
      detail: "Irrigation and ventilation run without standing at the valves.",
    },
    {
      value: "Steadier yield",
      label: "Climate control",
      detail: "Tighter temperature and moisture bands reduce unmanaged crop stress.",
    },
  ];

  return (
    <section id="proof" className="border-t border-border/40 bg-muted/20">
      <div className="mx-auto max-w-6xl px-6 py-20 md:px-12 lg:py-24">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">On Kenyan farms</p>
        <h2 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">
          A house you can walk into — not only an app
        </h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Drip, vents, and sensors are installed on site. The dashboard is how the farmer runs that house from
          anywhere.
        </p>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl border border-border/50 bg-card px-5 py-6 shadow-sm">
              <div className="font-display text-3xl font-semibold tracking-tight">{s.value}</div>
              <div className="mt-1 text-sm font-medium">{s.label}</div>
              <p className="mt-2 text-sm text-muted-foreground">{s.detail}</p>
            </div>
          ))}
        </div>
        <figure className="mt-10 overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm lg:grid lg:grid-cols-2">
          <img
            src={homeImages.ventilation}
            alt="Glass greenhouse on a Kenyan farm"
            className="h-64 w-full object-cover lg:h-full"
          />
          <figcaption className="flex flex-col justify-center p-6 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Kenya</p>
            <p className="mt-3 font-display text-xl font-semibold leading-snug">
              Every GreenTech system starts with a real house: frame, cover, drip lines, and climate sensors.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Growers walk the rows as they always have. The difference is that irrigation and ventilation also
              respond to live moisture and temperature — and the same view is on their phone.
            </p>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

export function WhoItsFor() {
  const navigate = useNavigate();
  const audiences = [
    {
      title: "Smallholder",
      offer: "Start with a Standard house, or a Smart house on the Basic plan.",
      href: "/pricing",
      icon: Leaf,
    },
    {
      title: "Co-operative",
      offer: "One Smart house shared across members — Standard subscription for the full dashboard.",
      href: "/pricing#plans",
      icon: Users,
    },
    {
      title: "Commercial estate",
      offer: "Smart hardware plus Advanced or Premium for AI scheduling and dedicated support.",
      href: "/pricing#plans",
      icon: Warehouse,
    },
  ];

  return (
    <section id="who" className="border-t border-border/40 bg-background">
      <div className="mx-auto max-w-6xl px-6 py-20 md:px-12 lg:py-24">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">Who it is for</p>
        <h2 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">See yourself in five seconds</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {audiences.map((a) => (
            <button
              key={a.title}
              type="button"
              onClick={() => navigate(a.href)}
              className="rounded-2xl border border-border/50 bg-card p-6 text-left shadow-sm transition-colors hover:border-primary/40"
            >
              <a.icon className="h-5 w-5 text-primary" />
              <h3 className="mt-4 font-display text-lg font-semibold">{a.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{a.offer}</p>
              <span className="mt-4 inline-block text-sm font-medium text-primary">View matching plans →</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Founders() {
  return (
    <section id="founders" className="border-t border-border/40 bg-muted/20">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 md:px-12 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">The team</p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">Built in Kenya, for Kenya</h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            GreenTech was founded by <span className="font-medium text-foreground">Nathan Kimutai</span> and{" "}
            <span className="font-medium text-foreground">Dylan Kibet</span> to give greenhouse farmers real-time
            control over water, climate, and pests — instead of walking the bay and guessing.
          </p>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            The work lines up with Kenya Vision 2030, food security, and climate-smart agriculture: less wasted
            input, more reliable output, and a digital tool farmers can actually run.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-border/50 bg-card p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Founder</p>
            <p className="mt-2 font-display text-xl font-semibold">Nathan Kimutai</p>
            <p className="mt-1 text-sm text-muted-foreground">Product, systems, and farmer rollout</p>
          </div>
          <div className="rounded-2xl border border-border/50 bg-card p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Co-founder</p>
            <p className="mt-2 font-display text-xl font-semibold">Dylan Kibet</p>
            <p className="mt-1 text-sm text-muted-foreground">Operations and farm partnerships</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ProductGlimpse() {
  const navigate = useNavigate();
  return (
    <section id="product" className="border-t border-border/40 bg-background">
      <div className="mx-auto max-w-6xl px-6 py-20 md:px-12 lg:py-24">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">The product</p>
        <h2 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">From the operations dashboard</h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          This is the same interface farmers use after login — live climate, irrigation state, and alerts — not a
          brochure mock of another company.
        </p>
        <div className="mt-10 overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border/40 px-4 py-3">
            <div>
              <p className="text-sm font-medium">House GH-001 · Automatic</p>
              <p className="text-xs text-muted-foreground">Live climate · last reading just now</p>
            </div>
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase text-primary">
              Irrigation on
            </span>
          </div>
          <div className="grid gap-3 p-4 sm:grid-cols-3">
            <GlimpseStat icon={<Thermometer className="h-4 w-4" />} label="Temperature" value="24.6 °C" tone="ok" />
            <GlimpseStat icon={<Droplets className="h-4 w-4" />} label="Soil moisture" value="58%" tone="ok" />
            <GlimpseStat icon={<Gauge className="h-4 w-4" />} label="Humidity" value="71%" tone="warn" />
          </div>
          <div className="border-t border-border/40 px-4 py-3 text-sm">
            <span className="font-medium text-amber-700 dark:text-amber-400">Alert · </span>
            Humidity above target band — ventilation recommended.
          </div>
        </div>
        <Button className="mt-6 rounded-full" variant="outline" onClick={() => navigate("/login")}>
          Open the live dashboard
        </Button>
      </div>
    </section>
  );
}

function GlimpseStat({
  icon,
  label,
  value,
  tone,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  tone: "ok" | "warn";
}) {
  return (
    <div className="rounded-xl border border-border/50 px-3 py-3">
      <div className={`flex items-center gap-2 text-xs ${tone === "ok" ? "text-primary" : "text-amber-600"}`}>
        {icon}
        {label}
      </div>
      <div className="mt-1 font-display text-xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}

export function TrustAndFaq() {
  const faqs = [
    {
      q: "What does the KSh 300,000 Smart Greenhouse include?",
      a: "One-time hardware: structure, sensors (temperature, humidity, soil moisture, light), smart irrigation, ventilation, lighting, and pest-control hardware. Intelligence (dashboard, AI, pest detection) is unlocked with a monthly plan.",
    },
    {
      q: "Does the Standard house (KSh 120,000) need a subscription?",
      a: "No. It is a basic, non-automated structure with manual irrigation. There is no monthly fee.",
    },
    {
      q: "How long does installation take?",
      a: "A typical single-house pilot install is scoped as a field visit plus assembly — usually days, not months. We confirm the calendar when we see the site.",
    },
    {
      q: "Is there a warranty?",
      a: "Hardware and workmanship cover is agreed on the order. Write to us for the current terms before you pay a deposit.",
    },
  ];

  return (
    <section id="contact" className="border-t border-border/40 bg-muted/20">
      <div className="mx-auto max-w-6xl px-6 py-20 md:px-12 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Next step</p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">Talk to us</h2>
            <p className="mt-3 mb-6 text-muted-foreground">
              Tell us about your farm. We reply from Nathan's inbox.
            </p>
            <ContactForm />
          </div>
          <div id="faq">
            <h3 className="font-display text-lg font-semibold">Questions</h3>
            <dl className="mt-4 space-y-3">
              {faqs.map((item) => (
                <div key={item.q} className="rounded-2xl border border-border/50 bg-card px-4 py-3">
                  <dt className="text-sm font-medium">{item.q}</dt>
                  <dd className="mt-1.5 text-sm text-muted-foreground">{item.a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
