import React from "react";
import Notebook from "./Notebook";
import GrayCat1 from "../assets/gray_cat1.png";

export default function TasksPage() {
  return (
    <div className="flex flex-row justify-between items-center h-full w-full px-10">
      {/* Notebook on the left */}
      <div className="flex-1 flex justify-center">
        <Notebook>
          <div className="flex flex-col gap-4 p-6">
            <h1 className="text-5xl font-dynapuff text-[#AD7B5C]">📋 Tasks</h1>
            <p className="text-2xl text-[#8F674D]">
              Here’s your task list and progress.
            </p>

            <ul className="mt-6 space-y-3">
              <li className="bg-[#f0e6d2] p-4 rounded-2xl text-xl font-bold">
                Task 1: Feed the cat
              </li>
              <li className="bg-[#f0e6d2] p-4 rounded-2xl text-xl font-bold">
                Task 2: Buy cat toys
              </li>
              <li className="bg-[#f0e6d2] p-4 rounded-2xl text-xl font-bold">
                Task 3: Walk the dog
              </li>
            </ul>
          </div>
        </Notebook>
      </div>

      {/* Cat on the right */}
      <div className="flex-1 flex justify-center items-center">
        <img
          src={GrayCat1}
          alt="Cat"
          className="w-[350px] h-auto drop-shadow-[0_0_20px_rgba(0,0,0,0.2)]"
        />
      </div>
    </div>
  );
}