import { useMemo, useEffect, useState, useRef } from "react";
import { useMqtt } from "../../hooks/useMqtt";
import { useAnalyticsHistory } from "../../hooks/useAnalyticsHistory";
import { computeAnalytics } from "../../lib/analyticsEngine";
import { fetchAIInsights, isAIConfigured, type AIInsight } from "../../lib/aiInsights";
import { getUserId, saveAnalytics } from "../../lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  Leaf,
  Droplets,
  Thermometer,
  TrendingUp,
  TrendingDown,
  Minus,
  Lightbulb,
  Wifi,
  WifiOff,
  Brain,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
} from "recharts";
import { format, parseISO } from "date-fns";

const ScoreGauge = ({
  value,
  label,
  icon,
  colorClass,
  subtitle,
}: {
  value: number;
  label: string;
  icon: React.ReactNode;
  colorClass: string;
  subtitle?: string;
}) => (
  <Card className="shadow-elegant border-0 overflow-hidden">
    <CardHeader className="pb-2">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <CardTitle className="text-base">{label}</CardTitle>
      </div>
    </CardHeader>
    <CardContent>
      <div className="flex items-end gap-2">
        <div className={`text-3xl font-bold tabular-nums ${colorClass}`}>{value}</div>
        {subtitle ? (
          <span className="text-muted-foreground text-sm mb-1">{subtitle}</span>
        ) : (
          <span className="text-muted-foreground text-sm mb-1">/ 100</span>
        )}
      </div>
      <div className="mt-2 h-2 w-full rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 bg-primary/80"
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </div>
    </CardContent>
  </Card>
);

function formatChartTime(iso: string): string {
  try {
    return format(parseISO(iso), "HH:mm");
  } catch {
    return iso.slice(11, 16);
  }
}

