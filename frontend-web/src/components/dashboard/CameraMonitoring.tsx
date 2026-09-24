import { useEffect, useMemo, useRef, useState } from "react";
import { Camera, Pause, Play, RotateCcw, ZoomIn, Droplets, Wind } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { cn } from "../../lib/utils";
import { feedsForHouse } from "../../lib/sentryFeeds";
import type { GreenhouseRow } from "../../lib/farmApi";
import overviewImg from "@/assets/greenhouse-overview.jpg";
import irrigationImg from "@/assets/irrigation-system.jpg";
import ventilationImg from "@/assets/ventilation-system.jpg";
import canopyImg from "@/assets/monitoring-sensors.jpg";

type CameraDef = {
  id: string;
  name: string;
  zone: string;
  video: string;
  poster: string;
  online: boolean;
  tag?: "irrigation" | "ventilation" | null;
};

function formatClock(d: Date) {
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
}

function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function CameraFeed({
  camera,
  houseCode,
  irrigating,
  ventilating,
}: {
  camera: CameraDef;
  houseCode: string;
  irrigating: boolean;
  ventilating: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(camera.online);
  const [failed, setFailed] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const [elapsed, setElapsed] = useState(() => 1800 + Math.floor(Math.random() * 900));

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !camera.online) return;
    if (playing) {
      void el.play().catch(() => setPlaying(false));
    } else {
      el.pause();
    }
  }, [playing, camera.online]);

  useEffect(() => {
    if (!camera.online || !playing) return;
    const timer = setInterval(() => {
      setNow(new Date());
      setElapsed((n) => n + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [camera.online, playing]);

  const showIrrigation = camera.tag === "irrigation" && irrigating;
  const showVentilation = camera.tag === "ventilation" && ventilating;

  return (
    <Card className="overflow-hidden border-border/50 bg-card shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Camera className={cn("h-5 w-5", camera.online ? "text-primary" : "text-muted-foreground")} />
            <div>
              <CardTitle className="text-lg">{camera.name}</CardTitle>
              <CardDescription>
                {houseCode} · {camera.zone}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                camera.online ? "bg-primary pulse-gentle" : "bg-destructive"
              )}
            />
            <span className="text-xs text-muted-foreground">{camera.online ? "Live" : "Offline"}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="relative aspect-video overflow-hidden rounded-lg bg-black">
          {camera.online ? (
            <>
              {!failed ? (
                <video
                  ref={videoRef}
                  className="absolute inset-0 h-full w-full object-cover"
                  src={camera.video}
                  poster={camera.poster}
                  muted
                  loop
                  playsInline
                  autoPlay
                  preload="metadata"
                  onError={() => setFailed(true)}
                />
              ) : (
                <img src={camera.poster} alt="" className="sentry-live absolute inset-0 h-full w-full object-cover" />
              )}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
              <div className="pointer-events-none absolute inset-0 opacity-15 mix-blend-overlay [background-image:repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,255,255,0.08)_3px)]" />

              <div className="absolute left-2 top-2 flex items-center gap-2">
                <Badge className="bg-destructive text-[10px] font-bold tracking-wider text-destructive-foreground">
                  REC
                </Badge>
                <span className="rounded bg-black/55 px-1.5 py-0.5 font-mono text-[10px] text-white">
                  {playing ? formatDuration(elapsed) : "PAUSED"}
                </span>
              </div>
              <div className="absolute right-2 top-2 font-mono text-[10px] text-white/90">
                {houseCode}-{camera.id.toUpperCase()}
              </div>

              {(showIrrigation || showVentilation) && (
                <div className="absolute left-2 top-10">
                  <Badge className="bg-primary/90 text-primary-foreground">
                    {showIrrigation ? (
                      <Droplets className="mr-1 h-3 w-3" />
                    ) : (
                      <Wind className="mr-1 h-3 w-3" />
                    )}
                    {showIrrigation ? "Irrigation running" : "Ventilation open"}
                  </Badge>
                </div>
              )}

              <div className="absolute bottom-2 left-2 flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 px-2 text-xs"
                  onClick={() => setPlaying((p) => !p)}
                >
                  {playing ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                </Button>
                <Button size="sm" variant="secondary" className="h-8 px-2 text-xs" type="button">
                  <ZoomIn className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="secondary" className="h-8 px-2 text-xs" type="button">
                  <RotateCcw className="h-3 w-3" />
                </Button>
              </div>
              <div className="absolute bottom-2 right-2 font-mono text-[10px] text-white/90">
                {formatClock(now)}
              </div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center bg-muted">
              <div className="text-center text-muted-foreground">
                <Camera className="mx-auto mb-2 h-12 w-12 opacity-40" />
                <p className="text-sm">Camera offline</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function CameraMonitoring({
  greenhouse,
  cropName,
  irrigating = false,
  ventilating = false,
}: {
  greenhouse?: GreenhouseRow | null;
  cropName?: string | null;
  irrigating?: boolean;
  ventilating?: boolean;
}) {
  const houseOnline = greenhouse?.status !== "offline";
  const crop = cropName ?? "Crop bay";
  const houseCode = greenhouse?.code ?? "CAM";

  const feeds = feedsForHouse(greenhouse?.code);

  const cameras = useMemo<CameraDef[]>(
    () => [
      {
        id: "cam-01",
        name: "North bay",
        zone: `${crop} · overview`,
        video: feeds.overview,
        poster: overviewImg,
        online: houseOnline,
        tag: null,
      },
      {
        id: "cam-02",
        name: "Irrigation line",
        zone: "Drip manifold",
        video: feeds.irrigation,
        poster: irrigationImg,
        online: houseOnline,
        tag: "irrigation",
      },
      {
        id: "cam-03",
        name: "Ridge vents",
        zone: "Ventilation deck",
        video: feeds.ventilation,
        poster: ventilationImg,
        online: houseOnline,
        tag: "ventilation",
      },
      {
        id: "cam-04",
        name: "Canopy walk",
        zone: greenhouse?.location ?? "Center aisle",
        video: feeds.canopy,
        poster: canopyImg,
        online: greenhouse?.status === "maintenance" ? false : houseOnline,
        tag: null,
      },
    ],
    [crop, feeds, greenhouse?.location, greenhouse?.status, houseOnline]
  );

  const onlineCount = cameras.filter((c) => c.online).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">Live Sentry</h2>
          <p className="text-muted-foreground">
            {greenhouse
              ? `${greenhouse.name} camera array · ${onlineCount} of ${cameras.length} recording`
              : "House camera array"}
          </p>
        </div>
        <div className="flex gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{onlineCount}</div>
            <div className="text-xs text-muted-foreground">Recording</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">
              {(irrigating ? 1 : 0) + (ventilating ? 1 : 0)}
            </div>
            <div className="text-xs text-muted-foreground">Actuators in view</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {cameras.map((camera) => (
          <CameraFeed
            key={camera.id}
            camera={camera}
            houseCode={houseCode}
            irrigating={irrigating}
            ventilating={ventilating}
          />
        ))}
      </div>
    </div>
  );
}
