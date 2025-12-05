import { cn } from "../lib/utils";

export default function Avatar({
  src,
  className,
}: {
  src: string | undefined;
  className?: string;
}) {
  const fallback = "/avatar-placeholder.png";
  const imageSrc = src || fallback;
  return (
    <div className="avatar">
      <div className={cn("w-20 overflow-hidden rounded-full", className)}>
        <img
          src={imageSrc}
          onError={(e) => {
            e.currentTarget.src = fallback;
          }}
          alt="avatar"
        />
      </div>
    </div>
  );
}
