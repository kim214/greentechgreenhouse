import { useNavigate } from "react-router-dom";
import { Droplets, CheckCircle2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { FeatureLayout } from "../components/feature/FeatureLayout";
import {MediaSection} from "../components/feature/MediaSection";
import irrigationImg from "@/assets/irrigation-system.jpg";

const benefits = [
  "Per-zone control for targeted water delivery",
  "Soil-moisture feedback loops for precision",
  "Scheduling intelligence reduces waste by up to 40%",
  "Automated drip and spray irrigation modes",
  "Real-time monitoring and alerts",
];

export default function FeatureIrrigation() {
  const navigate = useNavigate();

  return (
    <FeatureLayout
      heroTitle="Smart Irrigation"
      heroSubtitle="Precision water delivery with automated drip and spray irrigation. Reduce waste by up to 40% with soil-moisture feedback and intelligent scheduling."
      heroImage={irrigationImg}
      icon={Droplets}
      featureLabel="Smart Irrigation"
    >
      {/* Overview */}
      <section className="border-t border-border/40 py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-6 md:px-12">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                Precision water delivery system
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                Our smart irrigation system delivers water exactly when and where
                your crops need it. Automated drip and spray irrigation with
                per-zone control ensures optimal moisture levels across your
                entire greenhouse — without waste.
              </p>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Soil-moisture sensors feed real-time data into our scheduling
                engine, which adapts to environmental conditions. The result?
                Up to 40% reduction in water usage while improving crop health
                and yield.
              </p>
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-foreground">
                Key benefits
              </h3>
              <ul className="mt-6 space-y-4">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <span className="text-muted-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Images */}
      <MediaSection
        title="Gallery"
        description="See our smart irrigation systems in action."
        variant="images"
      >
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="overflow-hidden rounded-2xl border bg-muted/30">
            <img
              src="https://images.pexels.com/photos/167521/pexels-photo-167521.jpeg"
              alt="Drip irrigation lines delivering precise water to plants"
              className="h-48 w-full object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>
          <div className="overflow-hidden rounded-2xl border bg-muted/30">
            <img
              src="https://images.pexels.com/photos/803897/pexels-photo-803897.jpeg"
              alt="Overhead spray irrigation inside a greenhouse"
              className="h-48 w-full object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>
          <div className="overflow-hidden rounded-2xl border bg-muted/30">
            <img
              src="https://images.pexels.com/photos/1301856/pexels-photo-1301856.jpeg"
              alt="Soil moisture sensors monitoring irrigation performance"
              className="h-48 w-full object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>
        </div>
      </MediaSection>

      {/* CTA */}
      <section className="border-t border-border/40 bg-gradient-to-b from-muted/20 to-background py-24 md:py-32">
        <div className="mx-auto max-w-3xl px-6 text-center md:px-12">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl overflow-hidden">
            <img src="/greentech-logo.png" alt="GreenTech" className="h-full w-full object-contain" />
          </div>
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Ready to optimize your irrigation?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Join GreenTech and start saving water while improving yields.
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
    </FeatureLayout>
  );
}
