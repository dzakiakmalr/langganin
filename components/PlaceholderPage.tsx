type PlaceholderPageProps = {
  title: string;
  description: string;
};

/**
 * Shared scaffold for skeleton routes (FE-04): a heading plus one sentence
 * describing what will live on the page. Real screens replace this later.
 */
export default function PlaceholderPage({
  title,
  description,
}: PlaceholderPageProps) {
  return (
    <section className="w-full max-w-4xl">
      <h1 className="font-display text-3xl font-bold">{title}</h1>
      <p className="mt-3 text-text-muted">{description}</p>
    </section>
  );
}
