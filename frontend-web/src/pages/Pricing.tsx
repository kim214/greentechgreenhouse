import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Check, Minus } from "lucide-react";
import { Button } from "../components/ui/button";
import { MarketingFooter, MarketingNav } from "../components/layout/MarketingNav";
import { PlanEnquiryForm, planOptionFor } from "../components/landing/PlanEnquiryForm";
import greenhouseImg from "@/assets/home-planting.jpg";
import smartImg from "@/assets/home-hero.webp";

const kes = (n: number) =>
  new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(n);

const houses = [
  {
    name: "Standard Greenhouse",
    price: 120000,
    cadence: "One-time purchase",
    tag: "No subscription",
    image: greenhouseImg,
    blurb: "A basic, non-automated house for growers who want a reliable structure first.",
    features: ["Manual irrigation", "Basic frame and UV cover", "No sensors or automation", "No monthly fee"],
    cta: "Enquire",
  },
  {
    name: "Smart Greenhouse",
    price: 300000,
    cadence: "One-time hardware",
    tag: "Recommended",
    image: smartImg,
    featured: true,
    blurb: "Fully automated and IoT-enabled. Sensors and actuators ship with the house; intelligence unlocks with a monthly plan.",
    features: [
      "Temperature, humidity, soil moisture, and light sensors",
      "Smart irrigation, ventilation, and lighting",
      "Pest-control hardware ready",
      "AI features unlocked by subscription",
    ],
    cta: "Choose a plan",
  },
];

const plans = [
  {
    name: "Basic",
    price: 1000,
    blurb: "Stay informed from the field.",
    features: ["Remote monitoring", "Basic alerts by SMS and app", "Limited dashboard access"],
  },
  {
    name: "Standard",
    price: 2500,
    popular: true,
    blurb: "Full operations view for most farms.",
    features: [
      "Full dashboard access",
      "Smart alerts",
      "Historical data and reports",
      "Basic automation optimization",
    ],
  },
  {
    name: "Advanced",
    price: 5000,
    blurb: "Let the system recommend the next move.",
    features: [
      "Everything in Standard",
      "AI recommendations for irrigation, planting, and yield",
      "Smart irrigation scheduling",
      "Predictive analytics",
      "Priority support",
    ],
  },
  {
    name: "Premium",
    price: 10000,
    blurb: "Full intelligence and dedicated support.",
    features: [
      "Everything in Advanced",
      "Pest-detection AI",
      "Advanced climate and lighting automation",
      "Dedicated support",
    ],
  },
];

const compare = [
  { label: "Remote monitoring", basic: true, standard: true, advanced: true, premium: true },
  { label: "SMS / app alerts", basic: "Basic", standard: "Smart", advanced: "Smart", premium: "Smart" },
  { label: "Full dashboard", basic: false, standard: true, advanced: true, premium: true },
  { label: "Historical reports", basic: false, standard: true, advanced: true, premium: true },
  { label: "Automation optimization", basic: false, standard: true, advanced: true, premium: true },
  { label: "AI recommendations", basic: false, standard: false, advanced: true, premium: true },
  { label: "Predictive analytics", basic: false, standard: false, advanced: true, premium: true },
  { label: "Priority support", basic: false, standard: false, advanced: true, premium: true },
  { label: "Pest-detection AI", basic: false, standard: false, advanced: false, premium: true },
  { label: "Dedicated support", basic: false, standard: false, advanced: false, premium: true },
];

const faqs = [
  {
    q: "Does the Standard Greenhouse need a subscription?",
    a: "No. It is a one-time purchase. There is no monthly fee because it has no sensors or automation.",
  },
  {
    q: "What do I pay for a Smart Greenhouse?",
    a: "Hardware is a one-time KSh 300,000 purchase, including sensors and automation equipment. Intelligent features are unlocked with a monthly plan starting at KSh 1,000.",
  },
  {
    q: "Can I change my subscription later?",
    a: "Yes. Start on Basic or Standard and move up when you want AI scheduling, pest detection, or dedicated support.",
  },
  {
    q: "What currency are these prices in?",
    a: "All prices are in Kenyan Shillings (KES), as published in the GreenTech project proposal.",
  },
];

function scrollToEnquire() {
  document.getElementById("enquire")?.scrollIntoView({ behavior: "smooth" });
}

