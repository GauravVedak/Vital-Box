"use client";

import { useEffect, useRef, useCallback } from "react";
import { motion } from "motion/react";
import {
  ArrowRight, Activity, Brain, Shield,
  Zap, Package, TrendingUp, Heart, Users, CheckCircle, Lock,
} from "lucide-react";
import { useAuth } from "./AuthContext";
import s from "./HomePage.module.css";

/* ── Scroll reveal ────────────────────────────────────────── */
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

/* ── 3D tilt card — rAF lerp, pure CSS perspective ────────── */
function TiltCard({ children }: { children: React.ReactNode }) {
  const ref    = useRef<HTMLDivElement>(null);
  const target = useRef({ rx: 0, ry: 0 });
  const curr   = useRef({ rx: 0, ry: 0 });
 const raf = useRef<number>(0);
const tickRef = useRef<() => void>(() => {});

const tick = useCallback(() => {
  const el = ref.current;

  if (!el) {
    raf.current = requestAnimationFrame(tickRef.current);
    return;
  }

  curr.current.rx += (target.current.rx - curr.current.rx) * 0.09;
  curr.current.ry += (target.current.ry - curr.current.ry) * 0.09;

  el.style.transform =
    `perspective(900px) rotateX(${curr.current.rx.toFixed(2)}deg) rotateY(${curr.current.ry.toFixed(2)}deg) translateZ(0)`;

  raf.current = requestAnimationFrame(tickRef.current);
}, []);

  useEffect(() => {
  tickRef.current = tick;
}, [tick]);

useEffect(() => {
  raf.current = requestAnimationFrame(tickRef.current);
  return () => cancelAnimationFrame(raf.current);
}, [tick]);

  return (
    <div
      ref={ref}
      className={s.appCard}
      onMouseMove={(e) => {
        const rect = ref.current?.getBoundingClientRect();
        if (!rect) return;
        const dx = (e.clientX - rect.left  - rect.width  / 2) / (rect.width  / 2);
        const dy = (e.clientY - rect.top   - rect.height / 2) / (rect.height / 2);
        target.current = { rx: -dy * 7, ry: dx * 7 };
      }}
      onMouseLeave={() => { target.current = { rx: 0, ry: 0 }; }}
    >
      {children}
    </div>
  );
}

/* ── Dot grid — faint grey on white, bloom to emerald ─────── */
function DotGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse     = useRef({ x: -9999, y: -9999 });
  const raf       = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const SP = 34, R = 1.0, REACH = 130, LIFT = 3;
    const BA = 0.07, PA = 0.42;
    let cols = 0, rows = 0, W = 0, H = 0;

    const resize = () => {
      if (!canvas) return;
      W = canvas.offsetWidth; H = canvas.offsetHeight;
      const dpr = devicePixelRatio || 1;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.scale(dpr, dpr);
      cols = Math.ceil(W / SP) + 1;
      rows = Math.ceil(H / SP) + 1;
    };

    const draw = () => {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, W, H);
      const { x: mx, y: my } = mouse.current;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const bx = c * SP, by = r * SP;
          const dx = mx - bx, dy = my - by;
          const dist = Math.sqrt(dx*dx + dy*dy);
          const t = Math.max(0, 1 - dist / REACH);
          const nx = bx + (dist > 0 ? (dx/dist)*LIFT*t : 0);
          const ny = by + (dist > 0 ? (dy/dist)*LIFT*t : 0);
          const a  = BA + (PA - BA) * t * t;
          const rC = Math.round(178 - 162*t);
          const gC = Math.round(178 + 7*t);
          const bC = Math.round(190 - 61*t);
          ctx.beginPath();
          ctx.arc(nx, ny, R + t*0.8, 0, Math.PI*2);
          ctx.fillStyle = `rgba(${rC},${gC},${bC},${a.toFixed(3)})`;
          ctx.fill();
        }
      }
      raf.current = requestAnimationFrame(draw);
    };

    const onMove  = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const onLeave = () => { mouse.current = { x: -9999, y: -9999 }; };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize(); draw();
    canvas.parentElement?.addEventListener("mousemove", onMove);
    canvas.parentElement?.addEventListener("mouseleave", onLeave);
    return () => {
      cancelAnimationFrame(raf.current); ro.disconnect();
      canvas.parentElement?.removeEventListener("mousemove", onMove);
      canvas.parentElement?.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className={s.dotGrid} aria-hidden />;
}

