import { randomUUID } from "node:crypto";
import type { Content } from "../config/db";
import { getDb } from "../config/db";
import type { CreateContentInput, ListContentQuery, UpdateContentInput } from "../schemas/content.schema";
import { HttpError } from "../utils/httpError";

export interface ContentListItem {
  id: string;
  title: string;
  category: string;
  summary: string;
  authorName: string;
  updatedAt: string;
}

export interface ContentDetail extends Content {
  author: { id: string; name: string; email: string } | null;
  authorName: string;
}

const UNKNOWN_AUTHOR = "Desconocido";

function authorNameOf(authorId: string): string {
  return getDb().data.users.find((u) => u.id === authorId)?.name ?? UNKNOWN_AUTHOR;
}

function toDetail(content: Content): ContentDetail {
  const author = getDb().data.users.find((u) => u.id === content.authorId);
  return {
    ...content,
    author: author ? { id: author.id, name: author.name, email: author.email } : null,
    authorName: author?.name ?? UNKNOWN_AUTHOR,
  };
}

function findOrThrow(id: string): Content {
  const content = getDb().data.contents.find((c) => c.id === id);
  if (!content) {
    throw new HttpError(404, "Contenido no encontrado");
  }
  return content;
}

export function listContents(query: ListContentQuery): ContentListItem[] {
  const search = query.search?.toLowerCase();
  const category = query.category;

  return getDb()
    .data.contents.filter((c) => {
      if (category && c.category !== category) return false;
      if (search && !c.title.toLowerCase().includes(search) && !c.summary.toLowerCase().includes(search)) {
        return false;
      }
      return true;
    })
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .map((c) => ({
      id: c.id,
      title: c.title,
      category: c.category,
      summary: c.summary,
      authorName: authorNameOf(c.authorId),
      updatedAt: c.updatedAt,
    }));
}

export function getContent(id: string): ContentDetail {
  return toDetail(findOrThrow(id));
}

export async function createContent(input: CreateContentInput, authorId: string): Promise<ContentDetail> {
  const db = getDb();
  const now = new Date().toISOString();

  const content: Content = {
    id: randomUUID(),
    title: input.title,
    category: input.category,
    summary: input.summary,
    body: input.body,
    createdAt: now,
    updatedAt: now,
    authorId,
  };

  db.data.contents.push(content);
  await db.write();
  return toDetail(content);
}

export async function updateContent(id: string, input: UpdateContentInput): Promise<ContentDetail> {
  const db = getDb();
  const content = findOrThrow(id);

  if (input.title !== undefined) content.title = input.title;
  if (input.category !== undefined) content.category = input.category;
  if (input.summary !== undefined) content.summary = input.summary;
  if (input.body !== undefined) content.body = input.body;
  content.updatedAt = new Date().toISOString();

  await db.write();
  return toDetail(content);
}

export async function deleteContent(id: string): Promise<void> {
  const db = getDb();
  findOrThrow(id);
  db.data.contents = db.data.contents.filter((c) => c.id !== id);
  await db.write();
}
