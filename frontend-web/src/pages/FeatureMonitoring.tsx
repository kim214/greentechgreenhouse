import { useNavigate } from "react-router-dom";
import { Activity, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FeatureLayout } from "@/components/feature/FeatureLayout";
import { MediaSection } from "@/components/feature/MediaSection";
import monitoringImg from "@/assets/monitoring-sensors.jpg";

const benefits = [
  "12+ environmental data points in real-time",
  "Temperature, humidity, CO₂, PAR light, soil moisture",
  "Historical trend analytics",
  "Instant anomaly alerts",
  "Single dashboard for your entire operation",
];

export default function FeatureMonitoring() {
  const navigate = useNavigate();

  return (
    <FeatureLayout
      heroTitle="Live Monitoring"
      heroSubtitle="Real-time sensor intelligence across 12+ environmental data points. Track temperature, humidity, CO₂, light, soil moisture, and more — all from one dashboard."
      heroImage={monitoringImg}
      icon={Activity}
      featureLabel="Monitoring"
    >
      {/* Overview */}
      <section className="border-t border-border/40 py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-6 md:px-12">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                Real-time sensor intelligence
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                Know exactly what's happening in your greenhouse — at every
                moment. Our live monitoring system tracks 12+ environmental
                data points in real-time: temperature, humidity, CO₂, PAR
                light, soil moisture, and more.
              </p>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Historical trend analytics help you spot patterns and optimize
                conditions. When something goes wrong, instant anomaly alerts
                notify you immediately — so you can act before it impacts
                your crop.
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
        description="Our monitoring sensors and dashboard in action."
        variant="images"
      />

      {/* Videos */}
      <MediaSection
        title="Related videos"
        description="Learn how growers use real-time data to boost yields."
        variant="videos"
      />

      {/* CTA */}
      <section className="border-t border-border/40 bg-gradient-to-b from-muted/20 to-background py-24 md:py-32">
        <div className="mx-auto max-w-3xl px-6 text-center md:px-12">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl overflow-hidden">
            <img src="/greentech-logo.png" alt="GreenTech" className="h-full w-full object-contain" />
          </div>
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Ready to see your greenhouse in real-time?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Join GreenTech and get full visibility into your operation.
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
