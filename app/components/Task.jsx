"use client";

import React, { useState } from "react";
import { ChevronsDownUp, ChevronsUpDown, Eye, Info } from "lucide-react";
import Image from "next/image";

const Task = () => {
  const [showTask, setShowTask] = useState(true);
  return (
    <div className="bg-blue-50 border-l-4 border-blue-400 p-6 my-4 rounded-md shadow">
      <div className="flex justify-center mb-4">
        <img
          src="/bloq-logo.svg"
          alt="Bloq Logo"
          className="h-16 w-auto drop-shadow-lg"
        />
      </div>
      <h1 className="text-xl font-bold text-center text-blue-800 mb-4 drop-shadow-lg tracking-wide">
        Welcome to the Quantum Circuit Builder!
      </h1>
      <button
        className="grow-0 mx-auto mb-2 px-3 py-1 rounded bg-blue-200 hover:bg-blue-300 text-blue-800 font-semibold shadow flex items-center justify-center"
        onClick={() => setShowTask((v) => !v)}
        aria-label={showTask ? "Hide Task" : "Show Task"}
      >
        {showTask ? (
          <ChevronsDownUp className="h-5 w-5" />
        ) : (
          <ChevronsUpDown className="h-5 w-5" />
        )}
      </button>
      {showTask && (
        <>
          <h2 className="text-lg font-semibold mb-1 text-blue-600">
            About This App
          </h2>
          <p className="mb-4 text-gray-700">
            This is a visual quantum circuit builder. You can drag and drop
            quantum gates (operators) onto a grid to construct quantum circuits.
            Some gates can be composed of other elementary gates. Here,{" "}
            <span className="monospace text-gray-500">CG</span> is composed of
            four Hadamard gates in a certain configuration.
          </p>
          <h3 className="text-lg font-semibold mb-1 text-blue-600">
            Your Task
          </h3>
          <div className="mb-4 p-4 rounded-lg border-l-4 border-purple-400 bg-purple-50 shadow-sm">
            <h4 className="font-bold text-purple-700 mb-2">
              Task 1: XRay View for Custom Gate
            </h4>
            <p className="mb-2">
              CG is a custom gate composed of four Hadamard gates as described
              in the <span className="italic">components</span> field in the
              operator definition.
            </p>
            <p className="mb-2">
              Implement an{" "}
              <span className="text-gray-500 font-semibold">XRay View</span> for
              the custom gate that expands it to show its components in a grid
              layout.
            </p>
            <p className="mb-2">
              The expanded view should be toggled by clicking on the Eye (
              <Eye className="inline" size={12} />) icon that appears when you
              hover over the custom gate.
            </p>
            <div className="flex flex-col items-center my-2">
              <span className="text-xs text-gray-500 mb-1">
                XRay View Sample
              </span>
              <video
                className="rounded border shadow w-full max-w-md"
                height={100}
                width={300}
                autoPlay
                loop
                muted
                playsInline
              >
                <source src="/xray-sample.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
          <div className="mb-4 p-4 rounded-lg border-l-4 border-green-400 bg-green-50 shadow-sm">
            <h4 className="font-bold text-green-700 mb-2">
              Task 2: Support Gates of Varying Width
            </h4>
            <p className="mb-2">
              Add support for gates of varying width. When a custom gate is
              expanded, it can appear to span multiple columns. Ensure that the
              following conditions are met:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-2">
              <li>
                Any gates in the same row (qubit) should{" "}
                <span className="font-semibold">not</span> overlap.
                <Image
                  src="/overlap-sample.png"
                  alt="overlap"
                  className="my-2 mx-auto"
                  height={100}
                  width={300}
                />
              </li>
              <li>
                A gate spanning a width more than the default width of a column
                (here, CG in expanded view) should continue to have at most one
                gate in the same column across all qubits (hence effectively
                constituting only one column).
                <Image
                  src="/col-sample.png"
                  alt="overlap"
                  className="my-2 mx-auto"
                  height={100}
                  width={300}
                />
              </li>
            </ul>
          </div>
          <div className="mt-4 flex items-start">
            <Info className="inline flex-shrink-0 h-3 w-3 text-blue-500 mr-3 mt-1" />
            <span className="text-sm text-gray-600">
              There are no constraints on how the solution should be implemented
              - only ensure that you can defend your choices.
            </span>
          </div>
        </>
      )}
    </div>
  );
};

export default Task;
