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
      { threshold: 0.08 }
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

/* ── Mini app preview — shows the real product ── */
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
        <span className={s.appCardBadge}>AI Verified</span>
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

/* ── Interactive dot grid canvas ── */
function DotGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -9999, y: -9999 });
  const raf = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const SPACING = 28;
    const RADIUS  = 1.2;
    const REACH   = 110;   // px — how far the effect radiates
    const LIFT    = 3.5;   // max dot displacement toward cursor
    const BASE_ALPHA = 0.055;
    const PEAK_ALPHA = 0.38;

    let cols = 0, rows = 0, W = 0, H = 0;

    function resize() {
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width  = W * devicePixelRatio;
      canvas.height = H * devicePixelRatio;
      ctx.scale(devicePixelRatio, devicePixelRatio);
      cols = Math.ceil(W / SPACING) + 1;
      rows = Math.ceil(H / SPACING) + 1;
    }

    function draw() {
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
          const t = Math.max(0, 1 - dist / REACH); // 0..1

          // nudge dot toward cursor
          const nx = bx + (dist > 0 ? (dx / dist) * LIFT * t : 0);
          const ny = by + (dist > 0 ? (dy / dist) * LIFT * t : 0);

          // alpha: base + boost near cursor
          const alpha = BASE_ALPHA + (PEAK_ALPHA - BASE_ALPHA) * t * t;

          // color: white at rest, emerald tint near cursor
          const g = Math.round(185 + (255 - 185) * (1 - t));
          const b = Math.round(129 + (255 - 129) * (1 - t));
          ctx.beginPath();
          ctx.arc(nx, ny, RADIUS + t * 0.8, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(16,${g},${b},${alpha.toFixed(3)})`;
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

    canvas.parentElement?.addEventListener("mousemove", onMouseMove);
    canvas.parentElement?.addEventListener("mouseleave", onMouseLeave);

    return () => {
      cancelAnimationFrame(raf.current);
      ro.disconnect();
      canvas.parentElement?.removeEventListener("mousemove", onMouseMove);
      canvas.parentElement?.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={s.dotGrid}
      aria-hidden
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0 }}
    />
  );
}


const steps = [
  { num: "01", icon: Users,    title: "Log your basics",          desc: "Height, weight, age, goals. 60 seconds. Your data stays yours." },
  { num: "02", icon: Activity, title: "BMI snapshot",             desc: "We calculate your BMI and build a real health profile, not a generic one." },
  { num: "03", icon: Brain,    title: "AI analyses your profile", desc: "Our models cross-reference your data against supplement safety and efficacy rules." },
  { num: "04", icon: Package,  title: "Your plan, explained",     desc: "A clear personalised plan you can read, question, and act on immediately." },
];

const features = [
  { icon: Shield,      title: "Safety-first filtering",  desc: "Every recommendation is checked for dangerous interactions before it reaches you.", metric: "0",       metricLabel: "unsafe combos. Ever.", dark: false },
  { icon: TrendingUp,  title: "BMI-informed guidance",   desc: "Your BMI shapes the entire logic behind your plan. Not a generic starting point.",  metric: "92%",     metricLabel: "avg plan confidence",  dark: false },
  { icon: Brain,       title: "AI that explains itself", desc: "Ask why. No black boxes, just plain-language reasoning behind every suggestion.",    dark: true },
  { icon: Heart,       title: "Tracks you over time",    desc: "Log your metrics monthly. Watch your plan evolve as your body does.",                dark: false },
  { icon: Zap,         title: "Results in under 2 min",  desc: "From first input to full plan. No forms, no waiting, no account required.",         metric: "< 2 min", metricLabel: "start to plan",        dark: false },
  { icon: CheckCircle, title: "Medical-grade criteria",  desc: "Decision logic grounded in clinical references, not trends, not influencers.",      dark: false },
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

      {/* ══════════════════════════════════════
          HERO — split layout
          ══════════════════════════════════════ */}
      <section className={s.hero}>
        <div className={`${s.orb} ${s.orb1}`} aria-hidden />
        <div className={`${s.orb} ${s.orb2}`} aria-hidden />
        <div className={`${s.orb} ${s.orb3}`} aria-hidden />
        <DotGrid />

        <div className={s.heroInner}>

          {/* LEFT */}
          <motion.div
            className={s.heroLeft}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease }}
          >
            <div className={s.eyebrow}>
              <span className={s.eyebrowDot} />
              AI-Powered Health Tracker
            </div>

            <h1 className={s.heroH1}>
              Know exactly<br />what your body<br /><em>actually needs.</em>
            </h1>

            <p className={s.heroSub}>
              Vital Box tracks your BMI and health metrics, then uses AI
              to build a personalised supplement plan grounded in medical
              logic, not marketing.
            </p>

            <div className={s.ctaRow}>
              <button
                className={s.ctaPrimary}
                onClick={() => { window.location.hash = "#bmi"; }}
              >
                See what your body needs
                <ArrowRight />
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.2, ease }}
          >
            <AppPreviewCard />
          </motion.div>

        </div>
      </section>

      <div className={s.heroBridge} aria-hidden />

      <div className={s.body}>

        {/* HOW IT WORKS */}
        <div className={s.section}>
          <Reveal>
            <span className={s.sectionLabel}>How it works</span>
            <h2 className={s.h2}>From first log to <em>full plan</em> in minutes.</h2>
            <p className={s.sectionSub}>
              Four clean steps from your data to a plan you can trust.
            </p>
          </Reveal>
          <Reveal stagger>
            <div className={s.stepsGrid}>
              {steps.map((step) => (
                <div key={step.num} className={s.stepCard}>
                  <span className={s.stepNum}>{step.num}</span>
                  <div className={s.stepIcon}><step.icon /></div>
                  <div className={s.stepTitle}>{step.title}</div>
                  <div className={s.stepDesc}>{step.desc}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        {/* BIG STAT — scroll stopper */}
        <Reveal>
          <div className={s.bigStat}>
            <div className={s.bigStatInner}>
              <div className={s.bigStatNum}>94<em>%</em></div>
              <div className={s.bigStatLabel}>
                of users get a complete, medically verified supplement
                plan in under 90 seconds.
              </div>
            </div>
          </div>
        </Reveal>

        {/* BENTO */}
        <div className={s.section}>
          <Reveal>
            <span className={s.sectionLabel}>What makes it different</span>
            <h2 className={s.h2}>Built around <em>your data</em>, not generic advice.</h2>
            <p className={s.sectionSub}>
              Everything ties back to your actual numbers, not a one-size-fits-all stack.
            </p>
          </Reveal>
          <Reveal stagger>
            <div className={s.bentoGrid}>
              {features.map((f) => (
                <div key={f.title} className={`${s.bentoCard} ${f.dark ? s.bentoCardDark : ""}`}>
                  <div className={`${s.bentoIconBox} ${f.dark ? s.bentoIconBoxDark : ""}`}>
                    <f.icon />
                  </div>
                  <div className={s.bentoCardTitle}>{f.title}</div>
                  <div className={s.bentoCardDesc}>{f.desc}</div>
                  {f.metric && (
                    <div className={`${s.bentoMetric} ${f.dark ? s.bentoMetricDark : ""}`}>
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
                <t.icon />
                <span>{t.label}</span>
              </div>
            ))}
          </div>
        </Reveal>

        {/* TRACKER CTA STRIP */}
        <div className={s.section} style={{ paddingTop: "48px" }}>
          <Reveal>
            <div className={s.trackerStrip}>
              <div>
                <div className={s.trackerHeadline}>
                  Your BMI is the <em>starting point</em>,<br />not the end.
                </div>
                <div className={s.trackerDesc}>
                  Log it today. Come back next month. Watch Vital Box refine
                  your plan as your body changes.
                </div>
              </div>
              <div className={s.trackerAction}>
                <button
                  className={s.ctaPrimary}
                  onClick={() => { window.location.hash = "#bmi"; }}
                >
                  Log your BMI
                  <ArrowRight />
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
            <h2 className={s.ctaSectionH2}>
              Stop guessing.<br />Start knowing.
            </h2>
            <p className={s.ctaSectionSub}>
              Your supplement plan should come from your data, not a trending video.
              Start with your BMI and let the AI do the rest.
            </p>
          </div>
        </Reveal>
      </section>

      {/* FOOTER */}
      <div className={s.footerOuter}>
        <footer className={s.footer}>
          <div className={s.footerLogo}>
            <span className={s.footerLogoDot} />
            <span className={s.footerLogoText}>Vital Box</span>
          </div>
          <p className={s.footerTagline}>Supplements that make sense for you.</p>
          <span className={s.footerCopy}>© 2026 Vital Box</span>
        </footer>
      </div>

    </div>
  );
}