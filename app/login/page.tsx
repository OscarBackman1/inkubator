import { loginAction } from "@/lib/actions/auth";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const query = await searchParams;
  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-4">
      <section className="w-full max-w-md rounded border border-stone-200 bg-white p-8 shadow-soft">
        <p className="text-sm uppercase tracking-wide text-forest">Movexum</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">Impact Navigator</h1>
        <p className="mt-3 text-sm leading-6 text-stone-600">
          Logga in för att skapa, följa upp och jämföra hållbarhetsbedömningar av startups.
        </p>
        {query.error && (
          <p className="mt-4 rounded border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
            Fel e-post eller lösenord.
          </p>
        )}
        <form action={loginAction} className="mt-6 space-y-4">
          <label className="block text-sm font-medium">
            E-post
            <input
              name="email"
              type="email"
              defaultValue="admin@movexum.se"
              className="mt-1 w-full rounded border border-stone-300 px-3 py-2"
              required
            />
          </label>
          <label className="block text-sm font-medium">
            Lösenord
            <input
              name="password"
              type="password"
              defaultValue="demo"
              className="mt-1 w-full rounded border border-stone-300 px-3 py-2"
              required
            />
          </label>
          <button className="w-full rounded bg-forest px-4 py-2.5 font-medium text-white hover:bg-emerald-800">
            Logga in
          </button>
        </form>
      </section>
    </main>
  );
}
