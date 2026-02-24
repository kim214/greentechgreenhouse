import { cn } from "@/lib/utils";
import { ImageIcon, Video } from "lucide-react";

interface MediaSectionProps {
  title: string;
  description?: string;
  variant: "images" | "videos";
  children?: React.ReactNode;
}

function MediaPlaceholder({
  title,
  aspectRatio = "video",
}: {
  title: string;
  aspectRatio?: "video" | "square";
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-muted/30 transition-colors hover:border-primary/30 hover:bg-muted/50",
        aspectRatio === "video" ? "aspect-video" : "aspect-square"
      )}
    >
      <div className="rounded-full bg-primary/10 p-3">
        {aspectRatio === "video" ? (
          <Video className="h-6 w-6 text-primary" />
        ) : (
          <ImageIcon className="h-6 w-6 text-primary" />
        )}
      </div>
      <span className="text-sm font-medium text-muted-foreground">{title}</span>
    </div>
  );
}

export function MediaSection({
  title,
  description,
  variant,
  children,
}: MediaSectionProps) {
  const isImages = variant === "images";

  return (
    <section className="border-t border-border/40 py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6 md:px-12">
        <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          {title}
        </h2>
        {description && (
          <p className="mt-2 max-w-2xl text-muted-foreground">{description}</p>
        )}
        {children ? (
          <div className="mt-10">{children}</div>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <MediaPlaceholder
                key={i}
                title={
                  isImages
                    ? `Image ${i} — Add your photo here`
                    : `Video ${i} — Add embed or link`
                }
                aspectRatio={isImages ? "square" : "video"}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
