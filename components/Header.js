'use client';

import { useTheme } from './ThemeProvider';
import { Sun, Moon } from 'lucide-react';

export default function Header({ title }) {
  const { theme, toggleTheme, mounted } = useTheme();

  // Prevent hydration mismatch by showing default icon until mounted
  if (!mounted) {
    return (
      <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6 shadow-sm transition-colors">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <div className="flex items-center gap-4">
          <button
            className="p-2 rounded-lg hover:bg-accent transition-colors"
            aria-label="Toggle theme"
            disabled
          >
            <Moon className="h-5 w-5 text-muted-foreground" />
          </button>
          <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
            U
          </div>
          <span className="text-sm font-medium text-muted-foreground">User</span>
        </div>
      </header>
    );
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6 shadow-sm transition-colors">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <div className="flex items-center gap-4">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-accent transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? (
            <Moon className="h-5 w-5 text-muted-foreground" />
          ) : (
            <Sun className="h-5 w-5 text-muted-foreground" />
          )}
        </button>
        <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
          U
        </div>
        <span className="text-sm font-medium text-muted-foreground">User</span>
      </div>
    </header>
  );
}
