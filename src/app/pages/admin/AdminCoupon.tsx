import { useState, useEffect, useCallback } from 'react';
import { Send, CheckCircle, Ticket, Trash2, AlertTriangle, Save, FolderOpen } from 'lucide-react';
import { addDays, format } from 'date-fns';
import { api } from '../../lib/api';

const DRAFT_STORAGE_KEY = 'gleam_coupon_drafts';

interface CouponDraft {
  id: string;
  savedAt: string;
  name: string;
  discountType: DiscountType;
  discountValue: number | '';
  hasExpiry: boolean;
  expiresAt: string;
  usageCondition: string;
  targetRanks: Rank[];
  targetGenders: Gender[];
  ageMin: number | '';
  ageMax: number | '';
  targetHasPurchase: boolean;
}

interface CouponGroup {
  name: string;
  discountDesc: string;
  usageCondition: string | null;
  expiresAt: string | null;
  totalCount: number;
  usedCount: number;
  createdAt: string | null;
}

type DiscountType = 'PERCENT' | 'AMOUNT';
type Rank = 'REGULAR' | 'SILVER' | 'GOLD' | 'PLATINUM';
type Gender = 'MALE' | 'FEMALE' | 'OTHER';

const ALL_RANKS: { value: Rank; label: string }[] = [
  { value: 'REGULAR', label: 'レギュラー' },
  { value: 'SILVER', label: 'シルバー' },
  { value: 'GOLD', label: 'ゴールド' },
  { value: 'PLATINUM', label: 'プラチナ' },
];
const ALL_GENDERS: { value: Gender; label: string }[] = [
  { value: 'MALE', label: '男性' },
  { value: 'FEMALE', label: '女性' },
  { value: 'OTHER', label: 'その他' },
];