export const Analytics = () => {
  const { data, isConnected } = useMqtt();
  const { allPoints, rawSnapshots, loading } = useAnalyticsHistory(
    { temp: data.temp, humidity: data.humidity, soilMoisture: data.soilMoisture },
    isConnected
  );
  const [aiInsight, setAiInsight] = useState<AIInsight | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const lastSaveRef = useRef<number>(0);
  const lastAiRef = useRef<number>(0);
  const SAVE_INTERVAL_MS = 60_000;
  const AI_INTERVAL_MS = 120_000;

  const fetchAI = () => {
    if (!isAIConfigured() || !isConnected) return;
    lastAiRef.current = 0;
    setAiLoading(true);
    fetchAIInsights(result, {
      temp: data.temp,
      humidity: data.humidity,
      soilMoisture: data.soilMoisture,
    })
      .then((insight) => setAiInsight(insight ?? null))
      .catch(() => setAiInsight(null))
      .finally(() => setAiLoading(false));
  };

  const result = useMemo(
    () =>
      computeAnalytics(
        {
          temp: data.temp,
          humidity: data.humidity,
          soilMoisture: data.soilMoisture,
        },
        rawSnapshots
      ),
    [data.temp, data.humidity, data.soilMoisture, rawSnapshots]
  );

  const chartData = useMemo(() => {
    return allPoints.map((p) => ({
      time: formatChartTime(p.time),
      fullTime: p.time,
      temp: p.temp,
      humidity: p.humidity,
      soil: p.soilMoisture,
    }));
  }, [allPoints]);

  // Save snapshot to Supabase
  useEffect(() => {
    const userId = getUserId();
    if (!userId || !isConnected) return;
    const now = Date.now();
    if (now - lastSaveRef.current < SAVE_INTERVAL_MS) return;
    lastSaveRef.current = now;
    saveAnalytics({
      user_id: userId,
      plant_health_score: result.plantHealthScore,
      irrigation_need_score: result.irrigationNeedScore,
      climate_risk_score: result.climateRiskScore,
      recommendations: result.recommendations,
      snapshot: {
        temp: data.temp,
        humidity: data.humidity,
        soil_moisture: data.soilMoisture,
      },
    }).catch(() => {});
  }, [isConnected, result, data.temp, data.humidity, data.soilMoisture]);

  // Fetch AI insights (optional)
  useEffect(() => {
    if (!isAIConfigured() || !isConnected) return;
    const now = Date.now();
    if (now - lastAiRef.current < AI_INTERVAL_MS) return;
    lastAiRef.current = now;
    setAiLoading(true);
    fetchAIInsights(result, {
      temp: data.temp,
      humidity: data.humidity,
      soilMoisture: data.soilMoisture,
    })
      .then((insight) => setAiInsight(insight ?? null))
      .catch(() => setAiInsight(null))
      .finally(() => setAiLoading(false));
  }, [isConnected, result, data.temp, data.humidity, data.soilMoisture]);

  const healthColor =
    result.plantHealthScore >= 70
      ? "text-green-600 dark:text-green-400"
      : result.plantHealthScore >= 40
        ? "text-amber-600 dark:text-amber-400"
        : "text-red-600 dark:text-red-400";
  const irrigationColor =
    result.irrigationNeedScore > 50 ? "text-amber-600 dark:text-amber-400" : "text-primary";
  const riskColor =
    result.climateRiskScore < 30
      ? "text-green-600 dark:text-green-400"
      : result.climateRiskScore < 60
        ? "text-amber-600 dark:text-amber-400"
        : "text-red-600 dark:text-red-400";
  const vpdColor =
    result.vpdStatus === "optimal"
      ? "text-green-600 dark:text-green-400"
      : result.vpdStatus === "extreme"
        ? "text-red-600 dark:text-red-400"
        : "text-amber-600 dark:text-amber-400";

  const TrendIcon =
    result.trend === "improving"
      ? TrendingUp
      : result.trend === "declining"
        ? TrendingDown
        : Minus;

  const insightSummary = aiInsight?.summary ?? result.summary;
  const insightRecs = aiInsight?.recommendations ?? result.recommendations;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Advanced Analytics</h2>
          <p className="text-muted-foreground">
            Real-time metrics, trends, and AI-powered insights from sensor data
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isAIConfigured() && (
            <div className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-primary">
              <Brain className="h-4 w-4" />
              AI enabled
            </div>
          )}
          <div
            className={
              "flex items-center gap-2 rounded-xl border px-3 py-2 text-sm " +
              (isConnected
                ? "border-primary/20 bg-primary/5 text-primary"
                : "border-muted bg-muted/30 text-muted-foreground")
            }
          >
            {isConnected ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
            {isConnected ? "Live data" : "Waiting for ESP32"}
          </div>
        </div>
      </div>

      {/* Summary + Trend */}
      <Card className="shadow-elegant border-0 bg-gradient-to-br from-card to-primary/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Summary
            </CardTitle>
            {result.trend !== "unknown" && (
              <div
                className={
                  "flex items-center gap-1.5 text-sm font-medium " +
                  (result.trend === "improving"
                    ? "text-green-600 dark:text-green-400"
                    : result.trend === "declining"
                      ? "text-red-600 dark:text-red-400"
                      : "text-muted-foreground")
                }
              >
                <TrendIcon className="h-4 w-4" />
                {result.trend}
              </div>
            )}
          </div>
          <CardDescription className="text-base">{insightSummary}</CardDescription>
        </CardHeader>
      </Card>

      {/* AI Recommendations — prominent, high visibility */}
      <Card
        className={
          "shadow-elegant border-0 " +
          (aiInsight
            ? "bg-gradient-to-br from-primary/5 via-card to-primary/5 ring-1 ring-primary/20"
            : "")
        }
      >
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                {aiInsight ? (
                  <>
                    <Sparkles className="h-5 w-5 text-primary" />
                    AI Recommendations
                  </>
                ) : (
                  <>
                    <Lightbulb className="h-5 w-5" />
                    Recommendations
                  </>
                )}
              </CardTitle>
              <CardDescription className="mt-1">
                {aiLoading
                  ? "Fetching AI insights…"
                  : aiInsight
                    ? "AI-generated actions based on current greenhouse conditions"
                    : "Rule-based actions from current sensor data"}
              </CardDescription>
            </div>
            {isAIConfigured() && (
              <Button
                variant="outline"
                size="sm"
                onClick={fetchAI}
                disabled={aiLoading || !isConnected}
                className="shrink-0"
              >
                {aiLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                <span className="ml-2">Get AI insights</span>
              </Button>
            )}
          </div>
          {aiInsight?.riskLevel && (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">Risk level:</span>
              <Badge
                variant={
                  aiInsight.riskLevel === "high"
                    ? "destructive"
                    : aiInsight.riskLevel === "medium"
                      ? "secondary"
                      : "outline"
                }
                className={
                  aiInsight.riskLevel === "low"
                    ? "border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-400"
                    : ""
                }
              >
                {aiInsight.riskLevel}
              </Badge>
              {aiInsight.predictedImpact && (
                <span className="text-sm text-muted-foreground italic">
                  — {aiInsight.predictedImpact}
                </span>
              )}
            </div>
          )}
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {insightRecs.map((rec, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
                  {i + 1}
                </span>
                <span className="text-foreground">{rec}</span>
              </li>
            ))}
          </ul>
          {!isAIConfigured() && (
            <p className="mt-4 text-xs text-muted-foreground">
              Add <code className="rounded bg-muted px-1 py-0.5">VITE_OPENAI_API_KEY</code> to .env for
              AI-powered recommendations.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Score gauges */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ScoreGauge
          value={result.plantHealthScore}
          label="Plant Health"
          icon={<Leaf className="h-4 w-4" />}
          colorClass={healthColor}
        />
        <ScoreGauge
          value={result.irrigationNeedScore}
          label="Irrigation Need"
          icon={<Droplets className="h-4 w-4" />}
          colorClass={irrigationColor}
        />
        <ScoreGauge
          value={result.climateRiskScore}
          label="Climate Risk"
          icon={<Thermometer className="h-4 w-4" />}
          colorClass={riskColor}
        />
        <ScoreGauge
          value={result.vpd}
          label="VPD"
          icon={<Thermometer className="h-4 w-4" />}
          colorClass={vpdColor}
          subtitle="kPa"
        />
      </div>

      {/* Time series charts */}
      <Card className="shadow-elegant border-0">
        <CardHeader>
          <CardTitle>Sensor trends</CardTitle>
          <CardDescription>
            Temperature, humidity, and soil moisture over time
            {loading ? " (loading history…)" : chartData.length > 0 ? ` (${chartData.length} points)` : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length > 1 ? (
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    domain={["auto", "auto"]}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 100]}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid hsl(var(--border))",
                      background: "hsl(var(--card))",
                    }}
                    labelFormatter={(_, payload) =>
                      payload?.[0]?.payload?.fullTime
                        ? format(parseISO(payload[0].payload.fullTime), "PPp")
                        : ""
                    }
                  />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="temp"
                    name="Temp (°C)"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="humidity"
                    name="Humidity (%)"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="soil"
                    name="Soil (%)"
                    stroke="hsl(var(--chart-3))"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-[200px] items-center justify-center rounded-lg border border-dashed border-muted-foreground/25">
              <p className="text-sm text-muted-foreground">
                {isConnected
                  ? "Collecting data… Charts will appear as more data is received."
                  : "Connect to MQTT to see live trends."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Area chart for health scores (if we have historical with scores) */}
      {allPoints.some((p) => "plantHealth" in p && p.plantHealth != null) && (
        <Card className="shadow-elegant border-0">
          <CardHeader>
            <CardTitle>Plant health over time</CardTitle>
            <CardDescription>Historical plant health score from saved snapshots</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={allPoints
                    .filter((p) => p.plantHealth != null)
                    .map((p) => ({
                      time: formatChartTime(p.time),
                      health: p.plantHealth,
                      irrigation: p.irrigationNeed,
                      risk: p.climateRisk,
                    }))}
                  margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="healthGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid hsl(var(--border))",
                      background: "hsl(var(--card))",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="health"
                    name="Plant health"
                    stroke="hsl(var(--primary))"
                    fill="url(#healthGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Advanced metrics */}
      <Card className="shadow-elegant border-0">
        <CardHeader>
          <CardTitle className="text-base">Advanced metrics</CardTitle>
          <CardDescription>
            VPD (Vapor Pressure Deficit) affects transpiration. Dew point and heat index.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-sm">
            <div>
              <span className="text-muted-foreground">VPD</span>
              <p className="font-semibold text-foreground">
                {result.vpd} kPa
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  ({result.vpdStatus})
                </span>
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Dew point</span>
              <p className="font-semibold text-foreground">{result.metrics.dewPoint}°C</p>
            </div>
            <div>
              <span className="text-muted-foreground">Heat index</span>
              <p className="font-semibold text-foreground">{result.metrics.heatIndex}°C</p>
            </div>
            <div>
              <span className="text-muted-foreground">Status</span>
              <p className="font-semibold text-foreground">
                Temp: {result.metrics.tempStatus} · Humidity: {result.metrics.humidityStatus} · Soil:{" "}
                {result.metrics.soilStatus}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
