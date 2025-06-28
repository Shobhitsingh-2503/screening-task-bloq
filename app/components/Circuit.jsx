import ReactGridLayout from "react-grid-layout";
import React, { useEffect } from "react";
import Operator from "./Operator";
import { margin, operators, size } from "../data/operators";

// constants describing grid layout
const circuitContainerPadding = {
  x: 0,
  y: 0,
};
const containerPadding = {
  x: 10,
  y: 10,
};
const circuitLineMarginL = 40;
const circuitLineMarginR = 50;
const gridDimenY = 3; // Number of rows in the grid (qubits)
const gridDimenX = 10; // Number of columns in the grid

export default ({ droppingItem }) => {
  const [layout, setLayout] = React.useState([]); /* Layout of the circuit as 
    an array of objects, each representing a gate with properties:
        i - unique id
        gateId - the ID of the gate corresponding to the operator from operators.js
        x - x position in the grid (column)
        y - y position in the grid (row or qubit)
        w - width (number of columns it occupies, usually 1)
        h - height of the gate (range of qubits it occupies)
    */
  const [droppingItemHeight, setDroppingItemHeight] = React.useState(1); // Height of the dropping item, used to adjust the placeholder height during drag-and-drop of a new gate
  const [draggedItemId, setDraggedItemId] = React.useState(null); // ID of the item being dragged, used to handle drag-and-drop events of existing gates
  const [xrayStates, setXrayStates] = React.useState({}); // Track which gates are in XRay mode
  const [shiftedGatesMap, setShiftedGatesMap] = React.useState({});

  // Set the dropping item height for placeholder based on the height described in the operators array
  useEffect(() => {
    if (!droppingItem) {
      return;
    }
    setDroppingItemHeight(
      operators.find((op) => op.id === droppingItem)?.height ?? 1
    );
  }, [droppingItem]);

  // Calculate visual width of a gate (considering XRay mode)
  const getGateVisualWidth = (item) => {
    const gate = operators.find((op) => op.id === item.gateId);
    if (!gate || !gate.isCustom || !xrayStates[item.i]) {
      return 1; // Normal width
    }

    // Calculate XRay width based on components
    if (gate.components && gate.components.length > 0) {
      const minX = Math.min(...gate.components.map((c) => c.x));
      const maxX = Math.max(...gate.components.map((c) => c.x));
      return maxX - minX + 1;
    }
    return 1;
  };

  // Check if dropping a gate at the given position would cause visual overlap
  const wouldCauseVisualOverlap = (newItem) => {
    const newGate = operators.find((op) => op.id === newItem.gateId);
    const newVisualWidth = newGate?.isCustom
      ? newGate.components?.length > 0
        ? Math.max(...newGate.components.map((c) => c.x)) -
          Math.min(...newGate.components.map((c) => c.x)) +
          1
        : 1
      : 1;

    return layout.some((existingItem) => {
      // Skip the item being dragged
      if (existingItem.i === draggedItemId) return false;

      const existingVisualWidth = getGateVisualWidth(existingItem);

      // Check for overlap in the same rows (qubits)
      const newItemRows = Array.from(
        { length: newItem.h },
        (_, i) => newItem.y + i
      );
      const existingItemRows = Array.from(
        { length: existingItem.h },
        (_, i) => existingItem.y + i
      );
      const hasRowOverlap = newItemRows.some((row) =>
        existingItemRows.includes(row)
      );

      if (!hasRowOverlap) return false;

      // Check for column overlap considering visual widths
      const newItemColumns = Array.from(
        { length: newVisualWidth },
        (_, i) => newItem.x + i
      );
      const existingItemColumns = Array.from(
        { length: existingVisualWidth },
        (_, i) => existingItem.x + i
      );
      const hasColumnOverlap = newItemColumns.some((col) =>
        existingItemColumns.includes(col)
      );

      return hasColumnOverlap;
    });
  };

  // Check if expanding a custom gate would cause overlap
  const isXRayExpansionAllowed = (itemId) => {
    const item = layout.find((i) => i.i === itemId);
    if (!item) return false;
    const gate = operators.find((op) => op.id === item.gateId);
    if (!gate || !gate.isCustom || !gate.components) return true;

    // Calculate the absolute positions of all components in the expanded view
    const minX = Math.min(...gate.components.map((c) => c.x));
    const minY = Math.min(...gate.components.map((c) => c.y));
    const componentPositions = gate.components.map((c) => ({
      x: item.x + (c.x - minX),
      y: item.y + (c.y - minY),
    }));

    // For each component position, check if any other gate occupies that cell
    for (const pos of componentPositions) {
      for (const other of layout) {
        if (other.i === itemId) continue;
        // For each cell occupied by the other gate
        for (let dx = 0; dx < (other.w || 1); dx++) {
          for (let dy = 0; dy < (other.h || 1); dy++) {
            if (other.x + dx === pos.x && other.y + dy === pos.y) {
              return false;
            }
          }
        }
      }
    }
    return true;
  };

  // Handle XRay mode toggle from child components
  const handleXRayToggle = (itemId, isXRayMode) => {
    if (isXRayMode) {
      // About to expand: shift all gates in the columns that the expanded CG will occupy, if possible
      const item = layout.find((i) => i.i === itemId);
      const gate = operators.find((op) => op.id === item.gateId);
      if (gate && gate.isCustom && gate.components) {
        const minX = Math.min(...gate.components.map((c) => c.x));
        const maxX = Math.max(...gate.components.map((c) => c.x));
        const expansionWidth = maxX - minX + 1;
        const expansionCols = Array.from({length: expansionWidth}, (_, i) => item.x + i);
        // Calculate the rows (qubits) the custom gate expansion covers
        const expansionRows = Array.from({length: item.h || 1}, (_, i) => item.y + i);

        // Calculate expansion columns and rows
        const shiftCols = expansionCols.filter(col => col !== item.x);
        const maxExpansionRow = Math.max(...expansionRows);

        // Find all gates to shift
        const toShift = layout.filter((g) => {
          if (g.i === itemId) return false;
          // Don't shift gates in the original column
          const gateCols = Array.from({length: g.w || 1}, (_, dx) => g.x + dx);
          if (gateCols.includes(item.x)) return false;
          // Check if this gate is in shiftCols and (in expansionRows or below the lowest expansion row)
          for (let dx = 0; dx < (g.w || 1); dx++) {
            for (let dy = 0; dy < (g.h || 1); dy++) {
              const gx = g.x + dx;
              const gy = g.y + dy;
              if (
                shiftCols.includes(gx) &&
                (expansionRows.includes(gy) || gy > maxExpansionRow)
              ) {
                return true;
              }
            }
          }
          return false;
        });

        // Check if all can be shifted right by expansionWidth without overlap or out of bounds
        let canShift = true;
        for (const g of toShift) {
          const newX = g.x + expansionWidth;
          // Check for out of bounds
          if (newX + (g.w || 1) - 1 >= gridDimenX) {
            canShift = false;
            break;
          }
          // Check for overlap with any other gate (except those that will also be shifted)
          for (const other of layout) {
            if (other.i === g.i || other.i === itemId) continue;
            // If the other gate is also being shifted, skip overlap check (they move together)
            if (toShift.find((s) => s.i === other.i)) continue;
            for (let dx = 0; dx < (g.w || 1); dx++) {
              for (let dy = 0; dy < (g.h || 1); dy++) {
                const gx = newX + dx;
                const gy = g.y + dy;
                for (let odx = 0; odx < (other.w || 1); odx++) {
                  for (let ody = 0; ody < (other.h || 1); ody++) {
                    if (gx === other.x + odx && gy === other.y + ody) {
                      canShift = false;
                    }
                  }
                }
              }
            }
          }
        }
        if (!canShift) {
          // Block expansion, show feedback (handled in Operator)
          setXrayStates((prev) => ({
            ...prev,
            [itemId]: false,
          }));
          return;
        }
        // Track original positions
        const shifted = {};
        toShift.forEach((g) => {
          shifted[g.i] = { x: g.x, y: g.y };
        });
        setShiftedGatesMap((prev) => ({ ...prev, [itemId]: shifted }));
        // Shift all toShift gates by 1 column (not by expansionWidth)
        const newLayout = layout.map((g) => {
          if (shifted[g.i]) {
            return { ...g, x: g.x + expansionWidth - 1 };
          }
          return g;
        });
        setLayout(newLayout);
      }
    } else {
      // Collapsing: restore shifted gates to their original positions
      const shifted = shiftedGatesMap[itemId] || {};
      const newLayout = layout.map((g) => {
        if (shifted[g.i]) {
          return { ...g, x: shifted[g.i].x, y: shifted[g.i].y };
        }
        return g;
      });
      setLayout(newLayout);
      setShiftedGatesMap((prev) => {
        const newMap = { ...prev };
        delete newMap[itemId];
        return newMap;
      });
    }
    setXrayStates((prev) => ({
      ...prev,
      [itemId]: isXRayMode,
    }));
  };

  // Update the layout
  const handleCircuitChange = (newCircuit) => {
    setLayout(newCircuit.layout);
  };

  // Handle dropping a new gate onto the circuit
  const onDrop = (newLayout, layoutItem, event) => {
    event.preventDefault();

    let gateId = event.dataTransfer.getData("gateId");
    const isCustomGate = event.dataTransfer.getData("isCustomGate") === "true";
    const height = operators.find((op) => op.id === gateId)?.height || 1;

    if (layoutItem.y + height > gridDimenY) {
      return; // Prevent dropping if the gate exceeds the grid height
    }

    const newItem = {
      i: new Date().getTime().toString(), // unique id
      gateId: gateId,
      x: layoutItem.x,
      y: layoutItem.y,
      w: 1, // Keep logical width as 1 for ReactGridLayout
      h: height,
      isResizable: false,
    };

    // Check for visual overlap before allowing drop
    if (wouldCauseVisualOverlap(newItem)) {
      return; // Prevent dropping if it would cause visual overlap
    }

    const updatedLayout = newLayout
      .filter((item) => item.i !== "__dropping-elem__" && item.y < gridDimenY)
      .map((item) => {
        return {
          ...item,
          gateId: layout.find((i) => i.i === item.i)?.gateId,
        };
      });
    updatedLayout.push(newItem);

    handleCircuitChange({
      layout: updatedLayout,
    });

    return;
  };

  // Update the layout when a gate is dragged and dropped
  const handleDragStop = (newLayout) => {
    if (!draggedItemId) {
      console.error("Dragged item ID is missing on drag stop!");
      return;
    }

    const draggedItem = newLayout.find((item) => item.i === draggedItemId);
    if (draggedItem && wouldCauseVisualOverlap(draggedItem)) {
      // Revert to previous layout if move would cause visual overlap
      return;
    }

    const updatedLayout = newLayout
      .filter((item) => item.i !== "__dropping-elem__" && item.y < gridDimenY)
      .map((item) => {
        return {
          ...item,
          gateId: layout.find((i) => i.i === item.i)?.gateId,
        };
      });
    setLayout(updatedLayout);
    setDraggedItemId(null);
  };

  return (
    <div
      className="relative bg-white border-2 border-gray-200 m-2 shadow-lg rounded-lg"
      style={{
        boxSizing: "content-box",
        padding: `${circuitContainerPadding.y}px ${circuitContainerPadding.x}px`,
        minWidth: `${
          2 * containerPadding.x + gridDimenX * (size + margin.x)
        }px`,
        width: `${
          2 * containerPadding.x +
          gridDimenX * (size + margin.x) +
          size / 2 +
          margin.x
        }px`,
        height: `${
          2 * containerPadding.y + gridDimenY * (size + margin.y) - margin.y
        }px`,
        overflow: "visible", // Changed from "hidden" to "visible" to allow XRay expansion
      }}
    >
      <ReactGridLayout
        allowOverlap={false}
        layout={layout}
        useCSSTransforms={false}
        className="relative z-20"
        cols={gridDimenX}
        compactType={null}
        containerPadding={[containerPadding.x, containerPadding.y]}
        droppingItem={{
          i: "__dropping-elem__",
          h: droppingItemHeight,
          w: 1,
        }}
        isBounded={false}
        isDroppable={true}
        margin={[margin.x, margin.y]}
        onDrag={() => {
          const placeholderEl = document.querySelector(
            ".react-grid-placeholder"
          );
          if (placeholderEl) {
            placeholderEl.style.backgroundColor = "rgba(235, 53, 53, 0.2)";
            placeholderEl.style.border = "2px dashed blue";
          }
        }}
        onDragStart={(layout, oldItem) => {
          const draggedItemId = oldItem?.i;
          if (!draggedItemId) {
            console.error("Dragged item ID is missing!");
            return;
          }
          setDraggedItemId((prev) => {
            return draggedItemId;
          });
        }}
        onDragStop={(layout, oldItem, newItem) => {
          handleDragStop(layout);
        }}
        onDrop={onDrop}
        preventCollision={true}
        rowHeight={size}
        style={{
          minHeight: `${
            2 * containerPadding.y + gridDimenY * (size + margin.y) - margin.y
          }px`,
          maxHeight: `${
            2 * containerPadding.y + gridDimenY * (size + margin.y) - margin.y
          }px`,
          overflowY: "visible",
          marginLeft: `${circuitLineMarginL}px`,
          marginRight: `${circuitLineMarginR}px`,
        }}
        width={gridDimenX * (size + margin.x)}
      >
        {layout?.map((item, index) => {
          const gate = operators.find((op) => op.id === item.gateId);
          if (!gate) {
            console.warn(`Gate with ID ${item.gateId} not found in operators.`);
            return null;
          }
          return (
            <div
              className="grid-item relative group"
              data-grid={item}
              key={`${item.i}`}
            >
              <Operator
                itemId={item.i}
                symbol={gate.icon}
                height={gate.height}
                width={gate.width}
                fill={gate.fill}
                isCustom={gate.isCustom}
                components={gate.components ?? []}
                onXRayToggle={handleXRayToggle}
                isXRayMode={xrayStates[item.i] || false}
                isXRayExpansionAllowed={isXRayExpansionAllowed}
              />
            </div>
          );
        })}
      </ReactGridLayout>
      <div
        className="absolute top-0 left-0 z-10"
        style={{
          width: `${
            2 * containerPadding.x + gridDimenX * (size + margin.x) + size / 2
          }px`,
        }}
      >
        {[...new Array(gridDimenY)].map((_, index) => (
          <div
            className={"absolute flex group"}
            key={index}
            style={{
              height: `${size}px`,
              width: "100%",
              top: `${
                circuitContainerPadding.y +
                containerPadding.y +
                index * size +
                size / 2 +
                index * margin.y
              }px`,
              paddingLeft: `${circuitLineMarginL}px`,
            }}
          >
            <div className="absolute top-0 -translate-y-1/2 left-2 font-mono">
              Q<sub>{index}</sub>
            </div>
            <div
              className="h-[1px] bg-gray-400 grow"
              data-line={index}
              data-val={index + 1}
              key={`line-${index}`}
            ></div>
          </div>
        ))}
      </div>
    </div>
  );
};
