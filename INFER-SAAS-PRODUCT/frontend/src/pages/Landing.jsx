import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  FlaskConical,
  Activity,
  Sparkles,
  Layers,
  AlertOctagon,
  Github,
  Twitter,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Nav />
      <Hero />
      <TrustStrip />
      <HowItWorks />
      <FeatureGrid />
      <ProductPreview />
      <BuiltFor />
      <CTABanner />
      <Footer />
    </div>
  );
}

const Nav = () => (
  <nav className="sticky top-0 z-30 border-b border-slate-200/80 bg-slate-50/80 backdrop-blur">
    <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
      <Link to="/" className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-950 text-white">
          <FlaskConical className="h-4 w-4" />
        </div>
        <span className="font-display text-2xl italic leading-none text-slate-900">
          infer
        </span>
      </Link>
      <div className="hidden items-center gap-8 text-sm text-slate-600 md:flex">
        <a href="#how" className="hover:text-slate-900">
          How it works
        </a>
        <a href="#features" className="hover:text-slate-900">
          Features
        </a>
        <a href="#built-for" className="hover:text-slate-900">
          For teams
        </a>
        <a href="#" className="hover:text-slate-900">
          Docs
        </a>
      </div>
      <Link to="/app">
        <Button size="sm" data-testid="nav-cta">
          Try the demo
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Button>
      </Link>
    </div>
  </nav>
);

const Hero = () => (
  <section className="relative overflow-hidden">
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-emerald-200/40 blur-3xl" />
      <div className="absolute right-0 top-32 h-72 w-72 rounded-full bg-amber-100/50 blur-3xl" />
    </div>
    <div className="relative mx-auto max-w-6xl px-6 pb-24 pt-16 sm:pt-24">
      <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">
            <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Built for data teams shipping experiments weekly
          </div>
          <h1
            className="mt-6 font-display text-5xl leading-[1.04] tracking-tight text-slate-950 sm:text-6xl lg:text-[80px]"
            data-testid="hero-headline"
          >
            Understand <span className="italic text-emerald-700">causality</span>,
            <br />
            not just correlation.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
            <span className="font-semibold text-slate-900">infer</span> is a
            causal inference engine for A/B tests. Drop a CSV — get the lift,
            confidence interval, CUPED-adjusted estimate, and segment-level
            effects in seconds.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link to="/app">
              <Button size="lg" data-testid="hero-cta-primary">
                Upload an experiment
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/app">
              <Button
                variant="secondary"
                size="lg"
                data-testid="hero-cta-secondary"
              >
                Try with sample data
              </Button>
            </Link>
          </div>
          <p className="mt-5 text-xs text-slate-500">
            No login. No data leaves your browser in demo mode.
          </p>
        </div>

        <div className="lg:col-span-5">
          <HeroCard />
        </div>
      </div>
    </div>
  </section>
);

