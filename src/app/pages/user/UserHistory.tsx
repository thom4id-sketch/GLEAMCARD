import { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { format, parseISO } from 'date-fns';
import { ShoppingBag, Coins, ArrowRightLeft } from 'lucide-react';

export const UserHistory = () => {
  const { currentUser, purchases, pointHistory } = useStore();
  const [activeTab, setActiveTab] = useState<'purchase' | 'point'>('purchase');

  const myPurchases = purchases.filter(p => p.userId === currentUser.id);
  const myPointHistory = pointHistory.filter(ph => ph.userId === currentUser.id);

  return (
    <div className="flex flex-col h-full font-sans bg-[#f8f9fa]">
      {/* Tabs */}
      <div className="flex bg-white border-b border-[#d0d0d0] sticky top-0 z-10 shadow-sm">
        <button
          className={`flex-1 py-4 text-[10px] tracking-widest font-bold text-center border-b-[3px] transition-colors uppercase ${activeTab === 'purchase' ? 'border-[#5a5a5a] text-[#5a5a5a]' : 'border-transparent text-[#a0a0a0] hover:text-[#7a7a7a]'}`}
          onClick={() => setActiveTab('purchase')}
        >
          Purchase
        </button>
        <button
          className={`flex-1 py-4 text-[10px] tracking-widest font-bold text-center border-b-[3px] transition-colors uppercase ${activeTab === 'point' ? 'border-[#5a5a5a] text-[#5a5a5a]' : 'border-transparent text-[#a0a0a0] hover:text-[#7a7a7a]'}`}
          onClick={() => setActiveTab('point')}
        >
          Points
        </button>
      </div>

      <div className="p-0">
        {activeTab === 'purchase' && (
          <div className="flex flex-col">
            {myPurchases.length === 0 ? (
              <div className="text-center py-16 text-[#a0a0a0] bg-white border-b border-[#d0d0d0]">
                <ShoppingBag className="mx-auto w-8 h-8 mb-4 opacity-50 stroke-1" />
                <p className="text-xs tracking-widest uppercase">No Purchase History</p>
              </div>
            ) : (
              myPurchases.map(purchase => (
                <div key={purchase.id} className="bg-white border-b border-[#d0d0d0] p-5 shadow-sm mb-1">
                  <div className="flex justify-between items-end mb-4">
                    <div>
                      <span className="text-xs text-[#7a7a7a] font-mono tracking-widest block mb-1">
                        {format(parseISO(purchase.date), 'yyyy.MM.dd HH:mm')}
                      </span>
                      <span className="text-sm font-bold text-[#4a4a4a] tracking-widest uppercase">{purchase.storeName}</span>
                    </div>
                  </div>
                  
                  {purchase.status === 'canceled' ? (
                    <div className="py-3 text-center border border-[#a0a0a0] text-[#7a7a7a] font-bold text-xs uppercase tracking-widest bg-[#f8f9fa]">
                      Canceled
                    </div>
                  ) : (
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-[#7a7a7a] tracking-widest uppercase">Amount (Tax inc.)</span>
                        <span className="font-mono text-base tracking-tighter text-[#4a4a4a]">¥{purchase.amount.toLocaleString()}</span>
                      </div>
                      {purchase.pointsUsed > 0 && (
                        <div className="flex justify-between items-center text-[#7a7a7a]">
                          <span className="text-[10px] tracking-widest uppercase">Points Used</span>
                          <span className="font-mono text-sm tracking-tighter">-{purchase.pointsUsed} pt</span>
                        </div>
                      )}
                      {purchase.couponId && (
                        <div className="flex justify-between items-center text-[#7a7a7a]">
                          <span className="text-[10px] tracking-widest uppercase">Coupon Used</span>
                          <span className="text-[10px] tracking-widest font-bold">YES</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center pt-3 border-t border-[#e0e0e0]">
                        <span className="text-[10px] text-[#7a7a7a] tracking-widest uppercase">Points Granted</span>
                        <span className="font-mono text-sm font-bold tracking-tighter text-[#5a5a5a]">+{purchase.pointsGranted} pt</span>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'point' && (
          <div className="flex flex-col">
            <div className="bg-[#ececec] text-[#4a4a4a] p-6 flex flex-col items-center justify-center border-b border-[#d0d0d0] shadow-sm mb-1">
              <span className="text-[10px] tracking-widest opacity-80 mb-2 uppercase text-[#5a5a5a]">Current Points</span>
              <span className="text-4xl font-mono tracking-tighter text-[#4a4a4a]">{currentUser.points.toLocaleString()}<span className="text-sm ml-1 font-sans text-[#7a7a7a]">pt</span></span>
            </div>

            {myPointHistory.length === 0 ? (
              <div className="text-center py-16 text-[#a0a0a0] bg-white border-b border-[#d0d0d0]">
                <Coins className="mx-auto w-8 h-8 mb-4 opacity-50 stroke-1" />
                <p className="text-xs tracking-widest uppercase">No Point History</p>
              </div>
            ) : (
              myPointHistory.map(ph => (
                <div key={ph.id} className="bg-white border-b border-[#d0d0d0] p-5 flex items-center justify-between shadow-sm mb-1">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 border border-[#c0c0c0] bg-[#f8f9fa] rounded-none flex items-center justify-center flex-shrink-0">
                      <ArrowRightLeft className="w-4 h-4 stroke-1 text-[#5a5a5a]" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#4a4a4a] tracking-wider uppercase">{ph.description}</p>
                      <p className="text-[10px] text-[#7a7a7a] mt-1 font-mono tracking-widest">{format(parseISO(ph.date), 'yyyy.MM.dd HH:mm')}</p>
                    </div>
                  </div>
                  <div className={`font-mono text-lg tracking-tighter ${ph.type === 'grant' ? 'text-[#4a4a4a]' : 'text-[#7a7a7a]'}`}>
                    {ph.type === 'grant' ? '+' : '-'}{ph.amount}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
