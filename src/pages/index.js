import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';

// ============================================================
// SAMPLE DATA — Used as fallback when API is unavailable
// ============================================================
const SAMPLE_DATA = {
  date: "2026-02-15",
  executive_summary: {
    text: 'Claude Opus 4.6 dropped today with meaningful upgrades to agentic coding, tool use, and finance capabilities — directly relevant to both your Kalos builds and URS sector analysis. Meanwhile, Google DeepMind published new research on multi-agent orchestration that maps closely to the dashboard architecture you\'re building.',
    action: "Test Opus 4.6's finance capabilities on your EMI sector analysis workflow this week."
  },
  stories: [
    { rank: 1, pillar: "FRONTIER", headline: "Anthropic Releases Claude Opus 4.6 with Major Agentic and Finance Upgrades", teaser: "The most capable Claude yet — enhanced agentic coding, tool orchestration, and new finance-specific reasoning.", source: "Anthropic Blog", source_url: "https://www.anthropic.com/news/claude-opus-4-6", thumbnail_url: null, time_ago: "2 hours ago", summary: "Anthropic launched Claude Opus 4.6, its most capable model to date. Key improvements include enhanced agentic coding, computer use, multi-step tool orchestration, and new finance-specific reasoning capabilities.", relevance: "The finance upgrades are directly applicable to your EMI sector analysis at URS. The improved tool orchestration also means your Kalos agents on MindStudio could handle more complex multi-step workflows." },
    { rank: 2, pillar: "PRACTICAL", headline: "MindStudio Launches Native JSON Output Mode for Agent APIs", teaser: "Structured JSON output from agent runs via API — build custom frontends that consume agent data programmatically.", source: "MindStudio Blog", source_url: "https://www.mindstudio.ai/blog", thumbnail_url: null, time_ago: "5 hours ago", summary: "MindStudio now supports structured JSON output from agent runs via API, making it significantly easier to build custom frontends that consume agent-generated data programmatically.", relevance: "This is exactly what you need to connect The Brief agent to your custom dashboard. JSON output mode eliminates the need to parse unstructured text — your frontend can consume clean, typed data directly." },
    { rank: 3, pillar: "ECONOMICS", headline: "Microsoft Reports $18B Cloud AI Revenue Run Rate, Capex Guidance Up 40%", teaser: "AI cloud revenue growing 150% YoY with a massive capex increase signaling sustained infrastructure demand.", source: "Bloomberg", source_url: "https://www.bloomberg.com/technology", thumbnail_url: null, time_ago: "8 hours ago", summary: "Microsoft disclosed its AI-specific cloud revenue has reached an $18B annual run rate, growing 150% year-over-year. The company also raised its FY26 capital expenditure guidance by 40% to fund AI infrastructure buildout.", relevance: "The 40% capex increase signals sustained infrastructure demand that feeds directly into your EMI thesis at URS — particularly power generation, data center cooling, and energy infrastructure assets." },
    { rank: 4, pillar: "FRONTIER", headline: "DeepMind Publishes Research on Multi-Agent Orchestration Architectures", teaser: "A modular framework for multi-agent systems with structured message passing and central orchestration.", source: "ArXiv", source_url: "https://arxiv.org", thumbnail_url: null, time_ago: "12 hours ago", summary: "Google DeepMind released a paper proposing a modular framework for multi-agent systems where specialized agents communicate through structured message passing, with a central orchestrator managing task delegation.", relevance: "This architecture pattern mirrors what you're building with The Brief — separate vertical agents feeding into an orchestration layer. Worth reading for design validation and ideas on inter-agent communication." },
    { rank: 5, pillar: "POLICY", headline: "SEC Issues First Guidance on AI-Generated Investment Research Disclosures", teaser: "New disclosure requirements when AI tools are used to generate investment research and recommendations.", source: "Reuters", source_url: "https://www.reuters.com/technology", thumbnail_url: null, time_ago: "14 hours ago", summary: "The SEC published interpretive guidance requiring investment advisors to disclose when AI tools are used in generating research reports and investment recommendations shared with clients.", relevance: "As URS integrates AI tooling into investment analysis workflows, this disclosure requirement will shape how your team documents and presents AI-assisted research to the board and beneficiaries." },
    { rank: 6, pillar: "PRACTICAL", headline: 'New Prompting Technique "Chain of Draft" Reduces Token Usage by 80%', teaser: "Comparable reasoning quality to chain-of-thought at a fraction of the token cost — major implications for API economics.", source: "@karpathy on X", source_url: "https://x.com/karpathy", thumbnail_url: null, time_ago: "6 hours ago", summary: 'Andrej Karpathy shared a new prompting approach called "Chain of Draft" that achieves comparable reasoning quality to chain-of-thought while using dramatically fewer tokens, significantly reducing API costs.', relevance: "If this holds up, it directly reduces Kalos operating costs. Worth testing on your MindStudio agents — an 80% token reduction would fundamentally change your unit economics." }
  ],
  quick_hits: [
    { text: "Cursor IDE raised a $400M Series C at a $10B valuation, signaling continued investor appetite for AI coding tools.", source: "TechCrunch", url: "https://techcrunch.com" },
    { text: "ElevenLabs launched a podcast generation API with custom voice cloning — relevant for your podcast feature roadmap.", source: "ElevenLabs Blog", url: "https://elevenlabs.io/blog" },
    { text: "The EU AI Act's first enforcement provisions take effect March 1, affecting high-risk AI system classifications.", source: "Reuters", url: "https://reuters.com/technology" }
  ],
  watch: { title: "OpenAI Developer Day — February 20", text: "Expect new model announcements and API feature releases. Watch for anything that shifts the Anthropic vs. OpenAI competitive landscape.", date_label: "5 days away" },
  podcast: { available: false, duration: null, url: null }
};