function AppPreviewCard() {
  const recs = [
    { name: "Vitamin D3",          dose: "2,000 IU", match: 96, color: "#10b981" },
    { name: "Magnesium Glycinate", dose: "400 mg",   match: 89, color: "#34d399" },
    { name: "Omega-3 EPA/DHA",     dose: "1,000 mg", match: 82, color: "#059669" },
  ];

  return (
    <TiltCard>
      <div className={s.appCardLiveBadge}>
        <span className={s.appCardLiveDot} />
        Live plan
      </div>

      <div className={s.appCardProfile}>
        <div className={s.appCardProfileAvatar}>JR</div>
        <div className={s.appCardProfileInfo}>
          <div className={s.appCardProfileName}>Jamie R.</div>
          <div className={s.appCardProfileMeta}>175 cm · 78 kg · Goal: fat loss</div>
        </div>
        <div className={s.appCardProfileBMI}>
          <div className={s.appCardProfileBMINum}>25.5</div>
          <div className={s.appCardProfileBMILabel}>BMI</div>
        </div>
      </div>

      <div style={{
        fontSize: 9, fontWeight: 700, letterSpacing: "0.09em",
        textTransform: "uppercase", color: "var(--n400)", marginBottom: -6,
      }}>
        AI Recommendations
      </div>

      <div className={s.appCardList}>
        {recs.map((r) => (
          <div key={r.name} className={s.appCardItem}>
            <div className={s.appCardItemLeft}>
              <div className={s.appCardItemDot} style={{ background: r.color }} />
              <div>
                <div className={s.appCardItemName}>{r.name}</div>
                <div className={s.appCardItemDose}>{r.dose} daily</div>
              </div>
            </div>
            <div className={s.appCardItemRight}>
              <span className={s.appCardItemPct} style={{ color: r.color }}>
                {r.match}%
              </span>
              <div className={s.appCardItemBarTrack}>
                <div
                  className={s.appCardItemBarFill}
                  style={{ width: `${r.match}%`, background: r.color }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={s.appCardSafety}>
        <div className={s.appCardSafetyIcon}>
          <Shield size={11} />
        </div>
        <div className={s.appCardSafetyText}>
          No dangerous interactions found, safe to combine
        </div>
      </div>
    </TiltCard>
  );
}

const steps = [
  { num: "01", icon: Users,    title: "Enter your health profile",  desc: "Height, weight, age, and goals. 60 seconds. Your data never leaves your account." },
  { num: "02", icon: Activity, title: "BMI & metrics calculated",   desc: "We compute your body mass index and build a personalised health baseline." },
  { num: "03", icon: Brain,    title: "AI cross-checks safety",     desc: "Your profile is matched against supplement efficacy data and interaction rules." },
  { num: "04", icon: Package,  title: "You get a clear plan",       desc: "Named supplements, exact dosages, plain-English reasoning. Ask why at any time." },
];

const features = [
  { icon: Shield,      title: "Interaction safety filtering",  desc: "Every combination is checked against known dangerous interactions before it reaches you.",  metric: "Zero",    metricLabel: "unsafe combos. Ever.", dark: false },
  { icon: TrendingUp,  title: "Your BMI drives everything",    desc: "Body mass index shapes the entire recommendation, not a one-size-fits-all template.",      dark: false },
  { icon: Brain,       title: "AI that shows its work",        desc: "Every suggestion comes with a plain-English explanation. No black boxes.",                   dark: true  },
  { icon: Heart,       title: "Progress tracking over time",   desc: "Log monthly. Watch your plan adapt as your body and goals change.",                           dark: false },
  { icon: Zap,         title: "Full plan in under 2 minutes",  desc: "From first input to a complete, reasoned supplement plan. No waiting, no forms.",             metric: "< 2 min", metricLabel: "start to plan",        dark: false },
  { icon: CheckCircle, title: "Medical reference logic",       desc: "Decision rules grounded in clinical literature,  not influencer stacks, not trends.",        dark: false },
];

const trustItems = [
  { icon: Lock,        label: "Your data stays private" },
  { icon: Shield,      label: "Zero unsafe combinations" },
  { icon: CheckCircle, label: "Clinical reference logic" },
  { icon: Brain,       label: "Explainable AI decisions" },
];

const ease = [0.22, 1, 0.36, 1] as const;

export function HomePage() {
  const { user } = useAuth();

  return (
    <div className={s.page}>

      {/* ══════════════ HERO ══════════════════════════════════ */}
      <section className={s.hero}>
        {/* ── Full-section background video ─────────────────────────────────
            Drop hero-bg.mp4 into /public/ — fills the entire hero section.
            The .heroVideoOverlay darkens light/white videos so they read.
            Tweak overlay opacity in CSS to control how dark it goes.
        ────────────────────────────────────────────────────────────────── */}
        <video
          className={s.heroVideo}
          src="/hero-bg.mp4"
          autoPlay
          muted
          loop
          playsInline
          aria-hidden
        />
        <div className={s.heroVideoOverlay} aria-hidden />

        <DotGrid />
        <div className={s.heroRule} aria-hidden />

        {/* Navbar clearance */}
        <div className={s.heroTopBar} />

        {/* Split content */}
        <div className={s.heroInner}>

          {/* LEFT */}
          <motion.div
            className={s.heroLeft}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease }}
          >
            <h1 className={s.heroH1}>
              Your BMI.<br />
              Your goals.<br />
              <em>Your supplement plan.</em>
            </h1>

            <p className={s.heroSub}>
              Vital Box calculates your BMI, runs it through AI-powered
              safety checks, and builds a personalised supplement plan
              with exact dosages and plain-English reasoning in under
              two minutes.
            </p>

            <div className={s.ctaRow}>
              <button
                className={s.ctaPrimary}
                onClick={() => { window.location.hash = "#bmi"; }}
              >
                Calculate my BMI
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
                  Ask the AI
                </button>
              )}
            </div>

            <div className={s.heroTrust}>
              <Shield size={11} />
              <span>Medical-grade safety criteria applied to every plan</span>
            </div>
          </motion.div>

          {/* RIGHT — product preview card with 3D tilt */}
          <motion.div
            className={s.heroRight}
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.72, delay: 0.16, ease }}
          >
            <AppPreviewCard />
          </motion.div>
        </div>
      </section>

      {/* Bridge */}
      <div className={s.heroBridge} aria-hidden />

      <div className={s.body}>

        {/* HOW IT WORKS */}
        <div className={s.section}>
          <Reveal>
            <div className={s.sectionEyebrow}>How it works</div>
            <h2 className={s.h2}>From first log to <em>full plan</em><br />in minutes.</h2>
            <p className={s.sectionSub}>
              Four clear steps. No jargon. No guesswork.
            </p>
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

        {/* STAT BAND */}
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

        {/* BENTO */}
        <div className={s.section}>
          <Reveal>
            <div className={s.sectionEyebrow}>What makes it different</div>
            <h2 className={s.h2}>Built around <em>your data</em>,<br />not generic advice.</h2>
            <p className={s.sectionSub}>
              Every recommendation ties back to your actual numbers, <br />
              not a one-size-fits-all stack.
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

        {/* TRUST STRIP */}
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

        {/* PHILOSOPHY */}
        <div className={s.section}>
          <Reveal>
            <div className={s.philosophyStrip}>
              <div className={s.philosophyLeft}>
                <div className={s.sectionEyebrow}>Our philosophy</div>
                <div className={s.philosophyQuote}>
                  &quot;Supplements should come from
                  <em>your data</em>, not trends.&quot;
                </div>
              </div>
              <div className={s.philosophyRight}>
                <p>
                  Most supplement advice is built for audiences, not individuals.
                  &quot;Supplements should come from
                    <em>your data</em>, not trends.&quot;
                  weight, and goals, then works outward using AI and medical
                  safety logic.
                </p>
                <p>
                  No influencer stacks. No trending ingredients. Just a clear,
                  reasoned plan grounded in how your body actually works.
                </p>
                <button
                  className={s.ctaPrimary}
                  onClick={() => { window.location.hash = "#bmi"; }}
                >
                  Calculate my BMI
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </Reveal>
        </div>

      </div>

      {/* DARK CTA */}
      <section className={s.ctaSection}>
        <Reveal>
          <div className={s.ctaSectionInner}>
            <div className={s.ctaSectionLabel}>Ready to start</div>
            <h2 className={s.ctaSectionH2}>
              Stop guessing.<br />
              <em>Start knowing.</em>
            </h2>
            <p className={s.ctaSectionSub}>
              Your supplement plan should come from your data, not a
              trending video. Enter your BMI and let the AI do the rest.
            </p>
            <div className={s.ctaSectionActions}>
              <button
                className={s.ctaPrimary}
                onClick={() => { window.location.hash = "#bmi"; }}
              >
                Calculate my BMI
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

      {/* FOOTER */}
      <footer className={s.footer}>
        <div className={s.footerInner}>
          <div className={s.footerLogo}>
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