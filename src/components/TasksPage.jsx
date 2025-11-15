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
    if (checkedTasks.size === 0) {
      console.log("No tasks selected");
      return;
    }

    try {
      const uid = localStorage.getItem("uid");
      if (!uid) {
        alert("You must be logged in to complete tasks");
        return;
      }

      const taskIdsArray = Array.from(checkedTasks);
      console.log("Finishing tasks:", taskIdsArray);

      // Send delete request for checked tasks
      const response = await fetch(`/api/tasks/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid,
          taskIds: taskIdsArray,
        }),
      });

      if (!response.ok) {
        let errorMessage = "Failed to delete tasks";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.details || errorMessage;
          console.error("Server error response:", errorData);
        } catch (parseError) {
          const text = await response.text();
          console.error("Server error (non-JSON):", text);
          errorMessage = text || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log("Tasks completed successfully:", result);

      // Remove them locally too
      setTasks((prev) => prev.filter((task) => !checkedTasks.has(task.task_id)));
      setCheckedTasks(new Set());
      
      // Dispatch event to notify MainPage to refresh streak and XP
      window.dispatchEvent(new CustomEvent("taskCompleted"));
      
      if (result.xpEarned) {
        console.log(`Earned ${result.xpEarned} XP!`);
      }
    } catch (error) {
      console.error("Error finishing tasks:", error);
      alert(`Error completing tasks: ${error.message}`);
    }
  };

  return (
    <div className="flex h-screen">
      <div className="flex h-[96vh] w-133">
        <div className="flex flex-col">
          <div className=" h-[75vh] w-133 max-w-4xl p-8 bg-[#f4e1d2] rounded-2xl border-2 border-[#926B51]">
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
              className="w-60 h-[7vh] bg-[#AD7B5C] text-white font-bold rounded-2xl cursor-pointer 
                         shadow-[0_7px_4px_rgba(0,0,0,0.3)] hover:bg-[#8e634a] 
                         flex items-center justify-center text-4xl pt-1"
            >
              + Add Task
            </button>

            <button
              onClick={(e) => {
                e.preventDefault();
                console.log("Finish button clicked, checked tasks:", checkedTasks.size);
                handleFinishTasks();
              }}
              disabled={checkedTasks.size === 0} // 👈 disable if no tasks checked
              className={`w-60 h-[7vh] text-white font-bold rounded-2xl 
                          shadow-[0_7px_4px_rgba(0,0,0,0.3)] flex items-center justify-center text-4xl pt-2
                          transition-all duration-200
                          ${
                            checkedTasks.size === 0
                              ? "bg-gray-400 cursor-not-allowed opacity-50"
                              : "bg-[#b1d47f] hover:bg-[#7a9456] cursor-pointer active:scale-95"
                          }`}
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
