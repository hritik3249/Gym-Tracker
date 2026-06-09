export function PageHeader({ title, eyebrow, action }: { title: string; eyebrow: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-acid">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-black tracking-normal text-cream sm:text-4xl">{title}</h1>
      </div>
      {action}
    </div>
  );
}
