import { useNavigate } from "react-router-dom";
import { Wind, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FeatureLayout } from "@/components/feature/FeatureLayout";
import { MediaSection } from "@/components/feature/MediaSection";
import ventilationImg from "@/assets/ventilation-system.jpg";

const benefits = [
  "Intelligent fan and vent control",
  "Ideal airflow and CO₂ level maintenance",
  "Temperature gradient management",
  "Automatic mode responds to environmental changes",
  "24/7 climate optimization",
];

export default function FeatureVentilation() {
  const navigate = useNavigate();

  return (
    <FeatureLayout
      heroTitle="Ventilation Control"
      heroSubtitle="Automated climate management with intelligent fan and vent control. Maintain ideal airflow, CO₂ levels, and temperature gradients across your greenhouse."
      heroImage={ventilationImg}
      icon={Wind}
      featureLabel="Ventilation"
    >
      {/* Overview */}
      <section className="border-t border-border/40 py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-6 md:px-12">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                Automated climate management
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                GreenTech ventilation systems keep your greenhouse environment
                perfect. Intelligent fan and vent control maintains ideal
                airflow, CO₂ levels, and temperature gradients — so your crops
                thrive in every season.
              </p>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Automatic mode responds instantly to environmental changes,
                opening vents, adjusting fans, and managing humidity without
                manual intervention. Your greenhouse stays optimized around
                the clock.
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
        description="Explore our ventilation systems and climate control solutions."
        variant="images"
      />

      {/* Videos */}
      <MediaSection
        title="Related videos"
        description="See how growers are achieving perfect climate control with GreenTech."
        variant="videos"
      />

      {/* CTA */}
      <section className="border-t border-border/40 bg-gradient-to-b from-muted/20 to-background py-24 md:py-32">
        <div className="mx-auto max-w-3xl px-6 text-center md:px-12">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl overflow-hidden">
            <img src="/greentech-logo.png" alt="GreenTech" className="h-full w-full object-contain" />
          </div>
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Ready for perfect climate control?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Join GreenTech and automate your greenhouse ventilation.
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
