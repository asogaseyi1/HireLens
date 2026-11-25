import type {
  AuthResponse,
  DocumentType,
  GeneratedDocument,
  JobApplication,
  JobApplicationInput,
  Profile,
  User,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5297";
const TOKEN_KEY = "hirelens_token";

export const tokenStore = {
  get: (): string | null => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

// Called when any request comes back 401 so the app can log the user out.
let onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = tokenStore.get();
  const headers = new Headers(init.headers);
  if (init.body) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { ...init, headers });
  } catch {
    throw new ApiError(0, "Can't reach the HireLens API. Is the backend running?");
  }

  if (res.status === 401 && token) onUnauthorized?.();

  if (!res.ok) {
    throw new ApiError(res.status, await errorMessage(res));
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

// Turns ASP.NET ProblemDetails / ValidationProblemDetails into a readable message.
async function errorMessage(res: Response): Promise<string> {
  try {
    const body = await res.json();
    if (body.errors && typeof body.errors === "object") {
      const msgs = Object.values(body.errors as Record<string, string[]>).flat();
      if (msgs.length) return msgs.join(" ");
    }
    if (body.title) return body.title;
  } catch {
    /* non-JSON body */
  }
  return `Request failed (${res.status})`;
}

const json = (body: unknown) => JSON.stringify(body);

export const api = {
  register: (email: string, password: string, fullName?: string) =>
    request<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: json({ email, password, fullName }),
    }),
  login: (email: string, password: string) =>
    request<AuthResponse>("/api/auth/login", { method: "POST", body: json({ email, password }) }),
  me: () => request<User>("/api/auth/me"),

  getProfile: () => request<Profile>("/api/profile"),
  updateProfile: (data: { fullName: string | null; baseResume: string | null }) =>
    request<Profile>("/api/profile", { method: "PUT", body: json(data) }),

  listApplications: () => request<JobApplication[]>("/api/applications"),
  getApplication: (id: number) => request<JobApplication>(`/api/applications/${id}`),
  createApplication: (data: JobApplicationInput) =>
    request<JobApplication>("/api/applications", { method: "POST", body: json(data) }),
  updateApplication: (id: number, data: JobApplicationInput) =>
    request<JobApplication>(`/api/applications/${id}`, { method: "PUT", body: json(data) }),
  deleteApplication: (id: number) =>
    request<void>(`/api/applications/${id}`, { method: "DELETE" }),

  listDocuments: (applicationId: number) =>
    request<GeneratedDocument[]>(`/api/applications/${applicationId}/documents`),
  generateDocument: (applicationId: number, type: DocumentType) =>
    request<GeneratedDocument>(`/api/applications/${applicationId}/documents`, {
      method: "POST",
      body: json({ type }),
    }),
  deleteDocument: (id: number) => request<void>(`/api/documents/${id}`, { method: "DELETE" }),
};
