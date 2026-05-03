import { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { Link } from 'react-router';
import { Ticket, Users, Copy, Check } from 'lucide-react';

export const UserCoupons = () => {
  const { coupons, issueFriendLink, refresh } = useStore();
  const [activeTab, setActiveTab] = useState<'my' | 'invite'>('my');
  const [inviteUrl, setInviteUrl] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // ページ表示時に最新クーポン状態を取得
  useEffect(() => { refresh(); }, []);

  // 招待タブを開いたとき（初回のみ）リンクを取得
  useEffect(() => {
    if (activeTab !== 'invite' || inviteUrl) return;
    setInviteLoading(true);
    issueFriendLink()
      .then(url => setInviteUrl(url))
      .catch(console.error)
      .finally(() => setInviteLoading(false));
  }, [activeTab, inviteUrl, issueFriendLink]);

  const handleCopyLink = () => {
    if (!inviteUrl) return;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full font-sans bg-[#f8f9fa]">
      {/* Tabs */}
      <div className="flex bg-white border-b border-[#d0d0d0]">
        <button
          className={`flex-1 py-4 text-[10px] tracking-widest font-bold text-center border-b-[3px] transition-colors uppercase ${activeTab === 'my' ? 'border-[#5a5a5a] text-[#5a5a5a]' : 'border-transparent text-[#a0a0a0] hover:text-[#7a7a7a]'}`}
          onClick={() => setActiveTab('my')}
        >
          My Coupons
        </button>
        <button
          className={`flex-1 py-4 text-[10px] tracking-widest font-bold text-center border-b-[3px] transition-colors uppercase ${activeTab === 'invite' ? 'border-[#5a5a5a] text-[#5a5a5a]' : 'border-transparent text-[#a0a0a0] hover:text-[#7a7a7a]'}`}
          onClick={() => setActiveTab('invite')}
        >
          Invite Friends
        </button>
      </div>

      <div className="p-5 overflow-y-auto pb-20">
        {activeTab === 'my' && (
          <div className="space-y-5">
            {coupons.length === 0 ? (
              <div className="text-center py-16 text-[#a0a0a0] border border-dashed border-[#d0d0d0] bg-white">
                <Ticket className="mx-auto w-8 h-8 mb-4 opacity-50 stroke-1" />
                <p className="text-xs tracking-widest">NO COUPONS AVAILABLE</p>
              </div>
            ) : (
              coupons.map(coupon => (
                <div key={coupon.id} className="bg-white border border-[#7a7a7a] flex overflow-hidden relative group shadow-sm">
                  <div className="absolute top-1/2 -left-2 w-4 h-4 bg-[#f8f9fa] border-r border-t border-[#7a7a7a] rotate-45 -translate-y-1/2 z-10"></div>
                  <div className="absolute top-1/2 -right-2 w-4 h-4 bg-[#f8f9fa] border-l border-b border-[#7a7a7a] rotate-45 -translate-y-1/2 z-10"></div>

                  <div className="bg-[#e2e2e2] text-[#5a5a5a] p-4 flex flex-col justify-center items-center w-20 flex-shrink-0 relative">
                    <Ticket className="w-6 h-6 mb-2 stroke-1" />
                    <span className="text-[9px] font-bold tracking-widest -rotate-90 whitespace-nowrap mt-4 font-serif">TICKET</span>
                  </div>
                  <div className="p-5 flex-1 border-l border-dashed border-[#7a7a7a] relative">
                    <div className="text-[10px] tracking-widest text-[#7a7a7a] font-bold mb-2 uppercase">
                      {coupon.type === 'friend' ? 'Friend Invite' : coupon.type === 'distribute' ? 'Distribution' : 'Special Gift'}
                    </div>
                    <h3 className="text-sm font-bold text-[#4a4a4a] mb-2 tracking-wide leading-tight">{coupon.name}</h3>
                    <p className="text-lg font-serif font-bold text-[#5a5a5a]">{coupon.discountDesc}</p>
                    <p className="text-[9px] text-[#a0a0a0] font-mono tracking-widest mt-3">
                      EXP: {coupon.expiresAt ? coupon.expiresAt.replace(/-/g, '/') : '無期限'}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'invite' && (
          <div className="space-y-6">
            <div className="bg-white border border-[#c0c0c0] p-6 text-center shadow-sm">
              <div className="inline-flex bg-[#ececec] text-[#5a5a5a] p-4 mb-6 rounded-full border border-[#d0d0d0]">
                <Users className="w-6 h-6 stroke-1" />
              </div>
              <h3 className="text-sm font-bold text-[#4a4a4a] mb-4 tracking-widest leading-relaxed uppercase">
                Invite Friends<br />Get Rewards
              </h3>
              <p className="text-xs text-[#7a7a7a] mb-8 leading-loose text-left">
                お友達があなたのリンクから登録し、初回購入を完了すると、あなたに
                <span className="font-bold text-[#5a5a5a] border-b border-[#a0a0a0] pb-0.5">500ポイント</span>
                をプレゼント！お友達にも
                <span className="font-bold text-[#5a5a5a] border-b border-[#a0a0a0] pb-0.5">1,000円OFFクーポン</span>
                が届きます。
              </p>

              {inviteLoading ? (
                <p className="text-[10px] text-[#a0a0a0] tracking-widest animate-pulse">リンクを生成中...</p>
              ) : (
                <>
                  <div className="bg-[#f8f9fa] border border-[#d0d0d0] p-2 flex items-center mb-3">
                    <input
                      type="text"
                      readOnly
                      value={inviteUrl}
                      className="flex-1 text-[10px] font-mono text-[#5a5a5a] bg-transparent outline-none px-2 tracking-wider"
                      placeholder="リンクを生成しています..."
                    />
                    <button
                      onClick={handleCopyLink}
                      disabled={!inviteUrl}
                      className="bg-[#5a5a5a] text-white p-3 hover:bg-[#4a4a4a] transition flex items-center justify-center flex-shrink-0 disabled:opacity-40"
                    >
                      {copied ? <Check size={16} strokeWidth={1} /> : <Copy size={16} strokeWidth={1} />}
                    </button>
                  </div>
                  <p className="text-[9px] text-[#a0a0a0] tracking-widest uppercase">SHARE THIS LINK</p>
                </>
              )}
            </div>
          </div>
        )}

        <div className="mt-10 text-center">
          <Link
            to="/coupon-info"
            className="text-[10px] text-[#7a7a7a] tracking-widest border-b border-[#a0a0a0] pb-[2px] hover:text-[#5a5a5a] hover:border-[#5a5a5a] transition-colors inline-block"
          >
            クーポンについて
          </Link>
        </div>
      </div>
    </div>
  );
};
