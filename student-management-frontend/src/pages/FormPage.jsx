import StudentForm from "../components/StudentForm";

export default function FormPage() {
  return (
    <main className="p-8 lg:p-12 max-w-3xl mx-auto">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold text-slate-900">Student Registration</h2>
        <p className="text-slate-500 mt-2">Fill in the details below to add a new student record</p>
      </div>
      <StudentForm />
    </main>
  );
}
