import { Link } from "react-router-dom";
import type { Content } from "../types";
import { formatDate } from "../utils/formatDate";

export default function ContentCard({ content }: { content: Content }) {
  return (
    <Link
      to={`/content/${content.id}`}
      className="flex h-full flex-col rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition hover:border-indigo-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
    >
      <span className="mb-3 inline-flex w-fit items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
        {content.category}
      </span>
      <h3 className="text-base font-semibold text-gray-900">{content.title}</h3>
      <p className="mt-2 line-clamp-2 text-sm text-gray-600">{content.summary}</p>
      <div className="mt-auto pt-4 text-xs text-gray-500">
        <span className="font-medium text-gray-700">{content.authorName}</span>
        <span className="mx-1.5">·</span>
        <span>Actualizado {formatDate(content.updatedAt)}</span>
      </div>
    </Link>
  );
}