export default function Pricing() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedPlan, setSelectedPlan] = useState(
    planOptionFor((searchParams.get("plan") as "Basic" | "Standard" | "Advanced" | "Premium") || "Standard"),
  );

  useEffect(() => {
    const raw = searchParams.get("plan");
    if (raw === "standard-house" || raw === "Basic" || raw === "Standard" || raw === "Advanced" || raw === "Premium") {
      setSelectedPlan(planOptionFor(raw));
    }
    if (searchParams.get("enquire") === "1" || window.location.hash === "#enquire") {
      requestAnimationFrame(scrollToEnquire);
    }
  }, [searchParams]);

  function openEnquire(choice: "standard-house" | "Basic" | "Standard" | "Advanced" | "Premium") {
    setSelectedPlan(planOptionFor(choice));
    setSearchParams({ plan: choice, enquire: "1" }, { replace: true });
    requestAnimationFrame(scrollToEnquire);
  }

  return (
    <div className="min-h-screen w-full bg-background text-foreground antialiased">
      <MarketingNav active="pricing" />

      <section className="border-b border-border/40 bg-gradient-to-b from-muted/40 to-background px-6 pb-16 pt-32 md:px-12">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Pricing</p>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
            Simple plans for Kenyan growers
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            Buy the house once. Unlock monitoring, automation, and AI with a monthly subscription — only on the Smart
            Greenhouse.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 md:px-12">
        <div className="mb-8">
          <h2 className="font-display text-2xl font-bold tracking-tight md:text-3xl">Greenhouse products</h2>
          <p className="mt-2 text-muted-foreground">One-time purchase. The Smart house is ready for a monthly plan.</p>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          {houses.map((house) => (
            <article
              key={house.name}
              className={`overflow-hidden rounded-2xl border bg-card shadow-sm ${
                house.featured ? "border-primary/40 ring-1 ring-primary/20" : "border-border/50"
              }`}
            >
              <div className="relative h-48">
                <img src={house.image} alt={house.name} className="h-full w-full object-cover" />
                <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-foreground">
                  {house.tag}
                </span>
              </div>
              <div className="p-6">
                <h3 className="font-display text-xl font-semibold">{house.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{house.blurb}</p>
                <p className="mt-5 font-display text-3xl font-semibold tabular-nums">{kes(house.price)}</p>
                <p className="text-sm text-muted-foreground">{house.cadence}</p>
                <ul className="mt-5 space-y-2">
                  {house.features.map((item) => (
                    <li key={item} className="flex gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button
                  className="mt-6 w-full rounded-full"
                  variant={house.featured ? "default" : "outline"}
                  onClick={() =>
                    house.featured
                      ? document.getElementById("plans")?.scrollIntoView({ behavior: "smooth" })
                      : openEnquire("standard-house")
                  }
                >
                  {house.cta}
                </Button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="plans" className="border-t border-border/40 bg-muted/20 px-6 py-16 md:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <h2 className="font-display text-2xl font-bold tracking-tight md:text-3xl">Smart Greenhouse subscriptions</h2>
            <p className="mx-auto mt-2 max-w-2xl text-muted-foreground">
              Monthly plans for houses that already include sensors and automation hardware. Billed in KES.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {plans.map((plan) => (
              <article
                key={plan.name}
                className={`relative flex flex-col rounded-2xl border bg-card p-6 shadow-sm ${
                  plan.popular ? "border-primary ring-1 ring-primary/25" : "border-border/50"
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary-foreground">
                    Most farms
                  </span>
                )}
                <h3 className="font-display text-lg font-semibold">{plan.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{plan.blurb}</p>
                <div className="mt-5">
                  <span className="font-display text-3xl font-semibold tabular-nums">{kes(plan.price)}</span>
                  <span className="text-sm text-muted-foreground"> / month</span>
                </div>
                <ul className="mt-6 flex-1 space-y-2.5">
                  {plan.features.map((item) => (
                    <li key={item} className="flex gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button
                  className="mt-8 w-full rounded-full"
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => openEnquire(plan.name as "Basic" | "Standard" | "Advanced" | "Premium")}
                >
                  Get started
                </Button>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="enquire" className="border-t border-border/40 px-6 py-16 md:px-12">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Get started</p>
            <h2 className="mt-3 font-display text-2xl font-bold tracking-tight md:text-3xl">
              Tell us about your farm
            </h2>
            <p className="mt-3 text-muted-foreground">
              The plan you clicked is already selected. Add your details and we will follow up on that package.
            </p>
          </div>
          <PlanEnquiryForm plan={selectedPlan} />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 md:px-12">
        <h2 className="font-display text-2xl font-bold tracking-tight">Compare plans</h2>
        <div className="mt-6 overflow-x-auto rounded-2xl border border-border/50">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-muted/40 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Feature</th>
                {plans.map((p) => (
                  <th key={p.name} className="px-4 py-3 font-medium">
                    {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {compare.map((row) => (
                <tr key={row.label} className="border-t border-border/40">
                  <td className="px-4 py-3 font-medium">{row.label}</td>
                  {(["basic", "standard", "advanced", "premium"] as const).map((key) => (
                    <td key={key} className="px-4 py-3">
                      <Cell value={row[key]} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="border-t border-border/40 bg-muted/20 px-6 py-16 md:px-12">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center font-display text-2xl font-bold tracking-tight">Questions</h2>
          <dl className="mt-8 space-y-4">
            {faqs.map((item) => (
              <div key={item.q} className="rounded-2xl border border-border/50 bg-card px-5 py-4">
                <dt className="font-medium">{item.q}</dt>
                <dd className="mt-2 text-sm text-muted-foreground">{item.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="px-6 py-20 text-center md:px-12">
        <h2 className="font-display text-3xl font-bold tracking-tight">Ready to grow smarter?</h2>
        <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
          Choose a house or a monthly plan, then send us your details so we can follow up.
        </p>
        <Button className="mt-8 rounded-full px-8" size="lg" onClick={() => openEnquire("Standard")}>
          Get started
        </Button>
      </section>

      <MarketingFooter />
    </div>
  );
}

function Cell({ value }: { value: boolean | string }) {
  if (value === true) return <Check className="h-4 w-4 text-primary" />;
  if (value === false) return <Minus className="h-4 w-4 text-muted-foreground/50" />;
  return <span>{value}</span>;
}
