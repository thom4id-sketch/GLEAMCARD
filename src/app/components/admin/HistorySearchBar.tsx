import { Search } from 'lucide-react';

interface Props {
  value: string;
  onChange: (value: string) => void;
  exactMatch: boolean;
  onExactMatchChange: (exact: boolean) => void;
  onSearch: () => void;
  placeholder?: string;
}

/** 決済履歴管理（会員一覧・会員別履歴）で共通利用する名前検索バー */
export const HistorySearchBar = ({
  value,
  onChange,
  exactMatch,
  onExactMatchChange,
  onSearch,
  placeholder = '名前で絞り込み...',
}: Props) => {
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
    </>
  );
};