// ============================================================
// CONSTANTS
// ============================================================
const PILLAR_CONFIG = {
  PRACTICAL: { label: "Practical", color: "#34D399", dim: "rgba(52,211,153,0.12)", border: "rgba(52,211,153,0.3)" },
  FRONTIER: { label: "Frontier", color: "#4E9FFF", dim: "rgba(78,159,255,0.12)", border: "rgba(78,159,255,0.3)" },
  ECONOMICS: { label: "Economics", color: "#FBBF24", dim: "rgba(251,191,36,0.12)", border: "rgba(251,191,36,0.3)" },
  POLICY: { label: "Policy", color: "#A78BFA", dim: "rgba(167,139,250,0.12)", border: "rgba(167,139,250,0.3)" },
};

const GRADIENT_BG = [
  "linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)",
  "linear-gradient(135deg, #0d1117 0%, #161b22 40%, #1f2937 100%)",
  "linear-gradient(135deg, #1a1520 0%, #2d1b3d 40%, #1e293b 100%)",
  "linear-gradient(135deg, #0c1220 0%, #1a2744 40%, #0e2a47 100%)",
  "linear-gradient(135deg, #1a1625 0%, #1e1b2e 40%, #2a2040 100%)",
  "linear-gradient(135deg, #111820 0%, #182030 40%, #1a2838 100%)",
];

function formatDate(dateStr) {
  try {
    const d = new Date(dateStr + "T12:00:00");
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" }).toUpperCase();
  } catch {
    return dateStr;
  }
}

