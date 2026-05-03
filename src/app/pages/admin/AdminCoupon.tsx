import { useState } from 'react';
import { Send, CheckCircle, Ticket } from 'lucide-react';
import { addDays, format } from 'date-fns';
import { api } from '../../lib/api';

export const AdminCoupon = () => {
  const [name, setName] = useState('');
  const [hasExpiry, setHasExpiry] = useState(true);
  const [expiresAt, setExpiresAt] = useState(format(addDays(new Date(), 30), 'yyyy-MM-dd'));
  const [discountPercent, setDiscountPercent] = useState<number | ''>(10);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [distributedCount, setDistributedCount] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || typeof discountPercent !== 'number') return;
    if (hasExpiry && !expiresAt) return;

    setLoading(true);
    setError('');
    try {
      const res = await api.post<{ distributed: number }>('/api/admin/coupons/distribute', {
        name: name.trim(),
        discountType: 'PERCENT',
        discountValue: discountPercent,
        expiresAt: hasExpiry ? expiresAt : undefined,
      });

      setDistributedCount(res.distributed);
      setName('');
      setExpiresAt(format(addDays(new Date(), 30), 'yyyy-MM-dd'));
      setHasExpiry(true);
      setDiscountPercent(10);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '配布に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = name.trim() && typeof discountPercent === 'number' && (!hasExpiry || expiresAt);

  return (
    <div className="p-5 h-full flex flex-col overflow-y-auto bg-[#f8f9fa] font-sans">
      <h2 className="text-xs font-bold text-[#5a5a5a] border-b border-[#d0d0d0] pb-3 mb-6 tracking-widest flex items-center">
        <Ticket className="w-4 h-4 mr-2 stroke-1" />
        クーポン一斉配布
      </h2>

      {success && (
        <div className="bg-white border border-[#5a5a5a] text-[#5a5a5a] p-4 flex items-center space-x-3 mb-6 text-xs font-bold tracking-wide">
          <CheckCircle className="w-5 h-5 stroke-1" />
          <span>{distributedCount}名の会員へ配布が完了しました</span>
        </div>
      )}

      {error && (
        <div className="border border-red-200 bg-red-50 text-red-600 p-4 mb-6 text-xs tracking-wide">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col space-y-6 pb-10">
        <div>
          <label className="block text-[11px] font-bold text-[#7a7a7a] tracking-widest mb-2">
            クーポン名 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full border border-[#d0d0d0] bg-white px-3 py-3 text-sm focus:outline-none focus:border-[#5a5a5a] text-[#4a4a4a] transition-colors"
            placeholder="例: 春の特別10%OFFクーポン"
          />
        </div>

        <div className="flex space-x-4">
          <div className="flex-1">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-[11px] font-bold text-[#7a7a7a] tracking-widest">
                使用期限 <span className="text-red-500">*</span>
              </label>
              <label className="flex items-center space-x-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!hasExpiry}
                  onChange={e => setHasExpiry(!e.target.checked)}
                  className="accent-[#5a5a5a]"
                />
                <span className="text-[10px] text-[#7a7a7a] tracking-widest">無期限</span>
              </label>
            </div>
            <input
              type="date"
              required={hasExpiry}
              disabled={!hasExpiry}
              value={expiresAt}
              onChange={e => setExpiresAt(e.target.value)}
              className="w-full border border-[#d0d0d0] bg-white px-3 py-3 text-sm focus:outline-none focus:border-[#5a5a5a] text-[#4a4a4a] transition-colors font-mono tracking-widest disabled:bg-[#f0f0f0] disabled:text-[#a0a0a0]"
            />
          </div>

          <div className="w-24">
            <label className="block text-[11px] font-bold text-[#7a7a7a] tracking-widest mb-2">
              割引率 (%) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                required
                min="1"
                max="100"
                value={discountPercent}
                onChange={e => setDiscountPercent(e.target.value ? Number(e.target.value) : '')}
                className="w-full border border-[#d0d0d0] bg-white pl-3 pr-6 py-3 text-right text-sm focus:outline-none focus:border-[#5a5a5a] text-[#4a4a4a] transition-colors font-mono"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7a7a7a] text-[11px] tracking-widest">%</span>
            </div>
          </div>
        </div>

        {/* プレビュー */}
        <div className="bg-[#f8f9fa] border border-[#d0d0d0] p-4 text-[10px] text-[#7a7a7a] tracking-widest leading-relaxed">
          <p className="font-bold mb-2">プレビュー</p>
          <div className="bg-white border border-[#7a7a7a] flex overflow-hidden relative shadow-sm pointer-events-none">
            <div className="absolute top-1/2 -left-2 w-4 h-4 bg-[#f8f9fa] border-r border-t border-[#7a7a7a] rotate-45 -translate-y-1/2 z-10"></div>
            <div className="absolute top-1/2 -right-2 w-4 h-4 bg-[#f8f9fa] border-l border-b border-[#7a7a7a] rotate-45 -translate-y-1/2 z-10"></div>
            <div className="bg-[#e2e2e2] text-[#5a5a5a] p-4 flex flex-col justify-center items-center w-20 flex-shrink-0 relative">
              <Ticket className="w-6 h-6 mb-2 stroke-1" />
              <span className="text-[9px] font-bold tracking-widest -rotate-90 whitespace-nowrap mt-4 font-serif">TICKET</span>
            </div>
            <div className="p-5 flex-1 border-l border-dashed border-[#7a7a7a] relative">
              <div className="text-[10px] tracking-widest text-[#7a7a7a] font-bold mb-2 uppercase">Distribution</div>
              <h3 className="text-sm font-bold text-[#4a4a4a] mb-2 tracking-wide leading-tight">{name || 'クーポン名'}</h3>
              <p className="text-lg font-serif font-bold text-[#5a5a5a]">お会計から{discountPercent || 0}%OFF</p>
              {hasExpiry ? (
                <p className="text-[9px] text-[#a0a0a0] font-mono tracking-widest mt-3">
                  EXP: {expiresAt ? format(new Date(expiresAt), 'yyyy/MM/dd') : '未設定'}
                </p>
              ) : (
                <p className="text-[9px] text-[#a0a0a0] font-mono tracking-widest mt-3">EXP: 無期限</p>
              )}
            </div>
          </div>
        </div>

        <div className="pt-6 mt-auto">
          <button
            type="submit"
            disabled={loading || !isFormValid}
            className="w-full bg-[#5a5a5a] text-white py-4 text-xs tracking-widest font-bold flex items-center justify-center space-x-2 hover:bg-[#4a4a4a] transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4 stroke-1" />
            <span>{loading ? '配布中...' : '全会員に配布する'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
