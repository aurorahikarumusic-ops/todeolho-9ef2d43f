import { useState, useEffect } from "react";

export type DeviceType = "mobile" | "tablet" | "desktop";

const TABLET_MIN = 768;
const DESKTOP_MIN = 1024;

export function useDeviceType(): DeviceType {
  const [device, setDevice] = useState<DeviceType>(() => getDevice());

  useEffect(() => {
    const handleResize = () => setDevice(getDevice());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return device;
}

function getDevice(): DeviceType {
  const w = window.innerWidth;
  if (w >= DESKTOP_MIN) return "desktop";
  if (w >= TABLET_MIN) return "tablet";
  return "mobile";
}

/** Returns true for tablet and desktop */
export function useIsWideScreen(): boolean {
  const device = useDeviceType();
  return device !== "mobile";
}
