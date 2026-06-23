import { redirect } from "next/navigation";
import { addNoteAction } from "@/lib/actions/company";
import { prisma } from "@/lib/db/prisma";

export default async function NotesPage({ params }: { params: Promise<{ companyId: string }> }) {
  const { companyId } = await params;
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: { notes: { orderBy: { createdAt: "desc" }, include: { user: true } } }
  });
  if (!company) redirect("/companies");

  return (
    <div>
      <div className="mb-6">
        <p className="text-sm uppercase tracking-wide text-stone-500">Anteckningar</p>
        <h1 className="text-3xl font-semibold">{company.name}</h1>
      </div>
      <form action={addNoteAction.bind(null, company.id)} className="mb-5 rounded border border-stone-200 bg-white p-5 shadow-soft">
        <textarea name="body" rows={4} placeholder="Skriv intern anteckning..." className="w-full rounded border border-stone-300 px-3 py-2" />
        <button className="mt-3 rounded bg-forest px-4 py-2 font-medium text-white hover:bg-emerald-800">Spara anteckning</button>
      </form>
      <div className="grid gap-3">
        {company.notes.map((note) => (
          <article key={note.id} className="rounded border border-stone-200 bg-white p-4">
            <p className="whitespace-pre-wrap text-stone-700">{note.body}</p>
            <p className="mt-3 text-xs text-stone-500">
              {note.user.name} · {note.createdAt.toLocaleString("sv-SE")}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
