import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StoreProvider } from './context/StoreContext';
import { RegisterPage } from './pages/auth/RegisterPage';

/** 認証状態に応じてコンテンツを切り替えるゲート */
const AuthGate = () => {
  const { status, error } = useAuth();

  if (status === 'loading') {
    return (
      <div className="min-h-screen max-w-md mx-auto flex items-center justify-center bg-[#f8f9fa]">
        <div className="text-center">
          <p className="text-xs text-[#7a7a7a] tracking-widest uppercase animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen max-w-md mx-auto flex items-center justify-center bg-[#f8f9fa] p-6">
        <div className="bg-white border border-[#d0d0d0] p-8 text-center shadow-sm">
          <p className="text-xs font-bold text-[#5a5a5a] tracking-widest mb-3">認証エラー</p>
          <p className="text-[11px] text-[#a0a0a0] tracking-wide">{error}</p>
        </div>
      </div>
    );
  }

  if (status === 'registering') {
    return <RegisterPage />;
  }

  // status === 'ready'
  return (
    <StoreProvider>
      <RouterProvider router={router} />
    </StoreProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}

export default App;
