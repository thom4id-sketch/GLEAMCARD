import { useState, useEffect, useCallback } from 'react';
import { format, parseISO } from 'date-fns';
import { Search, XCircle, FileText } from 'lucide-react';
import { api } from '../../lib/api';

interface PaymentHistoryItem {
  id: number;
  memberNo: string;
  memberName: string;
  storeName: string;
  amount: number;
  pointsUsed: number;
  pointsToGrant: number;
  couponUsed: boolean;
  purchasedAt: string;
  status: string;
}

interface PageResponse {
  content: PaymentHistoryItem[];
  totalPages: number;
  totalElements: number;
}

export const AdminHistory = () => {
  const [items, setItems] = useState<PaymentHistoryItem[]>([]);
  const [filterName, setFilterName] = useState('');
  const [exactMatch, setExactMatch] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cancelingId, setCancelingId] = useState<number | null>(null);

  const load = useCallback(async (name?: string, exact?: boolean) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ size: '50' });
      if (name) { params.set('name', name); params.set('exact', String(exact ?? false)); }
      const res = await api.get<PageResponse>(`/api/admin/payments?${params}`);
      setItems(res.content);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSearch = () => load(filterName.trim() || undefined, exactMatch);

  const handleCancel = async (id: number) => {
    if (!window.confirm('この決済を取り消しますか？\n（ポイントやクーポンの利用状況も元に戻ります）')) return;
    setCancelingId(id);
    try {
      await api.put(`/api/admin/payments/${id}/cancel`);
      setItems(prev => prev.map(p => p.id === id ? { ...p, status: 'CANCELED' } : p));
    } catch (e) {
      alert(e instanceof Error ? e.message : '取消に失敗しました');
    } finally {
      setCancelingId(null);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#f8f9fa] font-sans">
      <div className="p-5 bg-white border-b border-[#d0d0d0] shadow-sm z-10 sticky top-0">
        <h2 className="text-sm font-bold text-[#5a5a5a] mb-4 flex items-center tracking-widest">
          <FileText className="w-5 h-5 mr-2 stroke-1" />
          決済履歴管理
        </h2>
        <div className="flex space-x-0 border border-[#d0d0d0] bg-[#f8f9fa] p-1 mb-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="名前で絞り込み..."
              value={filterName}
              onChange={e => setFilterName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className="w-full bg-transparent pl-10 pr-3 py-3 text-sm focus:outline-none text-[#4a4a4a]"
            />
            <Search className="w-4 h-4 text-[#a0a0a0] absolute left-3 top-1/2 -translate-y-1/2 stroke-1" />
          </div>
          <button
            onClick={handleSearch}
            className="bg-[#5a5a5a] text-white px-5 py-3 text-xs tracking-widest font-bold hover:bg-[#4a4a4a] transition"
          >
            検索
          </button>
        </div>
        <div className="flex border border-[#d0d0d0] overflow-hidden w-fit">
          <button
            type="button"
            onClick={() => setExactMatch(false)}
            className={`px-4 py-2 text-[10px] font-bold tracking-widest transition-colors ${!exactMatch ? 'bg-[#5a5a5a] text-white' : 'bg-white text-[#7a7a7a] hover:bg-[#f0f0f0]'}`}
          >
            部分一致
          </button>
          <button
            type="button"
            onClick={() => setExactMatch(true)}
            className={`px-4 py-2 text-[10px] font-bold tracking-widest transition-colors border-l border-[#d0d0d0] ${exactMatch ? 'bg-[#5a5a5a] text-white' : 'bg-white text-[#7a7a7a] hover:bg-[#f0f0f0]'}`}
          >
            完全一致
          </button>
        </div>
      </div>

      <div className="p-5 flex-1 overflow-y-auto space-y-4">
        {loading && (
          <p className="text-center text-xs text-[#a0a0a0] tracking-widest animate-pulse py-10">読み込み中...</p>
        )}

        {!loading && items.length === 0 && (
          <div className="text-center py-10 text-[#a0a0a0] text-xs tracking-widest font-bold border border-dashed border-[#d0d0d0] bg-white">
            該当する履歴がありません
          </div>
        )}

        {items.map(item => (
          <div key={item.id} className="bg-white p-5 shadow-sm border border-[#d0d0d0]">
            <div className="flex justify-between items-start mb-4 border-b border-[#d0d0d0] pb-4">
              <div>
                <div className="text-xs text-[#7a7a7a] mb-1 font-mono tracking-widest">
                  {format(parseISO(item.purchasedAt), 'yyyy/MM/dd HH:mm')}
                </div>
                <div className="text-base font-bold text-[#4a4a4a] tracking-wide font-serif">
                  {item.memberName}
                </div>
                <div className="text-[11px] text-[#7a7a7a] tracking-widest font-mono mt-0.5">
                  No. {item.memberNo}
                </div>
                <div className="text-[11px] text-[#7a7a7a] tracking-widest mt-1">
                  {item.storeName}
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold font-mono text-[#5a5a5a] tracking-wider">
                  ¥{item.amount.toLocaleString()}
                </div>
                <div className={`text-[10px] px-2 py-1 tracking-widest inline-block mt-2 border ${item.status === 'COMPLETED' ? 'border-[#5a5a5a] text-[#5a5a5a] font-bold' : 'border-[#d0d0d0] text-[#a0a0a0] line-through bg-[#f8f9fa]'}`}>
                  {item.status === 'COMPLETED' ? '完了' : 'キャンセル済'}
                </div>
              </div>
            </div>

            <div className="bg-[#f8f9fa] border border-[#d0d0d0] p-3 text-xs text-[#7a7a7a] space-y-2 mb-4 font-mono tracking-wider">
              <div className="flex justify-between">
                <span>利用ポイント:</span>
                <span>{item.pointsUsed} pt</span>
              </div>
              <div className="flex justify-between">
                <span>付与予定ポイント <span className="text-[10px] text-[#a0a0a0]">(3日後)</span>:</span>
                <span>+{item.pointsToGrant} pt</span>
              </div>
              <div className="flex justify-between">
                <span>クーポン利用:</span>
                <span>{item.couponUsed ? 'あり' : 'なし'}</span>
              </div>
            </div>

            {item.status === 'COMPLETED' && (
              <button
                onClick={() => handleCancel(item.id)}
                disabled={cancelingId === item.id}
                className="w-full py-3 border border-[#d0d0d0] text-[#7a7a7a] text-xs font-bold tracking-widest flex items-center justify-center hover:bg-[#f8f9fa] transition disabled:opacity-50"
              >
                <XCircle className="w-4 h-4 mr-2 stroke-1" />
                {cancelingId === item.id ? '処理中...' : '決済を取り消す'}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
