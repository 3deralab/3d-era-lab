import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

const ThemeToggle = () => {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  const getThemeByTime = () => {
    const hour = new Date().getHours();
    return hour >= 7 && hour < 19 ? "light" : "dark";
  };

  const applyTheme = (newTheme: "light" | "dark") => {
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  useEffect(() => {
    // Check if user has manually overridden the theme
    const manualOverride = localStorage.getItem("themeManualOverride");
    
    if (manualOverride) {
      const savedTheme = localStorage.getItem("theme") as "light" | "dark" || "dark";
      applyTheme(savedTheme);
    } else {
      // Use time-based theme
      const timeBasedTheme = getThemeByTime();
      applyTheme(timeBasedTheme);
    }

    // Check every minute if theme should change (only if no manual override)
    const interval = setInterval(() => {
      const manualOverride = localStorage.getItem("themeManualOverride");
      if (!manualOverride) {
        const timeBasedTheme = getThemeByTime();
        applyTheme(timeBasedTheme);
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    localStorage.setItem("themeManualOverride", "true");
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="border-primary/20 hover:bg-primary/10"
    >
      {theme === "light" ? (
        <Moon className="h-5 w-5" />
      ) : (
        <Sun className="h-5 w-5" />
      )}
    </Button>
  );
};

export default ThemeToggle;
