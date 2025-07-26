import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { Button } from './ui/button';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      aria-label="Basculer le thème"
      className="h-9 w-9 p-0 hover:bg-primary-100 dark:hover:bg-primary-900/20"
    >
      {theme === 'light' ? (
        <Moon className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
      ) : (
        <Sun className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
      )}
    </Button>
  );
}