function formatRelativeTime(date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

// ============================================================
// COMPONENTS
// ============================================================
function PillarTag({ pillar, style = {} }) {
  const cfg = PILLAR_CONFIG[pillar] || PILLAR_CONFIG.PRACTICAL;
  return (
    <span style={{
      fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 600,
      letterSpacing: 1, textTransform: "uppercase", padding: "4px 10px",
      borderRadius: 4, background: cfg.dim, color: cfg.color, ...style
    }}>
      {cfg.label}
    </span>
  );
}

function FlipCard({ story, index }) {
  const [flipped, setFlipped] = useState(false);
  const [imgError, setImgError] = useState(false);
  const cfg = PILLAR_CONFIG[story.pillar] || PILLAR_CONFIG.PRACTICAL;
  const bg = GRADIENT_BG[index % GRADIENT_BG.length];
  const hasImage = story.thumbnail_url && !imgError;

  return (
    <div
      onClick={() => setFlipped(!flipped)}
      style={{
        perspective: 1200, height: 340, cursor: "pointer",
        animation: `fadeUp 0.5s ease ${0.1 + index * 0.05}s both`
      }}
    >
      <div style={{
        position: "relative", width: "100%", height: "100%",
        transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
        transformStyle: "preserve-3d",
        transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)"
      }}>
        {/* FRONT */}
        <div style={{
          position: "absolute", inset: 0, backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden", borderRadius: 14,
          border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden",
          background: "#181C25", display: "flex", flexDirection: "column",
        }}>
          <div style={{ flex: 1, position: "relative", overflow: "hidden", minHeight: 0 }}>
            {hasImage ? (
              <img src={story.thumbnail_url} alt="" onError={() => setImgError(true)}
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.85 }} />
            ) : (
              <div style={{ position: "absolute", inset: 0, background: bg }}>
                <div style={{ position: "absolute", width: 250, height: 250, right: -80, top: -80, borderRadius: "50%", opacity: 0.07, background: "#4E9FFF" }} />
                <div style={{ position: "absolute", width: 160, height: 160, left: -50, bottom: -60, borderRadius: "50%", opacity: 0.07, background: "#A78BFA" }} />
                <div style={{ position: "absolute", bottom: 16, left: 20, fontFamily: "'DM Sans', sans-serif", fontSize: 24, fontWeight: 700, color: "rgba(255,255,255,0.6)", letterSpacing: -0.5 }}>
                  {story.source}
                  <span style={{ display: "block", fontSize: 11, fontWeight: 400, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginTop: 2 }}>
                    {story.source_url?.includes("x.com") ? "X / Twitter" : "Article"}
                  </span>
                </div>
              </div>
            )}
            <span style={{
              position: "absolute", top: 14, left: 16, fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase",
              padding: "5px 12px", borderRadius: 4, backdropFilter: "blur(8px)",
              background: `${cfg.color}33`, color: cfg.color
            }}>{cfg.label}</span>
            <span style={{
              position: "absolute", top: 14, right: 16, fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11, fontWeight: 600, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)",
              padding: "4px 10px", borderRadius: 100, color: "rgba(255,255,255,0.7)"
            }}>#{story.rank}</span>
          </div>
          <div style={{ padding: "20px 24px 22px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ fontFamily: "'Newsreader', serif", fontSize: 17, fontWeight: 700, lineHeight: 1.35, color: "#E8ECF4", marginBottom: 8 }}>{story.headline}</div>
            <div style={{ fontSize: 13, color: "#8B95A8", lineHeight: 1.5 }}>{story.teaser}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 12, fontSize: 12, fontWeight: 600, color: "#4E9FFF", letterSpacing: 0.3 }}>
              Tap to read more
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6" /></svg>
            </div>
          </div>
        </div>

        {/* BACK */}
        <div style={{
          position: "absolute", inset: 0, backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden", borderRadius: 14,
          border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden",
          background: "#181C25", transform: "rotateY(180deg)",
          padding: "24px 26px", display: "flex", flexDirection: "column", overflowY: "auto"
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <PillarTag pillar={story.pillar} />
            <button onClick={(e) => { e.stopPropagation(); setFlipped(false); }}
              style={{ fontSize: 12, color: "#5A6377", fontWeight: 500, display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", padding: "4px 8px", borderRadius: 6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg> Back
            </button>
          </div>
          <div style={{ fontFamily: "'Newsreader', serif", fontSize: 18, fontWeight: 700, lineHeight: 1.35, color: "#E8ECF4", marginBottom: 6 }}>{story.headline}</div>
          <div style={{ fontSize: 12, color: "#5A6377", marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>
            {story.source} <span style={{ width: 3, height: 3, borderRadius: "50%", background: "#5A6377" }} /> {story.time_ago}
          </div>
          <div style={{ fontSize: 14, lineHeight: 1.65, color: "#8B95A8", marginBottom: 16 }}>{story.summary}</div>
          <div style={{ padding: "14px 16px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, marginBottom: 16 }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: 1.5, textTransform: "uppercase", color: "#FB7185", fontWeight: 600, marginBottom: 6 }}>Why This Matters to You</div>
            <div style={{ fontSize: 13, lineHeight: 1.55, color: "#8B95A8", fontStyle: "italic", fontFamily: "'Newsreader', serif" }}>{story.relevance}</div>
          </div>
          <a href={story.source_url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "#4E9FFF", textDecoration: "none", marginTop: "auto" }}>
            Read full story <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </a>
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "120px 40px", gap: 20 }}>
      <div style={{ width: 40, height: 40, border: "3px solid rgba(78,159,255,0.2)", borderTop: "3px solid #4E9FFF", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      <div style={{ fontFamily: "'Newsreader', serif", fontSize: 18, color: "#8B95A8" }}>Loading your briefing...</div>
      <div style={{ fontSize: 13, color: "#5A6377" }}>Fetching the latest cached briefing data</div>
    </div>
  );
}

function ErrorState({ error, onRetry, onUseSample }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "120px 40px", gap: 16 }}>
      <div style={{ fontSize: 40, marginBottom: 8 }}>⚠</div>
      <div style={{ fontFamily: "'Newsreader', serif", fontSize: 18, color: "#E8ECF4" }}>Couldn't load today's briefing</div>
      <div style={{ fontSize: 14, color: "#8B95A8", textAlign: "center", maxWidth: 400 }}>{error}</div>
      <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
        <button onClick={onRetry} style={{
          padding: "10px 24px", borderRadius: 100, background: "rgba(78,159,255,0.1)",
          border: "1px solid rgba(78,159,255,0.25)", color: "#4E9FFF", fontSize: 14,
          fontWeight: 600, cursor: "pointer"
        }}>Try Again</button>
        <button onClick={onUseSample} style={{
          padding: "10px 24px", borderRadius: 100, background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.1)", color: "#8B95A8", fontSize: 14,
          fontWeight: 600, cursor: "pointer"
        }}>Use Sample Data</button>
      </div>
    </div>
  );
}

// ============================================================
// MAIN PAGE
// ============================================================
export default function TheBrief() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [usingSample, setUsingSample] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  const fetchBriefing = useCallback(async () => {
    setLoading(true);
    setError(null);
    setUsingSample(false);
    try {
      const res = await fetch('/api/briefing');
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `API returned ${res.status}`);
      }
      const json = await res.json();
      setData(json);
      if (json._cachedAt) {
        setLastRefreshed(new Date(json._cachedAt));
      }
    } catch (err) {
      console.error('Failed to fetch briefing:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const useSampleData = useCallback(() => {
    setData(SAMPLE_DATA);
    setError(null);
    setLoading(false);
    setUsingSample(true);
  }, []);

  useEffect(() => {
    fetchBriefing();
  }, [fetchBriefing]);

  const filteredStories = data?.stories?.filter(
    s => activeFilter === "ALL" || s.pillar === activeFilter
  ) || [];

  const filters = [
    { key: "ALL", label: "All Stories" },
    { key: "PRACTICAL", label: "Practical" },
    { key: "FRONTIER", label: "Frontier" },
    { key: "ECONOMICS", label: "Economics" },
    { key: "POLICY", label: "Policy" },
  ];

  return (
    <>
      <Head>
        <title>The Brief — AI News Dashboard</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </Head>

      <style jsx global>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0C0F14; color: #E8ECF4; font-family: 'DM Sans', sans-serif; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
        a { color: #4E9FFF; text-decoration: none; }
        a:hover { text-decoration: underline; }
      `}</style>

      {/* NAV */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100, background: "rgba(12,15,20,0.85)",
        backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: "0 40px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <div style={{ fontFamily: "'Newsreader', serif", fontSize: 22, fontWeight: 700, letterSpacing: -0.5 }}>
            The <span style={{ color: "#4E9FFF" }}>Brief</span>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {["AI News", "Investing", "General", "Markets"].map((tab, i) => (
              <button key={tab} style={{
                padding: "8px 16px", borderRadius: 6, fontSize: 13, fontWeight: 500,
                color: i === 0 ? "#E8ECF4" : "#5A6377", cursor: "pointer",
                border: "none", background: i === 0 ? "rgba(78,159,255,0.1)" : "none",
              }}>{tab}</button>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {usingSample && (
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#FBBF24", letterSpacing: 0.5, padding: "4px 10px", background: "rgba(251,191,36,0.1)", borderRadius: 100 }}>
              SAMPLE DATA
            </span>
          )}
          {lastRefreshed && (
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#5A6377", letterSpacing: 0.3 }}>
              Updated {formatRelativeTime(lastRefreshed)}
            </span>
          )}
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#5A6377", letterSpacing: 0.5 }}>
            {data ? formatDate(data.date) : "—"}
          </div>
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            background: "linear-gradient(135deg, #4E9FFF, #A78BFA)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: 700, color: "white"
          }}>MB</div>
        </div>
      </nav>

      {/* MAIN */}
      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 40px 80px", position: "relative", zIndex: 1 }}>

        {loading && <LoadingState />}
        {error && !data && <ErrorState error={error} onRetry={fetchBriefing} onUseSample={useSampleData} />}

        {data && (
          <>
            {/* EXEC SUMMARY */}
            <div style={{
              background: "linear-gradient(135deg, #141820 0%, #1A1F2D 100%)",
              border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20,
              padding: "36px 40px", marginBottom: 36, position: "relative", overflow: "hidden",
              animation: "fadeUp 0.5s ease both"
            }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, #4E9FFF, #A78BFA, #34D399)" }} />
              <div style={{
                fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 500,
                letterSpacing: 2, textTransform: "uppercase", color: "#4E9FFF",
                marginBottom: 16, display: "flex", alignItems: "center", gap: 8
              }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#34D399", animation: "pulse 2s infinite" }} />
                Executive Summary
              </div>
              <div style={{ fontFamily: "'Newsreader', serif", fontSize: 19, lineHeight: 1.7, color: "#E8ECF4", maxWidth: 900 }}
                dangerouslySetInnerHTML={{
                  __html: (data.executive_summary?.text || '').replace(
                    /^(.+?)(—|\.)/,
                    '<strong style="color:#4E9FFF;font-weight:600">$1</strong>$2'
                  )
                }}
              />
              {data.executive_summary?.action && (
                <div style={{ marginTop: 20, padding: "14px 20px", background: "rgba(78,159,255,0.06)", border: "1px solid rgba(78,159,255,0.15)", borderRadius: 10, display: "inline-flex", alignItems: "center", gap: 10 }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", color: "#4E9FFF", fontWeight: 500 }}>Your Move</div>
                  <div style={{ fontSize: 14, color: "#8B95A8" }}>{data.executive_summary.action}</div>
                </div>
              )}
            </div>

            {/* FILTERS */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, color: "#5A6377", fontWeight: 500, marginRight: 4 }}>Filter:</span>
              {filters.map(f => {
                const isActive = activeFilter === f.key;
                const cfg = PILLAR_CONFIG[f.key];
                let bg = "transparent", color = "#5A6377", borderColor = "rgba(255,255,255,0.06)";
                if (isActive && f.key === "ALL") { bg = "rgba(255,255,255,0.08)"; color = "#E8ECF4"; borderColor = "rgba(255,255,255,0.1)"; }
                else if (isActive && cfg) { bg = cfg.dim; color = cfg.color; borderColor = cfg.border; }
                return (
                  <button key={f.key} onClick={() => setActiveFilter(f.key)} style={{
                    padding: "6px 14px", borderRadius: 100, fontSize: 12, fontWeight: 600,
                    cursor: "pointer", transition: "all 0.2s", border: `1px solid ${borderColor}`,
                    background: bg, color, letterSpacing: 0.3
                  }}>{f.label}</button>
                );
              })}
              <div style={{ marginLeft: "auto", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#5A6377" }}>
                {filteredStories.length} stor{filteredStories.length === 1 ? "y" : "ies"} today
              </div>
            </div>

            {/* STORIES */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 18, marginBottom: 40 }}>
              {filteredStories.map((story, i) => <FlipCard key={story.rank} story={story} index={i} />)}
            </div>

            {/* BELOW THE FOLD */}
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 32, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, animation: "fadeUp 0.5s ease 0.4s both" }}>
              <div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "#5A6377", marginBottom: 16 }}>Quick Hits</div>
                {(data.quick_hits || []).map((hit, i) => (
                  <div key={i} style={{ padding: "12px 0", borderBottom: i < (data.quick_hits?.length || 0) - 1 ? "1px solid rgba(255,255,255,0.06)" : "none", display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#5A6377", marginTop: 8, flexShrink: 0 }} />
                    <div style={{ fontSize: 14, color: "#8B95A8", lineHeight: 1.55 }}>
                      {hit.text}{" "}<a href={hit.url} target="_blank" rel="noopener noreferrer">Link</a>
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "#5A6377", marginBottom: 16 }}>One Thing to Watch</div>
                {data.watch && (
                  <div style={{ background: "#181C25", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: 24 }}>
                    <div style={{ fontFamily: "'Newsreader', serif", fontSize: 16, fontWeight: 700, color: "#E8ECF4", marginBottom: 10 }}>{data.watch.title}</div>
                    <div style={{ fontSize: 14, color: "#8B95A8", lineHeight: 1.6 }}>{data.watch.text}</div>
                    <div style={{ marginTop: 12, fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#FBBF24" }}>{data.watch.date_label}</div>
                  </div>
                )}
              </div>
            </div>

            {/* PODCAST */}
            <div style={{
              marginTop: 40, background: "#181C25", border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 14, padding: "20px 28px", display: "flex", alignItems: "center", gap: 20,
              animation: "fadeUp 0.5s ease 0.45s both", opacity: data.podcast?.available ? 1 : 0.5
            }}>
              <div style={{ width: 48, height: 48, borderRadius: 10, background: "linear-gradient(135deg, #4E9FFF, #A78BFA)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="white" stroke="none">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  <path d="M12 19v4M8 23h8" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#E8ECF4" }}>Today's Brief — Audio Edition</div>
                <div style={{ fontSize: 12, color: "#5A6377", marginTop: 2 }}>
                  {data.podcast?.available ? `${data.podcast.duration} listen` : "Coming soon — podcast generation in development"}
                </div>
              </div>
              <button style={{
                padding: "8px 20px", borderRadius: 100, background: "rgba(78,159,255,0.1)",
                border: "1px solid rgba(78,159,255,0.25)", color: "#4E9FFF", fontSize: 13, fontWeight: 600,
                cursor: data.podcast?.available ? "pointer" : "not-allowed"
              }}>{data.podcast?.available ? "Play" : "Soon"}</button>
            </div>

            {/* REFRESH BUTTON */}
            <div style={{ display: "flex", justifyContent: "center", marginTop: 32 }}>
              <button onClick={fetchBriefing} style={{
                padding: "10px 28px", borderRadius: 100, background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)", color: "#5A6377", fontSize: 13,
                fontWeight: 500, cursor: "pointer", transition: "all 0.2s",
                display: "flex", alignItems: "center", gap: 8
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 4v6h6M23 20v-6h-6" /><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" /></svg>
                Refresh Briefing
              </button>
            </div>
          </>
        )}
      </main>
    </>
  );
}
