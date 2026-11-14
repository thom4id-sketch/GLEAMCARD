import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { format, parseISO } from 'date-fns';
import { FileText, ChevronRight } from 'lucide-react';
import { api } from '../../lib/api';
import { HistorySearchBar } from '../../components/admin/HistorySearchBar';

export interface AdminMemberSummary {
  id: number;
  memberNo: string;
  name: string;
  nameKana: string;
  rank: string;
  points: number;
  purchaseCount: number;
  totalAmount: number;
  lastPurchaseAt: string | null;
}

interface PageResponse {
  content: AdminMemberSummary[];
  totalPages: number;
  totalElements: number;
}

export const rankLabel = (rank: string) => {
  if (rank === 'PLATINUM') return 'Platinum';
  if (rank === 'GOLD') return 'Gold';
  if (rank === 'SILVER') return 'Silver';
  return 'Regular';
};

/** 決済履歴管理：会員一覧（ここから会員ごとの履歴へ遷移） */
export const AdminHistory = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // 検索条件は URL クエリで保持（会員別履歴から戻った時に復元される）
  const queryName = searchParams.get('name') ?? '';
  const queryExact = searchParams.get('exact') === 'true';

  const [members, setMembers] = useState<AdminMemberSummary[]>([]);
  const [filterName, setFilterName] = useState(queryName);
  const [exactMatch, setExactMatch] = useState(queryExact);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (name: string, exact: boolean) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ size: '50' });
      if (name) { params.set('name', name); params.set('exact', String(exact)); }
      const res = await api.get<PageResponse>(`/api/admin/members?${params}`);
      setMembers(res.content);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setFilterName(queryName);
    setExactMatch(queryExact);
    load(queryName, queryExact);
  }, [queryName, queryExact, load]);

  const handleSearch = () => {
    const name = filterName.trim();
    const next = new URLSearchParams();
    if (name) { next.set('name', name); next.set('exact', String(exactMatch)); }
    setSearchParams(next);
  };

  return (
    <div className="h-full flex flex-col bg-[#f8f9fa] font-sans">
      <div className="p-5 bg-white border-b border-[#d0d0d0] shadow-sm z-10 sticky top-0">
        <h2 className="text-sm font-bold text-[#5a5a5a] mb-4 flex items-center tracking-widest">
          <FileText className="w-5 h-5 mr-2 stroke-1" />
          決済履歴管理
        </h2>
        <HistorySearchBar
          value={filterName}
          onChange={setFilterName}
          exactMatch={exactMatch}
          onExactMatchChange={setExactMatch}
          onSearch={handleSearch}
        />
      </div>

      <div className="p-5 flex-1 overflow-y-auto space-y-3">
        {loading && (
          <p className="text-center text-xs text-[#a0a0a0] tracking-widest animate-pulse py-10">読み込み中...</p>
        )}

        {!loading && members.length === 0 && (
          <div className="text-center py-10 text-[#a0a0a0] text-xs tracking-widest font-bold border border-dashed border-[#d0d0d0] bg-white">
            該当する会員がいません
          </div>
        )}

        {!loading && members.map(m => (
          <button
            key={m.id}
            type="button"
            onClick={() => navigate(`/admin/history/${m.id}`)}
            className="w-full text-left bg-white p-5 shadow-sm border border-[#d0d0d0] hover:bg-[#f8f9fa] transition flex items-center"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between mb-1">
                <div className="text-base font-bold text-[#4a4a4a] tracking-wide font-serif truncate">
                  {m.name}
                </div>
                <div className="text-[10px] px-2 py-0.5 border border-[#d0d0d0] text-[#7a7a7a] tracking-widest font-serif ml-2 shrink-0">
                  {rankLabel(m.rank)}
                </div>
              </div>
              <div className="text-[11px] text-[#7a7a7a] tracking-widest font-mono">
                No. {m.memberNo}
              </div>
              <div className="mt-3 pt-3 border-t border-[#d0d0d0] grid grid-cols-3 gap-2 text-[10px] text-[#7a7a7a] tracking-wider font-mono">
                <div>
                  <div className="text-[#a0a0a0] mb-0.5">購入回数</div>
                  <div className="text-[#5a5a5a] font-bold">{m.purchaseCount} 回</div>
                </div>
                <div>
                  <div className="text-[#a0a0a0] mb-0.5">累計金額</div>
                  <div className="text-[#5a5a5a] font-bold">¥{m.totalAmount.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-[#a0a0a0] mb-0.5">最終購入</div>
                  <div className="text-[#5a5a5a] font-bold">
                    {m.lastPurchaseAt ? format(parseISO(m.lastPurchaseAt), 'yy/MM/dd') : '—'}
                  </div>
                </div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[#a0a0a0] stroke-1 ml-3 shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
};
