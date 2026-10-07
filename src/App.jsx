import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import LoginPage from './pages/LoginPage';
import PlacementPage from './pages/PlacementPage';

/**
 * Decode a JWT payload without verifying the signature.
 * Returns the payload object, or null if the token is missing / malformed / expired.
 * Signature verification is enforced by the backend on every API call.
 * This is purely a client-side gate to block obviously invalid tokens.
 */
function decodeJwtPayload(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    // Base64url → Base64 → JSON
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function isTokenValid() {
  const token = sessionStorage.getItem('auth_token');
  const payload = decodeJwtPayload(token);
  if (!payload) return false;
  // Check expiry — JWT exp is in seconds
  const nowSecs = Math.floor(Date.now() / 1000);
  return typeof payload.exp === 'number' && payload.exp > nowSecs;
}

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1a237e',
      light: '#3949ab',
      dark: '#0d1b5e',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#37474f',
      light: '#546e7a',
      dark: '#263238',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f4f6f8',
      paper: '#ffffff',
    },
    text: {
      primary: '#1c1c1e',
      secondary: '#6b7280',
    },
    divider: '#e0e0e0',
    success: { main: '#2e7d32' },
    error: { main: '#c62828' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
    h4: { fontWeight: 700, letterSpacing: '-0.5px' },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 500 },
    body1: { fontSize: '0.9375rem' },
    button: { textTransform: 'none', fontWeight: 600, letterSpacing: '0.3px' },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 28px',
          boxShadow: 'none',
          '&:hover': { boxShadow: '0 2px 8px rgba(0,0,0,0.15)' },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #1a237e 0%, #3949ab 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #0d1b5e 0%, #1a237e 100%)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#3949ab',
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.06)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 500 },
      },
    },
  },
});

/**
 * Blocks unauthenticated access to any protected page.
 * Redirects to "/" if the token is missing, malformed, or expired.
 */
function ProtectedRoute({ children }) {
  return isTokenValid() ? children : <Navigate to="/" replace />;
}

/**
 * Redirects already-authenticated users away from the login page.
 * Prevents going "back" to the login screen after signing in.
 */
function PublicOnlyRoute({ children }) {
  return isTokenValid() ? <Navigate to="/placement" replace /> : children;
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <PublicOnlyRoute>
                <LoginPage />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/placement"
            element={
              <ProtectedRoute>
                <PlacementPage />
              </ProtectedRoute>
            }
          />
          {/* Catch-all: unknown paths always go to login (or placement if authed) */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
