import { useState } from "react";
import { createStudent } from "../services/studentService";

export default function StudentForm({ onSuccess }) {
  const [form, setForm] = useState({ name: "", age: "", course: "", image: null });
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image' && files[0]) {
      setForm({ ...form, image: files[0] });
      setImagePreview(URL.createObjectURL(files[0]));
    } else {
      setForm({ ...form, [name]: name === 'age' ? Number(value) : value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("age", form.age);
      formData.append("course", form.course);
      if (form.image) {
        formData.append("image", form.image);
      }

      const result = await createStudent(formData);
      if (result.success) {
        alert("Student registered successfully!");
        setForm({ name: "", age: "", course: "", image: null });
        setImagePreview(null);
        e.target.reset();
        if (onSuccess) onSuccess();
      } else {
        alert("Error: " + result.message);
      }
    } catch (error) {
      alert("Failed to connect to the server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
          <input 
            name="name" 
            placeholder="e.g. Ayesha Tech" 
            onChange={handleChange} 
            required
            className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" 
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Age</label>
          <input 
            name="age" 
            type="number"
            placeholder="e.g. 20" 
            onChange={handleChange} 
            required
            className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" 
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Course</label>
          <input 
            name="course" 
            placeholder="e.g. Computer Science" 
            onChange={handleChange} 
            required
            className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" 
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Profile Image</label>
          <input 
            name="image" 
            type="file"
            accept="image/*"
            onChange={handleChange} 
            className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" 
          />
          {imagePreview && (
            <div className="mt-4 flex items-center gap-4">
              <img src={imagePreview} alt="Preview" className="w-16 h-16 object-cover rounded-full border-2 border-indigo-500 shadow-sm" />
              <span className="text-sm text-slate-500">Image selected</span>
            </div>
          )}
        </div>
        <button 
          disabled={isSubmitting}
          className={`w-full ${isSubmitting ? 'bg-slate-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'} text-white font-bold py-3 rounded-xl shadow-md transform hover:-translate-y-0.5 transition-all`}
        >
          {isSubmitting ? "Registering..." : "Register Student"}
        </button>
      </form>
    </div>
  );
}
