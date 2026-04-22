const API_URL = import.meta.env.VITE_API_BASE_URL;

export const fetchStudents = async (search = "", page = 1, limit = 10) => {
  try {
    const response = await fetch(`${API_URL}?search=${search}&page=${page}&limit=${limit}`);
    const result = await response.json();
    return result; // Return the whole result object for pagination metadata
  } catch (error) {
    console.error("Error fetching students:", error);
    return { data: [], total: 0, page: 1, limit: 10 };
  }
};

export const createStudent = async (studentData) => {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(studentData),
    });
    return await response.json();
  } catch (error) {
    console.error("Error creating student:", error);
    return { success: false, message: "Network error" };
  }
};

export const updateStudent = async (id, studentData) => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(studentData),
    });
    return await response.json();
  } catch (error) {
    console.error("Error updating student:", error);
    return { success: false, message: "Network error" };
  }
};

export const deleteStudent = async (id) => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });
    return await response.json();
  } catch (error) {
    console.error("Error deleting student:", error);
    return { success: false, message: "Network error" };
  }
};
