import React, { useState } from "react";
import Notebook from "./Notebook";
import Floor from "./Floor";
import GrayCat1 from "../assets/gray_cat1.png";
import Window1 from "../assets/items/window_1.png";
import Plant1 from "../assets/items/pottedplant_1.png";
import TaskbookL from "../assets/L_TaskBook.png";
import Tasks_Selected_tab from "../assets/Tasks_Selected_tab.png";
import Tasks_Untoggled_tab from "../assets/Tasks_Untoggled_tab.png";
import Add_New_Task_button from "../assets/Add_New_Task_button.png";
import pageflip_icon from "../assets/items/pageflip_icon.png";

export default function TasksPage() {
  const [selectedTab, setSelectedTab] = useState('not-started');

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#dbb9a0] flex justify-center items-center">
      {/* Floor */}
      <div className="pointer-events-none absolute inset-0">
        <Floor />
      </div>

      {/* Responsive Container with fixed aspect ratio */}
      <div className="relative w-full h-full flex justify-center items-center p-4">
        <div
          className="relative"
          style={{
            width: "100%",
            height: "100%",
            maxWidth: "1200px",
            maxHeight: "900px",
            aspectRatio: "4/3",
          }}
        >
          {/* Scaled Content Container */}
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

            {/* Progress Tabs - positioned right above content overlay */}
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
                    fontSize: '2vmin',
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
                    fontSize: '2vmin',
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
                    fontSize: '2vmin',
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
              className="absolute z-20 flex flex-col gap-4 p-6"
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
              <h1 className="font-dynapuff text-[#AD7B5C]" style={{ fontSize: '3.33vmin' }}> </h1>
              <p className="text-[#8F674D]" style={{ fontSize: '1.67vmin' }}>Here's your task list and progress.</p>

              <ul className="mt-4 space-y-3">
                <li className="bg-[#f0e6d2] p-3 rounded-2xl font-bold" style={{ fontSize: '1.5vmin' }}>
                  Task 1: Feed the cat
                </li>
                <li className="bg-[#f0e6d2] p-3 rounded-2xl font-bold" style={{ fontSize: '1.5vmin' }}>
                  Task 2: Buy cat toys
                </li>
                <li className="bg-[#f0e6d2] p-3 rounded-2xl font-bold" style={{ fontSize: '1.5vmin' }}>
                  Task 3: Walk the dog
                </li>
              </ul>
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
              onClick={() => setSelectedTab('add-new-task')}
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

            {/* Cat */}
            <img
              src={GrayCat1}
              alt="Cat"
              className="absolute z-30 object-contain drop-shadow-[0_0_20px_rgba(0,0,0,0.2)]"
              style={{
                width: "55.08%",
                height: "53.89%",
                right: "-25%",
                bottom: "5.56%"
              }}
            />

          </div>
        </div>
      </div>
    </div>
  );
}