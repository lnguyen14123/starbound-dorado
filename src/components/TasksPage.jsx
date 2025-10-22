import React, { useState, useEffect } from "react";
import Notebook from "./Notebook";
import Floor from "./Floor";
import GrayCat1 from "../assets/gray_cat1.png";
import YellowDog1 from "../assets/yellow_dog1.png";
import Window1 from "../assets/items/window_1.png";
import Plant1 from "../assets/items/pottedplant_1.png";
import TaskbookL from "../assets/L_TaskBook.png";
import Tasks_Selected_tab from "../assets/Tasks_Selected_tab.png";
import Tasks_Untoggled_tab from "../assets/Tasks_Untoggled_tab.png";
import Add_New_Task_button from "../assets/Add_New_Task_button.png";
import pageflip_icon from "../assets/items/pageflip_icon.png";
import high_tag from "../assets/items/high_tag.png";
import medium_tag from "../assets/items/medium_tag.png";
import low_tag from "../assets/items/low_tag.png";

export default function TasksPage() {
  const [selectedTab, setSelectedTab] = useState('not-started');
  const [petType, setPetType] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    class: '',
    type: '',
    start_date: '',
    due_date: '',
    reminder: '',
    custom_filter: ''
  });

  useEffect(() => {
    const cachedPet = localStorage.getItem("petType");
    if (cachedPet) setPetType(cachedPet);

    const fetchPet = async () => {
      try {
        const uid = localStorage.getItem("uid");
        const response = await fetch("/api/user/pet", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uid }),
        });
        const data = await response.json();
        if (data && data.petType) {
          setPetType(data.petType);
          localStorage.setItem("petType", data.petType);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchPet();
  }, []);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const uid = localStorage.getItem("uid");
      if (!uid) return;
      
      const response = await fetch(`/api/tasks/${uid}`);
      const data = await response.json();
      if (data && data.tasks) {
        setTasks(data.tasks);
      }
    } catch (err) {
      console.error("Error fetching tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  const getPetImage = () => {
    if (petType === "cat") return GrayCat1;
    if (petType === "dog") return YellowDog1;
    return null;
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'High': return high_tag;
      case 'Medium': return medium_tag;
      case 'Low': return low_tag;
      default: return medium_tag;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'border-red-400 bg-red-50';
      case 'Medium': return 'border-yellow-400 bg-yellow-50';
      case 'Low': return 'border-green-400 bg-green-50';
      default: return 'border-yellow-400 bg-yellow-50';
    }
  };

  const getFilteredTasks = () => {
    switch (selectedTab) {
      case 'not-started':
        return tasks.filter(task => !task.is_completed && (!task.start_date || new Date(task.start_date) > new Date()));
      case 'in-progress':
        return tasks.filter(task => !task.is_completed && (task.start_date && new Date(task.start_date) <= new Date()));
      case 'done':
        return tasks.filter(task => task.is_completed);
      default:
        return tasks;
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    try {
      const uid = localStorage.getItem("uid");
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: uid,
          ...newTask
        }),
      });
      
      if (response.ok) {
        setNewTask({
          title: '',
          description: '',
          priority: 'Medium',
          class: '',
          type: '',
          start_date: '',
          due_date: '',
          reminder: '',
          custom_filter: ''
        });
        setShowAddTask(false);
        fetchTasks();
      }
    } catch (err) {
      console.error("Error creating task:", err);
    }
  };

  const handleToggleComplete = async (taskId, isCompleted) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_completed: !isCompleted }),
      });
      
      if (response.ok) {
        fetchTasks();
      }
    } catch (err) {
      console.error("Error updating task:", err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        fetchTasks();
      }
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#dbb9a0] flex justify-center items-center">
      {/* Floor */}
      <div className="pointer-events-none absolute inset-0">
        <Floor />
      </div>

      {/* Containers for the notebook and contents inside it */}
      <div className="relative w-full h-full flex justify-center items-center p-4">
        <div
          className="relative"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "clamp(320px, 90vw, 1200px)",
            height: "auto",
            aspectRatio: "4/3",
          }}
        >
          {/* Container for the contents inside the notebook */}
          <div
            className="relative w-full h-full"
            style={{
              transform: "scale(1)",
              transformOrigin: "center center",
            }}
          >
            {/* Notebook */}
            <img
              src={TaskbookL}
              alt="Notebook"
              className="absolute z-10 object-contain drop-shadow-[-10px_10px_10px_rgba(0,0,0,0.5)]"
              style={{
                width: "70%",
                height: "100%",
                left: "-25%",
                top: "50%",
                transform: "translateY(-50%)"
              }}
            />

            {/* Progress Tabs - positioned right above the contents inside the notebook */}
            <div
              className="absolute z-30 flex"
              style={{
                left: "-12.5%",
                top: "3%",
                width: "52%",
              }}
            >
              {/* Not Started Button and Tab */}
              <div className="relative flex flex-col" style={{ flex: "1" }}>
                <img
                  src={selectedTab === 'not-started' ? Tasks_Selected_tab : Tasks_Untoggled_tab}
                  alt="Not Started Indicator"
                  className="object-contain w-full"
                  style={{ height: "auto" }}
                />
                <button
                  onClick={() => setSelectedTab('not-started')}
                  className="absolute cursor-pointer hover:opacity-80 transition-opacity bg-transparent border-none"
                  style={{
                    width: "100%",
                    height: "100%",
                    top: 0,
                    left: 0,
                    justifyContent: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    color: '#8F674D',
                    fontSize: 'clamp(14px, 2.2vw, 22px)',
                    fontFamily: 'Dongle',
                    fontWeight: '700',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Not Started
                </button>
              </div>

              {/* In Progress Button and Tab */}
              <div className="relative flex flex-col" style={{ flex: "1" }}>
                <img
                  src={selectedTab === 'in-progress' ? Tasks_Selected_tab : Tasks_Untoggled_tab}
                  alt="In Progress Indicator"
                  className="object-contain w-full"
                  style={{ height: "auto" }}
                />
                <button
                  onClick={() => setSelectedTab('in-progress')}
                  className="absolute cursor-pointer hover:opacity-80 transition-opacity bg-transparent border-none"
                  style={{
                    width: "100%",
                    height: "100%",
                    top: 0,
                    left: 0,
                    justifyContent: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    color: '#8F674D',
                    fontSize: 'clamp(14px, 2.2vw, 22px)',
                    fontFamily: 'Dongle',
                    fontWeight: '700',
                    whiteSpace: 'nowrap',
                  }}
                >
                  In Progress
                </button>
              </div>

              {/* Done Button and Tab */}
              <div className="relative flex flex-col" style={{ flex: "1" }}>
                <img
                  src={selectedTab === 'done' ? Tasks_Selected_tab : Tasks_Untoggled_tab}
                  alt="Done Indicator"
                  className="object-contain w-full"
                  style={{ height: "auto" }}
                />
                <button
                  onClick={() => setSelectedTab('done')}
                  className="absolute cursor-pointer hover:opacity-80 transition-opacity bg-transparent border-none"
                  style={{
                    width: "100%",
                    height: "100%",
                    top: 0,
                    left: 0,
                    justifyContent: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    color: '#8F674D',
                    fontSize: 'clamp(14px, 2.2vw, 22px)',
                    fontFamily: 'Dongle',
                    fontWeight: '700',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Done
                </button>
              </div>
            </div>

            {/* Content overlay on notebook */}
            <div
              className="absolute z-20 flex flex-col gap-4 p-6 overflow-y-auto"
              style={{
                width: "52%",
                height: "82%",
                background: "rgba(228, 199, 177, 0.39)",
                borderRadius: "18px",
                outline: "2px #926B51 solid",
                left: "-12.5%",
                top: "44%",
                transform: "translateY(-50%)"
              }}
            >
              {loading ? (
                <p className="text-gray-500" style={{ fontSize: 'clamp(12px, 1.8vw, 18px)' }}>Loading tasks...</p>
              ) : (
                <div className="space-y-4">
                  {getFilteredTasks().length === 0 ? (
                    <p className="text-center py-8 text-gray-500" style={{ fontSize: 'clamp(12px, 1.8vw, 18px)' }}>
                      No tasks in this category yet.
                    </p>
                  ) : (
                    getFilteredTasks().map((task) => (
                      <div
                        key={task.task_id}
                        className={`bg-[#f0e6d2] p-3 rounded-2xl border-2 ${getPriorityColor(task.priority)}`}
                        style={{ fontSize: 'clamp(12px, 1.6vw, 16px)' }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <img
                              src={getPriorityIcon(task.priority)}
                              alt={task.priority}
                              className="w-4 h-4"
                            />
                            <span className="font-bold">{task.title}</span>
                            {task.is_completed && (
                              <span className="text-green-600 text-xs">✓ Done</span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleToggleComplete(task.task_id, task.is_completed)}
                              className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                              {task.is_completed ? 'Undo' : 'Complete'}
                            </button>
                            <button
                              onClick={() => handleDeleteTask(task.task_id)}
                              className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        {task.description && (
                          <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                        )}
                        <div className="flex gap-4 mt-2 text-xs text-gray-500">
                          {task.class && <span>Class: {task.class}</span>}
                          {task.type && <span>Type: {task.type}</span>}
                          {task.due_date && <span>Due: {formatDate(task.due_date)}</span>}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Add New Task */}
            <img
              src={Add_New_Task_button}
              alt="Add New Task"
              className="absolute z-10 object-contain"
              style={{
                width: "30%",
                height: "30%",
                transform: "translateY(-40%) translate(-10%, 10%)",
                top: "85%",
                left: "-8%",
              }}
            />
            <button
              onClick={() => setShowAddTask(true)}
              className="absolute cursor-pointer hover:opacity-80 transition-opacity bg-transparent border-none"
              style={{
                width: "30%",
                height: "30%",
                justifyContent: 'center',
                display: 'flex',
                flexDirection: 'column',
                color: '#8F674D',
                fontSize: '1.67vmin',
                fontFamily: 'Dongle',
                fontWeight: '700',
                wordWrap: 'break-word',
                transform: "translateY(-50%) translate(-10%, 10%)",
                top: "85%",
                left: 0
              }}
            >
              Add New Task
            </button>

            {/* Page Flip Icon */}
            <img
              src={pageflip_icon}
              alt="Page Flip Icon"
              className="absolute z-10 object-contain"
              style={{
                width: "15%",
                height: "15%",
                transform: "translateY(-50%) translate(-10%, 10%)",
                top: "91%",
                left: "29%"
              }}
            />
            <button
              onClick={() => setSelectedTab('pageflip')}
              className="absolute cursor-pointer hover:opacity-80 transition-opacity bg-transparent border-none"
            >
              Page Flip
            </button>

            {/* Window */}
            <img
              src={Window1}
              alt="Window"
              className="absolute z-10 object-contain"
              style={{
                width: "32.58%",
                height: "37%",
                right: "-3.33%",
                top: "11.11%"
              }}
            />

            {/* Plant */}
            <img
              src={Plant1}
              alt="Plant"
              className="absolute z-20 object-contain drop-shadow-[0_0_20px_rgba(0,0,0,0.2)]"
              style={{
                width: "10.75%",
                height: "21.11%",
                right: "15%",
                top: "26.67%"
              }}
            />

            {/* Pet should be the same positions */}
            {petType && (
              <img
                src={getPetImage()}
                alt={petType}
                className="absolute z-30 object-contain drop-shadow-[0_0_20px_rgba(0,0,0,0.2)]"
                style={{
                  width: petType === "cat" ? "55.08%" : "45%",
                  height: "53.89%",
                  right: "-25%",
                  bottom: "5.56%"
                }}
              />
            )}

          </div>
        </div>
      </div>

      {/* Modal for adding a new task */}
      {showAddTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 max-h-96 overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Add New Task</h2>
            <form onSubmit={handleAddTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  className="w-full p-2 border rounded"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Priority</label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                  className="w-full p-2 border rounded"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Class</label>
                <input
                  type="text"
                  value={newTask.class}
                  onChange={(e) => setNewTask({...newTask, class: e.target.value})}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <input
                  type="text"
                  value={newTask.type}
                  onChange={(e) => setNewTask({...newTask, type: e.target.value})}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Start Date</label>
                <input
                  type="date"
                  value={newTask.start_date}
                  onChange={(e) => setNewTask({...newTask, start_date: e.target.value})}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Due Date</label>
                <input
                  type="date"
                  value={newTask.due_date}
                  onChange={(e) => setNewTask({...newTask, due_date: e.target.value})}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                >
                  Add Task
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddTask(false)}
                  className="flex-1 bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}