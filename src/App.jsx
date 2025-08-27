import { useState, useEffect } from 'react';
import { MantineProvider } from '@mantine/core';
import { theme } from './theme';
import LoginPage from './LoginPage';
import Dashboard from './Dashboard';
import ThemeToggle from './ThemeToggle';

function App() {
  const [token, setToken] = useState(null);
  const [colorScheme, setColorScheme] = useState(
    () => localStorage.getItem('color-scheme') || 'light'
  );

  const toggleColorScheme = () => {
    const newColorScheme = colorScheme === 'dark' ? 'light' : 'dark';
    setColorScheme(newColorScheme);
    localStorage.setItem('color-scheme', newColorScheme);
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const handleLogin = (newToken) => {
    setToken(newToken);
    localStorage.setItem('authToken', newToken);
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('authToken');
  };

  return (
    <MantineProvider theme={theme} forceColorScheme={colorScheme}>
      <ThemeToggle toggleColorScheme={toggleColorScheme} />
      
      {token ? (
        <Dashboard token={token} onLogout={handleLogout} />
      ) : (
        <LoginPage onLogin={handleLogin} />
      )}
    </MantineProvider>
  );
}

export default App;
