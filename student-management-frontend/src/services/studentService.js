import { mockStudents } from "../data/mockStudents";

// This service is built to be easily swapped with real API calls later
export const fetchStudents = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockStudents);
    }, 1000); // simulate API delay
  });
};
