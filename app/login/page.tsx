import { loginAction } from "@/lib/actions/auth";
import { SustainabilityBackground } from "@/components/SustainabilityBackground";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const query = await searchParams;
  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-paper px-4 py-10 sm:px-6">
      <SustainabilityBackground />
      <section className="w-full max-w-[440px] rounded-lg border border-white/70 bg-white/85 p-8 shadow-[0_22px_70px_rgba(23,33,31,0.12)] backdrop-blur-md sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-forest">Movexum</p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight text-ink sm:text-4xl">Impact Navigator</h1>
        <p className="mt-4 text-sm leading-6 text-stone-600">
          Bedöm, följ upp och stärk hållbarhetsarbetet i portföljbolag.
        </p>
        {query.error && (
          <p className="mt-5 rounded border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
            Fel e-post eller lösenord.
          </p>
        )}
        <form action={loginAction} className="mt-8 space-y-5">
          <label className="block text-sm font-medium text-ink">
            E-post
            <input
              name="email"
              type="email"
              placeholder="namn@movexum.se"
              className="mt-2 w-full rounded border border-stone-300 bg-white/90 px-3.5 py-2.5 text-ink shadow-sm transition placeholder:text-stone-400 focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/15"
              required
            />
          </label>
          <label className="block text-sm font-medium text-ink">
            Lösenord
            <input
              name="password"
              type="password"
              placeholder="Lösenord"
              className="mt-2 w-full rounded border border-stone-300 bg-white/90 px-3.5 py-2.5 text-ink shadow-sm transition placeholder:text-stone-400 focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/15"
              required
            />
          </label>
          <button className="w-full rounded bg-forest px-4 py-3 font-medium text-white shadow-sm transition hover:bg-emerald-800 active:bg-emerald-900 focus:outline-none focus:ring-2 focus:ring-forest/25 focus:ring-offset-2 focus:ring-offset-white">
            Logga in
          </button>
        </form>
      </section>
    </main>
  );
}
