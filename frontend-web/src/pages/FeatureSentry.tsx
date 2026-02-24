import { useNavigate } from "react-router-dom";
import { Shield, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FeatureLayout } from "@/components/feature/FeatureLayout";
import { MediaSection } from "@/components/feature/MediaSection";
import overviewImg from "@/assets/greenhouse-overview.jpg";

const benefits = [
  "Solar-powered 24/7 operation",
  "Perimeter security monitoring",
  "Environmental condition tracking",
  "Surveillance across your entire operation",
  "Autonomous operation with minimal maintenance",
];

export default function FeatureSentry() {
  const navigate = useNavigate();

  return (
    <FeatureLayout
      heroTitle="Sentry Hub"
      heroSubtitle="The future of greenhouse security. Solar-powered, autonomous monitoring for perimeter security, environmental tracking, and 24/7 surveillance."
      heroImage={overviewImg}
      icon={Shield}
      featureLabel="Sentry Hub"
    >
      {/* Overview */}
      <section className="border-t border-border/40 py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-6 md:px-12">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                The future of greenhouse security
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                The GreenTech Sentry Hub is your eyes and ears across the entire
                facility. Powered by solar panels, it runs autonomously — monitoring
                perimeter security, tracking environmental conditions, and providing
                24/7 surveillance when you can't be there.
              </p>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Whether it's detecting intruders, monitoring equipment, or keeping
                an eye on weather conditions, the Sentry Hub integrates seamlessly
                with your GreenTech dashboard. Stay informed, stay protected.
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
        description="Sentry Hub installations and surveillance solutions."
        variant="images"
      />

      {/* Videos */}
      <MediaSection
        title="Related videos"
        description="See how Sentry Hub keeps greenhouses secure and monitored."
        variant="videos"
      />

      {/* CTA */}
      <section className="border-t border-border/40 bg-gradient-to-b from-muted/20 to-background py-24 md:py-32">
        <div className="mx-auto max-w-3xl px-6 text-center md:px-12">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl overflow-hidden">
            <img src="/greentech-logo.png" alt="GreenTech" className="h-full w-full object-contain" />
          </div>
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Ready for 24/7 peace of mind?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Join GreenTech and protect your greenhouse with Sentry Hub.
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
