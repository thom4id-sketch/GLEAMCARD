import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useAuth, MemberDto } from './AuthContext';
import { api } from '../lib/api';

// ──────────────────────────────────────────────
// 型定義（バックエンド DTO をフロントの型にマッピング）
// ──────────────────────────────────────────────

export type Rank = 'Regular' | 'Gold' | 'Platinum';

export interface User {
  id: string;
  name: string;
  memberNo: string;
  rank: Rank;
  points: number;
  annualPurchase: number;
}

export interface Post {
  id: string;
  title: string;
  image: string;
  url: string;
  date: string;
}

export interface Coupon {
  id: string;
  name: string;
  discountDesc: string;
  type: 'friend' | 'normal' | 'distribute';
  expiresAt?: string;
}

export interface Purchase {
  id: string;
  storeName: string;
  amount: number;
  pointsUsed: number;
  pointsToGrant: number;
  pointsGranted: boolean;
  couponUsed: boolean;
  date: string;
  status: 'completed' | 'canceled';
}

export interface PointHistory {
  id: string;
  amount: number;
  type: 'grant' | 'use' | 'cancel' | 'expire';
  date: string;
  description: string;
}

// バックエンドのレスポンス型
interface PostApi {
  id: number;
  title: string;
  imageData: string;
  linkUrl: string;
  createdAt: string;
}

interface CouponApi {
  id: number;
  name: string;
  discountType: string;
  discountValue: number;
  discountDesc: string;
  couponType: string;
  expiresAt: string | null;
}

interface PurchaseApi {
  id: number;
  storeName: string;
  amount: number;
  pointsUsed: number;
  pointsToGrant: number;
  pointsGranted: boolean;
  couponUsed: boolean;
  purchasedAt: string;
  status: string;
}

interface PointHistoryApi {
  id: number;
  amount: number;
  transactionType: string;
  description: string;
  createdAt: string;
}

// ──────────────────────────────────────────────
// マッピング関数
// ──────────────────────────────────────────────

function rankFromStr(r: string): Rank {
  if (r === 'GOLD') return 'Gold';
  if (r === 'PLATINUM') return 'Platinum';
  return 'Regular';
}

function memberToUser(m: MemberDto): User {
  return {
    id: String(m.id),
    name: m.name,
    memberNo: m.memberNo,
    rank: rankFromStr(m.rank),
    points: m.points,
    annualPurchase: m.annualPurchaseAmount,
  };
}

function couponTypeFrom(ct: string): Coupon['type'] {
  if (ct === 'FRIEND') return 'friend';
  if (ct === 'DISTRIBUTE') return 'distribute';
  return 'normal';
}

function txTypeFrom(t: string): PointHistory['type'] {
  if (t === 'USE') return 'use';
  if (t === 'CANCEL') return 'cancel';
  if (t === 'EXPIRE') return 'expire';
  return 'grant';
}

// ──────────────────────────────────────────────
// Context
// ──────────────────────────────────────────────

interface StoreState {
  currentUser: User | null;
  posts: Post[];
  coupons: Coupon[];
  purchases: Purchase[];
  pointHistory: PointHistory[];
  loading: boolean;
  postsLoaded: boolean;
  /** 友達招待リンクを取得（毎回新規 invitation 生成） */
  issueFriendLink: () => Promise<string>;
  /** 最新の会員情報・ポイント履歴を再取得 */
  refresh: () => Promise<void>;
}

const StoreContext = createContext<StoreState | undefined>(undefined);

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const { status: authStatus, currentUser: authUser, refreshUser } = useAuth();

  const [posts, setPosts] = useState<Post[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [pointHistory, setPointHistory] = useState<PointHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [postsLoaded, setPostsLoaded] = useState(false);

  // ユーザーデータを API から読み込む
  const loadUserData = useCallback(async () => {
    setLoading(true);
    try {
      const [couponRes, purchaseRes, pointRes] = await Promise.all([
        api.get<CouponApi[]>('/api/me/coupons'),
        api.get<PurchaseApi[]>('/api/me/purchases'),
        api.get<{ currentPoints: number; history: PointHistoryApi[] }>('/api/me/points'),
      ]);

      setCoupons(couponRes.map(c => ({
        id: String(c.id),
        name: c.name,
        discountDesc: c.discountDesc,
        type: couponTypeFrom(c.couponType),
        expiresAt: c.expiresAt ?? undefined,
      })));

      setPurchases(purchaseRes.map(p => ({
        id: String(p.id),
        storeName: p.storeName,
        amount: p.amount,
        pointsUsed: p.pointsUsed,
        pointsToGrant: p.pointsToGrant,
        pointsGranted: p.pointsGranted,
        couponUsed: p.couponUsed,
        date: p.purchasedAt,
        status: p.status === 'CANCELED' ? 'canceled' : 'completed',
      })));

      setPointHistory(pointRes.history.map(ph => ({
        id: String(ph.id),
        amount: ph.amount,
        type: txTypeFrom(ph.transactionType),
        date: ph.createdAt,
        description: ph.description,
      })));
    } finally {
      setLoading(false);
    }
  }, []);

  // 投稿一覧は認証不要でロード
  const loadPosts = useCallback(async () => {
    try {
      const res = await api.get<{ content: PostApi[] }>('/api/posts?size=20');
      setPosts(res.content.map(p => ({
        id: String(p.id),
        title: p.title,
        image: p.imageData,
        url: p.linkUrl ?? '',
        date: p.createdAt,
      })));
    } finally {
      setPostsLoaded(true);
    }
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  useEffect(() => {
    if (authStatus === 'ready') {
      loadUserData();
    }
  }, [authStatus, loadUserData]);

  const issueFriendLink = useCallback(async (): Promise<string> => {
    const res = await api.get<{ invitationId: number; url: string }>('/api/me/invite-link');
    return res.url;
  }, []);

  const refresh = useCallback(async () => {
    await Promise.all([refreshUser(), loadUserData()]);
  }, [refreshUser, loadUserData]);

  const currentUser = authUser ? memberToUser(authUser) : null;

  return (
    <StoreContext.Provider
      value={{ currentUser, posts, coupons, purchases, pointHistory, loading, postsLoaded, issueFriendLink, refresh }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = (): StoreState => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
};
