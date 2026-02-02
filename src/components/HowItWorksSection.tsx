import { motion } from "framer-motion";

export function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Tell us how you train",
      description:
        "Drop in your BMI, training split, weekly schedule, and budget. It takes about two minutes.",
    },
    {
      number: "02",
      title: "We build your stack",
      description:
        "We match products to your block: volume, intensity, or maintenance phases are treated differently.",
    },
    {
      number: "03",
      title: "You review and tweak",
      description:
        "See the full box before it ships. Swap flavors, remove items you already have, or adjust spend.",
    },
    {
      number: "04",
      title: "Box ships each month",
      description:
        "Your stack updates when your plan changes, so your supplements move with your training—not behind it.",
    },
  ];

  return (
    <section id="how-it-works" className="px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 text-center"
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
            How it works
          </p>
          <h2 className="mb-3 text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
            From intake to box in four steps
          </h2>
          <p className="mx-auto max-w-2xl text-sm text-slate-600 md:text-base">
            No buzzwords, just a simple flow: give us your details, review your box, and keep control
            before anything leaves the warehouse.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, idx) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.06 }}
              className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:-translate-y-1 hover:shadow-md transition"
            >
              <span className="mb-4 inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                {step.number}
              </span>
              <p className="mb-2 text-sm font-semibold text-slate-900">{step.title}</p>
              <p className="text-xs text-slate-600">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
