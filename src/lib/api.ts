import { VisualScanDTO } from "@/types/vision";

const API_BASE_URL = "http://localhost:5000/api";

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  mobileNumber?: string;
  createdAt: string;
}

export interface ScanDTO {
  _id: string;
  userId: string;
  scanDate: string;
  wallType: "solid" | "hollow" | "cracked";
  label: string;
  confidenceScore: number;
  peakFrequency: number;
  rms: number;
  duration: number;
  fftSummary: number[];
  recommendation: string;
  audioPath?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStatsDTO {
  totalScans: number;
  todayScans: number;
  solidCount: number;
  hollowCount: number;
  crackedCount: number;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; message?: string; [key: string]: any }> {
  const token = typeof window !== "undefined" && window.localStorage ? localStorage.getItem("echoscan_token") : null;

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || `API request failed with status ${res.status}`);
    }
    return data;
  } catch (err: any) {
    throw new Error(err.message || "Network error. Is the backend server running?");
  }
}

export const api = {
  // Auth
  register: (body: { name: string; email: string; password: string; mobileNumber?: string }) =>
    request<{ success: boolean; token: string; user: UserDTO }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  login: (body: { email: string; password: string }) =>
    request<{ success: boolean; token: string; user: UserDTO }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  getProfile: () => request<{ success: boolean; user: UserDTO }>("/auth/profile"),

  // Acoustic Scans
  createScan: (scanData: Omit<Partial<ScanDTO>, "_id">) =>
    request<{ success: boolean; scan: ScanDTO }>("/scans", {
      method: "POST",
      body: JSON.stringify(scanData),
    }),

  getScans: (query?: { wallType?: string; search?: string }) => {
    const params = new URLSearchParams();
    if (query?.wallType && query.wallType !== "all") params.append("wallType", query.wallType);
    if (query?.search) params.append("search", query.search);
    const qStr = params.toString() ? `?${params.toString()}` : "";
    return request<{ success: boolean; count: number; scans: ScanDTO[] }>(`/scans${qStr}`);
  },

  getScanById: (id: string) =>
    request<{ success: boolean; scan: ScanDTO }>(`/scans/${id}`),

  deleteScan: (id: string) =>
    request<{ success: boolean; message: string; id: string }>(`/scans/${id}`, {
      method: "DELETE",
    }),

  // Visual Wall Scans
  createVisualScan: (scanData: Omit<Partial<VisualScanDTO>, "_id">) =>
    request<{ success: boolean; scan: VisualScanDTO }>("/visual-scans", {
      method: "POST",
      body: JSON.stringify(scanData),
    }),

  getVisualScans: () =>
    request<{ success: boolean; count: number; scans: VisualScanDTO[] }>("/visual-scans"),

  getVisualScanById: (id: string) =>
    request<{ success: boolean; scan: VisualScanDTO }>(`/visual-scans/${id}`),

  deleteVisualScan: (id: string) =>
    request<{ success: boolean; message: string; id: string }>(`/visual-scans/${id}`, {
      method: "DELETE",
    }),

  // Audio & Image Upload
  uploadAudio: (file: File | Blob) => {
    const formData = new FormData();
    formData.append("audio", file, "recording.webm");
    return request<{ success: boolean; audioPath: string }>("/upload", {
      method: "POST",
      body: formData,
    });
  },

  // Report Download URL & Instant Generator
  getReportDownloadUrl: (scanId: string) => {
    return `${API_BASE_URL}/report/${scanId}`;
  },

  downloadInstantReport: async (
    scanData: Partial<ScanDTO>,
    userName?: string,
    userEmail?: string
  ): Promise<Blob> => {
    const res = await fetch(`${API_BASE_URL}/report/instant`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...scanData, userName, userEmail }),
    });
    if (!res.ok) throw new Error("Failed to generate instant PDF report");
    return await res.blob();
  },

  // Dashboard
  getDashboardStats: () =>
    request<{
      success: boolean;
      stats: DashboardStatsDTO;
      recentScans: ScanDTO[];
    }>("/dashboard"),
};
