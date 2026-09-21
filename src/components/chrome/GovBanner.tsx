export function GovBanner() {
  return (
    <div className="bg-ink py-[7px] text-[12px] tracking-[0.04em] text-banner-text">
      <div className="mx-auto flex max-w-page flex-wrap justify-between gap-x-6 gap-y-1 px-[18px] md:px-10">
        <span>भारत सरकार · Government of India · Ministry of Statistics and Programme Implementation</span>
        <span className="hidden text-banner-dim md:inline">Data Informatics &amp; Innovation Division</span>
      </div>
    </div>
  );
}
