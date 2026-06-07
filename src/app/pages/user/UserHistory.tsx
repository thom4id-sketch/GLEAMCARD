import { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { format, parseISO } from 'date-fns';
import { ShoppingBag, Coins, ArrowRightLeft, Clock, XCircle } from 'lucide-react';

const safeFormat = (dateStr: string, fmt: string): string => {
  try {
    return format(parseISO(dateStr), fmt);
  } catch {
    return '—';
  }
};

export const UserHistory = () => {
  const { currentUser, purchases, pointHistory } = useStore();
  const [activeTab, setActiveTab] = useState<'purchase' | 'point'>('purchase');

  // 付与予定エントリ（ポイントタブ用）: 完了済みかつ未付与の購入
  const pendingGrants = purchases.filter(
    p => p.status === 'completed' && !p.pointsGranted && p.pointsToGrant > 0
  );

  return (
    <div className="flex flex-col h-full font-sans bg-[#f8f9fa]">
      {/* タブ */}
      <div className="flex bg-white border-b border-[#d0d0d0] sticky top-0 z-10 shadow-sm">
        <button
          className={`flex-1 py-4 text-[10px] tracking-widest font-bold text-center border-b-[3px] transition-colors ${activeTab === 'purchase' ? 'border-[#5a5a5a] text-[#5a5a5a]' : 'border-transparent text-[#a0a0a0] hover:text-[#7a7a7a]'}`}
          onClick={() => setActiveTab('purchase')}
        >
          購入履歴
        </button>
        <button
          className={`flex-1 py-4 text-[10px] tracking-widest font-bold text-center border-b-[3px] transition-colors ${activeTab === 'point' ? 'border-[#5a5a5a] text-[#5a5a5a]' : 'border-transparent text-[#a0a0a0] hover:text-[#7a7a7a]'}`}
          onClick={() => setActiveTab('point')}
        >
          ポイント
        </button>
      </div>

      <div className="p-0">
        {/* ── 購入履歴タブ ── */}
        {activeTab === 'purchase' && (
          <div className="flex flex-col">
            {purchases.length === 0 ? (
              <div className="text-center py-16 text-[#a0a0a0] bg-white border-b border-[#d0d0d0]">
                <ShoppingBag className="mx-auto w-8 h-8 mb-4 opacity-50 stroke-1" />
                <p className="text-xs tracking-widest">購入履歴がありません</p>
              </div>
            ) : (
              purchases.map(purchase => (
                <div key={purchase.id} className="bg-white border-b border-[#d0d0d0] p-5 shadow-sm mb-1">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-xs text-[#7a7a7a] font-mono tracking-widest block mb-1">
                        {safeFormat(purchase.date, 'yyyy.MM.dd HH:mm')}
                      </span>
                      <span className="text-sm font-bold text-[#4a4a4a] tracking-widest">{purchase.storeName}</span>
                    </div>
                    {purchase.status === 'canceled' && (
                      <div className="flex items-center space-x-1 text-[#a0a0a0]">
                        <XCircle className="w-3 h-3 stroke-1" />
                        <span className="text-[10px] tracking-widest font-bold">キャンセル済</span>
                      </div>
                    )}
                  </div>

                  {purchase.status === 'canceled' ? (
                    <div className="py-3 text-center border border-dashed border-[#d0d0d0] text-[#a0a0a0] font-bold text-[10px] tracking-widest bg-[#f8f9fa]">
                      この取引はキャンセルされました
                    </div>
                  ) : (
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-[#7a7a7a] tracking-widest">お支払い金額（税込）</span>
                        <span className="font-mono text-base tracking-tighter text-[#4a4a4a]">¥{purchase.amount.toLocaleString()}</span>
                      </div>
                      {purchase.pointsUsed > 0 && (
                        <div className="flex justify-between items-center text-[#7a7a7a]">
                          <span className="text-[10px] tracking-widest">利用ポイント</span>
                          <span className="font-mono text-sm tracking-tighter">-{purchase.pointsUsed} pt</span>
                        </div>
                      )}
                      {purchase.couponUsed && (
                        <div className="flex justify-between items-center text-[#7a7a7a]">
                          <span className="text-[10px] tracking-widest">クーポン利用</span>
                          <span className="text-[10px] tracking-widest font-bold">あり</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center pt-3 border-t border-[#e0e0e0]">
                        <div className="flex items-center space-x-1">
                          <span className="text-[10px] text-[#7a7a7a] tracking-widest">ポイント</span>
                          {purchase.pointsGranted ? (
                            <span className="text-[9px] bg-[#5a5a5a] text-white px-1.5 py-0.5 tracking-widest font-bold">付与済み</span>
                          ) : (
                            <span className="text-[9px] border border-[#a0a0a0] text-[#7a7a7a] px-1.5 py-0.5 tracking-widest font-bold flex items-center space-x-0.5">
                              <Clock className="w-2.5 h-2.5 stroke-1 inline" />
                              <span>付与予定</span>
                            </span>
                          )}
                        </div>
                        <span className="font-mono text-sm font-bold tracking-tighter text-[#5a5a5a]">+{purchase.pointsToGrant} pt</span>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* ── ポイント履歴タブ ── */}
        {activeTab === 'point' && (
          <div className="flex flex-col">
            <div className="bg-[#ececec] text-[#4a4a4a] p-6 flex flex-col items-center justify-center border-b border-[#d0d0d0] shadow-sm mb-1">
              <span className="text-[10px] tracking-widest opacity-80 mb-2 text-[#5a5a5a]">現在のポイント</span>
              <span className="text-4xl font-mono tracking-tighter text-[#4a4a4a]">
                {currentUser?.points.toLocaleString()}
                <span className="text-sm ml-1 font-sans text-[#7a7a7a]">pt</span>
              </span>
            </div>

            {pendingGrants.length === 0 && pointHistory.length === 0 ? (
              <div className="text-center py-16 text-[#a0a0a0] bg-white border-b border-[#d0d0d0]">
                <Coins className="mx-auto w-8 h-8 mb-4 opacity-50 stroke-1" />
                <p className="text-xs tracking-widest">ポイント履歴がありません</p>
              </div>
            ) : (
              <>
                {/* 付与予定（購入から3日後に付与） */}
                {pendingGrants.map(p => (
                  <div key={`pending-${p.id}`} className="bg-white border-b border-[#d0d0d0] p-5 flex items-center justify-between shadow-sm mb-1">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 border border-dashed border-[#c0c0c0] bg-[#f8f9fa] flex items-center justify-center flex-shrink-0">
                        <Clock className="w-4 h-4 stroke-1 text-[#a0a0a0]" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#7a7a7a] tracking-wider">ポイント付与予定</p>
                        <p className="text-[10px] text-[#a0a0a0] mt-1 font-mono tracking-widest">
                          {safeFormat(p.date, 'yyyy.MM.dd')} の購入分
                        </p>
                        <p className="text-[9px] text-[#a0a0a0] tracking-widest mt-0.5">購入日から3日後に付与</p>
                      </div>
                    </div>
                    <div className="font-mono text-lg tracking-tighter text-[#a0a0a0]">
                      +{p.pointsToGrant}
                    </div>
                  </div>
                ))}

                {/* 確定済みのポイント履歴 */}
                {pointHistory.map(ph => (
                  <div key={ph.id} className="bg-white border-b border-[#d0d0d0] p-5 flex items-center justify-between shadow-sm mb-1">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 border border-[#c0c0c0] bg-[#f8f9fa] flex items-center justify-center flex-shrink-0">
                        <ArrowRightLeft className="w-4 h-4 stroke-1 text-[#5a5a5a]" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#4a4a4a] tracking-wider">{ph.description}</p>
                        <p className="text-[10px] text-[#7a7a7a] mt-1 font-mono tracking-widest">
                          {safeFormat(ph.date, 'yyyy.MM.dd HH:mm')}
                        </p>
                      </div>
                    </div>
                    <div className={`font-mono text-lg tracking-tighter ${ph.type === 'grant' ? 'text-[#4a4a4a]' : 'text-[#7a7a7a]'}`}>
                      {ph.type === 'grant' ? '+' : '-'}{ph.amount}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
