import { useNavigate } from "react-router-dom";
import { ArrowRight, Droplets, Wind, Activity, Shield } from "lucide-react";
import { Button } from "../components/ui/button";
import { MarketingFooter, MarketingNav } from "../components/layout/MarketingNav";
import {
  Founders,
  HowItWorks,
  ProductGlimpse,
  ProofStrip,
  TrustAndFaq,
  WhoItsFor,
} from "../components/landing/LandingSections";
import heroImg from "@/assets/home-hero.webp";
import irrigationImg from "@/assets/home-irrigation.jpg";
import ventilationImg from "@/assets/home-ventilation.jpg";
import monitoringImg from "@/assets/home-monitoring.jpg";
import overviewImg from "@/assets/home-sentry.jpg";
import canopyImg from "@/assets/home-canopy.jpg";
import plantingImg from "@/assets/home-planting.jpg";
import inspectionImg from "@/assets/home-inspection.jpg";
import harvestImg from "@/assets/home-harvest.jpg";
import { kenyaTomatoHouse } from "../lib/homeImages";

const fieldPhotos = [
  { src: canopyImg, alt: "Uniform canopy of flowering crops inside a tunnel house", caption: "Healthy canopy" },
  { src: plantingImg, alt: "Drip lines laid across a newly planted greenhouse bed", caption: "New planting cycle" },
  { src: inspectionImg, alt: "Grower inspecting tomato seedlings in the greenhouse", caption: "Crop inspection" },
  { src: harvestImg, alt: "Harvested tomatoes packed in crates between crop rows", caption: "Harvest ready" },
  { src: kenyaTomatoHouse, alt: "Tomato production house typical of Kenyan smart greenhouse farms", caption: "Production house" },
];

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
      <MarketingNav home />

      {/* Hero */}
      <section className="relative flex min-h-screen w-full items-end overflow-hidden">
        <img
          src={heroImg}
          alt="Tomato rows growing in a production greenhouse"
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
              onClick={() => navigate("/pricing")}
              className="gap-2 rounded-full bg-primary px-8 py-6 text-base font-medium hover:bg-primary/90"
            >
              See plans
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="rounded-full border-white/30 bg-white/10 px-8 py-6 text-base font-medium text-white backdrop-blur hover:bg-white/20 hover:text-white"
            >
              <a href="#contact">Talk to us</a>
            </Button>
          </div>
        </div>
      </section>

      <HowItWorks />
      <WhoItsFor />

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

      <section className="border-t border-border/40 bg-background">
        <div className="mx-auto max-w-6xl px-6 py-20 md:px-12 lg:py-24">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">On the ground</p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Real houses. Real harvests.
          </h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            From first drip line to packed crates — the same GreenTech houses our growers run every day.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {fieldPhotos.map((photo) => (
              <figure key={photo.caption} className="group overflow-hidden rounded-2xl">
                <div className="relative min-h-[220px] overflow-hidden">
                  <img
                    src={photo.src}
                    alt={photo.alt}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <figcaption className="mt-3 text-sm font-medium text-muted-foreground">{photo.caption}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <ProofStrip />
      <ProductGlimpse />
      <Founders />
      <TrustAndFaq />

      <section id="cta" className="border-t border-border/40 bg-gradient-to-b from-muted/20 to-background py-20 md:py-24">
        <div className="mx-auto max-w-3xl px-6 text-center md:px-12">
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Ready to grow smarter?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            See house prices and monthly plans, or write to Nathan and Dylan.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button size="lg" className="rounded-full px-8" onClick={() => navigate("/pricing")}>
              See plans
            </Button>
            <Button size="lg" variant="outline" className="rounded-full px-8" asChild>
              <a href="#contact">Talk to us</a>
            </Button>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
