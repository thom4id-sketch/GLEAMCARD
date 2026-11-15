import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router';
import { format, parseISO } from 'date-fns';
import { ArrowLeft, XCircle, FileText, Gem } from 'lucide-react';
import { api } from '../../lib/api';
import { pageMeta, type PageResponse as PageResponseBase } from '../../lib/page';
import { HistorySearchBar, type FilterRank } from '../../components/admin/HistorySearchBar';
import { RankBadge } from '../../components/admin/RankBadge';
import { LoadMoreSentinel } from '../../components/admin/LoadMoreSentinel';
import type { AdminMemberSummary } from './AdminHistory';

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

type PageResponse = PageResponseBase<PaymentHistoryItem>;

/** 会員の紹介状況（紹介人数と、うち紹介クーポンで購入に至った人数） */
interface ReferralSummary {
  referralCount: number;
  purchaseCount: number;
}

/** 決済履歴管理：会員ごとの決済履歴（取り消し操作もここで行う） */
export const AdminMemberHistory = () => {
  const navigate = useNavigate();
  const { memberId } = useParams<{ memberId: string }>();

  const [member, setMember] = useState<AdminMemberSummary | null>(null);
  const [referrals, setReferrals] = useState<ReferralSummary | null>(null);
  const [items, setItems] = useState<PaymentHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [error, setError] = useState('');
  const [cancelingId, setCancelingId] = useState<number | null>(null);
  const [diamondUpdating, setDiamondUpdating] = useState(false);

  // 検索バー（会員一覧と同じ機能）：検索すると会員一覧へ戻って絞り込み結果を表示する
  const [filterName, setFilterName] = useState('');
  const [exactMatch, setExactMatch] = useState(false);
  const [ranks, setRanks] = useState<FilterRank[]>([]);

  const PAGE_SIZE = 50;

  const fetchPage = useCallback((id: string, pageNo: number) =>
    api.get<PageResponse>(`/api/admin/payments?memberId=${id}&size=${PAGE_SIZE}&page=${pageNo}`), []);

  const load = useCallback(async (id: string) => {
    setLoading(true);
    setError('');
    // 紹介状況は補助情報なので、取得に失敗しても画面全体はエラーにしない
    setReferrals(null);
    api.get<ReferralSummary>(`/api/admin/members/id/${id}/referrals`)
      .then(setReferrals)
      .catch(() => setReferrals(null));
    try {
      const [m, res] = await Promise.all([
        api.get<AdminMemberSummary>(`/api/admin/members/id/${id}`),
        fetchPage(id, 0),
      ]);
      setMember(m);
      setItems(res.content);
      setPage(0);
      setTotalPages(pageMeta(res).totalPages);
      setTotalElements(pageMeta(res).totalElements);
    } catch (e) {
      setError(e instanceof Error ? e.message : '読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  }, [fetchPage]);

  const loadMore = useCallback(async () => {
    if (!memberId || loadingMore) return;
    const next = page + 1;
    setLoadingMore(true);
    try {
      const res = await fetchPage(memberId, next);
      setItems(prev => [...prev, ...res.content]);
      setPage(next);
      setTotalPages(pageMeta(res).totalPages);
      setTotalElements(pageMeta(res).totalElements);
    } catch (e) {
      alert(e instanceof Error ? e.message : '読み込みに失敗しました');
    } finally {
      setLoadingMore(false);
    }
  }, [memberId, loadingMore, page, fetchPage]);

  const hasMore = page + 1 < totalPages;

  useEffect(() => {
    if (memberId) load(memberId);
  }, [memberId, load]);

  const handleSearch = () => {
    const name = filterName.trim();
    const params = new URLSearchParams();
    if (name) { params.set('name', name); params.set('exact', String(exactMatch)); }
    if (ranks.length > 0) params.set('ranks', ranks.join(','));
    const query = params.toString();
    navigate(`/admin/history${query ? `?${query}` : ''}`);
  };

  const handleToggleDiamond = async () => {
    if (!member || !memberId || diamondUpdating) return;
    const isDiamond = member.rank === 'DIAMOND';
    const confirmMsg = isDiamond
      ? `${member.name} 様のダイヤモンド会員を解除しますか？\n（3年間の購入実績に応じた通常ランクに戻ります）`
      : `${member.name} 様をダイヤモンド会員にしますか？\n（ログイン直後にダイヤモンド専用ページが表示されます。ポイント等の扱いはプラチナと同じです）`;
    if (!window.confirm(confirmMsg)) return;

    setDiamondUpdating(true);
    try {
      const updated = isDiamond
        ? await api.delete<AdminMemberSummary>(`/api/admin/members/id/${memberId}/diamond`)
        : await api.put<AdminMemberSummary>(`/api/admin/members/id/${memberId}/diamond`);
      setMember(updated);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'ランクの変更に失敗しました');
    } finally {
      setDiamondUpdating(false);
    }
  };

  const handleCancel = async (id: number) => {
    if (!window.confirm('この決済を取り消しますか？\n（ポイントやクーポンの利用状況も元に戻ります）')) return;
    setCancelingId(id);
    try {
      await api.put(`/api/admin/payments/${id}/cancel`);
      setItems(prev => prev.map(p => p.id === id ? { ...p, status: 'CANCELED' } : p));
      // 取り消し後はヘッダーの購入回数・累計額も更新する
      if (memberId) {
        api.get<AdminMemberSummary>(`/api/admin/members/id/${memberId}`).then(setMember).catch(() => {});
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : '取消に失敗しました');
    } finally {
      setCancelingId(null);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#f8f9fa] font-sans">
      <div className="p-5 bg-white border-b border-[#d0d0d0] shadow-sm z-10 sticky top-0">
        <div className="flex items-center mb-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mr-3 p-1 -ml-1 text-[#7a7a7a] hover:text-[#4a4a4a] transition"
            aria-label="会員一覧へ戻る"
          >
            <ArrowLeft className="w-5 h-5 stroke-1" />
          </button>
          <h2 className="text-sm font-bold text-[#5a5a5a] flex items-center tracking-widest">
            <FileText className="w-5 h-5 mr-2 stroke-1" />
            決済履歴管理
          </h2>
        </div>

        <HistorySearchBar
          value={filterName}
          onChange={setFilterName}
          exactMatch={exactMatch}
          onExactMatchChange={setExactMatch}
          ranks={ranks}
          onRanksChange={setRanks}
          onSearch={handleSearch}
          placeholder="他の会員を名前で検索..."
        />
      </div>

      <div className="p-5 flex-1 overflow-y-auto space-y-4">
        {member && (
          <div className="bg-[#5a5a5a] text-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <div className="text-lg font-bold tracking-wide font-serif">{member.name}</div>
              <RankBadge rank={member.rank} size="md" />
            </div>
            <div className="text-[11px] text-white/70 tracking-widest font-mono mt-0.5">
              No. {member.memberNo}
            </div>
            <div className="mt-4 pt-3 border-t border-white/30 grid grid-cols-3 gap-2 text-[10px] tracking-wider font-mono">
              <div>
                <div className="text-white/60 mb-0.5">購入回数</div>
                <div className="font-bold">{member.purchaseCount} 回</div>
              </div>
              <div>
                <div className="text-white/60 mb-0.5">累計金額</div>
                <div className="font-bold">¥{member.totalAmount.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-white/60 mb-0.5">保有ポイント</div>
                <div className="font-bold">{member.points.toLocaleString()} pt</div>
              </div>
            </div>

            {/* 紹介状況：ダイヤモンド会員、または紹介実績のある会員に表示 */}
            {referrals && (member.rank === 'DIAMOND' || referrals.referralCount > 0) && (
              <div className="mt-3 pt-3 border-t border-white/30 grid grid-cols-3 gap-2 text-[10px] tracking-wider font-mono">
                <div>
                  <div className="text-white/60 mb-0.5">紹介人数</div>
                  <div className="font-bold">{referrals.referralCount} 名</div>
                </div>
                <div>
                  <div className="text-white/60 mb-0.5">うち購入人数</div>
                  <div className="font-bold">{referrals.purchaseCount} 名</div>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleToggleDiamond}
              disabled={diamondUpdating}
              className={`mt-4 w-full py-3 text-xs font-bold tracking-widest flex items-center justify-center border transition disabled:opacity-50 ${
                member.rank === 'DIAMOND'
                  ? 'bg-transparent border-white/60 text-white hover:bg-white/10'
                  : 'bg-[#111111] border-[#111111] text-white hover:bg-black'
              }`}
            >
              <Gem className="w-4 h-4 mr-2" strokeWidth={1.5} />
              {diamondUpdating
                ? '処理中...'
                : member.rank === 'DIAMOND' ? 'ダイヤモンド会員解除' : 'ダイヤモンド会員にする'}
            </button>
          </div>
        )}

        {loading && (
          <p className="text-center text-xs text-[#a0a0a0] tracking-widest animate-pulse py-10">読み込み中...</p>
        )}

        {!loading && error && (
          <div className="text-center py-10 text-[#a0a0a0] text-xs tracking-widest font-bold border border-dashed border-[#d0d0d0] bg-white">
            {error}
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="text-center py-10 text-[#a0a0a0] text-xs tracking-widest font-bold border border-dashed border-[#d0d0d0] bg-white">
            この会員の決済履歴はありません
          </div>
        )}


        {!loading && items.map(item => (
          <div key={item.id} className="bg-white p-5 shadow-sm border border-[#d0d0d0]">
            <div className="flex justify-between items-start mb-4 border-b border-[#d0d0d0] pb-4">
              <div>
                <div className="text-xs text-[#7a7a7a] mb-1 font-mono tracking-widest">
                  {format(parseISO(item.purchasedAt), 'yyyy/MM/dd HH:mm')}
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

        {!loading && items.length > 0 && (
          <LoadMoreSentinel
            hasMore={hasMore}
            loading={loadingMore}
            onLoadMore={loadMore}
            loaded={items.length}
            total={totalElements}
            unit="件"
          />
        )}
      </div>
    </div>
  );
};
