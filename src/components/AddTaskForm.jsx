import React, { useState, useRef } from "react";
import { useTheme } from "../context/ThemeContext";

export default function AddTaskForm({ onClose, onSave }) {
  const today = new Date().toISOString().split("T")[0];

  const [name, setName] = useState("");
  const [date, setDate] = useState(today);
  const [priority, setPriority] = useState("Medium");
  const [difficulty, setDifficulty] = useState("Easy");
  const { theme = "light" } = useTheme() || {};

  const containerClasses =
    theme === "dark"
      ? "bg-[#1f2434]/95 border border-[#353a52] text-[#f5ede1]"
      : "bg-[#e8c4a7] border-3 border-[#AD7B5C]";

  const inputClasses =
    theme === "dark"
      ? "border-4 border-[#353a52] bg-[#1a2030]/50 text-[#f5ede1] placeholder:text-[#99a4c0] focus:ring-[#6daf4f]"
      : "border-5 border-[#AD7B5C] text-[#4b3b2f] focus:ring-[#AD7B5C]";

  const buttonPrimary =
    theme === "dark"
      ? "bg-[#4c6d3d] hover:bg-[#678b59]"
      : "bg-[#AD7B5C] hover:bg-[#8e634a]";

  const buttonSecondary =
    theme === "dark"
      ? "bg-[#3a2a35] hover:bg-[#513a4b]"
      : "bg-[#AD7B5C] hover:bg-gray-400";

  const handleSubmit = async (e) => {
    e.preventDefault();
    const uid = localStorage.getItem("uid");
    const taskData = { uid, name, date, priority, difficulty };

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || "Failed to save task");
      }

      const savedTask = await response.json();
      onSave(savedTask.task);
      onClose();
    } catch (err) {
      console.error("Error saving task:", err);
      alert(`Could not save task: ${err.message}. Try again!`);
    }
  };

    const dateRef = useRef(null);


  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className={`
          bg-[#f4d9c3] 
          p-8 
          rounded-3xl 
          shadow-[0_8px_20px_rgba(0,0,0,0.2)]
          w-[80%]
          max-w-xl
          h-[75vh]
          flex 
          flex-col
          border-4 
          border-[#B08463]
          ${containerClasses}
        `}
      >
        <h2 className="text-3xl font-bold text-center text-[#5a3b2c] mb-4">
          Add New Task
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-xl flex-grow overflow-y-auto pr-1">

          {/* Task Name */}
          <div className="flex flex-col gap-1">
            <label className="font-semibold text-[#5a3b2c]">Task Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Ex: Study for exam"
              className="border-3 border-[#B08463] rounded-xl px-4 py-2 bg-white focus:ring-2 focus:ring-[#B08463] outline-none"
            />
          </div>

{/* Date */}
<div className="flex flex-col gap-1">
  <label className="font-semibold text-[#5a3b2c]">Due Date</label>

  <div
    className="border-3 border-[#B08463] rounded-xl px-4 py-2 bg-white cursor-pointer select-none"
    onClick={() => dateRef.current?.showPicker()}
  >
    <input
      ref={dateRef}
      type="date"
      value={date}
      onChange={(e) => setDate(e.target.value)}
      className="w-full bg-transparent outline-none cursor-pointer"
    />
  </div>
</div>

          {/* Priority + Difficulty side-by-side */}
          <div className="grid grid-cols-2 gap-4">

            <div className="flex flex-col gap-1">
              <label className="font-semibold text-[#5a3b2c]">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="border-3 border-[#B08463] rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-[#B08463] outline-none cursor-pointer"
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-semibold text-[#5a3b2c]">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="border-3 border-[#B08463] rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-[#B08463] outline-none cursor-pointer"
              >
                <option>Easy</option>
                <option>Moderate</option>
                <option>Hard</option>
              </select>
            </div>

          </div>

{/* Buttons */}
<div className="flex justify-between mt-auto pt-4">
  <button
    type="button"
    onClick={onClose}
    className="bg-[#B08463] text-white font-semibold text-2xl px-7 py-4 rounded-xl shadow-md 
               hover:bg-[#8e684c] transition cursor-pointer"
  >
    Cancel
  </button>

  <button
    type="submit"
    className="bg-[#B08463] text-white font-semibold text-2xl px-7 py-4 rounded-xl shadow-md 
               hover:bg-[#9c7152] transition cursor-pointer"
  >
    Save Task
  </button>
</div>
        </form>
      </div>
    </div>
  );
}
