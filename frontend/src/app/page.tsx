import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 flex flex-col justify-between p-6 sm:p-12 font-sans">
      <header className="flex items-center justify-between border-b border-neutral-800 pb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-600 flex items-center justify-center font-bold text-xl text-white shadow-lg shadow-amber-600/30">
            ☕
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">BrewLite</h1>
            <p className="text-xs text-neutral-400">Cashless Coffee Ordering</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            ● Sprint 1 - Task 1 Ready
          </span>
        </div>
      </header>

      <main className="flex flex-col items-center justify-center text-center max-w-2xl mx-auto py-16">
        <div className="inline-block p-3 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20 mb-6 text-sm font-semibold">
          Bài tập lớn Công nghệ Phần mềm — ĐH Sài Gòn
        </div>
        <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight mb-4">
          Cà phê liền tay, <br />
          <span className="text-amber-500">không lo tiền mặt</span>.
        </h2>
        <p className="text-neutral-400 text-base sm:text-lg mb-8 leading-relaxed">
          Hệ thống đặt đồ uống không dùng tiền mặt BrewLite giúp tiết kiệm thời gian xếp hàng,
          chọn size/topping nhanh chóng và thanh toán tức thì.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full text-left">
          <div className="p-4 rounded-xl bg-neutral-800/60 border border-neutral-700/60">
            <div className="text-xs uppercase tracking-wider text-neutral-400 mb-1">Frontend</div>
            <div className="text-base font-semibold text-white">Next.js 16 + TailwindCSS</div>
            <div className="text-xs text-emerald-400 mt-2">● App Router Initialized</div>
          </div>
          <div className="p-4 rounded-xl bg-neutral-800/60 border border-neutral-700/60">
            <div className="text-xs uppercase tracking-wider text-neutral-400 mb-1">Backend API</div>
            <div className="text-base font-semibold text-white">NestJS + TypeScript</div>
            <div className="text-xs text-emerald-400 mt-2">● REST API on Port 3001</div>
          </div>
        </div>
      </main>

      <footer className="border-t border-neutral-800 pt-6 text-center text-xs text-neutral-500">
        BrewLite MVP © 2026 — Xây dựng theo quy trình Agile Scrum
      </footer>
    </div>
  );
}
