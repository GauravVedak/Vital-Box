"use client";

import { useState } from "react";
import { Ruler, Scale } from "lucide-react";
import { useAuth } from "../AuthContext";
import { getBMICategoryData } from "./data";
import s from "./BMICalculatorPage.module.css";

interface BMICalculatorPageProps {
  onSignInClick?: () => void;
}

interface BMIResult {
  value: number;
  category: string;
  healthNote: string;
  color: string;
  aiRecommendation?: string;
  healthRisks?: string[];
  actionItems?: string[];
  lifestyleTips?: string[];
}

type Unit = "metric" | "imperial";

function badgeClass(category: string): string {
  if (category === "Underweight") return s.badgeBlue;
  if (category === "Normal Weight") return s.badgeGreen;
  if (category === "Overweight") return s.badgeOrange;
  return s.badgeRed;
}

/** Map BMI 10–40 → 0–100% for the scale thumb */
function bmiPct(bmi: number): number {
  return Math.min(100, Math.max(0, ((bmi - 10) / 30) * 100));
}

export function BMICalculatorPage({ onSignInClick }: BMICalculatorPageProps) {
  const { user, updateFitnessMetrics } = useAuth();

  const [height,       setHeight]       = useState("");
  const [weight,       setWeight]       = useState("");
  const [unit,         setUnit]         = useState<Unit>("metric");
  const [result,       setResult]       = useState<BMIResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error,        setError]        = useState<string | null>(null);

  /* ── Validation ──────────────────────────────────────────────────────────── */
  const validate = (): string | null => {
    const h = parseFloat(height);
    const w = parseFloat(weight);
    if (isNaN(h) || isNaN(w) || h <= 0 || w <= 0)
      return "Please enter valid positive numbers.";
    const minH = unit === "metric" ?  50 :  20;
    const maxH = unit === "metric" ? 250 : 100;
    const minW = unit === "metric" ?  20 :  40;
    const maxW = unit === "metric" ? 300 : 700;
    if (h < minH || h > maxH)
      return `Height must be ${minH}–${maxH} ${unit === "metric" ? "cm" : "in"}.`;
    if (w < minW || w > maxW)
      return `Weight must be ${minW}–${maxW} ${unit === "metric" ? "kg" : "lbs"}.`;
    return null;
  };

  /* ── Calculate ───────────────────────────────────────────────────────────── */
  const calculateBMI = async () => {
    setError(null);
    const err = validate();
    if (err) { setError(err); return; }

    const h = parseFloat(height);
    const w = parseFloat(weight);
    const bmi = unit === "metric"
      ? w / ((h / 100) ** 2)
      : (w / (h ** 2)) * 703;

    const rounded   = Math.round(bmi * 10) / 10;
    const catData   = getBMICategoryData(bmi);
    const bmiResult: BMIResult = { value: rounded, ...catData };
    setResult(bmiResult);

    if (user) {
      setIsSubmitting(true);
      try {
        await updateFitnessMetrics({
          latestBMI: {
            value:    bmiResult.value,
            category: bmiResult.category,
            height: h,
            weight: w,
            unit,
            date: new Date().toISOString(),
          },
          height: h,
          weight: w,
          unit,
        });
      } catch (e: unknown) {
        console.error("Failed to save BMI:", e);
        setError(e instanceof Error ? e.message : "Failed to save BMI data.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  /* ── Split value into integer + decimal string ───────────────────────────── */
  const bmiInt = result ? Math.floor(result.value)                               : null;
  const bmiFrac = result ? "." + result.value.toFixed(1).split(".")[1]           : null;

  return (
    <div className={s.root}>
      <div className={s.inner}>

        {/* Page heading */}
        <div className={s.pageHead}>
          <div className={s.eyebrow}>
            <span className={s.eyebrowDot} />
            Health Metrics
          </div>
          <h1 className={s.pageTitle}>
            BMI <span className={s.pageTitleAccent}>Calculator</span>
          </h1>
        </div>

        {/* Card */}
        <div className={s.card}>

          {/* Unit toggle */}
          <div className={s.toggle}>
            <button
              className={`${s.toggleBtn} ${unit === "metric" ? s.toggleActive : ""}`}
              onClick={() => { setUnit("metric");   setResult(null); setError(null); }}
            >
              Metric · cm / kg
            </button>
            <button
              className={`${s.toggleBtn} ${unit === "imperial" ? s.toggleActive : ""}`}
              onClick={() => { setUnit("imperial"); setResult(null); setError(null); }}
            >
              Imperial · in / lbs
            </button>
          </div>

          {/* Inputs */}
          <div className={s.fields}>
            <div>
              <div className={s.fieldLabel}>
                <Ruler size={12} className={s.fieldIcon} />
                Height&nbsp;
                <span style={{ textTransform: "none", letterSpacing: 0, fontWeight: 500 }}>
                  ({unit === "metric" ? "cm" : "inches"})
                </span>
              </div>
              <input
                type="number"
                inputMode="decimal"
                className={s.input}
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder={unit === "metric" ? "170" : "67"}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <div className={s.fieldLabel}>
                <Scale size={12} className={s.fieldIcon} />
                Weight&nbsp;
                <span style={{ textTransform: "none", letterSpacing: 0, fontWeight: 500 }}>
                  ({unit === "metric" ? "kg" : "lbs"})
                </span>
              </div>
              <input
                type="number"
                inputMode="decimal"
                className={s.input}
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder={unit === "metric" ? "70" : "154"}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Inline error */}
          {error && <p className={s.error}>{error}</p>}

          {/* Calculate */}
          <button
            className={s.calcBtn}
            onClick={calculateBMI}
            disabled={!height || !weight || isSubmitting}
          >
            {isSubmitting ? "Saving…" : "Calculate BMI"}
          </button>

          {/* ── Result ── */}
          {result && (
            <>
              <div className={s.sep} />

              <div className={s.result}>

                {/* Score row */}
                <div className={s.scoreRow}>
                  <div>
                    <div className={s.scoreNum}>
                      {bmiInt}
                      <span className={s.scoreFrac}>{bmiFrac}</span>
                    </div>
                    <div className={s.scoreUnit}>BMI index</div>
                  </div>
                  <span className={`${s.badge} ${badgeClass(result.category)}`}>
                    {result.category}
                  </span>
                </div>

                {/* Scale bar */}
                <div className={s.scaleWrap}>
                  <div className={s.scaleTrack}>
                    <div
                      className={s.scaleThumb}
                      style={{ left: `${bmiPct(result.value)}%` }}
                    />
                  </div>
                  <div className={s.scaleLabels}>
                    <span className={s.scaleLabel}>Under</span>
                    <span className={s.scaleLabel}>Normal</span>
                    <span className={s.scaleLabel}>Over</span>
                    <span className={s.scaleLabel}>Obese</span>
                  </div>
                </div>

                {/* Health note */}
                <div className={s.note}>
                  {result.aiRecommendation ?? result.healthNote}
                </div>

                {/* Info lists */}
                <div className={s.infoGrid}>
                  {(result.actionItems?.length ?? 0) > 0 && (
                    <div>
                      <p className={s.infoTitle}>Action steps</p>
                      <ul className={s.infoList}>
                        {result.actionItems!.map((item, i) => (
                          <li key={i} className={s.infoItem}>
                            <span className={s.infoDot} />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {(result.lifestyleTips?.length ?? 0) > 0 && (
                    <div>
                      <p className={s.infoTitle}>Lifestyle tips</p>
                      <ul className={s.infoList}>
                        {result.lifestyleTips!.map((tip, i) => (
                          <li key={i} className={s.infoItem}>
                            <span className={s.infoDot} />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {(result.healthRisks?.length ?? 0) > 0 && (
                    <div>
                      <p className={s.infoTitle}>Health risks</p>
                      <ul className={s.infoList}>
                        {result.healthRisks!.map((risk, i) => (
                          <li key={i} className={s.infoItem}>
                            <span className={s.infoDotRed} />
                            {risk}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Guest CTA */}
                {!user && onSignInClick && (
                  <div className={s.guestCta}>
                    <div className={s.guestCtaText}>
                      <strong>Save your results</strong>
                      Sign in to track progress and get AI guidance.
                    </div>
                    <button className={s.guestCtaBtn} onClick={onSignInClick}>
                      Sign in
                    </button>
                  </div>
                )}

                {/* Saving indicator */}
                {isSubmitting && (
                  <div className={s.saving}>
                    <div className={s.savingDot} />
                    Saving to your profile…
                  </div>
                )}

              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}