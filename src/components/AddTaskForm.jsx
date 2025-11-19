import React, { useState, useRef } from "react";

export default function AddTaskForm({ onClose, onSave }) {
  const today = new Date().toISOString().split("T")[0];

  const [name, setName] = useState("");
  const [date, setDate] = useState(today);
  const [priority, setPriority] = useState("Medium");
  const [difficulty, setDifficulty] = useState("Easy");

  const fieldClasses =
    "border-3 rounded-xl px-4 py-2 bg-[var(--color-task-input-bg)] " +
    "text-[var(--color-task-input-text)] border-[var(--color-task-input-border)] " +
    "focus:ring-2 focus:ring-[var(--color-task-input-focus)] outline-none placeholder:text-[var(--color-task-input-placeholder)]";

  const buttonBase =
    "font-semibold text-2xl px-7 py-4 rounded-xl shadow-md transition cursor-pointer";

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
          bg-[var(--color-task-surface)] 
          p-8 
          rounded-3xl 
          shadow-[0_8px_20px_rgba(0,0,0,0.2)]
          w-[80%]
          max-w-xl
          h-[75vh]
          flex 
          flex-col
          border-4 
          border-[var(--color-task-border)]
          text-[var(--color-task-text)]
        `}
      >
        <h2 className="text-3xl font-bold text-center text-[var(--color-task-heading)] mb-4">
          Add New Task
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-xl flex-grow overflow-y-auto pr-1">

          {/* Task Name */}
          <div className="flex flex-col gap-1">
            <label className="font-semibold text-[var(--color-task-label)]">Task Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Ex: Study for exam"
              className={fieldClasses}
            />
          </div>

{/* Date */}
<div className="flex flex-col gap-1">
  <label className="font-semibold text-[var(--color-task-label)]">Due Date</label>

  <div
    className={`${fieldClasses} cursor-pointer select-none`}
    onClick={() => dateRef.current?.showPicker()}
  >
    <input
      ref={dateRef}
      type="date"
      value={date}
      onChange={(e) => setDate(e.target.value)}
      className="w-full bg-transparent outline-none cursor-pointer text-[var(--color-task-input-text)]"
    />
  </div>
</div>

          {/* Priority + Difficulty side-by-side */}
          <div className="grid grid-cols-2 gap-4">

            <div className="flex flex-col gap-1">
              <label className="font-semibold text-[var(--color-task-label)]">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className={`${fieldClasses} cursor-pointer`}
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-semibold text-[var(--color-task-label)]">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className={`${fieldClasses} cursor-pointer`}
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
    className={`${buttonBase} bg-[var(--color-task-secondary-bg)] text-[var(--color-task-secondary-text)] hover:bg-[var(--color-task-secondary-hover)]`}
  >
    Cancel
  </button>

  <button
    type="submit"
    className={`${buttonBase} bg-[var(--color-task-primary-bg)] text-[var(--color-task-primary-text)] hover:bg-[var(--color-task-primary-hover)]`}
  >
    Save Task
  </button>
</div>
        </form>
      </div>
    </div>
  );
}
