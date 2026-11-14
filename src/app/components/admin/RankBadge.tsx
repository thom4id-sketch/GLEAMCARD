import { Crown, Gem } from 'lucide-react';

/**
 * 会員ランクの表示設定。配色は会員証画面（UserCard）と揃えている。
 *  - badge : 塗りつぶしバッジ用クラス
 *  - accent: カード左ボーダー等のアクセント色クラス
 *  - label : 表示名
 *  - crowns: 王冠アイコンの数（ランクが高いほど多い）
 */
const RANK_STYLES: Record<string, { badge: string; accent: string; label: string; crowns: number }> = {
  DIAMOND: {
    badge: 'bg-[#111111] text-white border-[#111111]',
    accent: 'border-l-[#111111]',
    label: 'DIAMOND',
    crowns: -1, // 王冠ではなくダイヤアイコンを表示
  },
  PLATINUM: {
    badge: 'bg-gradient-to-br from-[#f4f5f7] to-[#cdd1d8] text-[#2c3036] border-[#a0a0a0]',
    accent: 'border-l-[#b8bcc4]',
    label: 'PLATINUM',
    crowns: 3,
  },
  GOLD: {
    badge: 'bg-[#b89b5e] text-white border-[#b89b5e]',
    accent: 'border-l-[#b89b5e]',
    label: 'GOLD',
    crowns: 2,
  },
  SILVER: {
    badge: 'bg-gradient-to-br from-[#7a7a7a] to-[#b0b0b0] text-white border-[#9a9a9a]',
    accent: 'border-l-[#9a9a9a]',
    label: 'SILVER',
    crowns: 1,
  },
  REGULAR: {
    badge: 'bg-[#4a4a4a] text-white border-[#4a4a4a]',
    accent: 'border-l-[#4a4a4a]',
    label: 'REGULAR',
    crowns: 0,
  },
};

export const getRankStyle = (rank: string) => RANK_STYLES[rank] ?? RANK_STYLES.REGULAR;

interface Props {
  rank: string;
  size?: 'sm' | 'md';
  className?: string;
}

/** 会員ランクバッジ（ランク色で塗りつぶし、王冠アイコンで高ランクを強調） */
export const RankBadge = ({ rank, size = 'sm', className = '' }: Props) => {
  const style = getRankStyle(rank);
  const sizeClass = size === 'md'
    ? 'px-3 py-1 text-[11px]'
    : 'px-2 py-0.5 text-[10px]';
  return (
    <span
      className={`inline-flex items-center gap-1 border font-bold tracking-widest font-serif shrink-0 ${sizeClass} ${style.badge} ${className}`}
    >
      {style.crowns < 0 && (
        <Gem className={size === 'md' ? 'w-3 h-3' : 'w-2.5 h-2.5'} strokeWidth={2} />
      )}
      {style.crowns > 0 && (
        <span className="inline-flex -space-x-0.5">
          {Array.from({ length: style.crowns }).map((_, i) => (
            <Crown key={i} className={size === 'md' ? 'w-3 h-3' : 'w-2.5 h-2.5'} strokeWidth={2} />
          ))}
        </span>
      )}
      {style.label}
    </span>
  );
};
