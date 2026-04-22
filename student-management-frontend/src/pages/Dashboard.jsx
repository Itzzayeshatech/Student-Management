import { useStudents } from "../hooks/useStudents";
import StudentTable from "../components/StudentTable";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import Button from "../components/Button";

export default function Dashboard() {
  const { students, loading } = useStudents();

  return (
    <main className="p-8 lg:p-12 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Dashboard</h2>
          <p className="text-slate-500">Overview of all registered students</p>
        </div>
        <Button text="+ Add New Student" variant="success" />
      </div>

      {loading ? (
        <Loader />
      ) : students.length === 0 ? (
        <EmptyState />
      ) : (
        <StudentTable students={students} />
      )}
    </main>
  );
}
