"use client";

import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import {
  ArrowRight, Activity, Brain, Shield,
  Zap, Package, TrendingUp, Heart, Users, CheckCircle, Lock,
} from "lucide-react";
import { useAuth } from "./AuthContext";
import s from "./HomePage.module.css";

/* ── Scroll reveal ── */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add(s.visible); io.disconnect(); } },
      { threshold: 0.06 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

function Reveal({ children, stagger = false, className = "" }: {
  children: React.ReactNode; stagger?: boolean; className?: string;
}) {
  const ref = useReveal();
  return (
    <div ref={ref} className={`${s.reveal} ${stagger ? s.stagger : ""} ${className}`}>
      {children}
    </div>
  );
}

/* ── App preview card ── */
function AppPreviewCard() {
  const supplements = [
    { name: "Vitamin D3",          dose: "2,000 IU", match: 96, color: "#10b981" },
    { name: "Magnesium Glycinate", dose: "400 mg",   match: 89, color: "#34d399" },
    { name: "Omega-3 Fish Oil",    dose: "1,000 mg", match: 84, color: "#059669" },
  ];
  return (
    <div className={s.appCard}>
      <div className={s.appCardHeader}>
        <div className={s.appCardHeaderLeft}>
          <div className={s.appCardDot} />
          <span className={s.appCardTitle}>Your AI Plan</span>
        </div>
        <span className={s.appCardBadge}>Safety Verified</span>
      </div>

      <div className={s.appCardBmi}>
        <div className={s.appCardBmiLeft}>
          <span className={s.appCardBmiLabel}>BMI</span>
          <span className={s.appCardBmiValue}>22.4</span>
        </div>
        <div className={s.appCardBmiRight}>
          <div className={s.appCardBmiTrack}>
            <div className={s.appCardBmiFill} />
            <div className={s.appCardBmiMarker} />
          </div>
          <div className={s.appCardBmiRange}>
            <span>Under</span>
            <span className={s.appCardBmiHealthy}>Healthy</span>
            <span>Obese</span>
          </div>
        </div>
      </div>

      <div className={s.appCardList}>
        {supplements.map((sup) => (
          <div key={sup.name} className={s.appCardItem}>
            <div className={s.appCardItemLeft}>
              <div className={s.appCardItemDot} style={{ background: sup.color }} />
              <div>
                <div className={s.appCardItemName}>{sup.name}</div>
                <div className={s.appCardItemDose}>{sup.dose} daily</div>
              </div>
            </div>
            <div className={s.appCardItemRight}>
              <span className={s.appCardItemPct} style={{ color: sup.color }}>{sup.match}%</span>
              <div className={s.appCardItemBarTrack}>
                <div
                  className={s.appCardItemBarFill}
                  style={{ width: `${sup.match}%`, background: sup.color }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={s.appCardFooter}>
        <Shield size={11} />
        <span>Checked against medical safety criteria</span>
      </div>
    </div>
  );
}

/* ── Interactive dot grid — tuned for white background ── */
function DotGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -9999, y: -9999 });
  const raf = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const SPACING    = 32;
    const RADIUS     = 1.0;
    const REACH      = 130;
    const LIFT       = 3;
    const BASE_ALPHA = 0.09;   // visible but quiet on white
    const PEAK_ALPHA = 0.44;

    let cols = 0, rows = 0, W = 0, H = 0;

    function resize() {
      if (!canvas) return;
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      const dpr = window.devicePixelRatio || 1;
      canvas.width  = W * dpr;
      canvas.height = H * dpr;
      ctx.scale(dpr, dpr);
      cols = Math.ceil(W / SPACING) + 1;
      rows = Math.ceil(H / SPACING) + 1;
    }

    function draw() {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, W, H);
      const mx = mouse.current.x;
      const my = mouse.current.y;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const bx = c * SPACING;
          const by = r * SPACING;
          const dx = mx - bx;
          const dy = my - by;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const t = Math.max(0, 1 - dist / REACH);

          const nx = bx + (dist > 0 ? (dx / dist) * LIFT * t : 0);
          const ny = by + (dist > 0 ? (dy / dist) * LIFT * t : 0);
          const alpha = BASE_ALPHA + (PEAK_ALPHA - BASE_ALPHA) * t * t;

          // Neutral grey at rest → pure emerald on hover
          const rCh = Math.round(178 - 162 * t); // 178 → 16
          const gCh = Math.round(178 + 7 * t);   // 178 → 185
          const bCh = Math.round(190 - 61 * t);  // 190 → 129

          ctx.beginPath();
          ctx.arc(nx, ny, RADIUS + t * 0.8, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${rCh},${gCh},${bCh},${alpha.toFixed(3)})`;
          ctx.fill();
        }
      }
      raf.current = requestAnimationFrame(draw);
    }

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const onMouseLeave = () => { mouse.current = { x: -9999, y: -9999 }; };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();
    draw();

    const parent = canvas.parentElement;
    parent?.addEventListener("mousemove", onMouseMove);
    parent?.addEventListener("mouseleave", onMouseLeave);

    return () => {
      cancelAnimationFrame(raf.current);
      ro.disconnect();
      parent?.removeEventListener("mousemove", onMouseMove);
      parent?.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className={s.dotGrid} aria-hidden />;
}

/* ── Data ── */
const steps = [
  { num: "01", icon: Users,    title: "Log your basics",           desc: "Height, weight, age, and goals. Takes about 60 seconds. Your data stays yours." },
  { num: "02", icon: Activity, title: "BMI snapshot",              desc: "We calculate your BMI and build a health profile tailored to your actual numbers." },
  { num: "03", icon: Brain,    title: "AI analyses your profile",  desc: "Our models cross-reference your data against supplement safety and efficacy logic." },
  { num: "04", icon: Package,  title: "Your plan, explained",      desc: "A clear, personalized plan you can read, question, and act on right away." },
];

const features = [
  { icon: Shield,      title: "Safety-first filtering",  desc: "Every recommendation is checked for dangerous interactions before it reaches you.",    metric: "Zero",    metricLabel: "unsafe combinations. Ever.", dark: false },
  { icon: TrendingUp,  title: "BMI-informed guidance",   desc: "Your BMI shapes the entire logic behind your plan, not a generic starting point.",    dark: false },
  { icon: Brain,       title: "AI that explains itself", desc: "Ask why. No black boxes, plain-language reasoning behind every suggestion.",          dark: true  },
  { icon: Heart,       title: "Tracks you over time",    desc: "Log your metrics monthly. Your plan evolves as your body changes.",                    dark: false },
  { icon: Zap,         title: "Results in under 2 min",  desc: "From first input to a full plan. No lengthy forms, no waiting.",                       metric: "< 2 min", metricLabel: "start to plan",        dark: false },
  { icon: CheckCircle, title: "Medical-grade criteria",  desc: "Decision logic grounded in clinical references, not trends, not influencers.",        dark: false },
];

const trustItems = [
  { icon: Lock,        label: "Medical-grade safety rules" },
  { icon: Shield,      label: "Zero unsafe combinations" },
  { icon: CheckCircle, label: "Clinical reference logic" },
  { icon: Brain,       label: "Explainable AI decisions" },
];

const ease = [0.22, 1, 0.36, 1] as const;

export function HomePage() {
  const { user } = useAuth();

  return (
    <div className={s.page}>

      {/* ═══════════════ HERO ═══════════════ */}
      <section className={s.hero}>
        {/* Soft light blooms — pure radial washes at very low opacity */}
        <div className={`${s.orb} ${s.orb1}`} aria-hidden />
        <div className={`${s.orb} ${s.orb2}`} aria-hidden />
        <div className={`${s.orb} ${s.orb3}`} aria-hidden />

        {/* Interactive dot grid */}
        <DotGrid />

        {/* Hairline accent rule — Apple product page signature detail */}
        <div className={s.heroRule} aria-hidden />

        <div className={s.heroInner}>

          {/* LEFT — copy */}
          <motion.div
            className={s.heroLeft}
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.65, ease }}
          >

            <h1 className={s.heroH1}>
              Know exactly<br />
              what your body<br />
              <em>actually needs.</em>
            </h1>

            <p className={s.heroSub}>
              Vital Box calculates your BMI, analyses your health profile,
              and builds a personalized supplement plan grounded in medical
              logic, not marketing.
            </p>

            <div className={s.ctaRow}>
              <button
                className={s.ctaPrimary}
                onClick={() => { window.location.hash = "#bmi"; }}
              >
                Start your health profile
                <ArrowRight size={14} />
              </button>
              {user ? (
                <button
                  className={s.ctaSecondary}
                  onClick={() => { window.location.hash = "#user-panel"; }}
                >
                  My dashboard
                </button>
              ) : (
                <button
                  className={s.ctaSecondary}
                  onClick={() => { window.location.hash = "#ai-advisor"; }}
                >
                  Talk to the AI
                </button>
              )}
            </div>

            <div className={s.heroTrust}>
              <Shield size={11} />
              <span>Medical-grade safety criteria applied to every plan</span>
            </div>
          </motion.div>

          {/* RIGHT — app card */}
          <motion.div
            className={s.heroRight}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease }}
          >
            <AppPreviewCard />
          </motion.div>

        </div>

        {/* Scroll indicator */}
        <div className={s.scrollHint} aria-hidden>
          <div className={s.scrollLine} />
          <span>Scroll to explore</span>
        </div>
      </section>

      {/* Hairline bridge */}
      <div className={s.heroBridge} aria-hidden />

      <div className={s.body}>

        {/* ═══════════════ HOW IT WORKS ═══════════════ */}
        <div className={s.section}>
          <Reveal>
            <div className={s.sectionEyebrow}>How it works</div>
            <h2 className={s.h2}>From first log to <em>full plan</em><br />in minutes.</h2>
            <p className={s.sectionSub}>Four clear steps. No guesswork. No generic advice.</p>
          </Reveal>
          <Reveal stagger>
            <div className={s.stepsGrid}>
              {steps.map((step) => (
                <div key={step.num} className={s.stepCard}>
                  <div className={s.stepTopRow}>
                    <span className={s.stepNum}>{step.num}</span>
                    <div className={s.stepIcon}><step.icon size={15} /></div>
                  </div>
                  <div className={s.stepTitle}>{step.title}</div>
                  <div className={s.stepDesc}>{step.desc}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        {/* ═══════════════ STAT BAND ═══════════════ */}
        <Reveal>
          <div className={s.statBand}>
            <div className={s.statBandInner}>
              <div className={s.statBandItem}>
                <div className={s.statBandNum}>BMI<em>+</em></div>
                <div className={s.statBandLabel}>Calculated from your real height & weight</div>
              </div>
              <div className={s.statBandDivider} />
              <div className={s.statBandItem}>
                <div className={s.statBandNum}>AI<em>×</em></div>
                <div className={s.statBandLabel}>Safety-checked, medically-referenced logic</div>
              </div>
              <div className={s.statBandDivider} />
              <div className={s.statBandItem}>
                <div className={s.statBandNum}>0<em> unsafe</em></div>
                <div className={s.statBandLabel}>Dangerous supplement combinations allowed</div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* ═══════════════ BENTO FEATURES ═══════════════ */}
        <div className={s.section}>
          <Reveal>
            <div className={s.sectionEyebrow}>What makes it different</div>
            <h2 className={s.h2}>Built around <em>your data</em>,<br />not generic advice.</h2>
            <p className={s.sectionSub}>
              Every decision ties back to your actual numbers, <br></br>
              not a one-size-fits-all supplement stack.
            </p>
          </Reveal>
          <Reveal stagger>
            <div className={s.bentoGrid}>
              {features.map((f) => (
                <div key={f.title} className={`${s.bentoCard} ${f.dark ? s.bentoCardDark : ""}`}>
                  <div className={`${s.bentoIconBox} ${f.dark ? s.bentoIconBoxDark : ""}`}>
                    <f.icon size={16} />
                  </div>
                  <div className={s.bentoCardTitle}>{f.title}</div>
                  <div className={s.bentoCardDesc}>{f.desc}</div>
                  {f.metric && (
                    <div className={s.bentoMetric}>
                      <span className={s.bentoMetricValue}>{f.metric}</span>
                      <span className={s.bentoMetricLabel}>{f.metricLabel}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        {/* ═══════════════ TRUST STRIP ═══════════════ */}
        <Reveal>
          <div className={s.trustStrip}>
            {trustItems.map((t) => (
              <div key={t.label} className={s.trustItem}>
                <t.icon size={13} />
                <span>{t.label}</span>
              </div>
            ))}
          </div>
        </Reveal>

        {/* ═══════════════ PHILOSOPHY STRIP ═══════════════ */}
        <div className={s.section}>
          <Reveal>
            <div className={s.philosophyStrip}>
              <div className={s.philosophyLeft}>
                <div className={s.sectionEyebrow}>Our philosophy</div>
                <div className={s.philosophyQuote}>
                  "Supplements should come from<br />
                  <em>your data</em>, not trends."
                </div>
              </div>
              <div className={s.philosophyRight}>
                <p>
                  Most supplement advice is built for audiences, not individuals.
                  Vital Box starts with what's true about your body — your height,
                  weight, and goals — and works outward from there using AI and
                  medical safety logic.
                </p>
                <p>
                  No influencer stacks. No trending ingredients. Just a clear plan
                  grounded in how your body actually works.
                </p>
                <button
                  className={s.ctaPrimary}
                  onClick={() => { window.location.hash = "#bmi"; }}
                >
                  Log your BMI
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </Reveal>
        </div>

      </div>

      {/* ═══════════════ DARK CTA ═══════════════ */}
      <section className={s.ctaSection}>
        <Reveal>
          <div className={s.ctaSectionInner}>
            <div className={s.ctaSectionLabel}>Ready to start</div>
            <h2 className={s.ctaSectionH2}>
              Stop guessing.<br />
              <em>Start knowing.</em>
            </h2>
            <p className={s.ctaSectionSub}>
              Your supplement plan should come from your data, not a trending video.
              Start with your BMI and let the AI do the rest.
            </p>
            <div className={s.ctaSectionActions}>
              <button
                className={s.ctaPrimary}
                onClick={() => { window.location.hash = "#bmi"; }}
              >
                Generate my plan
                <ArrowRight size={14} />
              </button>
              <button
                className={s.ctaPrimary}
                onClick={() => { window.location.hash = "#ai-advisor"; }}
              >
                Ask the AI first
              </button>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer className={s.footer}>
        <div className={s.footerInner}>
          <div className={s.footerLogo}>
            <span className={s.footerLogoDot} />
            <span className={s.footerLogoText}>Vital Box</span>
          </div>
          <p className={s.footerTagline}>Supplements that make sense for you.</p>
          <div className={s.footerLinks}>
            <span className={s.footerCopy}>© 2026 Vital Box</span>
          </div>
        </div>
      </footer>

    </div>
  );
}