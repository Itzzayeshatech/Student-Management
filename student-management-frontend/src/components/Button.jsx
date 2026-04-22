export default function Button({ text, onClick, variant = "primary" }) {
  const variants = {
    primary: "bg-indigo-600 hover:bg-indigo-700 text-white",
    success: "bg-emerald-500 hover:bg-emerald-600 text-white",
    outline: "border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50"
  };

  return (
    <button
      onClick={onClick}
      className={`${variants[variant]} px-6 py-2.5 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md`}
    >
      {text}
    </button>
  );
}
