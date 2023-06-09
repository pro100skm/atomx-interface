import { useContext, useEffect } from 'react';
import { ThemeContext } from 'styled-components';
import { useIsDark } from '../store/ui/hooks';

const useTheme = () => {
  const isDark = useIsDark();
  const rawSetTheme = (isDark: boolean) => {
    const root = window.document.documentElement;
    root.classList.remove(isDark ? 'light' : 'dark');
    root.classList.add(isDark ? 'dark' : 'light');
  };

  useEffect(() => {
    rawSetTheme(isDark);
  }, [isDark]);
  return useContext(ThemeContext);
};

export default useTheme;
