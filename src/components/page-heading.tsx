export default function PageHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div>
      <h2 className="text-foreground text-[clamp(1.25rem,1.5vw+0.5rem,1.5rem)] font-bold tracking-wide">
        {title}
      </h2>

      {subtitle && (
        <p className="text-muted-foreground text-xs lg:text-sm">{subtitle}</p>
      )}
    </div>
  );
}