export const AdminCoupon = () => {
  const [activeTab, setActiveTab] = useState<'distribute' | 'draft' | 'history'>('distribute');

  // ── 配布タブ ──
  const [name, setName] = useState('');
  const [hasExpiry, setHasExpiry] = useState(true);
  const [expiresAt, setExpiresAt] = useState(format(addDays(new Date(), 30), 'yyyy-MM-dd'));
  const [discountType, setDiscountType] = useState<DiscountType>('PERCENT');
  const [discountValue, setDiscountValue] = useState<number | ''>(10);
  const [usageCondition, setUsageCondition] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [distributedCount, setDistributedCount] = useState(0);

  // ターゲティング
  const [targetRanks, setTargetRanks] = useState<Rank[]>([]);
  const [targetGenders, setTargetGenders] = useState<Gender[]>([]);
  const [ageMin, setAgeMin] = useState<number | ''>('');
  const [ageMax, setAgeMax] = useState<number | ''>('');
  const [targetHasPurchase, setTargetHasPurchase] = useState(false);

  // ── 履歴タブ ──
  const [history, setHistory] = useState<CouponGroup[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [historyError, setHistoryError] = useState('');

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    setHistoryError('');
    try {
      const res = await api.get<CouponGroup[]>('/api/admin/coupons/history');
      setHistory(res);
    } catch (err) {
      setHistoryError(err instanceof Error ? err.message : '取得に失敗しました');
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'history') loadHistory();
  }, [activeTab, loadHistory]);

  const handleDelete = async (couponName: string) => {
    setDeleteLoading(true);
    try {
      await api.delete(`/api/admin/coupons/by-name/${encodeURIComponent(couponName)}`);
      setHistory(prev => prev.filter(g => g.name !== couponName));
    } catch (err) {
      setHistoryError(err instanceof Error ? err.message : '削除に失敗しました');
    } finally {
      setDeleteLoading(false);
      setDeleteTarget(null);
    }
  };

  // ── 下書きタブ ──
  const [drafts, setDrafts] = useState<CouponDraft[]>(() => {
    try { return JSON.parse(localStorage.getItem(DRAFT_STORAGE_KEY) ?? '[]'); } catch { return []; }
  });

  const saveDraft = () => {
    const existing = drafts.find(d => d.name === name);
    const draft: CouponDraft = {
      id: existing?.id ?? Date.now().toString(),
      savedAt: new Date().toISOString(),
      name, discountType, discountValue, hasExpiry, expiresAt,
      usageCondition, targetRanks, targetGenders, ageMin, ageMax, targetHasPurchase,
    };
    const next = existing
      ? drafts.map(d => d.id === existing.id ? draft : d)
      : [draft, ...drafts];
    setDrafts(next);
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(next));
  };

  const loadDraft = (draft: CouponDraft) => {
    setName(draft.name);
    setDiscountType(draft.discountType);
    setDiscountValue(draft.discountValue);
    setHasExpiry(draft.hasExpiry);
    setExpiresAt(draft.expiresAt);
    setUsageCondition(draft.usageCondition);
    setTargetRanks(draft.targetRanks);
    setTargetGenders(draft.targetGenders);
    setAgeMin(draft.ageMin);
    setAgeMax(draft.ageMax);
    setTargetHasPurchase(draft.targetHasPurchase);
    setActiveTab('distribute');
  };

  const deleteDraft = (id: string) => {
    const next = drafts.filter(d => d.id !== id);
    setDrafts(next);
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(next));
  };

  const toggleRank = (r: Rank) =>
    setTargetRanks(prev => prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r]);
  const toggleGender = (g: Gender) =>
    setTargetGenders(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);

  const previewDesc = typeof discountValue === 'number'
    ? discountType === 'PERCENT'
      ? `お会計から${discountValue}%OFF`
      : `お会計から${discountValue.toLocaleString()}円引き`
    : '—';

  const handleExpiresAtChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 8);
    let formatted = digits;
    if (digits.length > 6) {
      formatted = `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`;
    } else if (digits.length > 4) {
      formatted = `${digits.slice(0, 4)}-${digits.slice(4)}`;
    }
    setExpiresAt(formatted);
  };

  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || typeof discountValue !== 'number') return;
    if (hasExpiry && !expiresAt) return;
    setShowConfirm(true);
  };

  const handleConfirmDistribute = async () => {
    setShowConfirm(false);
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
        targetHasPurchase: targetHasPurchase || undefined,
        usageCondition: usageCondition.trim() || undefined,
      });

      setDistributedCount(res.distributed);
      setName('');
      setExpiresAt(format(addDays(new Date(), 30), 'yyyy-MM-dd'));
      setHasExpiry(true);
      setDiscountType('PERCENT');
      setDiscountValue(10);
      setUsageCondition('');
      setTargetRanks([]);
      setTargetGenders([]);
      setAgeMin('');
      setAgeMax('');
      setTargetHasPurchase(false);
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
    <div className="h-full flex flex-col overflow-hidden bg-[#f8f9fa] font-sans">
      {/* タブ */}
      <div className="flex bg-white border-b border-[#d0d0d0] flex-shrink-0">
        <button
          className={`flex-1 py-3 text-[10px] tracking-widest font-bold text-center border-b-2 transition-colors ${activeTab === 'distribute' ? 'border-[#5a5a5a] text-[#5a5a5a]' : 'border-transparent text-[#a0a0a0] hover:text-[#7a7a7a]'}`}
          onClick={() => setActiveTab('distribute')}
        >
          配布
        </button>
        <button
          className={`flex-1 py-3 text-[10px] tracking-widest font-bold text-center border-b-2 transition-colors relative ${activeTab === 'draft' ? 'border-[#5a5a5a] text-[#5a5a5a]' : 'border-transparent text-[#a0a0a0] hover:text-[#7a7a7a]'}`}
          onClick={() => setActiveTab('draft')}
        >
          下書き
          {drafts.length > 0 && (
            <span className="absolute top-2 right-3 w-4 h-4 bg-[#5a5a5a] text-white text-[9px] rounded-full flex items-center justify-center font-mono">
              {drafts.length}
            </span>
          )}
        </button>
        <button
          className={`flex-1 py-3 text-[10px] tracking-widest font-bold text-center border-b-2 transition-colors ${activeTab === 'history' ? 'border-[#5a5a5a] text-[#5a5a5a]' : 'border-transparent text-[#a0a0a0] hover:text-[#7a7a7a]'}`}
          onClick={() => setActiveTab('history')}
        >
          履歴
        </button>
      </div>

      {/* 下書きタブ */}
      {activeTab === 'draft' && (
        <div className="flex-1 overflow-y-auto p-5">
          {drafts.length === 0 ? (
            <div className="text-center py-16 text-[#a0a0a0] border border-dashed border-[#d0d0d0] bg-white">
              <Save className="mx-auto w-8 h-8 mb-4 opacity-50 stroke-1" />
              <p className="text-[10px] tracking-widest">保存された下書きはありません</p>
            </div>
          ) : (
            <div className="space-y-3">
              {drafts.map(draft => (
                <div key={draft.id} className="bg-white border border-[#d0d0d0] p-4 shadow-sm">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[#4a4a4a] tracking-wide mb-1 truncate">
                        {draft.name || '（名称未設定）'}
                      </p>
                      <p className="text-xs text-[#5a5a5a] font-serif mb-1">
                        {typeof draft.discountValue === 'number'
                          ? draft.discountType === 'PERCENT'
                            ? `${draft.discountValue}%OFF`
                            : `${draft.discountValue.toLocaleString()}円引き`
                          : '—'}
                      </p>
                      <p className="text-[9px] text-[#a0a0a0] font-mono tracking-widest">
                        {new Date(draft.savedAt).toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })} に保存
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => loadDraft(draft)}
                        className="flex items-center gap-1 px-3 py-2 bg-[#5a5a5a] text-white text-[10px] font-bold tracking-widest hover:bg-[#4a4a4a] transition"
                      >
                        <FolderOpen size={12} strokeWidth={1.5} />
                        読み込む
                      </button>
                      <button
                        onClick={() => deleteDraft(draft.id)}
                        className="p-2 text-[#a0a0a0] hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 履歴タブ */}
      {activeTab === 'history' && (
        <div className="flex-1 overflow-y-auto p-5">
          {historyError && (
            <div className="border border-red-200 bg-red-50 text-red-600 p-4 mb-4 text-xs tracking-wide">
              {historyError}
            </div>
          )}
          {historyLoading ? (
            <p className="text-center text-[10px] text-[#a0a0a0] tracking-widest animate-pulse py-16">読み込み中...</p>
          ) : history.length === 0 ? (
            <div className="text-center py-16 text-[#a0a0a0] border border-dashed border-[#d0d0d0] bg-white">
              <Ticket className="mx-auto w-8 h-8 mb-4 opacity-50 stroke-1" />
              <p className="text-[10px] tracking-widest">配布履歴はありません</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map(group => (
                <div key={group.name} className="bg-white border border-[#d0d0d0] p-4 shadow-sm">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[#4a4a4a] tracking-wide mb-1 truncate">{group.name}</p>
                      <p className="text-xs text-[#5a5a5a] font-serif mb-2">{group.discountDesc}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1">
                        <span className="text-[9px] text-[#a0a0a0] font-mono tracking-widest">
                          EXP: {group.expiresAt ? group.expiresAt.replace(/-/g, '/') : '無期限'}
                        </span>
                        {group.usageCondition && (
                          <span className="text-[9px] text-[#a0a0a0] font-mono tracking-widest">{group.usageCondition}</span>
                        )}
                      </div>
                      <div className="mt-2 flex items-center gap-3">
                        <span className="text-[10px] text-[#7a7a7a] tracking-widest">
                          配布 <strong className="text-[#4a4a4a]">{group.totalCount}</strong> 件
                        </span>
                        <span className="text-[10px] text-[#7a7a7a] tracking-widest">
                          使用済み <strong className="text-[#4a4a4a]">{group.usedCount}</strong> 件
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setDeleteTarget(group.name)}
                      className="flex-shrink-0 p-2 text-[#a0a0a0] hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 配布確認モーダル */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center">
          <div className="bg-[#f8f9fa] w-full max-w-sm pb-8 pt-6 px-5 shadow-lg">
            <p className="text-[11px] font-bold text-[#5a5a5a] tracking-widest mb-5 text-center uppercase">Confirm Distribution</p>

            {/* プレビュー */}
            <div className="bg-white border border-[#7a7a7a] flex overflow-hidden relative shadow-sm mb-5">
              <div className="absolute top-1/2 -left-2 w-4 h-4 bg-[#f8f9fa] border-r border-t border-[#7a7a7a] rotate-45 -translate-y-1/2 z-10"></div>
              <div className="absolute top-1/2 -right-2 w-4 h-4 bg-[#f8f9fa] border-l border-b border-[#7a7a7a] rotate-45 -translate-y-1/2 z-10"></div>
              <div className="bg-[#e2e2e2] text-[#5a5a5a] p-4 flex flex-col justify-center items-center w-16 flex-shrink-0">
                <Ticket className="w-5 h-5 mb-1 stroke-1" />
                <span className="text-[8px] font-bold tracking-widest -rotate-90 whitespace-nowrap mt-3 font-serif">TICKET</span>
              </div>
              <div className="p-4 flex-1 border-l border-dashed border-[#7a7a7a]">
                <h3 className="text-sm font-bold text-[#4a4a4a] mb-1 tracking-wide leading-tight">{name}</h3>
                <p className="text-base font-serif font-bold text-[#5a5a5a]">{previewDesc}</p>
                <p className="text-[9px] text-[#a0a0a0] font-mono tracking-widest mt-2">
                  EXP: {hasExpiry ? (expiresAt || '未設定') : '無期限'}
                </p>
                {usageCondition.trim() && (
                  <p className="text-[9px] text-[#a0a0a0] font-mono tracking-widest mt-1">{usageCondition.trim()}</p>
                )}
              </div>
            </div>

            <p className="text-xs text-center text-[#4a4a4a] tracking-widest mb-6">
              このクーポンを配布しますか？
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 border border-[#d0d0d0] bg-white py-3 text-[11px] font-bold tracking-widest text-[#7a7a7a] hover:bg-[#f0f0f0] transition"
              >
                いいえ
              </button>
              <button
                onClick={handleConfirmDistribute}
                className="flex-1 bg-[#5a5a5a] text-white py-3 text-[11px] font-bold tracking-widest hover:bg-[#4a4a4a] transition"
              >
                はい
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 削除確認モーダル */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-6">
          <div className="bg-white p-6 w-full max-w-xs shadow-lg">
            <div className="flex items-center space-x-2 mb-4">
              <AlertTriangle size={18} strokeWidth={1.5} className="text-[#5a5a5a]" />
              <p className="text-xs font-bold text-[#4a4a4a] tracking-widest">クーポンを削除</p>
            </div>
            <p className="text-xs text-[#7a7a7a] mb-2 leading-relaxed">
              <strong className="text-[#4a4a4a]">「{deleteTarget}」</strong> を一括削除します。
            </p>
            <p className="text-[10px] text-[#a0a0a0] tracking-widest mb-6">
              未使用・使用済み含め全件削除されます。この操作は取り消せません。
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleteLoading}
                className="flex-1 border border-[#d0d0d0] py-3 text-[10px] font-bold tracking-widest text-[#7a7a7a] hover:bg-[#f8f9fa] transition"
              >
                キャンセル
              </button>
              <button
                onClick={() => handleDelete(deleteTarget)}
                disabled={deleteLoading}
                className="flex-1 bg-[#5a5a5a] text-white py-3 text-[10px] font-bold tracking-widest hover:bg-[#4a4a4a] transition disabled:opacity-50"
              >
                {deleteLoading ? '削除中...' : '削除する'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 配布タブ */}
      {activeTab === 'distribute' && (
      <div className="flex-1 overflow-y-auto p-5">
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

        {/* 利用条件 */}
        <div>
          <label className="block text-[11px] font-bold text-[#7a7a7a] tracking-widest mb-2">
            利用条件 <span className="text-[#a0a0a0] font-normal">（任意・15文字以内）</span>
          </label>
          <input
            type="text"
            maxLength={15}
            value={usageCondition}
            onChange={e => setUsageCondition(e.target.value)}
            className="w-full border border-[#d0d0d0] bg-white px-3 py-3 text-sm focus:outline-none focus:border-[#5a5a5a] text-[#4a4a4a] transition-colors"
            placeholder="例: サングラスの購入時のみ利用可能"
          />
          <p className="text-right text-[10px] text-[#a0a0a0] mt-1 font-mono">{usageCondition.length}/15</p>
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
            placeholder="例: 20260602"
            required={hasExpiry}
            disabled={!hasExpiry}
            value={expiresAt}
            onChange={handleExpiresAtChange}
            className="w-full border border-[#d0d0d0] bg-white px-3 py-3 text-sm focus:outline-none focus:border-[#5a5a5a] text-[#4a4a4a] font-mono disabled:bg-[#f0f0f0] disabled:text-[#a0a0a0]"
          />
        </div>

        {/* ターゲティング */}
        <div>
          <label className="block text-[11px] font-bold text-[#7a7a7a] tracking-widest mb-3">
            配布対象 <span className="text-[#a0a0a0] font-normal">（未選択の場合は全員対象）</span>
          </label>

          {/* 購入経験 */}
          <p className="text-[10px] text-[#7a7a7a] tracking-widest mb-2">購入履歴</p>
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              type="button"
              onClick={() => setTargetHasPurchase(prev => !prev)}
              className={`px-3 py-2 text-[10px] font-bold tracking-widest border transition-colors ${
                targetHasPurchase
                  ? 'bg-[#5a5a5a] text-white border-[#5a5a5a]'
                  : 'bg-white text-[#7a7a7a] border-[#d0d0d0] hover:bg-[#f0f0f0]'
              }`}
            >
              購入経験者
            </button>
          </div>

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
              <h3 className="text-sm font-bold text-[#4a4a4a] mb-2 tracking-wide leading-tight">{name || 'クーポン名'}</h3>
              <p className="text-lg font-serif font-bold text-[#5a5a5a]">{previewDesc}</p>
              {hasExpiry ? (
                <p className="text-[9px] text-[#a0a0a0] font-mono tracking-widest mt-3">
                  EXP: {(() => { try { return expiresAt ? format(new Date(expiresAt), 'yyyy/MM/dd') : '未設定'; } catch { return '未設定'; } })()}
                </p>
              ) : (
                <p className="text-[9px] text-[#a0a0a0] font-mono tracking-widest mt-3">EXP: 無期限</p>
              )}
              {usageCondition.trim() && (
                <p className="text-[9px] text-[#a0a0a0] font-mono tracking-widest mt-1">
                  {usageCondition.trim()}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="pt-6 mt-auto space-y-3">
          <button
            type="button"
            onClick={saveDraft}
            className="w-full border border-[#d0d0d0] bg-white py-3 text-xs tracking-widest font-bold flex items-center justify-center space-x-2 text-[#7a7a7a] hover:bg-[#f0f0f0] transition"
          >
            <Save className="w-4 h-4 stroke-1" />
            <span>下書きを保存</span>
          </button>
          <button
            type="submit"
            disabled={loading || !isFormValid}
            className="w-full bg-[#5a5a5a] text-white py-4 text-xs tracking-widest font-bold flex items-center justify-center space-x-2 hover:bg-[#4a4a4a] transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4 stroke-1" />
            <span>
              {loading
                ? '配布中...'
                : (targetRanks.length || targetGenders.length || typeof ageMin === 'number' || typeof ageMax === 'number' || targetHasPurchase)
                  ? '対象会員に配布する'
                  : '全会員に配布する'}
            </span>
          </button>
        </div>
      </form>
      </div>
      )}
    </div>
  );
};
