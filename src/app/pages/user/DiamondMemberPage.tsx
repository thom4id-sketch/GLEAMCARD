import { useCallback, useEffect, useState } from 'react';
import liff from '@line/liff';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';

const REFERRAL_DISCOUNT = 5; // ご紹介された方の特典（%OFF）

/** ダイヤモンド会員専用ページ（通常の会員証・履歴画面には遷移しない） */
export const DiamondMemberPage = () => {
  const { currentUser } = useAuth();
  const [referralCount, setReferralCount] = useState<number | null>(null);
  const [sharing, setSharing] = useState(false);
  const [notice, setNotice] = useState<{ text: string; url?: string } | null>(null);

  const loadReferrals = useCallback(async () => {
    try {
      const res = await api.get<{ referralCount: number }>('/api/me/referrals');
      setReferralCount(res.referralCount);
    } catch {
      setReferralCount(0);
    }
  }, []);

  useEffect(() => {
    loadReferrals();
    // 友だちが登録を済ませて戻ってきた時に数字を更新する
    const onVisible = () => { if (document.visibilityState === 'visible') loadReferrals(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [loadReferrals]);

  const buildMessage = (url: string) =>
    `GLEAM 会員のご紹介です。\n` +
    `こちらのリンクから会員登録いただくと、初回のお買い物が${REFERRAL_DISCOUNT}%OFFになるクーポンをプレゼントいたします。\n\n` +
    url;

  const handleShare = async () => {
    if (sharing) return;
    setSharing(true);
    setNotice(null);
    try {
      // 紹介リンクは1リンク=1名まで。送信のたびに新しいリンクを発行する
      const { url } = await api.get<{ invitationId: number; url: string }>('/api/me/invite-link');
      const message = buildMessage(url);

      if (liff.isApiAvailable('shareTargetPicker')) {
        const result = await liff.shareTargetPicker(
          [{ type: 'text', text: message }],
          { isMultiple: false },
        );
        if (result) {
          setNotice({ text: '紹介メッセージを送信しました。' });
        } else {
          setNotice({ text: '送信をキャンセルしました。' });
        }
      } else {
        // LINEアプリ外などで友だち選択が使えない場合はリンクを表示してコピーしてもらう
        try {
          await navigator.clipboard.writeText(url);
          setNotice({ text: '紹介リンクをコピーしました。お友だちに送ってください。', url });
        } catch {
          setNotice({ text: '下記の紹介リンクをお友だちに送ってください。', url });
        }
      }
    } catch (e) {
      setNotice({ text: e instanceof Error ? e.message : '紹介リンクの作成に失敗しました。' });
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="min-h-[100dvh] max-w-md mx-auto bg-[#111111] text-white font-sans flex flex-col">
      {/* ヘッダー */}
      <header className="flex items-center justify-between px-5 h-14 border-b border-white/10">
        <span className="text-[11px] tracking-widest text-white/60">会員ページ</span>
        <span className="text-lg font-bold tracking-[0.35em] font-serif pl-[0.35em]">GLEAM</span>
        <span className="w-[4.5em]" aria-hidden="true" />
      </header>

      <main className="flex-1 flex flex-col items-center px-6 pt-12 pb-10">
        {/* タイトル */}
        <p className="text-[11px] tracking-[0.5em] text-white/60 uppercase mb-4 pl-[0.5em]">Diamond Member</p>
        <h1 className="text-[26px] font-bold tracking-[0.25em] pl-[0.25em] mb-5">ダイヤモンド会員</h1>
        <p className="text-sm tracking-widest text-white/70 mb-12">{currentUser?.name} 様</p>

        {/* ダイヤモンドの線画 */}
        <div className="relative w-full max-w-[320px] aspect-square mb-12">
          <div className="absolute inset-[12%] rounded-full bg-white/[0.06] blur-3xl" aria-hidden="true" />
          <svg viewBox="0 0 200 200" className="relative w-full h-full" fill="none" stroke="#ffffff" strokeWidth="1.6" strokeLinejoin="round" aria-hidden="true">
            {/* 上面 */}
            <polygon points="50,50 150,50 180,90 20,90" fill="#2a2a2a" />
            <polygon points="50,50 80,90 20,90" fill="#3a3a3a" />
            <polygon points="80,50 100,90 80,90" fill="#1f1f1f" />
            <polygon points="80,50 120,50 100,90" fill="#4a4a4a" />
            <polygon points="120,50 120,90 100,90" fill="#1f1f1f" />
            <polygon points="150,50 180,90 120,90" fill="#3a3a3a" />
            <polygon points="50,50 80,50 80,90" fill="#2a2a2a" />
            <polygon points="120,50 150,50 120,90" fill="#2a2a2a" />
            {/* 下面 */}
            <polygon points="20,90 180,90 100,180" fill="#2f2f2f" />
            <polygon points="20,90 60,90 100,180" fill="#454545" />
            <polygon points="60,90 100,90 100,180" fill="#333333" />
            <polygon points="100,90 140,90 100,180" fill="#3d3d3d" />
            <polygon points="140,90 180,90 100,180" fill="#272727" />
            {/* きらめき */}
            <g strokeWidth="1.6" strokeLinecap="round">
              <line x1="170" y1="28" x2="170" y2="44" />
              <line x1="162" y1="36" x2="178" y2="36" />
              <line x1="28" y1="104" x2="28" y2="118" />
              <line x1="21" y1="111" x2="35" y2="111" />
            </g>
          </svg>
        </div>

        {/* 紹介数・特典 */}
        <div className="w-full grid grid-cols-2 border border-white/40 mb-8">
          <div className="py-8 px-3 text-center border-r border-white/40">
            <p className="text-[11px] tracking-widest text-white/70 mb-4">現在までの紹介数</p>
            <p className="font-mono leading-none">
              <span className="text-5xl font-light">{referralCount ?? '–'}</span>
              <span className="text-sm ml-1 tracking-widest">名</span>
            </p>
          </div>
          <div className="py-8 px-3 text-center">
            <p className="text-[11px] tracking-widest text-white/70 mb-4">ご紹介された方の特典</p>
            <p className="font-mono leading-none">
              <span className="text-5xl font-light">{REFERRAL_DISCOUNT}</span>
              <span className="text-sm ml-1 tracking-widest">% OFF</span>
            </p>
          </div>
        </div>

        <p className="text-xs leading-loose tracking-wider text-white/70 text-center mb-10">
          ご紹介されたお友だちは、初回のお買い物が{REFERRAL_DISCOUNT}%OFFになります。
        </p>

        {notice && (
          <div className="w-full border border-white/30 bg-white/5 px-4 py-3 mb-6 text-center">
            <p className="text-xs tracking-wider text-white/90">{notice.text}</p>
            {notice.url && (
              <p className="mt-2 text-[10px] font-mono tracking-wider text-white/70 break-all select-all">{notice.url}</p>
            )}
          </div>
        )}

        <div className="flex-1" />

        {/* 友だちに紹介する */}
        <button
          type="button"
          onClick={handleShare}
          disabled={sharing}
          className="w-full bg-white text-[#111111] py-5 flex items-center justify-center gap-3 text-lg font-bold tracking-[0.2em] pl-[0.2em] hover:bg-white/90 active:bg-white/80 transition disabled:opacity-60"
        >
          {sharing ? 'リンクを作成中...' : '友だちに紹介する'}
          {!sharing && <ArrowRight className="w-5 h-5" strokeWidth={1.5} />}
        </button>
      </main>
    </div>
  );
};
