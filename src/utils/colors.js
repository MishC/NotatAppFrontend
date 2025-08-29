// utils/colors.js
export const colors = [
  "bg-red-100",
  "bg-blue-100",
  "bg-green-100",
  "bg-yellow-100",
  "bg-purple-100",
  "bg-pink-100",
  "bg-orange-100",
  "bg-teal-100",
];

export function getRandomColor() {
  return colors[Math.floor(Math.random() * colors.length)];
}
