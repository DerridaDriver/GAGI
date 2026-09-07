import Link from "next/link";

const entryModes = [
  {
    href: "/ask",
    index: "01",
    title: "自由提问",
    description: "你来出题，让 AI 接梗。",
    cta: "开始出题",
  },
  {
    href: "/arena",
    index: "02",
    title: "笑话竞技场",
    description: "无需出题，直接从四个答案里选最好笑的。",
    cta: "进入竞技场",
  },
] as const;

export default function HomePage() {
  return (
    <main className="page-shell landing-shell">
      <div className="page-glow" />

      <div className="container landing-container">
        <section className="landing-hero" aria-labelledby="landing-title">
          <div className="brand-row">
            <p className="eyebrow">GENERAL ARTIFICIAL GAG INTELLIGENCE</p>
            <span className="version">GAGI 0.5</span>
          </div>

          <h1 id="landing-title">
            GAGI<span className="brand-dot">.</span>
          </h1>
          <p className="landing-subtitle">
            General Artificial Gag Intelligence
          </p>
          <p className="tagline">
            这是一个让 AI 在真人投票中学习幽默的实验。
          </p>
        </section>

        <section className="entry-grid" aria-label="选择实验入口">
          {entryModes.map((mode) => (
            <Link className="entry-card" href={mode.href} key={mode.href}>
              <span className="entry-index">{mode.index}</span>
              <span className="entry-copy">
                <strong>{mode.title}</strong>
                <span>{mode.description}</span>
              </span>
              <span className="entry-cta" aria-hidden="true">
                {mode.cta} →
              </span>
            </Link>
          ))}
        </section>

        <footer>
          <span>GAGI 0.5</span>
          <span>MAKE MACHINES FUNNY, EVENTUALLY.</span>
        </footer>
      </div>
    </main>
  );
}
