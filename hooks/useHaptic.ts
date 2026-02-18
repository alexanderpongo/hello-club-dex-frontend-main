"use client";

import { useCallback } from "react";

/**
 * Custom hook to trigger haptic feedback.
 * This is a placeholder since we are in a web environment.
 * If integrated with Telegram Mini App, it can use Telegram's HapticFeedback API.
 */
export function useHaptic() {
    const triggerHaptic = useCallback((type: "light" | "medium" | "heavy" = "light") => {
        // Check if Telegram WebApp is available
        if (typeof window !== "undefined" && (window as any).Telegram?.WebApp?.HapticFeedback) {
            const haptic = (window as any).Telegram.WebApp.HapticFeedback;
            switch (type) {
                case "light":
                    haptic.impactOccurred("light");
                    break;
                case "medium":
                    haptic.impactOccurred("medium");
                    break;
                case "heavy":
                    haptic.impactOccurred("heavy");
                    break;
                default:
                    haptic.impactOccurred("light");
            }
            return;
        }

        // Fallback for standard browsers using vibration API if available
        if (typeof window !== "undefined" && window.navigator.vibrate) {
            switch (type) {
                case "light":
                    window.navigator.vibrate(10);
                    break;
                case "medium":
                    window.navigator.vibrate(20);
                    break;
                case "heavy":
                    window.navigator.vibrate(30);
                    break;
            }
        }
    }, []);

    return { triggerHaptic };
}
