import Link from "next/link";

const features = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7">
        <path
          d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
    ),
    title: "برنامج فوري بالذكاء الاصطناعي",
    desc: "تدخل بياناتك ويطلع لك برنامج تمارين ووجبات مخصص لك في دقيقتين.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7">
        <path
          d="M4 19V6M4 19h16M4 19l5-6 4 3 6-8"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "خطة تناسب مستواك وهدفك",
    desc: "سواء بيتك أو النادي، مبتدئ أو متوسط، البرنامج يتكيف معك بالكامل.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7">
        <path
          d="M12 21s-7-4.35-9.5-8.6C.7 8.6 2.4 5 6 5c2 0 3.3 1.1 4 2 .7-.9 2-2 4-2 3.6 0 5.3 3.6 3.5 7.4C19 16.65 12 21 12 21Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "متابعة تحفيزية يومية",
    desc: "رسائل تشجيعية وتحليل BMI فوري يخليك مستمر على هدفك.",
  },
];

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 bg-grid-glow" />

      <nav className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-navy">
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
              <path
                d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z"
                fill="currentColor"
              />
            </svg>
          </span>
          <span className="text-xl font-extrabold">اتحرك</span>
        </div>
        <Link href="/form" className="btn-secondary text-sm">
          ابدأ الآن
        </Link>
      </nav>

      <section className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-6 pb-24 pt-16 text-center sm:pt-24">
        <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
          مدعوم بالذكاء الاصطناعي
        </span>

        <h1 className="text-balance text-4xl font-extrabold leading-tight sm:text-6xl">
          برنامجك الرياضي
          <br />
          <span className="bg-gradient-to-l from-primary to-accent bg-clip-text text-transparent">
            في دقيقتين
          </span>
        </h1>

        <p className="mt-6 max-w-xl text-balance text-lg text-gray-400">
          سواء تبي تنحف أو تضخم أو تحافظ على لياقتك، اتحرك يبني لك برنامج
          تمارين ووجبات مخصص حسب بياناتك وهدفك — مجاناً وفوراً.
        </p>

        <Link href="/form" className="btn-primary mt-10 text-xl">
          ابدأ مجاناً
          <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
            <path
              d="M10 17l-5-5 5-5M5 12h14"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>

        <p className="mt-4 text-sm text-gray-500">
          بدون تسجيل مسبق &middot; النتيجة خلال دقيقتين
        </p>

        <div className="mt-20 grid w-full grid-cols-1 gap-5 sm:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="glass-card animate-float rounded-2xl p-6 text-right"
              style={{ animationDelay: "0s" }}
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                {f.icon}
              </div>
              <h3 className="mb-2 text-lg font-bold">{f.title}</h3>
              <p className="text-sm leading-relaxed text-gray-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="relative z-10 border-t border-border py-6 text-center text-sm text-gray-500">
        اتحرك &middot; اسم مؤقت للمشروع
      </footer>
    </main>
  );
}
