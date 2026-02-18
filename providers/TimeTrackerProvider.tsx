"use client";
import { useEffect, useState } from "react";

const TimeTrackerProvider = ({ children }: { children: React.ReactNode }) => {
  const [timer, setTimer] = useState(0);
  const [ipAddress, setIpAddress] = useState("");
  const [isPageVisible, setIsPageVisible] = useState(true);

  useEffect(() => {
    // Fetch the user's IP address when the page loads
    const fetchIpAddress = async () => {
      const response = await fetch("https://api.ipify.org?format=json");
      const data = await response.json();
      setIpAddress(data.ip);
    };

    fetchIpAddress();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    const handleVisibilityChange = () => {
      setIsPageVisible(!document.hidden);
    };

    if (isPageVisible) {
      // Start the timer when the page is visible
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 1);
      }, 1000);
    }

    // Listen for visibility changes
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (interval) clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isPageVisible]);

  useEffect(() => {
    // console.log('Timer:', timer);

    // Save data to the database when the user closes the page
    const handleBeforeUnload = () => {
      // console.log('Saving data:', { ipAddress, timeSpent: timer });

      const payload = JSON.stringify({ ipAddress, timeSpent: timer });
      navigator.sendBeacon("/api/save-user-data", payload);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [timer, ipAddress]);

  return <>{children}</>;
};

export default TimeTrackerProvider;
