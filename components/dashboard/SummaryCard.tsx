import BrandLogo from "@/components/ui/BrandLogo";

type SummaryCardLogo = {
  name: string;
  color: string;
  logoSrc: string | null;
};

type SummaryCardProps = {
  title: string;
  value: string;
  subtitle?: string;
  logos?: SummaryCardLogo[];
};

const MAX_LOGOS = 5;

export default function SummaryCard({
  title,
  value,
  subtitle,
  logos,
}: SummaryCardProps) {
  const shown = logos?.slice(0, MAX_LOGOS) ?? [];
  const extra = logos ? logos.length - shown.length : 0;

  return (
    <div className="rounded-card bg-surface p-6 shadow-md transition-[transform,box-shadow] duration-300 ease-out hover:shadow-lg hover:-translate-y-[2px]">
      <p className="text-sm text-text-muted">{title}</p>
      <p className="mt-2 font-display text-3xl font-bold tracking-tight tabular-nums">
        {value}
      </p>
      {subtitle && (
        <p className="mt-1 text-sm text-text-muted">{subtitle}</p>
      )}
      {shown.length > 0 && (
        <div className="mt-3 flex items-center">
          <div className="flex -space-x-2">
            {shown.map((l) => (
              <BrandLogo
                key={l.name}
                logoSrc={l.logoSrc}
                color={l.color}
                name={l.name}
                size={28}
                rounded="rounded-full"
                className="ring-2 ring-surface"
              />
            ))}
          </div>
          {extra > 0 && (
            <span className="ml-2 text-xs font-semibold text-text-muted">
              +{extra}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
