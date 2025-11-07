import React, { useState } from "react";
import "../index.css";
import toggleTab from "../assets/toggle_tab.svg";
import AddTaskModal from "./AddTaskForm.jsx";

export default function TaskPage({ onClose }) {
  const [openId, setOpenId] = useState(null); // ✅ define openId state
  const [showModal, setShowModal] = useState(false);
  const [tasks, setTasks] = useState([
    { name: "Buy groceries", priority: "Low" },
    { name: "Finish project report", priority: "High" },
    { name: "Call mom", priority: "Low" },
  ]);

  async function addTaskToBackend(task) {
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(task),
      });

      if (!response.ok) throw new Error("Failed to add task");
      return await response.json();
    } catch (error) {
      console.error("Error adding task:", error);
      alert("Could not add task");
    }
  }

  async function handleAddTask() {
    const newTask = { name: "New Task", priority: "Medium" };
    const savedTask = await addTaskToBackend(newTask);
    setTasks((prev) => [...prev, savedTask || newTask]);
  }

  return (
    <div className="flex h-screen">
      <div className="flex h-full w-full">
        <div className="flex flex-col">
          <div className="-ml-[1vw] h-[75vh] w-[35vw] max-w-4xl p-8 bg-[#f4e1d2] rounded-2xl border-2 border-[#926B51]">
            {/* Priority labels */}
            <div className="flex gap-4">
              <div className="h-[4vh] w-[6vw] text-2xl bg-[#d2ee80] rounded-2xl flex items-center justify-center pt-1 text-[#48855c]">
                Low
              </div>
              <div className="h-[4vh] w-[6vw] text-2xl bg-[#fcd68d] rounded-2xl flex items-center justify-center pt-1 text-[#e5a01c]">
                Medium
              </div>
              <div className="h-[4vh] w-[6vw] text-2xl bg-[#ffbac4] rounded-2xl flex items-center justify-center pt-1 text-[#f5526b]">
                High
              </div>
            </div>

            {/* Task list */}
            <div className="py-[4vh] flex flex-col gap-8 overflow-y-auto max-h-[60vh]">
              {tasks.map((task, index) => (
                <div
                  key={index}
                  className="relative flex items-center justify-between py-3 pl-[2vw] bg-[#e4c8b2] rounded-sm shadow-md overflow-visible"
                >
                  {/* Stick-out priority tag */}
                  <div
                    className={`absolute -top-4 right-[0.4vw] px-4 py-1 rounded-4xl text-lg font-bold w-[5vw] h-[4vh] 
    flex items-center justify-center text-center
    ${
      task.priority === "Low"
        ? "bg-[#d2ee80] text-[#48855c] border-[#48855c]"
        : task.priority === "Medium"
        ? "bg-[#fcd68d] text-[#e5a01c] border-[#e5a01c]"
        : "bg-[#ffbac4] text-[#f5526b] border-[#f5526b]"
    }`}
                  >
                    {task.priority}
                  </div>

                  {/* Left side: checkbox + divider + task name */}
                  <div className="flex items-center gap-3 w-full">
                    <input
                      type="checkbox"
                      className="w-5 h-5 accent-[#e4c8b2] cursor-pointer flex-shrink-0"
                    />
                    <div className="h-8 w-[2px] bg-[#6b4b33] rounded-full opacity-70 flex-shrink-0"></div>
                    <span className="text-2xl font-semibold truncate">
                      {task.name}
                    </span>
                  </div>

                  {/* Right side: divider + dropdown button — absolutely positioned */}
                  <div className="absolute right-[2.3vw] top-[50%] -translate-y-1/2 flex items-center gap-[2vw]">
                    <div className="h-8 w-[2px] bg-[#6b4b33] rounded-full opacity-70 translate-x-[-4px]"></div>

                    <button
                      onClick={() => setOpenId(openId === index ? null : index)}
                      className={`transition-transform duration-200 cursor-pointer ${
                        openId === index ? "rotate-0" : "rotate-180"
                      }`}
                    >
                      <img
                        src={toggleTab}
                        alt="toggle details"
                        className="w-5 h-5"
                      />
                    </button>
                  </div>

                  {/* Dropdown section */}
                  {/* <div
    id={`task-${index}`}
    className={`overflow-hidden transition-all duration-300 ease-in-out ${
      openId === index ? "max-h-40 mt-3" : "max-h-0"
    }`}
  >
    <div className="pl-10 text-lg text-[#4b3b2f]">
      <p>Details about "{task.name}" go here…</p>
    </div>
  </div> */}
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="mt-4 px-2 pt-1 w-[20vw] bg-[#AD7B5C] text-white font-bold rounded-2xl cursor-pointer transition shadow-[0_7px_4px_rgba(0,0,0,0.3)]"
          >
            + Add Task
          </button>
        </div>
      </div>
      {/* Modal overlay */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <AddTaskModal
            onClose={() => setShowModal(false)}
            onSave={(task) => console.log("Save task", task)}
          />
        </div>
      )}
    </div>
  );
}
