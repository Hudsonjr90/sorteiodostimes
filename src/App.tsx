import { useMemo, useState, useEffect } from 'react';
import { ThemeProvider, CssBaseline, createTheme } from '@mui/material';
import Home from './pages/Home';

export default function App() {
  // Estado do tema global
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    // Carregar preferência do tema do localStorage, se existir
    const raw = localStorage.getItem('sorteio.app.v1');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed.themeMode === 'dark' || parsed.themeMode === 'light') {
          setThemeMode(parsed.themeMode);
        }
      } catch {}
    }
  }, []);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: themeMode,
          primary: {
            main: '#00a96e',
          },
          secondary: {
            main: '#0067c5',
          },
          background:
            themeMode === 'dark'
              ? {
                  default: '#0f1412',
                  paper: 'rgba(16, 25, 21, 0.88)',
                }
              : {
                  default: '#eef8f2',
                  paper: 'rgba(255, 255, 255, 0.88)',
                },
        },
        shape: {
          borderRadius: 16,
        },
        typography: {
          fontFamily: '"Baloo 2", "Roboto", sans-serif',
        },
        components: {
          MuiTextField: {
            styleOverrides: {
              root: {
                '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button':
                  { WebkitAppearance: 'none', margin: 0 },
                '& input[type=number]': { MozAppearance: 'textfield' },
              },
            },
          },
        },
      }),
    [themeMode],
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Home themeMode={themeMode} setThemeMode={setThemeMode} />
    </ThemeProvider>
  );
}
// O App agora é apenas o shell/layout. Toda a interface e lógica está em Home/MainApp.
