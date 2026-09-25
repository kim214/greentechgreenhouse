import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { sendEnquiry } from "../../lib/sendEnquiry";

export const PLAN_OPTIONS = [
  "Standard Greenhouse — KSh 120,000 one-time",
  "Smart Greenhouse + Basic — KSh 1,000 / month",
  "Smart Greenhouse + Standard — KSh 2,500 / month",
  "Smart Greenhouse + Advanced — KSh 5,000 / month",
  "Smart Greenhouse + Premium — KSh 10,000 / month",
] as const;

export function planOptionFor(choice: "standard-house" | "Basic" | "Standard" | "Advanced" | "Premium") {
  if (choice === "standard-house") return PLAN_OPTIONS[0];
  const found = PLAN_OPTIONS.find((p) => p.includes(`+ ${choice} `));
  return found ?? PLAN_OPTIONS[2];
}

const empty = {
  name: "",
  phone: "",
  email: "",
  location: "",
  houses: "1",
  crop: "",
  message: "",
  company: "",
};

export function PlanEnquiryForm({ plan }: { plan: string }) {
  const [fields, setFields] = useState({ ...empty, plan });
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  useEffect(() => {
    setFields((prev) => ({ ...prev, plan }));
  }, [plan]);

  const set =
    (key: keyof typeof fields) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setFields((prev) => ({ ...prev, [key]: e.target.value }));
    };

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (fields.company.trim()) return;
    setStatus("sending");
    const payload = {
      name: fields.name,
      phone: fields.phone,
      email: fields.email,
      location: fields.location,
      plan: fields.plan,
      houses: fields.houses,
      crop: fields.crop || "Not specified",
      message: fields.message || "Please get in touch about this plan.",
    };
    const body = [
      `Name: ${payload.name}`,
      `Phone: ${payload.phone}`,
      `Email: ${payload.email}`,
      `Location: ${payload.location}`,
      `Plan: ${payload.plan}`,
      `Number of houses: ${payload.houses}`,
      `Crop: ${payload.crop}`,
      "",
      payload.message,
    ].join("\n");
    try {
      await sendEnquiry(payload, `GreenTech plan enquiry: ${fields.plan} — ${fields.name}`, body);
      setStatus("sent");
      setFields({ ...empty, plan: fields.plan });
    } catch {
      setStatus("idle");
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm">
        <p className="font-display text-lg font-semibold">Request sent</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Thank you. We will contact you about the {fields.plan.split(" — ")[0]} plan.
        </p>
        <Button className="mt-5 rounded-full" variant="outline" onClick={() => setStatus("idle")}>
          Send another request
        </Button>
      </div>
    );
  }

  const fieldClass =
    "mt-1.5 h-10 rounded-xl border-border/60 bg-background text-sm focus-visible:ring-primary/30";

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-border/50 bg-card p-5 shadow-sm md:p-6">
      <input
        type="text"
        name="company"
        value={fields.company}
        onChange={set("company")}
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
      />

      <div className="mb-5 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">Selected plan</p>
        <select
          id="enquire-plan"
          required
          value={fields.plan}
          onChange={set("plan")}
          className="mt-2 w-full rounded-lg border-0 bg-transparent font-display text-base font-semibold text-foreground focus:outline-none focus:ring-0"
        >
          {PLAN_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="enquire-name">Full name</Label>
          <Input
            id="enquire-name"
            className={fieldClass}
            required
            value={fields.name}
            onChange={set("name")}
            placeholder="Jane Wanjiku"
          />
        </div>
        <div>
          <Label htmlFor="enquire-phone">Phone</Label>
          <Input
            id="enquire-phone"
            className={fieldClass}
            type="tel"
            required
            value={fields.phone}
            onChange={set("phone")}
            placeholder="07xx xxx xxx"
          />
        </div>
        <div>
          <Label htmlFor="enquire-email">Email</Label>
          <Input
            id="enquire-email"
            className={fieldClass}
            type="email"
            required
            value={fields.email}
            onChange={set("email")}
            placeholder="you@email.com"
          />
        </div>
        <div>
          <Label htmlFor="enquire-location">County / farm location</Label>
          <Input
            id="enquire-location"
            className={fieldClass}
            required
            value={fields.location}
            onChange={set("location")}
            placeholder="Kiambu"
          />
        </div>
        <div>
          <Label htmlFor="enquire-houses">Number of houses</Label>
          <select
            id="enquire-houses"
            required
            value={fields.houses}
            onChange={set("houses")}
            className={`${fieldClass} flex w-full border border-input px-3`}
          >
            <option>1</option>
            <option>2–5</option>
            <option>6 or more</option>
          </select>
        </div>
        <div>
          <Label htmlFor="enquire-crop">Main crop</Label>
          <Input
            id="enquire-crop"
            className={fieldClass}
            value={fields.crop}
            onChange={set("crop")}
            placeholder="Tomatoes, capsicum, herbs…"
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="enquire-message">Anything we should know?</Label>
          <Textarea
            id="enquire-message"
            rows={4}
            value={fields.message}
            onChange={set("message")}
            placeholder="When you want to start, farm size, or questions about this plan."
            className="mt-1.5 min-h-[110px] rounded-xl border-border/60"
          />
        </div>
      </div>

      <Button type="submit" className="mt-5 w-full rounded-full sm:w-auto" disabled={status === "sending"}>
        {status === "sending" ? "Sending…" : "Send request"}
      </Button>
    </form>
  );
}
