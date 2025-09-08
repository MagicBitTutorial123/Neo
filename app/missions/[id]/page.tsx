"use client";

import React, { use, useEffect, useMemo, useState } from "react";
import SideNavbar from "@/components/SideNavbar";
import StatusHeaderBar from "@/components/StatusHeaderBar";
import { useSidebar } from "@/context/SidebarContext";
import { getMissionMeta, getMissionJsonPublic } from "@/utils/queries";
import {
  normalizeMissionFromJson,
  NormalizedMission,
} from "@/utils/normalizeMission";
import StandardMissionLayout from "@/components/StandardMissionLayout";
import BlocklySplitLayout from "@/components/BlocklySplitLayout";

/**
 * This version obeys React Rules of Hooks:
 *  - All hooks are called unconditionally at the top.
 *  - params is a Promise in Next 15; unwrap with React.use().
 *  - No hooks inside conditionals/try/catch/returns.
 *  - Conditional layout rendering is done by returning different child components.
 */
export default function MissionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // ✅ Unwrap params once, at top-level
  const resolved = use(params);
  const missionId = (resolved?.id || "").toString();

  // ✅ All hooks at top-level (never inside if/try/catch)
  const { sidebarCollapsed } = useSidebar();

  const [loading, setLoading] = useState<boolean>(true);
  const [mission, setMission] = useState<NormalizedMission | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showHeader, setShowHeader] = useState<boolean>(false);
  const [showMCQ, setShowMCQ] = useState<boolean>(false);
  const [mcqStepIndex, setMcqStepIndex] = useState<number>(0);

interface BluetoothDevice {
  name?: string;
  gatt?: BluetoothRemoteGATTServer;
  addEventListener: (event: string, callback: () => void) => void;
}

interface RequestDeviceOptions {
  filters?: Array<{ name?: string; services?: Array<string> }>;
  optionalServices?: Array<string>;
}

interface SerialPort {
  open: (options: { baudRate: number }) => Promise<void>;
  close: () => Promise<void>;
  readable?: unknown;
  writable?: unknown;
}

interface NavigatorWithSerial {
  serial: { requestPort: () => Promise<SerialPort> };
}

declare global {
  interface Navigator {
    bluetooth: {
      requestDevice: (options: RequestDeviceOptions) => Promise<BluetoothDevice>;
    };
  }
  interface Window {
    missionTimerControls?: {
      resume: () => void;
      pause: () => void;
      reset: () => void;
    };
  }
}
import { useSidebar } from "@/context/SidebarContext";
import Image from "next/image";

type MissionsType = typeof missions;
type MissionKey = keyof MissionsType;

