import React, { useState, useEffect } from 'react';
import { MantineProvider as BaseMantineProvider } from '@mantine/core';

export function MantineProvider({ children }) {
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  useEffect(() => {
    const htmlElement = document.documentElement;
    const checkTheme = () => {
      setIsDarkTheme(htmlElement.getAttribute('data-theme') === 'dark');
    };

    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(htmlElement, { attributes: true, attributeFilter: ['data-theme'] });

    return () => observer.disconnect();
  }, []);

  return (
    <BaseMantineProvider theme={{ colorScheme: isDarkTheme ? 'dark' : 'light' }}>
      {children}
    </BaseMantineProvider>
  );
}
