const COLS: { title: string; links: string[] }[] = [
  { title: "Data", links: ["Monthly bulletin", "Full CSV archive", "Revision policy"] },
  { title: "About", links: ["Methodology v1.2", "Quality report", "Contact the division"] },
  { title: "Legal", links: ["Terms of use", "Open data licence", "Accessibility"] },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-line bg-wash">
      <div className="mx-auto grid max-w-page gap-8 px-4 py-9 md:px-10" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))" }}>
        <div>
          <div className="font-display text-[16px] font-semibold">FareSankhya · APIx</div>
          <div className="mt-2 max-w-[34ch] text-[13px] leading-[1.6] text-muted">
            An experimental statistic of the Ministry of Statistics and Programme Implementation.
          </div>
        </div>
        {COLS.map((c) => (
          <div key={c.title} className="flex flex-col gap-[9px] text-[13.5px]">
            <span className="text-[12px] font-semibold uppercase tracking-[0.09em] text-faint">{c.title}</span>
            {c.links.map((l) => (
              <a key={l} href="#">{l}</a>
            ))}
          </div>
        ))}
      </div>
      <div className="border-t border-line">
        <div className="mx-auto max-w-page px-4 py-4 text-[12.5px] text-faint md:px-10">
          Prototype · Smart India Hackathon 2026 · Figures shown are illustrative.
        </div>
      </div>
    </footer>
  );
}