const HeroCard = () => (
  <div className="relative">
    <div className="absolute -inset-4 -z-10 rounded-[32px] bg-gradient-to-br from-emerald-200/50 via-white to-amber-100/40 blur-2xl" />
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_60px_-20px_rgba(15,23,42,0.18)]">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
          Live result
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
          <Check className="h-3 w-3" /> p = 0.021
        </span>
      </div>
      <p className="mt-4 font-display text-7xl leading-none tracking-tight text-slate-950">
        +3.1%
      </p>
      <p className="mt-2 text-sm text-slate-500">
        Conversion lift · 95% CI [+0.5%, +5.7%]
      </p>

      <div className="mt-6 space-y-2">
        {[
          { label: "new", v: 5.1, color: "bg-emerald-500" },
          { label: "returning", v: 1.9, color: "bg-emerald-400" },
          { label: "power", v: 0.8, color: "bg-emerald-300" },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-3 text-xs">
            <span className="w-20 capitalize text-slate-500">{s.label}</span>
            <div className="h-2 flex-1 rounded-full bg-slate-100">
              <div
                className={`h-2 rounded-full ${s.color}`}
                style={{ width: `${(s.v / 6) * 100}%` }}
              />
            </div>
            <span className="w-12 text-right font-mono text-slate-700">
              +{s.v}%
            </span>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl bg-slate-950 p-4 text-xs text-white/80">
        <p className="font-display text-base italic leading-snug text-white">
          "Treatment caused a 3.1% lift in conversion. Effect strongest among
          new users."
        </p>
        <p className="mt-2 font-mono text-[10px] text-emerald-400">
          inference engine v0.4
        </p>
      </div>
    </div>
  </div>
);

const TrustStrip = () => (
  <div className="border-y border-slate-200/80 bg-white">
    <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-12 gap-y-4 px-6 py-8 text-sm text-slate-400">
      <span className="text-xs uppercase tracking-[0.18em] text-slate-500">
        In the toolbox at
      </span>
      {["Northwind", "Helix Labs", "Parallax", "Atlas Growth", "Kindred"].map(
        (n) => (
          <span
            key={n}
            className="font-display text-2xl italic tracking-tight text-slate-700"
          >
            {n}
          </span>
        ),
      )}
    </div>
  </div>
);

const steps = [
  {
    n: "01",
    title: "Upload your CSV",
    body: "Event-level data with user_id, variant, and your metric of interest. Optional pre-period and segment columns unlock more.",
  },
  {
    n: "02",
    title: "We run the math",
    body: "ATE estimation, robust standard errors, CUPED variance reduction, segment-level CATE, and an SRM diagnostic.",
  },
  {
    n: "03",
    title: "Ship with confidence",
    body: "Plain-English summary, sticky alerts when assignment is broken, and exportable cards your PM will actually read.",
  },
];

const HowItWorks = () => (
  <section id="how" className="relative py-28">
    <div className="mx-auto max-w-6xl px-6">
      <div className="max-w-2xl">
        <span className="text-xs font-medium uppercase tracking-[0.18em] text-emerald-700">
          How it works
        </span>
        <h2 className="mt-3 font-display text-4xl tracking-tight text-slate-950 sm:text-5xl">
          From CSV to causal inference in three steps.
        </h2>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-3">
        {steps.map((s, i) => (
          <div
            key={s.n}
            className="relative rounded-2xl border border-slate-200 bg-white p-7"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-slate-400">{s.n}</span>
              {i < steps.length - 1 && (
                <ArrowRight className="h-4 w-4 text-slate-300" />
              )}
            </div>
            <h3 className="mt-6 font-display text-2xl leading-snug tracking-tight text-slate-950">
              {s.title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-500">
              {s.body}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const features = [
  {
    icon: Activity,
    title: "ATE estimation",
    body: "Average Treatment Effect with robust HC2 standard errors and proper 95% confidence intervals — no spreadsheet hacks.",
    accent: "text-emerald-700 bg-emerald-50",
  },
  {
    icon: Sparkles,
    title: "CUPED variance reduction",
    body: "Use a pre-period covariate to shrink your confidence interval by 30–50%. Smaller samples, faster decisions.",
    accent: "text-blue-700 bg-blue-50",
  },
  {
    icon: Layers,
    title: "Segment-level CATE",
    body: "Heterogeneous treatment effects by cohort: see where the lift is real, where it's noise, and where it reverses.",
    accent: "text-amber-700 bg-amber-50",
  },
  {
    icon: AlertOctagon,
    title: "SRM detection",
    body: "Sample Ratio Mismatch alerts when randomisation is broken — before you ship a result that isn't real.",
    accent: "text-rose-700 bg-rose-50",
  },
];

const FeatureGrid = () => (
  <section id="features" className="bg-slate-950 py-28 text-white">
    <div className="mx-auto max-w-6xl px-6">
      <div className="max-w-2xl">
        <span className="text-xs font-medium uppercase tracking-[0.18em] text-emerald-400">
          What's inside
        </span>
        <h2 className="mt-3 font-display text-4xl tracking-tight text-white sm:text-5xl">
          The statistics layer your{" "}
          <span className="italic text-emerald-300">A/B tool</span> never had.
        </h2>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/60">
          Most experimentation platforms stop at "treatment beat control" with a
          p-value. infer keeps going — into segment effects, variance
          reduction, and assignment diagnostics.
        </p>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 sm:grid-cols-2">
        {features.map((f) => (
          <div
            key={f.title}
            className="bg-slate-950 p-8 transition hover:bg-slate-900/80"
          >
            <div
              className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${f.accent}`}
            >
              <f.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-6 font-display text-2xl tracking-tight text-white">
              {f.title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-white/60">
              {f.body}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const ProductPreview = () => (
  <section className="relative bg-gradient-to-b from-slate-50 to-white py-28">
    <div className="mx-auto max-w-6xl px-6">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-xs font-medium uppercase tracking-[0.18em] text-emerald-700">
          The product
        </span>
        <h2 className="mt-3 font-display text-4xl tracking-tight text-slate-950 sm:text-5xl">
          Built like a tool you'd actually keep open.
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-slate-500 sm:text-base">
          A clean dashboard, sensible defaults, and the statistics that matter
          — front and center.
        </p>
      </div>

      <div className="relative mx-auto mt-14 max-w-5xl">
        <div className="absolute -inset-6 -z-10 rounded-[40px] bg-gradient-to-br from-emerald-200/40 via-white to-amber-100/40 blur-2xl" />
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_40px_80px_-30px_rgba(15,23,42,0.25)]">
          <div className="flex items-center gap-1.5 border-b border-slate-200 bg-slate-50 px-4 py-3">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
            <span className="ml-3 font-mono text-xs text-slate-400">
              app.infer.dev/experiments/checkout-funnel-v3
            </span>
          </div>
          <DashboardMock />
        </div>
      </div>
    </div>
  </section>
);

const DashboardMock = () => (
  <div className="grid grid-cols-12 gap-0">
    <div className="col-span-3 border-r border-slate-200 bg-slate-50/60 p-5">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-950 text-white">
          <FlaskConical className="h-3.5 w-3.5" />
        </div>
        <span className="font-display text-lg italic text-slate-900">
          infer
        </span>
      </div>
      <div className="mt-8 space-y-1">
        <div className="rounded-md bg-slate-950 px-2.5 py-1.5 text-xs text-white">
          Results
        </div>
        <div className="px-2.5 py-1.5 text-xs text-slate-500">Upload</div>
        <div className="px-2.5 py-1.5 text-xs text-slate-500">History</div>
      </div>
    </div>
    <div className="col-span-9 p-7">
      <div className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
        Inference report
      </div>
      <div className="mt-1.5 font-display text-2xl text-slate-950">
        Experiment results
      </div>
      <div className="mt-5 grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-[10px] uppercase tracking-wider text-slate-400">
            ATE
          </p>
          <p className="mt-1 font-display text-3xl text-slate-950">+3.1%</p>
          <p className="mt-1 font-mono text-[10px] text-slate-500">
            CI [+0.5%, +5.7%]
          </p>
        </div>
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
          <p className="text-[10px] uppercase tracking-wider text-blue-700/70">
            CUPED
          </p>
          <p className="mt-1 font-display text-3xl text-blue-950">+3.4%</p>
          <p className="mt-1 text-[10px] text-blue-700">
            38% less variance needed
          </p>
        </div>
      </div>
      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-[10px] uppercase tracking-wider text-slate-400">
          CATE by segment
        </p>
        <div className="mt-3 flex h-20 items-end gap-3">
          {[5.1, 1.9, 0.8].map((v, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-1">
              <div
                className="w-full rounded-t bg-emerald-500"
                style={{ height: `${(v / 6) * 100}%` }}
              />
              <span className="text-[10px] text-slate-400">
                {["new", "returning", "power"][i]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const personas = [
  {
    role: "Data scientists",
    body: "Stop hand-rolling Jupyter notebooks for every test. Get the same statistics — but in a UI your stakeholders can read.",
  },
  {
    role: "Product managers",
    body: "Skip the back-and-forth on 'is this significant?' — get a plain-English answer with the caveats baked in.",
  },
  {
    role: "Growth teams",
    body: "Run more tests with smaller samples. CUPED + segment-level CATE means you ship faster and waste less traffic.",
  },
];

const BuiltFor = () => (
  <section id="built-for" className="bg-white py-28">
    <div className="mx-auto max-w-6xl px-6">
      <div className="max-w-2xl">
        <span className="text-xs font-medium uppercase tracking-[0.18em] text-emerald-700">
          Built for
        </span>
        <h2 className="mt-3 font-display text-4xl tracking-tight text-slate-950 sm:text-5xl">
          Whoever owns the test plan.
        </h2>
      </div>
      <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
        {personas.map((p) => (
          <div
            key={p.role}
            className="group rounded-2xl border border-slate-200 p-7 transition hover:border-slate-950 hover:shadow-lg"
          >
            <h3 className="font-display text-2xl tracking-tight text-slate-950">
              {p.role}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-500">
              {p.body}
            </p>
            <div className="mt-6 inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
              Read more <ArrowUpRight className="h-3.5 w-3.5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const CTABanner = () => (
  <section className="px-6 pb-24">
    <div className="mx-auto max-w-6xl">
      <div className="relative overflow-hidden rounded-3xl bg-slate-950 px-8 py-16 text-center sm:px-16">
        <div className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 30% 30%, white 1.5px, transparent 1.5px)",
            backgroundSize: "20px 20px",
          }}
        />
        <div className="relative">
          <h2 className="font-display text-4xl tracking-tight text-white sm:text-6xl">
            Ship the test.{" "}
            <span className="italic text-emerald-300">Trust the result.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-sm text-white/60 sm:text-base">
            Drop in your CSV — get a full causal inference report in under two
            seconds.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link to="/app">
              <Button variant="accent" size="lg">
                Open the dashboard
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="border-t border-slate-200 bg-slate-50 py-12">
    <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-6 sm:flex-row sm:items-center">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-950 text-white">
          <FlaskConical className="h-3.5 w-3.5" />
        </div>
        <span className="font-display text-xl italic text-slate-900">
          infer
        </span>
        <span className="ml-3 text-xs text-slate-400">
          © 2026 — a causal inference engine
        </span>
      </div>
      <div className="flex items-center gap-6 text-xs text-slate-500">
        <a href="#" className="hover:text-slate-900">
          Privacy
        </a>
        <a href="#" className="hover:text-slate-900">
          Terms
        </a>
        <a href="#" className="hover:text-slate-900">
          Changelog
        </a>
        <a href="#" className="text-slate-400 hover:text-slate-900">
          <Github className="h-4 w-4" />
        </a>
        <a href="#" className="text-slate-400 hover:text-slate-900">
          <Twitter className="h-4 w-4" />
        </a>
      </div>
    </div>
  </footer>
);
