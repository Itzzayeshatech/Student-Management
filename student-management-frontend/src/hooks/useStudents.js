import { useEffect, useState, useCallback } from "react";
import { fetchStudents, deleteStudent } from "../services/studentService";

export const useStudents = () => {
  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshStudents = useCallback(async (search = "", page = 1) => {
    setLoading(true);
    try {
      const response = await fetchStudents(search, page);
      // Response from backend is { total, page, limit, data }
      setStudents(response.data || []);
      setPagination({
        total: response.total,
        page: response.page,
        limit: response.limit
      });
      setError(null);
    } catch (err) {
      setError("Failed to fetch students");
    } finally {
      setLoading(false);
    }
  }, []);

  const removeStudent = async (id) => {
    const previousStudents = [...students];
    setStudents(students.filter(s => s._id !== id));

    try {
      const result = await deleteStudent(id);
      if (!result.success) {
        setStudents(previousStudents);
        alert("Error deleting student: " + result.message);
      }
    } catch (err) {
      setStudents(previousStudents);
      alert("Network error while deleting");
    }
  };

  useEffect(() => {
    refreshStudents();
  }, [refreshStudents]);

  return { students, pagination, loading, error, refreshStudents, removeStudent };
};
