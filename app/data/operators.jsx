export const size = 40; // Size of each cell in the grid
export const margin = {
  x: 10,
  y: 10,
}; // margin between cells

const fill = "red";
const altFill = "blue";

export const operators = [
  {
    id: "Hadamard",
    title: "Hadamard",
    height: 1,
    width: 1,
    fill: fill,
    icon: (
      <>
        <text
          dominantBaseline="middle"
          fill="white"
          fontFamily="'Arial Black', Arial, sans-serif"
          fontSize={16}
          textAnchor="middle"
          x={size / 2}
          y={size / 2}
        >
          H
        </text>
      </>
    ),
    isCustom: false,
  },
  {
    id: "CustomGate",
    title: "Custom Gate",
    height: 2,
    width: 1,
    fill: altFill,
    icon: (
      <>
        <text
          dominantBaseline="middle"
          fill="white"
          fontFamily="'Arial Black', Arial, sans-serif"
          fontSize={16}
          textAnchor="middle"
          x={size / 2}
          y={size / 2}
        >
          CG
        </text>
      </>
    ),
    components: [
      {
        gateId: "Hadamard",
        x: 0,
        y: 0,
        w: 1,
        h: 1,
      },
      {
        gateId: "Hadamard",
        x: 1,
        y: 0,
        w: 1,
        h: 1,
      },
      {
        gateId: "Hadamard",
        x: 2,
        y: 0,
        w: 1,
        h: 1,
      },
      {
        gateId: "Hadamard",
        x: 3,
        y: 1,
        w: 1,
        h: 1,
      },
    ],
    isCustom: true,
  },
];
