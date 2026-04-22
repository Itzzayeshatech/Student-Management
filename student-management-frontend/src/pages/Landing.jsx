import Button from "../components/Button";

export default function Landing({ onStart }) {
  return (
    <main className="min-h-[80vh] flex flex-col items-center justify-center text-center px-6">
      <div className="max-w-3xl">
        <h1 className="text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Manage Students with <span className="text-indigo-600">Precision.</span>
        </h1>
        <p className="mt-6 text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
          A powerful, clean architecture student management system designed for scalability and ease of use. Handle CRUD operations with a premium interface.
        </p>

        <section className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={onStart} text="View Dashboard" />
          <Button onClick={onStart} text="Add New Student" variant="outline" />
        </section>
      </div>

      <div className="mt-20 w-full max-w-5xl overflow-hidden rounded-3xl shadow-2xl border border-slate-200 opacity-80 rotate-1 transform hover:rotate-0 transition-transform duration-700">
        <div className="bg-slate-800 p-2 flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-rose-500"></div>
          <div className="w-3 h-3 rounded-full bg-amber-500"></div>
          <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
        </div>
        <div className="bg-slate-100 h-64 flex items-center justify-center text-slate-300 font-bold text-4xl">
          PREVIEW
        </div>
      </div>
    </main>
  );
}
