import { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
  useLocation,
} from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Briefcase,
  Cpu,
  Mic,
  Settings as SettingsIcon,
  Wifi,
  WifiOff,
} from "lucide-react";

import Dashboard from "./pages/Dashboard/index";
import Projects from "./pages/Projects/index";
import AI from "./pages/AI/index";
import Capture from "./pages/Capture/index";
import Settings from "./pages/Settings/index";
import { pingGlasses } from "./services/glasses";
import { FounderStoreProvider } from "./store/founder-store";

const NavItem = ({
  to,
  icon: Icon,
  label,
}: {
  to: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  label: string;
}) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      [
        "flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-none px-1 py-2 transition-all duration-300",
        isActive
          ? "text-primary"
          : "text-muted-foreground hover:text-foreground",
      ].join(" ")
    }
  >
    <Icon size={20} strokeWidth={1.5} />
    <span className="text-[9px] font-medium tracking-tight sm:text-[10px]">
      {label}
    </span>
  </NavLink>
);

const StatusBar = () => {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const check = async () => {
      const isOk = await pingGlasses();
      setConnected(isOk);
    };

    void check();
    const interval = setInterval(check, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed left-0 right-0 top-0 z-50 flex h-12 items-center justify-between border-b border-border/40 bg-background/80 px-4 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-2">
        <div
          className={`h-1.5 w-1.5 rounded-full ${connected ? "bg-primary" : "bg-destructive"} animate-pulse`}
        />
        <span className="text-[11px] font-mono uppercase tracking-widest opacity-60">
          {connected ? "HUD Connected" : "HUD Offline"}
        </span>
      </div>
      <div className="text-[11px] font-mono opacity-40">FOUNDER OS PWA</div>
      <div className="flex items-center gap-3">
        {connected ? (
          <Wifi size={14} className="opacity-40" />
        ) : (
          <WifiOff size={14} className="opacity-20" />
        )}
      </div>
    </div>
  );
};

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="px-4 pb-28 pt-16 sm:px-6"
    >
      {children}
    </motion.div>
  );
}

function AppContent() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      <StatusBar />

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route
            path="/"
            element={
              <PageWrapper>
                <Dashboard />
              </PageWrapper>
            }
          />
          <Route
            path="/projects"
            element={
              <PageWrapper>
                <Projects />
              </PageWrapper>
            }
          />
          <Route
            path="/ai"
            element={
              <PageWrapper>
                <AI />
              </PageWrapper>
            }
          />
          <Route
            path="/capture"
            element={
              <PageWrapper>
                <Capture />
              </PageWrapper>
            }
          />
          <Route
            path="/settings"
            element={
              <PageWrapper>
                <Settings />
              </PageWrapper>
            }
          />
        </Routes>
      </AnimatePresence>

      <nav className="fixed bottom-0 left-0 right-0 z-50 h-22 border-t border-border/40 bg-background/80 px-2 backdrop-blur-xl sm:px-6">
        <div className="mx-auto flex h-full w-full max-w-4xl items-center justify-between">
          <NavItem to="/" icon={LayoutDashboard} label="HUD" />
          <NavItem to="/projects" icon={Briefcase} label="BUILD" />
          <div className="relative -top-4 px-1">
            <NavLink
              to="/capture"
              className={({ isActive }) =>
                [
                  "flex h-16 w-16 items-center justify-center rounded-full border transition-all duration-500 shadow-2xl",
                  isActive
                    ? "border-primary bg-primary text-primary-foreground scale-110"
                    : "border-border/50 bg-card text-foreground hover:scale-105",
                ].join(" ")
              }
            >
              <Mic size={26} strokeWidth={1.5} />
            </NavLink>
          </div>
          <NavItem to="/ai" icon={Cpu} label="OS" />
          <NavItem to="/settings" icon={SettingsIcon} label="CORE" />
        </div>
      </nav>
    </div>
  );
}

function App() {
  return (
    <FounderStoreProvider>
      <Router>
        <AppContent />
      </Router>
    </FounderStoreProvider>
  );
}

export default App;
