import { useEffect, useRef } from 'react';

interface Props {
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
  /** 読み込み済み件数 / 総件数（表示用） */
  loaded: number;
  total: number;
  unit: string;
}

/**
 * 一覧末尾に置く自動読み込みセンチネル。
 * 画面内に入ると次ページを取得し、手動用の「さらに読み込む」ボタンも併せて表示する。
 * 全件取得済みのときは件数のみ表示する。
 */
export const LoadMoreSentinel = ({ hasMore, loading, onLoadMore, loaded, total, unit }: Props) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !hasMore || loading) return;
    const observer = new IntersectionObserver(
      entries => {
        if (entries.some(e => e.isIntersecting)) onLoadMore();
      },
      { rootMargin: '200px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loading, onLoadMore]);

  return (
    <div ref={ref} className="space-y-2 pt-1">
      {hasMore && (
        <button
          type="button"
          onClick={onLoadMore}
          disabled={loading}
          className="w-full py-3 border border-[#d0d0d0] bg-white text-[#7a7a7a] text-xs font-bold tracking-widest hover:bg-[#f8f9fa] transition disabled:opacity-50"
        >
          {loading ? '読み込み中...' : 'さらに読み込む'}
        </button>
      )}
      <p className="text-[10px] text-[#a0a0a0] tracking-widest font-mono text-center">
        {loaded} / {total} {unit}{!hasMore && total > 0 ? '（すべて表示）' : ''}
      </p>
    </div>
  );
};
