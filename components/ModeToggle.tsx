"use client";
import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
// import { useHeroVisibility } from '@/providers/HeroVisibilityContext';
import { cn } from "@/lib/utils";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  //   const { isHeroVisible } = useHeroVisibility();

  return (
    <Button
      variant="outline"
      size="icon"
      className={cn(
        "bg-black/5 dark:bg-dark border-none ring-1 ring-black/10 dark:ring-white/20 rounded-full"
        // isHeroVisible ? '!text-white !bg-dark !ring-white/20' : 'text-black dark:text-white'
      )}
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
