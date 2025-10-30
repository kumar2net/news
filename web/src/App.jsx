import NewsSearch from "./components/NewsSearch";

export default function App() {
  return (
    <div className="min-h-screen bg-[#f4f6f8] text-slate-800">
      <header className="sticky top-0 z-40 border-b border-white/60 bg-white/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#5e35b1] to-[#7c4dff] text-lg font-semibold text-white shadow-lg">
              NK
            </span>
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.3em] text-[#5e35b1]">
                News Kumar
              </p>
              <h1 className="text-lg font-semibold text-slate-900">
                My News My Way - simple & un-cluttered
              </h1>
            </div>
          </div>

          <nav className="hidden gap-6 text-sm font-medium text-slate-500 sm:flex">
            <a className="text-[#5e35b1]" href="#">
              Discover
            </a>
            <a className="transition hover:text-[#5e35b1]" href="#">
              Trends
            </a>
            <a className="transition hover:text-[#5e35b1]" href="#">
              Sources
            </a>
            <a className="transition hover:text-[#5e35b1]" href="#">
              Alerts
            </a>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-5 pb-16 pt-10 sm:px-8">
        <section className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#5e35b1]">
              Today’s Briefing
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900 sm:text-4xl">
              Curate the headlines that matter
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-500 sm:text-base">
              Powered by NewsAPI.org. Enter comma separated topics and review
              fresh coverage side-by-side. Built with the Berry admin aesthetic.
            </p>
          </div>
        </section>

        <NewsSearch />
      </main>
    </div>
  );
}
