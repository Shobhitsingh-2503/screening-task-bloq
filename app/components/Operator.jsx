"use client";

import React, { useState, useEffect } from "react";
import { margin, operators, size } from "../data/operators.jsx";
import { Eye } from "lucide-react";

export default function Operator({
  title,
  itemId,
  fill,
  height,
  width,
  components = [],
  isCustom,
  symbol,
  onXRayToggle,
  isXRayMode,
  style = {},
  isXRayExpansionAllowed,
}) {
  const [localXRayMode, setLocalXRayMode] = useState(isXRayMode || false);
  const [blockedFeedback, setBlockedFeedback] = useState(false);

  // Sync with parent state
  useEffect(() => {
    setLocalXRayMode(isXRayMode || false);
  }, [isXRayMode]);

  // Calculate XRay view dimensions
  const getXRayDimensions = () => {
    if (!localXRayMode || !components.length) {
      return { 
        width: size, 
        height: height * size + (height - 1) * margin.y 
      };
    }

    const minX = Math.min(...components.map((c) => c.x));
    const maxX = Math.max(...components.map((c) => c.x));
    const minY = Math.min(...components.map((c) => c.y));
    const maxY = Math.max(...components.map((c) => c.y));

    const xRayWidth = (maxX - minX + 1) * size + (maxX - minX) * margin.x;
    const xRayHeight = (maxY - minY + 1) * size + (maxY - minY) * margin.y;

    return { width: xRayWidth, height: xRayHeight };
  };

  const { width: svgWidth, height: svgHeight } = getXRayDimensions();

  // Get the operator definition for a component
  const getComponentOperator = (gateId) => {
    return operators.find((op) => op.id === gateId);
  };

  // Handle XRay toggle
  const handleXRayToggle = () => {
    if (!localXRayMode && isCustom && isXRayExpansionAllowed) {
      // About to expand: check with parent
      if (!isXRayExpansionAllowed(itemId)) {
        setBlockedFeedback(true);
        setTimeout(() => setBlockedFeedback(false), 600);
        return;
      }
    }
    const newXRayMode = !localXRayMode;
    setLocalXRayMode(newXRayMode);
    if (onXRayToggle && itemId) {
      onXRayToggle(itemId, newXRayMode);
    }
  };

  // Render individual components in XRay mode
  const renderXRayComponents = () => {
    if (!localXRayMode || !components.length) return null;

    const minX = Math.min(...components.map((c) => c.x));
    const minY = Math.min(...components.map((c) => c.y));

    return components.map((component, index) => {
      const componentOp = getComponentOperator(component.gateId);
      if (!componentOp) return null;

      const xPos = (component.x - minX) * (size + margin.x);
      const yPos = (component.y - minY) * (size + margin.y);
      const componentWidth = component.w * size + (component.w - 1) * margin.x;
      const componentHeight = component.h * size + (component.h - 1) * margin.y;

      return (
        <g key={index}>
          <rect
            fill={componentOp.fill}
            height={componentHeight}
            rx="4"
            width={componentWidth}
            x={xPos}
            y={yPos}
          />
          <g transform={`translate(${xPos}, ${yPos})`}>
            <text
              dominantBaseline="middle"
              fill="white"
              fontFamily="'Arial Black', Arial, sans-serif"
              fontSize={16}
              textAnchor="middle"
              x={componentWidth / 2}
              y={componentHeight / 2}
            >
              H
            </text>
          </g>
        </g>
      );
    });
  };

  return (
    <div
      style={{ ...style }}
      className={`group relative ${blockedFeedback ? 'ring-2 ring-red-500 animate-shake' : ''}`}
    >
      <svg
        className={`z-40 absolute top-0 left-0 transition-all duration-200 ${
          localXRayMode ? "scale-100" : "scale-100"
        }`}
        height={svgHeight}
        width={svgWidth}
        overflow="visible"
        xmlns="http://www.w3.org/2000/svg"
      >
        {localXRayMode ? (
          // XRay mode: render individual components with background
          <>
            <rect
              fill="rgba(255, 255, 255, 0.9)"
              stroke="rgba(59, 130, 246, 0.3)"
              strokeWidth="2"
              height={svgHeight}
              width={svgWidth}
              rx="8"
              x="0"
              y="0"
            />
            {renderXRayComponents()}
          </>
        ) : (
          // Normal mode: render the main gate
          <>
            <rect
              fill={fill}
              height={height * size + (height - 1) * margin.y}
              rx="4"
              width={size}
              x="0"
              y="0"
            />
            {symbol}
          </>
        )}
      </svg>
      {isCustom && (
        <button
          aria-label="Toggle X-Ray Mode"
          className={`${
            !localXRayMode && "group-hover:block hidden"
          } absolute top-0 left-[-20px] bg-white cursor-pointer border border-gray-300 z-50 rounded-full shadow transform translate-x-1/2 -translate-y-1/2 hover:bg-gray-50 transition-colors`}
          onClick={(e) => {
            e.stopPropagation();
            handleXRayToggle();
          }}
          style={{
            width: 20,
            height: 20,
            minWidth: 0,
            padding: 2,
            zIndex: 100,
          }}
        >
          {localXRayMode ? (
            <Eye size={12} color="#3b82f6" />
          ) : (
            <Eye size={12} />
          )}
        </button>
      )}
    </div>
  );
}
