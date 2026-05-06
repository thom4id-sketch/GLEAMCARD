import { useState } from 'react';
import { Send, CheckCircle, Ticket } from 'lucide-react';
import { addDays, format } from 'date-fns';
import { api } from '../../lib/api';

type DiscountType = 'PERCENT' | 'AMOUNT';
type Rank = 'REGULAR' | 'GOLD' | 'PLATINUM';
type Gender = 'MALE' | 'FEMALE' | 'OTHER';

const ALL_RANKS: { value: Rank; label: string }[] = [
  { value: 'REGULAR', label: 'レギュラー' },
  { value: 'GOLD', label: 'ゴールド' },
  { value: 'PLATINUM', label: 'プラチナ' },
];
const ALL_GENDERS: { value: Gender; label: string }[] = [
  { value: 'MALE', label: '男性' },
  { value: 'FEMALE', label: '女性' },
  { value: 'OTHER', label: 'その他' },
];

export const AdminCoupon = () => {
  const [name, setName] = useState('');
  const [hasExpiry, setHasExpiry] = useState(true);
  const [expiresAt, setExpiresAt] = useState(format(addDays(new Date(), 30), 'yyyy-MM-dd'));
  const [discountType, setDiscountType] = useState<DiscountType>('PERCENT');
  const [discountValue, setDiscountValue] = useState<number | ''>(10);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [distributedCount, setDistributedCount] = useState(0);

  // ターゲティング
  const [targetRanks, setTargetRanks] = useState<Rank[]>([]);
  const [targetGenders, setTargetGenders] = useState<Gender[]>([]);
  const [ageMin, setAgeMin] = useState<number | ''>('');
  const [ageMax, setAgeMax] = useState<number | ''>('');

  const toggleRank = (r: Rank) =>
    setTargetRanks(prev => prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r]);
  const toggleGender = (g: Gender) =>
    setTargetGenders(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);

  const previewDesc = typeof discountValue === 'number'
    ? discountType === 'PERCENT'
      ? `お会計から${discountValue}%OFF`
      : `お会計から${discountValue.toLocaleString()}円引き`
    : '—';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || typeof discountValue !== 'number') return;
    if (hasExpiry && !expiresAt) return;

    setLoading(true);
    setError('');
    try {
      const res = await api.post<{ distributed: number }>('/api/admin/coupons/distribute', {
        name: name.trim(),
        discountType,
        discountValue,
        expiresAt: hasExpiry ? expiresAt : undefined,
        targetRanks: targetRanks.length > 0 ? targetRanks : undefined,
        targetGenders: targetGenders.length > 0 ? targetGenders : undefined,
        targetAgeMin: typeof ageMin === 'number' ? ageMin : undefined,
        targetAgeMax: typeof ageMax === 'number' ? ageMax : undefined,
      });

      setDistributedCount(res.distributed);
      setName('');
      setExpiresAt(format(addDays(new Date(), 30), 'yyyy-MM-dd'));
      setHasExpiry(true);
      setDiscountType('PERCENT');
      setDiscountValue(10);
      setTargetRanks([]);
      setTargetGenders([]);
      setAgeMin('');
      setAgeMax('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '配布に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = name.trim() && typeof discountValue === 'number' && discountValue > 0 && (!hasExpiry || expiresAt);

  return (
    <div className="p-5 h-full flex flex-col overflow-y-auto overflow-x-hidden bg-[#f8f9fa] font-sans">
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
            placeholder="例: 春の特別クーポン"
          />
        </div>

        {/* 割引タイプ + 値 */}
        <div>
          <label className="block text-[11px] font-bold text-[#7a7a7a] tracking-widest mb-2">
            割引内容 <span className="text-red-500">*</span>
          </label>
          <div className="flex space-x-2">
            {/* タイプ切り替え */}
            <div className="flex border border-[#d0d0d0] overflow-hidden">
              <button
                type="button"
                onClick={() => { setDiscountType('PERCENT'); setDiscountValue(10); }}
                className={`px-4 py-3 text-xs font-bold tracking-widest transition-colors ${discountType === 'PERCENT' ? 'bg-[#5a5a5a] text-white' : 'bg-white text-[#7a7a7a] hover:bg-[#f0f0f0]'}`}
              >
                ％
              </button>
              <button
                type="button"
                onClick={() => { setDiscountType('AMOUNT'); setDiscountValue(1000); }}
                className={`px-4 py-3 text-xs font-bold tracking-widest transition-colors border-l border-[#d0d0d0] ${discountType === 'AMOUNT' ? 'bg-[#5a5a5a] text-white' : 'bg-white text-[#7a7a7a] hover:bg-[#f0f0f0]'}`}
              >
                円
              </button>
            </div>
            {/* 値入力 */}
            <div className="relative flex-1">
              <input
                type="number"
                required
                min="1"
                max={discountType === 'PERCENT' ? 100 : undefined}
                value={discountValue}
                onChange={e => setDiscountValue(e.target.value ? Number(e.target.value) : '')}
                className="w-full border border-[#d0d0d0] bg-white pl-3 pr-8 py-3 text-right text-sm focus:outline-none focus:border-[#5a5a5a] text-[#4a4a4a] font-mono"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7a7a7a] text-[11px] tracking-widest">
                {discountType === 'PERCENT' ? '%' : '円'}
              </span>
            </div>
          </div>
        </div>

        {/* 使用期限 */}
        <div>
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
            type="text"
            inputMode="numeric"
            placeholder="例: 2026-06-02"
            required={hasExpiry}
            disabled={!hasExpiry}
            value={expiresAt}
            onChange={e => setExpiresAt(e.target.value)}
            className="w-full border border-[#d0d0d0] bg-white px-3 py-3 text-sm focus:outline-none focus:border-[#5a5a5a] text-[#4a4a4a] font-mono disabled:bg-[#f0f0f0] disabled:text-[#a0a0a0]"
          />
        </div>

        {/* ターゲティング */}
        <div>
          <label className="block text-[11px] font-bold text-[#7a7a7a] tracking-widest mb-3">
            配布対象 <span className="text-[#a0a0a0] font-normal">（未選択の場合は全員対象）</span>
          </label>

          {/* ランク */}
          <p className="text-[10px] text-[#7a7a7a] tracking-widest mb-2">会員ランク</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {ALL_RANKS.map(r => (
              <button
                key={r.value}
                type="button"
                onClick={() => toggleRank(r.value)}
                className={`px-3 py-2 text-[10px] font-bold tracking-widest border transition-colors ${
                  targetRanks.includes(r.value)
                    ? 'bg-[#5a5a5a] text-white border-[#5a5a5a]'
                    : 'bg-white text-[#7a7a7a] border-[#d0d0d0] hover:bg-[#f0f0f0]'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* 性別 */}
          <p className="text-[10px] text-[#7a7a7a] tracking-widest mb-2">性別</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {ALL_GENDERS.map(g => (
              <button
                key={g.value}
                type="button"
                onClick={() => toggleGender(g.value)}
                className={`px-3 py-2 text-[10px] font-bold tracking-widest border transition-colors ${
                  targetGenders.includes(g.value)
                    ? 'bg-[#5a5a5a] text-white border-[#5a5a5a]'
                    : 'bg-white text-[#7a7a7a] border-[#d0d0d0] hover:bg-[#f0f0f0]'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>

          {/* 年齢 */}
          <p className="text-[10px] text-[#7a7a7a] tracking-widest mb-2">年齢</p>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              max="120"
              value={ageMin}
              onChange={e => setAgeMin(e.target.value ? Number(e.target.value) : '')}
              placeholder="下限"
              className="w-20 border border-[#d0d0d0] bg-white px-3 py-2 text-sm text-center focus:outline-none focus:border-[#5a5a5a] text-[#4a4a4a] font-mono"
            />
            <span className="text-[10px] text-[#7a7a7a] tracking-widest">歳〜</span>
            <input
              type="number"
              min="0"
              max="120"
              value={ageMax}
              onChange={e => setAgeMax(e.target.value ? Number(e.target.value) : '')}
              placeholder="上限"
              className="w-20 border border-[#d0d0d0] bg-white px-3 py-2 text-sm text-center focus:outline-none focus:border-[#5a5a5a] text-[#4a4a4a] font-mono"
            />
            <span className="text-[10px] text-[#7a7a7a] tracking-widest">歳</span>
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
              <p className="text-lg font-serif font-bold text-[#5a5a5a]">{previewDesc}</p>
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
            <span>
              {loading
                ? '配布中...'
                : (targetRanks.length || targetGenders.length || typeof ageMin === 'number' || typeof ageMax === 'number')
                  ? '対象会員に配布する'
                  : '全会員に配布する'}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};
