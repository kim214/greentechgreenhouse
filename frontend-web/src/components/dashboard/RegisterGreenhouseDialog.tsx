import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

type Props = {
  onSubmit: (input: { name: string; location?: string; cropName?: string }) => Promise<string | null>;
  disabled?: boolean;
};

export function RegisterGreenhouseDialog({ onSubmit, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [cropName, setCropName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setName("");
    setLocation("");
    setCropName("");
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Enter a greenhouse name.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const id = await onSubmit({
        name: name.trim(),
        location: location.trim() || undefined,
        cropName: cropName.trim() || undefined,
      });
      if (!id) return;
      reset();
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add greenhouse.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="rounded-xl"
          disabled={disabled}
          aria-label="Add greenhouse"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Add greenhouse</DialogTitle>
            <DialogDescription>
              Register another house on this account. You can switch between houses on the dashboard.
              Live controller readings replace climate on the house you have open when the ESP32 is
              connected.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="gh-name">Name</Label>
            <Input
              id="gh-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="North tunnel"
              autoComplete="off"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gh-location">Location</Label>
            <Input
              id="gh-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Kiambu"
              autoComplete="off"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gh-crop">Crop</Label>
            <Input
              id="gh-crop"
              value={cropName}
              onChange={(e) => setCropName(e.target.value)}
              placeholder="Tomatoes"
              autoComplete="off"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={busy}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy || !name.trim()}>
              {busy ? "Adding…" : "Add greenhouse"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
