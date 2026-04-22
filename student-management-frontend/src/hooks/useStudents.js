import { useEffect, useState } from "react";
import { fetchStudents } from "../services/studentService";

export const useStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents().then((data) => {
      setStudents(data);
      setLoading(false);
    });
  }, []);

  return { students, loading };
};
