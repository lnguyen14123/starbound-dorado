import React, { useState, useEffect } from "react";
import "../index.css";
import toggleTab from "../assets/toggle_tab.svg";
import AddTaskModal from "./AddTaskForm.jsx";

export default function TaskPage({ onClose }) {
  const [openId, setOpenId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [checkedTasks, setCheckedTasks] = useState(new Set()); // ✅ store checked task IDs

  useEffect(() => {
    async function fetchTasks() {
      try {
        const uid = localStorage.getItem("uid");
        const response = await fetch(`/api/tasks?uid=${uid}`);
        if (!response.ok) throw new Error("Failed to fetch tasks");
        const data = await response.json();
        setTasks(data.tasks || []);
        console.log(data);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    }

    fetchTasks();
  }, []);

  // ✅ handle check/uncheck
  const handleCheck = (taskId) => {
    setCheckedTasks((prev) => {
      const updated = new Set(prev);
      if (updated.has(taskId)) updated.delete(taskId);
      else updated.add(taskId);
      return updated;
    });
  };

  // ✅ finish selected tasks
  const handleFinishTasks = async () => {
    if (checkedTasks.size === 0) return;

    try {
      const uid = localStorage.getItem("uid");

      // Send delete request for checked tasks
      const response = await fetch(`/api/tasks/delete`, {
        method: "POST", // or DELETE depending on your backend
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid,
          taskIds: Array.from(checkedTasks),
        }),
      });

      if (!response.ok) throw new Error("Failed to delete tasks");

      // Remove them locally too
      setTasks((prev) => prev.filter((task) => !checkedTasks.has(task.task_id)));
      setCheckedTasks(new Set());
    } catch (error) {
      console.error("Error finishing tasks:", error);
    }
  };

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
                  key={task.task_id || index}
                  className="relative flex items-center justify-between py-3 pl-[2vw] bg-[#e4c8b2] rounded-sm shadow-md overflow-visible"
                >
                  {/* Stick-out priority tag */}
                  <div
                    className={`absolute -top-4 right-[0.4vw] px-4 py-1 rounded-4xl text-lg font-bold w-[5vw] h-[4vh] 
                    flex items-center justify-center text-center
                    ${
                      task.priority === "Low"
                        ? "bg-[#d2ee80] text-[#48855c]"
                        : task.priority === "Medium"
                        ? "bg-[#fcd68d] text-[#e5a01c]"
                        : "bg-[#ffbac4] text-[#f5526b]"
                    }`}
                  >
                    {task.priority}
                  </div>

                  {/* Left side: checkbox + divider + task name */}
                  <div className="flex items-center gap-3 w-full">
                    <input
                      type="checkbox"
                      checked={checkedTasks.has(task.task_id)}
                      onChange={() => handleCheck(task.task_id)}
                      className="w-5 h-5 accent-[#e4c8b2] cursor-pointer flex-shrink-0"
                    />
                    <div className="h-8 w-[2px] bg-[#6b4b33] rounded-full opacity-70 flex-shrink-0"></div>
                    <span className="text-2xl font-semibold truncate">
                      {task.title}
                    </span>
                  </div>

                  {task.due_date && (
                    <div
                      className="absolute left-1/2 -translate-x-1/2 -bottom-4 px-3 pt-1 bg-[#dcdcdc] 
                        rounded-full text-lg font-semibold text-[#4b3b2f] shadow-md"
                    >
                      {new Date(task.due_date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                  )}

                  {/* Right side: dropdown */}
                  <div className="absolute right-[2.3vw] top-[50%] -translate-y-1/2 flex items-center gap-[2vw]">
                    <div className="h-8 w-[2px] bg-[#6b4b33] rounded-full opacity-70 translate-x-[-4px]"></div>
                    <button
                      onClick={() =>
                        setOpenId(openId === index ? null : index)
                      }
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
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Buttons */}
          <div className="ml-[.5vw] mt-4 flex gap-7">
            <button
              onClick={() => setShowModal(true)}
              className="w-[15vw] h-[5vh] bg-[#AD7B5C] text-white font-bold rounded-2xl cursor-pointer 
                         shadow-[0_7px_4px_rgba(0,0,0,0.3)] hover:bg-[#8e634a] 
                         flex items-center justify-center text-xl"
            >
              + Add Task
            </button>

            <button
              onClick={handleFinishTasks}
              className="w-[15vw] h-[5vh] bg-[#b1d47f] text-white font-bold rounded-2xl cursor-pointer 
                         shadow-[0_7px_4px_rgba(0,0,0,0.3)] hover:bg-[#7a9456] 
                         flex items-center justify-center text-xl"
            >
              ✓ Finish Tasks
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <AddTaskModal
            onClose={() => setShowModal(false)}
            onSave={(newTask) => {
              setTasks((prevTasks) => [...prevTasks, newTask]);
              setShowModal(false);
            }}
          />
        </div>
      )}
    </div>
  );
}
