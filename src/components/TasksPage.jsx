import React, { useState, useEffect } from "react";
import "../index.css";
import toggleTab from "../assets/ui/toggle_tab.svg";
import AddTaskModal from "./AddTaskForm.jsx";


import { useCurrency } from "../context/CurrencyContext.jsx";
import { useTheme } from "../context/ThemeContext";

export default function TaskPage({ onClose }) {
  const [openId, setOpenId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [checkedTasks, setCheckedTasks] = useState(new Set()); // ✅ store checked task IDs
  const [priorityFilters, setPriorityFilters] = useState(
    () => new Set(["Low", "Medium", "High"])
  );
  const [isFinishing, setIsFinishing] = useState(false);
  const { theme = "light" } = useTheme() || {};

const difficultyValues = {
  Low: 5,
  Medium: 7,
  High: 10,
};

  const { setCurrency } = useCurrency()

  const boardClasses =
    theme === "dark"
      ? "bg-[#1f2434]/95 border border-[#353a52] text-[#f5ede1]"
      : "bg-[#f4e1d2] border-2 border-[#926B51] text-[#4b3b2f]";

  const priorityClasses = {
    Low:
      theme === "dark"
        ? "bg-[#3f5d31] text-[#d7f2b6]"
        : "bg-[#d2ee80] text-[#48855c]",
    Medium:
      theme === "dark"
        ? "bg-[#5c4b2e] text-[#f4cf88]"
        : "bg-[#fcd68d] text-[#e5a01c]",
    High:
      theme === "dark"
        ? "bg-[#632f3c] text-[#ff9fb1]"
        : "bg-[#ffbac4] text-[#f5526b]",
  };
  const priorityOptions = ["Low", "Medium", "High"];

  const dividerClass = theme === "dark" ? "bg-[#3a425a]" : "bg-[#6b4b33]";

  const taskRowClass =
    theme === "dark"
      ? "bg-[#283247]/90 text-[#f5ede1]"
      : "bg-[#e4c8b2]";

  const dueDateClasses =
    theme === "dark"
      ? "bg-[#323d55] text-[#d8e5ff]"
      : "bg-[#dcdcdc] text-[#4b3b2f]";

  const checkboxAccent =
    theme === "dark" ? "accent-[#6daf4f]" : "accent-[#e4c8b2]";

  const emptyStateClass =
    theme === "dark" ? "text-[#c8cfdc]" : "text-[#6b4b33]";

  const addButtonClasses =
    theme === "dark"
      ? "bg-[#5c3a2c] hover:bg-[#7a4d39]"
      : "bg-[#AD7B5C] hover:bg-[#8e634a]";

  const finishButtonActive =
    theme === "dark"
      ? "bg-[#4c6d3d] hover:bg-[#678b59]"
      : "bg-[#b1d47f] hover:bg-[#7a9456]";


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

const handleFinishTasks = async () => {
  if (checkedTasks.size === 0 || isFinishing) return;
  setIsFinishing(true);

  const uid = localStorage.getItem("uid");

  // 🎯 Calculate reward
  let totalReward = 0;
  let completedTasks = tasks.filter((t) => checkedTasks.has(t.task_id));

  completedTasks.forEach((task) => {
    const base = difficultyValues[task.priority] || 5;
    totalReward += base;
  });

  // Optional: bonus for doing multiple tasks at once
  const streakBonus = completedTasks.length * 2;
  totalReward += streakBonus;

  try {
    // ⛏️ 1. Remove tasks
    const response = await fetch(`/api/tasks/delete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uid,
        taskIds: Array.from(checkedTasks),
      }),
    });

    if (!response.ok) throw new Error("Failed to delete tasks");

    // 💰 2. Award currency
    const rewardResponse = await fetch(`/api/user/reward`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uid,
        amount: totalReward,
      }),
    });

    if (!rewardResponse.ok) throw new Error("Failed to reward user");

    const data = await rewardResponse.json();
    setCurrency(prev => prev + Number(data.change));


    // ✨ 3. Update UI locally
    setTasks((prev) => prev.filter((task) => !checkedTasks.has(task.task_id)));
    setCheckedTasks(new Set());

    // Dispatch event to refresh XP and level
    window.dispatchEvent(new CustomEvent("taskCompleted"));

    console.log("Awarded:", totalReward);
  } catch (error) {
    console.error("Error finishing tasks:", error);
  } finally {
    setIsFinishing(false);
  }
};

  const togglePriorityFilter = (priority) => {
    setPriorityFilters((prev) => {
      const updated = new Set(prev);
      if (updated.has(priority)) {
        if (updated.size === 1) {
          return updated;
        }
        updated.delete(priority);
      } else {
        updated.add(priority);
      }
      return updated;
    });
  };

  const filteredTasks = tasks.filter((task) =>
    priorityFilters.has(task.priority)
  );

  return (
    <div className="flex h-screen">
      <div className="flex h-[96vh] w-133">
        <div className="flex flex-col">
          <div className={`h-[75vh] w-133 max-w-4xl p-8 rounded-2xl ${boardClasses}`}>
            {/* Priority labels */}
            <div className="flex gap-4">
              {priorityOptions.map((priority) => {
                const isActive = priorityFilters.has(priority);
                return (
                  <button
                    key={priority}
                    type="button"
                    onClick={() => togglePriorityFilter(priority)}
                    className={`h-[4vh] w-[6vw] text-2xl rounded-2xl flex items-center justify-center pt-1 border-2 border-transparent cursor-pointer transition ${priorityClasses[priority]} ${
                      isActive ? "" : "opacity-40 border-dashed border-current"
                    }`}
                  >
                    {priority}
                  </button>
                );
              })}
            </div>

            <div className="w-full h-[2px] bg-[#926B51] opacity-60 my-4 rounded-full"></div>


            {/* Task list */}
            <div className="py-[4vh] flex flex-col gap-8 overflow-y-auto max-h-[60vh]">

              {tasks.length === 0 ? (
                <div className={`w-full text-center text-3xl ${emptyStateClass} opacity-70 mt-[10vh]`}>
                  Add a task item!
                </div>
              ) : filteredTasks.length === 0 ? (
                <div className={`w-full text-center text-3xl ${emptyStateClass} opacity-70 mt-[10vh]`}>
                  No tasks match the selected priorities.
                </div>
              ) : (
                filteredTasks.map((task, index) => (
                <div
                  key={task.task_id || index}
                  className={`relative flex items-center justify-between py-3 pl-[2vw] rounded-sm shadow-md overflow-visible ${taskRowClass}`}
                >
                  {/* Stick-out priority tag */}
                  <div
                    className={`absolute -top-4 right-[0.4vw] px-4 py-1 rounded-4xl text-lg font-bold w-[5vw] h-[4vh] 
                    flex items-center justify-center text-center ${
                      task.priority === "Low"
                        ? priorityClasses.Low
                        : task.priority === "Medium"
                        ? priorityClasses.Medium
                        : priorityClasses.High
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
                      className={`w-5 h-5 cursor-pointer flex-shrink-0 ${checkboxAccent}`}
                    />
                    <div className={`h-8 w-[2px] rounded-full opacity-70 flex-shrink-0 ${dividerClass}`}></div>
                    <span className="text-2xl font-semibold truncate">
                      {task.title}
                    </span>
                  </div>

                  {task.due_date && (
                    <div
                      className={`absolute left-1/2 -translate-x-1/2 -bottom-4 px-3 pt-1 rounded-full text-lg font-semibold shadow-md ${dueDateClasses}`}
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
                    <div className={`h-8 w-[2px] rounded-full opacity-70 translate-x-[-4px] ${dividerClass}`}></div>
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
              )))}
            </div>
          </div>

          {/* Bottom Buttons */}
          <div className="ml-[.5vw] mt-4 flex gap-7">
            <button
              onClick={() => setShowModal(true)}
              className={`w-60 h-[7vh] text-white font-bold rounded-2xl cursor-pointer 
                         shadow-[0_7px_4px_rgba(0,0,0,0.3)] flex items-center justify-center text-4xl pt-1 ${addButtonClasses}`}
            >
              + Add Task
            </button>

            <button
              onClick={(e) => {
                e.preventDefault();
                console.log("Finish button clicked, checked tasks:", checkedTasks.size);
                handleFinishTasks();
              }}
              disabled={checkedTasks.size === 0 || isFinishing}
              className={`w-60 h-[7vh] text-white font-bold rounded-2xl 
                          shadow-[0_7px_4px_rgba(0,0,0,0.3)] flex items-center justify-center text-4xl pt-2
                          transition-all duration-200
                          ${
                            checkedTasks.size === 0 || isFinishing
                              ? "bg-gray-400 cursor-not-allowed opacity-50"
                              : `${finishButtonActive} cursor-pointer active:scale-95`
                          }`}
            >
              {isFinishing ? "Finishing..." : "Finish Tasks"}
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

