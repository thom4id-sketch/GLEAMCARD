import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import liff from '@line/liff';
import { api, setToken } from '../lib/api';

// バックエンド MemberDto に対応
export interface MemberDto {
  id: number;
  memberNo: string;
  name: string;
  rank: string; // 'REGULAR' | 'GOLD' | 'PLATINUM'
  pointRate: number;
  points: number;
  annualPurchaseAmount: number;
  rankExpiresAt: string | null;
}

interface AuthResponse {
  token: string | null;
  isAdmin: boolean;
  isNewMember: boolean;
  member: MemberDto | null;
}

type AuthStatus = 'loading' | 'registering' | 'ready' | 'error';

interface AuthState {
  status: AuthStatus;
  currentUser: MemberDto | null;
  isAdmin: boolean;
  error?: string;
  /** 新規登録を完了して JWT を取得する */
  completeRegistration: () => Promise<void>;
  /** currentUser を最新データで再取得 */
  refreshUser: () => Promise<void>;
}

// ─── 開発用モックユーザー ───────────────────────────────
const MOCK_USER: MemberDto = {
  id: 1,
  memberNo: '10001',
  name: '山田 太郎（開発用）',
  rank: 'GOLD',
  pointRate: 0.08,
  points: 1200,
  annualPurchaseAmount: 65000,
  rankExpiresAt: null,
};
// ────────────────────────────────────────────────────────

const IS_DEV_MOCK = import.meta.env.VITE_DEV_MOCK_AUTH === 'true';

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [currentUser, setCurrentUser] = useState<MemberDto | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState<string>();

  // LIFF トークンを登録フロー用に保持
  const [liffAccessToken, setLiffAccessToken] = useState<string | null>(null);
  const [liffId, setLiffId] = useState<string | null>(null);
  const [invitationId, setInvitationId] = useState<number | null>(null);

  useEffect(() => {
    const init = async () => {
      const adminMode = window.location.pathname.startsWith('/admin');

      // ── 開発モック：LIFF・バックエンドをスキップ ──────────────
      if (IS_DEV_MOCK) {
        const mockAdmin = import.meta.env.VITE_DEV_MOCK_ADMIN === 'true' || adminMode;
        console.info('[Auth] DEV MOCK MODE — LIFF / backend auth skipped');
        setIsAdmin(mockAdmin);
        setCurrentUser(MOCK_USER);
        setStatus('ready');
        return;
      }
      // ────────────────────────────────────────────────────────

      setIsAdmin(adminMode);

      const targetLiffId = adminMode
        ? import.meta.env.VITE_ADMIN_LIFF_ID
        : import.meta.env.VITE_LIFF_ID;

      // ?inv= パラメータ（友達招待経由）
      const params = new URLSearchParams(window.location.search);
      const inv = params.get('inv');
      if (inv) setInvitationId(Number(inv));

      try {
        await liff.init({ liffId: targetLiffId });

        if (!liff.isLoggedIn()) {
          liff.login({ redirectUri: window.location.href });
          return; // ページ遷移するのでここで停止
        }

        const accessToken = liff.getAccessToken();
        if (!accessToken) throw new Error('LIFFアクセストークンを取得できませんでした');

        setLiffAccessToken(accessToken);
        setLiffId(targetLiffId);

        const res = await api.post<AuthResponse>('/api/auth/line', {
          lineAccessToken: accessToken,
          liffId: targetLiffId,
        });

        if (res.isNewMember) {
          setStatus('registering');
        } else {
          setToken(res.token!);
          setCurrentUser(res.member);
          setIsAdmin(res.isAdmin);
          setStatus('ready');
        }
      } catch (e) {
        console.error('[Auth] init failed:', e);
        setError(e instanceof Error ? e.message : '認証に失敗しました');
        setStatus('error');
      }
    };

    init();
  }, []);

  const completeRegistration = async () => {
    // 開発モック時は登録不要
    if (IS_DEV_MOCK) {
      setCurrentUser(MOCK_USER);
      setStatus('ready');
      return;
    }

    if (!liffAccessToken || !liffId) throw new Error('認証情報が不足しています');

    const res = await api.post<AuthResponse>('/api/auth/register', {
      lineAccessToken: liffAccessToken,
      liffId,
      invitationId: invitationId ?? undefined,
    });

    setToken(res.token!);
    setCurrentUser(res.member);
    setIsAdmin(res.isAdmin);
    setStatus('ready');
  };

  const refreshUser = async () => {
    if (IS_DEV_MOCK) return; // モック時は何もしない
    const res = await api.get<MemberDto>('/api/me');
    setCurrentUser(res);
  };

  return (
    <AuthContext.Provider
      value={{ status, currentUser, isAdmin, error, completeRegistration, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthState => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