export default function MissionPage() {
  const params = useParams();
  const router = useRouter();
  let id = params.id;
  if (Array.isArray(id)) id = id[0];
  id = String(id);
  const numericId = Number(id);
  const mission = missions[numericId as MissionKey];
  const layoutType =
    missionLayoutMap[numericId as keyof typeof missionLayoutMap] ||
    "standardIntroLayout";

  // State for mission header buttons

  // BLE Connection states
  const [isConnected, setIsConnected] = useState(false);
  const [connectionType, setConnectionType] = useState<"bluetooth" | "serial" | "none">(
    "bluetooth"
  );
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [tryingToConnect, setTryingToConnect] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // BLE Connection refs
  const portRef = useRef<SerialPort | null>(null);
  const bluetoothDeviceRef = useRef<BluetoothDevice | null>(null);
  const writeCharacteristicRef = useRef<BluetoothRemoteGATTCharacteristic | null>(null);
  const server = useRef<BluetoothRemoteGATTServer | null>(null);
  const keyStateRef = useRef<{ [key: string]: boolean }>({});
  const [isRunning, setIsRunning] = useState(false);
  const { sidebarCollapsed, setSidebarCollapsed } = useSidebar();
  const [showHeader, setShowHeader] = useState(false);
  const [showFirmwareModal, setShowFirmwareModal] = useState(false);

  // Listen for sidebar collapse state changes
  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setError(null);
        setLoading(true);

        // 1) Fetch mission meta
        const meta = await getMissionMeta(missionId);
        if (!meta) {
          throw new Error(`Mission ${missionId} not found`);
        }

  const onConnectionTypeChange = (type: "bluetooth" | "serial" | "none") => {
    if (isConnected) onConnectToggle(false);
    setConnectionType(type);
  };

  useEffect(() => {
    async function connect() {
      if (tryingToConnect) {
        await connectBluetooth();
      }
    }
    connect();
  }, [connectBluetooth, tryingToConnect]);

  // Load mission state on mount
  useEffect(() => {
    const savedState = MissionStatePersistence.getMissionState(id);
    if (savedState) {
      console.log("🔄 Loading saved mission state:", savedState);
      setShowHeader(savedState.showHeader);
      setForceHideIntro(savedState.forceHideIntro);
      setShowCountdown(savedState.showCountdown);
      setFromNo(savedState.fromNo);
      setCompletedMCQSteps(new Set(savedState.completedMCQSteps));

      // If we're resuming a mission that was already started, resume the timer
      if (savedState.showHeader && !savedState.showCountdown) {
        // Wait for the timer component to be ready, then resume
        setTimeout(() => {
          if (
            typeof window !== "undefined" &&
            window.missionTimerControls
          ) {
            const savedTimerState = TimerPersistence.loadTimerState();
            if (savedTimerState && savedTimerState.missionId === id) {
              console.log("🔄 Resuming existing timer for mission", id);
              window.missionTimerControls.resume();
            }
          }
        }, 100);
      }
    }
  }, [id]);

  // Handle current step changes from layout components
  const handleCurrentStepChange = (step: number) => {
    console.log("🔄 Current step changed to:", step);
    // Update mission state with new step
    MissionStatePersistence.updateMissionState(id, {
      currentStep: step,
    });
  };

  // Function to stop timer and calculate time taken
  const stopTimerAndCalculateTime = useCallback(() => {
    if (typeof window !== "undefined" && window.missionTimerControls) {
      // Pause the timer first
      window.missionTimerControls.pause();

      // Get the current timer state to calculate time taken
      const savedTimerState = TimerPersistence.loadTimerState();
      if (savedTimerState && savedTimerState.missionId === id) {
        const allocatedTime = savedTimerState.allocatedTime;
        const elapsed = Math.floor(
          (Date.now() - savedTimerState.startTime) / 1000
        );

        // 3) Normalize (resolves steps[].text/image, layout, intro, etc.)
        const normalized = normalizeMissionFromJson(meta, json);

        if (!alive) return;
        setMission(normalized);
        
      } 
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      catch (e: any) {
        console.error("[MissionDetails] fetch error:", e);
        if (!alive) return;
        setError(e?.message || "Failed to load mission");
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [missionId]);

  // State change handlers
  const handleStateChange = (state: {
    showIntro: boolean;
    showCountdown: boolean;
  }) => {
    // Show header when we're in mission content (not intro or countdown)
    const shouldShowHeader = !state.showIntro && !state.showCountdown;
    console.log("🎯 MissionPage: State change received:", state);
    console.log("🎯 MissionPage: Should show header:", shouldShowHeader);
    setShowHeader(shouldShowHeader);
  };

  const handleMCQChange = (show: boolean, stepIndex: number) => {
    setShowMCQ(show);
    setMcqStepIndex(stepIndex);
    console.log(
      `MCQ ${show ? "show" : "hide"} for step ${stepIndex} (display step ${
        stepIndex + 1
      })`
    );
  };

  const handleMCQAnswer = (selectedAnswer: number) => {
    console.log(
      `MCQ answer selected: ${selectedAnswer} for step ${mcqStepIndex} (display step ${
        mcqStepIndex + 1
      })`
    );
    setShowMCQ(false);
  };

  // Debug header state
  useEffect(() => {
    console.log("🎯 MissionPage: showHeader changed to:", showHeader);
    console.log("🎯 MissionPage: mission exists:", !!mission);
    if (mission) {
      console.log("🎯 MissionPage: mission.id:", mission.id);
      console.log("🎯 MissionPage: mission.title:", mission.title);
    }
  }, [showHeader, mission]);

  // Initialize header state when mission loads
  useEffect(() => {
    if (mission && !loading) {
      console.log("🎯 MissionPage: Mission loaded, initializing header state");
      setShowHeader(false); // Start with header hidden to allow intro/countdown
    }
  }, [mission, loading]);

  // ✅ derive layout AFTER hooks
  const layout = mission?.layout || "StandardMissionLayout";
  console.log("🎯 MissionPage: Using layout:", layout);
  console.log("🎯 MissionPage: Mission data:", mission);

  // ✅ Render only; no hooks here
  return (
    <div className="flex min-h-screen bg-white">
      <SideNavbar />
      <main
        className="flex-1 flex flex-col overflow-hidden"
        style={{ marginLeft: sidebarCollapsed ? "80px" : "260px" }}
      >
        {/* Loading / Error */}
        {loading && (
          <div className="flex-1 flex items-center justify-center text-sm text-[#222E3A]">
            Loading mission…
          </div>
        )}

        {!loading && error && (
          <div className="flex-1 flex items-center justify-center text-red-600">
            {error}
          </div>
        )}

        {/* Ready */}
        {!loading && !error && mission && (
          <>
            {layout === "BlocklySplitLayout" ? (
              <BlocklySplitLayout
                mission={mission}
                onStateChange={handleStateChange}
                onMCQChange={handleMCQChange}
                onMCQAnswer={handleMCQAnswer}
                showHeader={showHeader}
              />
            ) : (
              <StandardMissionLayout
                mission={mission}
                onStateChange={handleStateChange}
                showHeader={showHeader}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}
