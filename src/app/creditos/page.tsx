import { SecondaryPageShell } from "@/components/secondary-page-shell";
import { creditColumns } from "@/data/credits";

export default function CreditosPage() {
  return (
    <SecondaryPageShell breadcrumbHref="/" breadcrumbLabel="Home" tint="cream">
      <div className="px-4 py-6 sm:px-7">
        <h1 className="font-display text-3xl dark:text-cream">Créditos</h1>
        <div className="mt-9 grid max-w-4xl grid-cols-1 gap-x-16 gap-y-8 uppercase sm:grid-cols-2">
          {creditColumns.map((column, columnIndex) => (
            <div key={columnIndex} className="space-y-8">
              {column.map((credit, index) => (
                <div key={index} className="font-sans text-[13px]">
                  <p className="font-bold tracking-wide text-black dark:text-cream">
                    {credit.name}
                  </p>
                  <p className="font-normal text-black dark:text-cream">{credit.description}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </SecondaryPageShell>
  );
}
