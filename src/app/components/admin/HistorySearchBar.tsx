import { Search } from 'lucide-react';
import { getRankStyle } from './RankBadge';

/** 絞り込みに使える会員ランク（表示順） */
export const FILTER_RANKS = ['REGULAR', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND'] as const;
export type FilterRank = typeof FILTER_RANKS[number];

/** URL クエリ（カンマ区切り）→ ランク配列。不正な値は除外 */
export const parseRanksParam = (value: string | null): FilterRank[] =>
  (value ?? '')
    .split(',')
    .filter((r): r is FilterRank => (FILTER_RANKS as readonly string[]).includes(r));

interface Props {
  value: string;
  onChange: (value: string) => void;
  exactMatch: boolean;
  onExactMatchChange: (exact: boolean) => void;
  ranks: FilterRank[];
  onRanksChange: (ranks: FilterRank[]) => void;
  onSearch: () => void;
  placeholder?: string;
}

/** 決済履歴管理（会員一覧・会員別履歴）で共通利用する検索バー（名前 + ランク絞り込み） */
export const HistorySearchBar = ({
  value,
  onChange,
  exactMatch,
  onExactMatchChange,
  ranks,
  onRanksChange,
  onSearch,
  placeholder = '名前で絞り込み...',
}: Props) => {
  const toggleRank = (rank: FilterRank) => {
    onRanksChange(ranks.includes(rank) ? ranks.filter(r => r !== rank) : [...ranks, rank]);
  };

  return (
    <>
      <div className="flex space-x-0 border border-[#d0d0d0] bg-[#f8f9fa] p-1 mb-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={e => onChange(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && onSearch()}
            className="w-full bg-transparent pl-10 pr-3 py-3 text-sm focus:outline-none text-[#4a4a4a]"
          />
          <Search className="w-4 h-4 text-[#a0a0a0] absolute left-3 top-1/2 -translate-y-1/2 stroke-1" />
        </div>
        <button
          onClick={onSearch}
          className="bg-[#5a5a5a] text-white px-5 py-3 text-xs tracking-widest font-bold hover:bg-[#4a4a4a] transition"
        >
          検索
        </button>
      </div>

      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex border border-[#d0d0d0] overflow-hidden w-fit">
          <button
            type="button"
            onClick={() => onExactMatchChange(false)}
            className={`px-4 py-2 text-[10px] font-bold tracking-widest transition-colors ${!exactMatch ? 'bg-[#5a5a5a] text-white' : 'bg-white text-[#7a7a7a] hover:bg-[#f0f0f0]'}`}
          >
            部分一致
          </button>
          <button
            type="button"
            onClick={() => onExactMatchChange(true)}
            className={`px-4 py-2 text-[10px] font-bold tracking-widest transition-colors border-l border-[#d0d0d0] ${exactMatch ? 'bg-[#5a5a5a] text-white' : 'bg-white text-[#7a7a7a] hover:bg-[#f0f0f0]'}`}
          >
            完全一致
          </button>
        </div>
      </div>

      {/* ランク絞り込み（複数選択可。未選択 = 全ランク） */}
      <div className="mt-2 flex items-center gap-1.5 flex-wrap">
        <span className="text-[10px] text-[#a0a0a0] tracking-widest mr-1">ランク</span>
        <button
          type="button"
          onClick={() => onRanksChange([])}
          className={`px-3 py-1.5 text-[10px] font-bold tracking-widest border transition-colors ${ranks.length === 0 ? 'bg-[#5a5a5a] text-white border-[#5a5a5a]' : 'bg-white text-[#7a7a7a] border-[#d0d0d0] hover:bg-[#f0f0f0]'}`}
        >
          すべて
        </button>
        {FILTER_RANKS.map(rank => {
          const selected = ranks.includes(rank);
          const style = getRankStyle(rank);
          return (
            <button
              key={rank}
              type="button"
              onClick={() => toggleRank(rank)}
              aria-pressed={selected}
              className={`px-3 py-1.5 text-[10px] font-bold tracking-widest border font-serif transition-opacity ${style.badge} ${selected ? 'opacity-100 ring-2 ring-offset-1 ring-[#5a5a5a]' : 'opacity-40 hover:opacity-70'}`}
            >
              {style.label}
            </button>
          );
        })}
      </div>
    </>
  );
};
