import { Q as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { Q as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { c as createRouter, a as createRootRouteWithContext, u as useRouter, L as Link, O as Outlet, H as HeadContent, S as Scripts, b as createFileRoute, l as lazyRouteComponent } from "../_libs/tanstack__react-router.mjs";
import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { S as Sparkles, A as Activity, L as LayoutDashboard, H as History, U as User, a as LogOut, b as LogIn } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
const API_BASE_URL = "http://localhost:5000/api";
async function request(endpoint, options = {}) {
  const token = typeof window !== "undefined" && window.localStorage ? localStorage.getItem("echoscan_token") : null;
  const headers = {
    ...options.headers
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
      headers
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || `API request failed with status ${res.status}`);
    }
    return data;
  } catch (err) {
    return handleLocalFallback(endpoint, options);
  }
}
function handleLocalFallback(endpoint, options) {
  if (typeof window === "undefined" || !window.localStorage) {
    throw new Error("Network error. Backend server unreachable.");
  }
  const cleanEndpoint = endpoint.split("?")[0];
  if (cleanEndpoint === "/auth/register" && options.body) {
    const body = typeof options.body === "string" ? JSON.parse(options.body) : {};
    const user = {
      id: "user_" + Date.now(),
      name: body.name || "Structural Inspector",
      email: body.email || "inspector@echoscan.io",
      mobileNumber: body.mobileNumber || "",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    const token = "local_token_" + Date.now();
    localStorage.setItem("echoscan_current_user", JSON.stringify(user));
    localStorage.setItem("echoscan_token", token);
    return { success: true, token, user };
  }
  if (cleanEndpoint === "/auth/login" && options.body) {
    const body = typeof options.body === "string" ? JSON.parse(options.body) : {};
    const stored = localStorage.getItem("echoscan_current_user");
    let user = stored ? JSON.parse(stored) : {
      id: "user_" + Date.now(),
      name: body.email ? body.email.split("@")[0] : "Structural Inspector",
      email: body.email || "inspector@echoscan.io",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    if (body.email) user.email = body.email;
    const token = "local_token_" + Date.now();
    localStorage.setItem("echoscan_current_user", JSON.stringify(user));
    localStorage.setItem("echoscan_token", token);
    return { success: true, token, user };
  }
  if (cleanEndpoint === "/auth/profile") {
    const stored = localStorage.getItem("echoscan_current_user");
    if (stored) {
      return { success: true, user: JSON.parse(stored) };
    }
    return { success: false, message: "User not logged in" };
  }
  if (cleanEndpoint === "/scans" && options.method === "POST" && options.body) {
    const body = typeof options.body === "string" ? JSON.parse(options.body) : {};
    const scan = {
      _id: "scan_" + Date.now(),
      userId: "local_user",
      scanDate: (/* @__PURE__ */ new Date()).toISOString(),
      wallType: body.wallType || "solid",
      label: body.label || "Acoustic Wall Resonance Test",
      confidenceScore: body.confidenceScore || 92,
      peakFrequency: body.peakFrequency || 240,
      rms: body.rms || 0.12,
      duration: body.duration || 1,
      fftSummary: body.fftSummary || new Array(96).fill(0.2),
      recommendation: body.recommendation || "Wall surface appears structurally sound.",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    const scans = JSON.parse(localStorage.getItem("echoscan_scans") || "[]");
    scans.unshift(scan);
    localStorage.setItem("echoscan_scans", JSON.stringify(scans));
    return { success: true, scan };
  }
  if (cleanEndpoint === "/scans" && (!options.method || options.method === "GET")) {
    const scans = JSON.parse(localStorage.getItem("echoscan_scans") || "[]");
    return { success: true, count: scans.length, scans };
  }
  if (cleanEndpoint === "/visual-scans" && options.method === "POST" && options.body) {
    const body = typeof options.body === "string" ? JSON.parse(options.body) : {};
    const scan = {
      _id: "vscan_" + Date.now(),
      userId: "local_user",
      scanDate: (/* @__PURE__ */ new Date()).toISOString(),
      ...body,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    const scans = JSON.parse(localStorage.getItem("echoscan_vscans") || "[]");
    scans.unshift(scan);
    localStorage.setItem("echoscan_vscans", JSON.stringify(scans));
    return { success: true, scan };
  }
  if (cleanEndpoint === "/visual-scans" && (!options.method || options.method === "GET")) {
    const scans = JSON.parse(localStorage.getItem("echoscan_vscans") || "[]");
    return { success: true, count: scans.length, scans };
  }
  if (cleanEndpoint === "/dashboard") {
    const scans = JSON.parse(localStorage.getItem("echoscan_scans") || "[]");
    const solidCount = scans.filter((s) => s.wallType === "solid").length;
    const hollowCount = scans.filter((s) => s.wallType === "hollow").length;
    const crackedCount = scans.filter((s) => s.wallType === "cracked").length;
    return {
      success: true,
      stats: {
        totalScans: scans.length,
        todayScans: scans.length,
        solidCount,
        hollowCount,
        crackedCount
      },
      recentScans: scans.slice(0, 5)
    };
  }
  return { success: true };
}
const api = {
  // Auth
  register: (body) => request("/auth/register", {
    method: "POST",
    body: JSON.stringify(body)
  }),
  login: (body) => request("/auth/login", {
    method: "POST",
    body: JSON.stringify(body)
  }),
  getProfile: () => request("/auth/profile"),
  // Acoustic Scans
  createScan: (scanData) => request("/scans", {
    method: "POST",
    body: JSON.stringify(scanData)
  }),
  getScans: (query) => {
    const params = new URLSearchParams();
    if (query?.wallType && query.wallType !== "all") params.append("wallType", query.wallType);
    if (query?.search) params.append("search", query.search);
    const qStr = params.toString() ? `?${params.toString()}` : "";
    return request(`/scans${qStr}`);
  },
  getScanById: (id) => request(`/scans/${id}`),
  deleteScan: (id) => request(`/scans/${id}`, {
    method: "DELETE"
  }),
  // Visual Wall Scans
  createVisualScan: (scanData) => request("/visual-scans", {
    method: "POST",
    body: JSON.stringify(scanData)
  }),
  getVisualScans: () => request("/visual-scans"),
  getVisualScanById: (id) => request(`/visual-scans/${id}`),
  deleteVisualScan: (id) => request(`/visual-scans/${id}`, {
    method: "DELETE"
  }),
  // Audio & Image Upload
  uploadAudio: (file) => {
    const formData = new FormData();
    formData.append("audio", file, "recording.webm");
    return request("/upload", {
      method: "POST",
      body: formData
    });
  },
  // Report Download URL & Instant Generator
  getReportDownloadUrl: (scanId) => {
    return `${API_BASE_URL}/report/${scanId}`;
  },
  downloadInstantReport: async (scanData, userName, userEmail) => {
    try {
      const res = await fetch(`${API_BASE_URL}/report/instant`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...scanData, userName, userEmail })
      });
      if (res.ok) return await res.blob();
    } catch {
    }
    const htmlStr = `<html><body style="font-family:sans-serif;padding:40px;background:#0d1117;color:#fff">
      <h1>EchoScan Structural Inspection Report</h1>
      <p>Date: ${(/* @__PURE__ */ new Date()).toLocaleDateString()}</p>
      <p>Inspector: ${userName || "Inspector"}</p>
      <p>Wall Type: ${scanData.wallType || "Solid"}</p>
      <p>Recommendation: ${scanData.recommendation || "Wall exhibits solid structural resonance."}</p>
    </body></html>`;
    return new Blob([htmlStr], { type: "text/html" });
  },
  // Dashboard
  getDashboardStats: () => request("/dashboard")
};
const AuthContext = reactExports.createContext(void 0);
const getStoredToken = () => {
  if (typeof window !== "undefined" && window.localStorage) {
    return localStorage.getItem("echoscan_token");
  }
  return null;
};
const AuthProvider = ({ children }) => {
  const [user, setUser] = reactExports.useState(null);
  const [token, setToken] = reactExports.useState(getStoredToken);
  const [loading, setLoading] = reactExports.useState(true);
  const fetchProfile = async () => {
    const savedToken = getStoredToken();
    if (!savedToken) {
      setLoading(false);
      return;
    }
    try {
      const res = await api.getProfile();
      if (res.success && res.user) {
        setUser(res.user);
        setToken(savedToken);
      } else {
        logout();
      }
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  };
  reactExports.useEffect(() => {
    fetchProfile();
  }, []);
  const handleLogin = (newToken, newUser) => {
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.setItem("echoscan_token", newToken);
    }
    setToken(newToken);
    setUser(newUser);
  };
  const handleRegister = (newToken, newUser) => {
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.setItem("echoscan_token", newToken);
    }
    setToken(newToken);
    setUser(newUser);
  };
  const logout = () => {
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.removeItem("echoscan_token");
    }
    setToken(null);
    setUser(null);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    AuthContext.Provider,
    {
      value: {
        user,
        token,
        isAuthenticated: !!token && !!user,
        loading,
        login: handleLogin,
        register: handleRegister,
        logout,
        refreshProfile: fetchProfile
      },
      children
    }
  );
};
const useAuth = () => {
  const context = reactExports.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
function reportLovableError(error, context = {}) {
  if (typeof window === "undefined") return;
  window.__lovableEvents?.captureException?.(
    error,
    {
      source: "react_error_boundary",
      route: window.location.pathname,
      ...context
    },
    {
      mechanism: "react_error_boundary",
      handled: false,
      severity: "error"
    }
  );
}
const appCss = "/assets/styles-B0gTjARS.css";
function NotFoundComponent() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-7xl font-bold text-foreground", children: "404" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-4 text-xl font-semibold text-foreground", children: "Page not found" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "The page you're looking for doesn't exist or has been moved." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Link,
      {
        to: "/",
        className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
        children: "Go home"
      }
    ) })
  ] }) });
}
function ErrorComponent({ error, reset }) {
  console.error(error);
  const router2 = useRouter();
  reactExports.useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-semibold tracking-tight text-foreground", children: "This page didn't load" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Something went wrong on our end. You can try refreshing or head back home." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex flex-wrap justify-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => {
            router2.invalidate();
            reset();
          },
          className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
          children: "Try again"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "a",
        {
          href: "/",
          className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
          children: "Go home"
        }
      )
    ] })
  ] }) });
}
const Route$7 = createRootRouteWithContext()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "EchoScan — Acoustic Wall Analysis & Visual Crack Inspection" },
      { name: "description", content: "Non-destructive acoustic wall inspection & AI visual crack detection platform" }
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss
      }
    ]
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent
});
function HeaderNav() {
  const { user, isAuthenticated, logout } = useAuth();
  return /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "sticky top-0 z-50 border-b border-white/10 bg-background/80 backdrop-blur-md", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex max-w-6xl items-center justify-between px-4 py-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/", className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 text-primary ring-1 ring-primary/40", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-4 w-4" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-lg font-bold tracking-tight", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gradient-brand", children: "Echo" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground", children: "Scan" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("nav", { className: "flex items-center gap-1 sm:gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Link,
        {
          to: "/scan",
          activeProps: { className: "bg-white/10 text-foreground font-semibold" },
          className: "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium text-muted-foreground transition hover:text-foreground hover:bg-white/5",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { className: "h-4 w-4 text-primary" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Scan" })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Link,
        {
          to: "/dashboard",
          activeProps: { className: "bg-white/10 text-foreground font-semibold" },
          className: "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium text-muted-foreground transition hover:text-foreground hover:bg-white/5",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LayoutDashboard, { className: "h-4 w-4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Dashboard" })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Link,
        {
          to: "/history",
          activeProps: { className: "bg-white/10 text-foreground font-semibold" },
          className: "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium text-muted-foreground transition hover:text-foreground hover:bg-white/5",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(History, { className: "h-4 w-4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "History" })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "ml-2 border-l border-white/10 pl-2", children: isAuthenticated ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden md:flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1 text-xs text-foreground/90 border border-white/10", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-3.5 w-3.5 text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "max-w-[100px] truncate", children: user?.name })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: logout,
            className: "flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-destructive/20 hover:text-destructive hover:border-destructive/30",
            title: "Logout",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "h-3.5 w-3.5" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline", children: "Logout" })
            ]
          }
        )
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Link,
        {
          to: "/auth",
          className: "flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs sm:text-sm font-medium text-primary-foreground shadow transition hover:bg-primary/90",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LogIn, { className: "h-4 w-4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Login" })
          ]
        }
      ) })
    ] })
  ] }) });
}
function RootShell({ children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("html", { lang: "en", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("head", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("body", { children: [
      children,
      /* @__PURE__ */ jsxRuntimeExports.jsx(Scripts, {})
    ] })
  ] });
}
function RootComponent() {
  const { queryClient } = Route$7.useRouteContext();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsxRuntimeExports.jsx(AuthProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background text-foreground flex flex-col", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(HeaderNav, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}) })
  ] }) }) });
}
const $$splitComponentImporter$6 = () => import("./visual-scan-DzxCHYmN.mjs");
const Route$6 = createFileRoute("/visual-scan")({
  component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
const $$splitComponentImporter$5 = () => import("./scan-Lf0-llk7.mjs");
const Route$5 = createFileRoute("/scan")({
  head: () => ({
    meta: [{
      title: "Echo Scan — Acoustic Wall Detection"
    }, {
      name: "description",
      content: "Upload or record a sound and Echo Scan analyzes its echo signature to detect solid, cracked, or hollow walls."
    }, {
      property: "og:title",
      content: "Echo Scan — Acoustic Wall Detection"
    }, {
      property: "og:description",
      content: "In-browser audio analysis that classifies walls from their echo."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
const $$splitComponentImporter$4 = () => import("./history-JRyYdwO-.mjs");
const Route$4 = createFileRoute("/history")({
  component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
const $$splitComponentImporter$3 = () => import("./dashboard-B-jM83zh.mjs");
const Route$3 = createFileRoute("/dashboard")({
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const $$splitComponentImporter$2 = () => import("./auth-r8WM5DQJ.mjs");
const Route$2 = createFileRoute("/auth")({
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("./index-3djcXbDG.mjs");
const Route$1 = createFileRoute("/")({
  head: () => ({
    meta: [{
      title: "Echo Scan — See Through Walls With Sound"
    }, {
      name: "description",
      content: "Echo Scan uses acoustic analysis to detect solid, cracked, or hollow walls — all privately in your browser."
    }, {
      property: "og:title",
      content: "Echo Scan — See Through Walls With Sound"
    }, {
      property: "og:description",
      content: "In-browser acoustic wall detection powered by the Web Audio API."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("./report._id-D7vgYfqJ.mjs");
const Route = createFileRoute("/report/$id")({
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const VisualScanRoute = Route$6.update({
  id: "/visual-scan",
  path: "/visual-scan",
  getParentRoute: () => Route$7
});
const ScanRoute = Route$5.update({
  id: "/scan",
  path: "/scan",
  getParentRoute: () => Route$7
});
const HistoryRoute = Route$4.update({
  id: "/history",
  path: "/history",
  getParentRoute: () => Route$7
});
const DashboardRoute = Route$3.update({
  id: "/dashboard",
  path: "/dashboard",
  getParentRoute: () => Route$7
});
const AuthRoute = Route$2.update({
  id: "/auth",
  path: "/auth",
  getParentRoute: () => Route$7
});
const IndexRoute = Route$1.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$7
});
const ReportIdRoute = Route.update({
  id: "/report/$id",
  path: "/report/$id",
  getParentRoute: () => Route$7
});
const rootRouteChildren = {
  IndexRoute,
  AuthRoute,
  DashboardRoute,
  HistoryRoute,
  ScanRoute,
  VisualScanRoute,
  ReportIdRoute
};
const routeTree = Route$7._addFileChildren(rootRouteChildren)._addFileTypes();
const getRouter = () => {
  const queryClient = new QueryClient();
  const router2 = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0
  });
  return router2;
};
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  api as a,
  router as r,
  useAuth as u
};
