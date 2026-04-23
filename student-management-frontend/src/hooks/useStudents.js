import { useEffect, useState, useCallback, useRef } from "react";
import { fetchStudents, deleteStudent } from "../services/studentService";
import socket from "../services/socketService";

/**
 * useStudents Hook - Manages student data with real-time WebSocket updates
 * 
 * Features:
 * - Fetch students with pagination
 * - Real-time updates via WebSocket
 * - Search functionality
 * - Error handling & recovery
 * - Automatic reconnection
 * 
 * @returns {Object} Students state, pagination, loading, error, and methods
 */
export const useStudents = () => {
  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState({ 
    total: 0, 
    page: 1, 
    limit: 10 
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [socketConnected, setSocketConnected] = useState(socket.connected);
  
  // Track if component mounted (for cleanup)
  const mountedRef = useRef(true);

  /**
   * Fetch students from backend
   * @param {string} search - Search query
   * @param {number} page - Page number
   */
  const refreshStudents = useCallback(async (search = "", page = 1) => {
    if (!mountedRef.current) return;
    
    setLoading(true);
    try {
      const response = await fetchStudents(search, page);
      
      if (mountedRef.current) {
        setStudents(response.data || []);
        setPagination({
          total: response.total,
          page: response.page,
          limit: response.limit
        });
        setError(null);
      }
    } catch (err) {
      if (mountedRef.current) {
        const errorMessage = err.response?.data?.message || 
                           err.message || 
                           "Failed to fetch students";
        setError(errorMessage);
        console.error("❌ Error fetching students:", err);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  /**
   * Delete student with optimistic update
   * @param {string} id - Student ID
   */
  const removeStudent = async (id) => {
    const previousStudents = [...students];
    
    // Optimistic update
    setStudents(students.filter(s => s._id !== id));

    try {
      const result = await deleteStudent(id);
      if (!result.success) {
        // Revert on error
        setStudents(previousStudents);
        setError(`Failed to delete student: ${result.message}`);
      }
    } catch (err) {
      // Revert on network error
      setStudents(previousStudents);
      const errorMessage = err.response?.data?.message || 
                         err.message || 
                         "Network error while deleting";
      setError(errorMessage);
      console.error("❌ Error deleting student:", err);
    }
  };

  /**
   * Setup WebSocket listeners and fetch initial data
   */
  useEffect(() => {
    // Reset mounted flag for React 18 StrictMode double-mounts
    mountedRef.current = true;

    // Initial fetch
    refreshStudents();

    /**
     * Real-time event handlers
     * 
     * These listeners update local state when backend emits events
     * so all connected clients see updates instantly
     */

    // Handle new student created
    const handleStudentCreated = (newStudent) => {
      setStudents((prev) => {
        // Check if already exists (prevent duplicates)
        const exists = prev.some(s => s._id === newStudent._id);
        if (exists) return prev;
        
        console.log("✅ New student created (real-time):", newStudent.name);
        return [newStudent, ...prev];
      });
    };

    // Handle student updated
    const handleStudentUpdated = (updatedStudent) => {
      setStudents((prev) => {
        return prev.map(s => 
          s._id === updatedStudent._id ? updatedStudent : s
        );
      });
      console.log("✅ Student updated (real-time):", updatedStudent.name);
    };

    // Handle student deleted
    const handleStudentDeleted = ({ id, name }) => {
      setStudents((prev) => {
        const updated = prev.filter(s => s._id !== id);
        console.log("✅ Student deleted (real-time):", name || id);
        return updated;
      });
    };

    // Handle socket connection
    const handleConnect = () => {
      setSocketConnected(true);
      console.log("🔌 WebSocket connected");
    };

    // Handle socket disconnection
    const handleDisconnect = (reason) => {
      setSocketConnected(false);
      console.warn("🔌 WebSocket disconnected:", reason);
    };

    // Handle socket errors
    const handleSocketError = (error) => {
      console.error("❌ WebSocket error:", error);
    };

    // Register all listeners
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("error", handleSocketError);
    socket.on("studentCreated", handleStudentCreated);
    socket.on("studentUpdated", handleStudentUpdated);
    socket.on("studentDeleted", handleStudentDeleted);

    // Cleanup listeners on unmount
    return () => {
      mountedRef.current = false;
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("error", handleSocketError);
      socket.off("studentCreated", handleStudentCreated);
      socket.off("studentUpdated", handleStudentUpdated);
      socket.off("studentDeleted", handleStudentDeleted);
    };
  }, [refreshStudents]);

  return {
    // State
    students,
    pagination,
    loading,
    error,
    socketConnected,
    
    // Methods
    refreshStudents,
    removeStudent,
  };
};
