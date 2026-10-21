import type { Role } from "../types";

export default function RoleBadge({ role }: { role: Role }) {
  const isAdmin = role === "admin";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        isAdmin ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-700"
      }`}
    >
      {isAdmin ? "Admin" : "Viewer"}
    </span>
  );
}
