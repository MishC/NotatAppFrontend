// utils/colors.js
export const colors = [
  "bg-red-100",
  "bg-orange-100",
  "bg-amber-100",
  "bg-yellow-100",
  "bg-green-100",
  "bg-lime-200",
  "bg-teal-100",
  "bg-blue-100",
  "bg-sky-100",
  "bg-indigo-100",
  "bg-purple-100",
  "bg-pink-100",
  "bg-rose-100",
];

export function getRandomColor() {
  return colors[Math.floor(Math.random() * colors.length)];
}

export function getColorById(id) {
  // make sure id is a string
  const str = String(id);
  // simple hash: sum of char codes
  const hash = [...str].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  // pick consistent index
  return colors[hash % colors.length];
}


// src/helpers/colors.js
export function getColorClassById(id) {
  const i = Math.abs(Number(id)) % 8; // 0..7
  return `note-color-${i + 1}`;
}
