import type { ReactNode } from "react";

export function inputClass(hasError: boolean): string {
  return `w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 ${
    hasError
      ? "border-red-400 focus:border-red-500 focus:ring-red-200"
      : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-200"
  }`;
}

interface FormFieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  children: ReactNode;
}

export default function FormField({ label, htmlFor, error, children }: FormFieldProps) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
