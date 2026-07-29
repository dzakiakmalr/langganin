type CategoryBadgeProps = {
  name: string;
  color: string | null;
};

export default function CategoryBadge({ name, color }: CategoryBadgeProps) {
  const hex = color ?? "#7A6F63";

  return (
    <span
      className="inline-flex shrink-0 items-center gap-1 rounded-pill px-2 py-0.5 text-xs font-medium"
      style={{
        backgroundColor: `${hex}22`, // 13 % opacity
        color: hex,
      }}
    >
      <span
        className="inline-block h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: hex }}
      />
      {name}
    </span>
  );
}
