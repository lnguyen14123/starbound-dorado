import React, { useState } from "react";

export default function AddTaskForm({ onClose, onSave }) {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [difficulty, setDifficulty] = useState("Easy");

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

    if (!response.ok) throw new Error("Failed to save task");

    const savedTask = await response.json();
    // pass the saved task back to parent
    onSave(savedTask.task); // your backend returns { task: ... }
  } catch (err) {
    console.error("Error saving task:", err);
    alert("Could not save task. Try again!");
  }
};

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className="ml-[3vw] bg-[#e8c4a7] p-8 rounded-2xl shadow-lg w-[80%] h-[80%]
      drop-shadow-[-10px_10px_10px_rgba(0,0,0,0.5)] border-[#AD7B5C] border-3"
      >
        <h2 className="text-5xl font-bold mb-4 text-center">Add New Task</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-3xl">
          <input
            type="text"
            placeholder="Task Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="border-5 border-[#AD7B5C] rounded-lg px-5 py-2 focus:ring-2 focus:ring-[#AD7B5C] outline-none"
          />

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border-5 border-[#AD7B5C] rounded-lg px-5 py-2  focus:ring-2 focus:ring-[#AD7B5C] outline-non cursor-pointer"
          />

          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="border-5 border-[#AD7B5C] rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#AD7B5C] outline-none appearance-none cursor-pointer"
          >
            <option className="text-base"> Low</option>
            <option className="text-base">Medium</option>
            <option className="text-base">High</option>
          </select>

          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="border-5 border-[#AD7B5C] rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#AD7B5C] outline-none appearance-none cursor-pointer"
          >
            <option>Easy</option>
            <option>Moderate</option>
            <option>Hard</option>
          </select>

          <div className="flex justify-between mt-20">
            <button
              type="button"
              onClick={onClose}
              className="bg-[#AD7B5C] text-white font-semibold px-4 py-2 rounded-lg hover:bg-gray-400 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#AD7B5C] text-white font-semibold px-4 py-2 rounded-lg hover:bg-[#94694b] transition cursor-pointer"
            >
              Save Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
