import { useState, type ChangeEvent, type FormEvent } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { contactFormEndpoint, talkMailto } from "../../lib/siteContact";

const emptyForm = {
  name: "",
  phone: "",
  email: "",
  location: "",
  house: "Smart greenhouse",
  houses: "1",
  crop: "",
  message: "",
  company: "",
};

function encodeMailto(fields: typeof emptyForm) {
  const body = [
    `Name: ${fields.name}`,
    `Phone: ${fields.phone}`,
    `Email: ${fields.email}`,
    `Location: ${fields.location}`,
    `House: ${fields.house}`,
    `Number of houses: ${fields.houses}`,
    `Crop: ${fields.crop || "—"}`,
    "",
    fields.message,
  ].join("\n");
  return `${talkMailto}&body=${encodeURIComponent(body)}`;
}

export function ContactForm() {
  const [fields, setFields] = useState(emptyForm);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const set =
    (key: keyof typeof emptyForm) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setFields((prev) => ({ ...prev, [key]: e.target.value }));
    };

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (fields.company.trim()) return;
    setStatus("sending");

    try {
      const res = await fetch(contactFormEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: fields.name,
          phone: fields.phone,
          email: fields.email,
          _replyto: fields.email,
          location: fields.location,
          house: fields.house,
          houses: fields.houses,
          crop: fields.crop || "Not specified",
          message: fields.message,
          _subject: `GreenTech enquiry from ${fields.name}`,
          _template: "table",
          _captcha: "false",
        }),
      });
      if (!res.ok) throw new Error("send failed");
      setStatus("sent");
      setFields(emptyForm);
    } catch {
      setStatus("error");
      window.location.href = encodeMailto(fields);
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm">
        <p className="font-display text-lg font-semibold">Message sent</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Thank you. Nathan will reply to you at the email you gave.
        </p>
        <Button className="mt-5 rounded-full" variant="outline" onClick={() => setStatus("idle")}>
          Send another message
        </Button>
      </div>
    );
  }

  const fieldClass =
    "mt-1.5 h-10 rounded-xl border-border/60 bg-background text-sm focus-visible:ring-primary/30";

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-border/50 bg-card p-5 shadow-sm md:p-6">
      <input type="text" name="company" value={fields.company} onChange={set("company")} className="hidden" tabIndex={-1} autoComplete="off" />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="contact-name">Full name</Label>
          <Input id="contact-name" className={fieldClass} required value={fields.name} onChange={set("name")} placeholder="Jane Wanjiku" />
        </div>
        <div>
          <Label htmlFor="contact-phone">Phone</Label>
          <Input id="contact-phone" className={fieldClass} type="tel" required value={fields.phone} onChange={set("phone")} placeholder="07xx xxx xxx" />
        </div>
        <div>
          <Label htmlFor="contact-email">Email</Label>
          <Input id="contact-email" className={fieldClass} type="email" required value={fields.email} onChange={set("email")} placeholder="you@email.com" />
        </div>
        <div>
          <Label htmlFor="contact-location">County / farm location</Label>
          <Input id="contact-location" className={fieldClass} required value={fields.location} onChange={set("location")} placeholder="Kiambu" />
        </div>
        <div>
          <Label htmlFor="contact-house">House of interest</Label>
          <select
            id="contact-house"
            required
            value={fields.house}
            onChange={set("house")}
            className={`${fieldClass} flex w-full border border-input px-3`}
          >
            <option>Smart greenhouse</option>
            <option>Standard house</option>
            <option>Not sure yet</option>
          </select>
        </div>
        <div>
          <Label htmlFor="contact-houses">Number of houses</Label>
          <select
            id="contact-houses"
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
        <div className="sm:col-span-2">
          <Label htmlFor="contact-crop">Main crop</Label>
          <Input id="contact-crop" className={fieldClass} value={fields.crop} onChange={set("crop")} placeholder="Tomatoes, capsicum, herbs…" />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="contact-message">How can we help?</Label>
          <Textarea
            id="contact-message"
            required
            rows={4}
            value={fields.message}
            onChange={set("message")}
            placeholder="Tell us about your farm and what you need."
            className="mt-1.5 min-h-[110px] rounded-xl border-border/60"
          />
        </div>
      </div>

      <Button type="submit" className="mt-5 w-full rounded-full sm:w-auto" disabled={status === "sending"}>
        {status === "sending" ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
