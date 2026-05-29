import { Link } from 'react-router';
import { ArrowLeft, Award, Info, Ticket } from 'lucide-react';

export const PointInfo = () => {
  return (
    <div className="bg-[#f8f9fa] min-h-full pb-10 font-sans">
      <div className="bg-white border-b border-[#d0d0d0] px-4 py-4 flex items-center sticky top-0 z-20 shadow-sm">
        <Link to="/card" className="text-[#5a5a5a] hover:text-[#333333] flex items-center p-1 -ml-1 transition-colors">
          <ArrowLeft size={20} strokeWidth={1} />
          <span className="sr-only">BACK</span>
        </Link>
        <h2 className="text-xs font-bold text-[#5a5a5a] ml-3 tracking-widest uppercase">Point Information</h2>
      </div>

      <div className="p-5 space-y-8 mt-2">
        {/* ポイント概要 */}
        <section className="bg-white border-l-2 border-[#a0a0a0] pl-5 p-4 shadow-sm">
          <div className="flex items-center space-x-3 mb-5">
            <Info className="text-[#5a5a5a]" size={18} strokeWidth={1.5} />
            <h3 className="text-[11px] font-bold text-[#5a5a5a] tracking-widest uppercase">Point Rules</h3>
          </div>
          <ul className="text-xs text-[#7a7a7a] space-y-4 list-disc pl-4 leading-relaxed">
            <li>お買い上げ金額と現在の会員ランクの付与率に応じてポイントが貯まります。</li>
            <li>商品ご購入時に、店舗スタッフがポイントの付与処理を行います。</li>
            <li><strong className="text-[#4a4a4a]">ポイントが付与されるのはご購入の3日後（72時間後）</strong>となります。</li>
            <li>貯まったポイントは、次回以降のお買い物で「1ポイント＝1円」としてご利用いただけます。</li>
            <li>ポイントの有効期限は、最終お買い上げ日から3年間となります。</li>
            <li>ショッピングローンをご利用の際は、ポイントの付与はございません。</li>
          </ul>
        </section>

        {/* ランクシステム */}
        <section className="bg-white border-l-2 border-[#a0a0a0] pl-5 p-4 shadow-sm">
          <div className="flex items-center space-x-3 mb-5">
            <Award className="text-[#5a5a5a]" size={18} strokeWidth={1.5} />
            <h3 className="text-[11px] font-bold text-[#5a5a5a] tracking-widest uppercase">Membership Rank</h3>
          </div>
          <div className="text-xs text-[#7a7a7a] mb-6 space-y-4 leading-relaxed">
            <p>
              直近3年間のお買い上げ累計金額（税抜き）に応じてランクアップし、ポイント付与率が上昇します。
            </p>
            <ul className="list-disc pl-4 space-y-3">
              <li>集計期間は<strong className="text-[#4a4a4a]">当年を含む過去3年間（1月1日〜12月31日）</strong>が対象となります。</li>
              <li>購入額の条件を満たした場合、<strong className="text-[#4a4a4a]">即時ランクアップ</strong>となり、新しいランクの付与率は<strong className="text-[#4a4a4a]">次の決済から有効</strong>となります。</li>
              <li>
                <div className="bg-[#f8f9fa] p-4 border border-[#d0d0d0] mt-3 mb-2 font-mono text-[10px] leading-relaxed text-[#5a5a5a]">
                  <strong className="text-[#4a4a4a]">【EX】</strong> 2026年の集計対象期間<br/><br/>
                  　2024年1月1日 〜 2026年12月31日<br/><br/>
                  2027年になると対象期間が切り替わります。<br/>
                  　2025年1月1日 〜 2027年12月31日
                </div>
              </li>
            </ul>
          </div>

          <p className="text-[10px] text-[#a0a0a0] mb-4 tracking-widest">※購入額は税抜き金額が基準です</p>
          <div className="space-y-4">
            {/* Regular */}
            <div className="border border-[#c0c0c0] p-4 flex justify-between items-center bg-[#4a4a4a] text-white">
              <div>
                <span className="font-serif tracking-widest text-sm uppercase">Regular</span>
                <p className="text-[9px] mt-1 font-mono tracking-widest text-[#d0d0d0]">BASIC RANK</p>
              </div>
              <span className="text-[10px] border border-white/40 px-3 py-1 font-mono tracking-widest">5%</span>
            </div>

            {/* Silver */}
            <div className="border border-[#a0a0a0] p-4 flex justify-between items-center bg-gradient-to-br from-[#7a7a7a] to-[#b0b0b0] text-white">
              <div>
                <span className="font-serif tracking-widest text-sm uppercase">Silver</span>
                <p className="text-[9px] mt-1 font-mono tracking-widest text-[#e8e8e8]">OVER ¥300,000</p>
              </div>
              <span className="text-[10px] border border-white/50 px-3 py-1 font-mono tracking-widest">8%</span>
            </div>

            {/* Gold */}
            <div className="border border-[#c2a76f] p-4 flex justify-between items-center bg-[#b89b5e] text-white">
              <div>
                <span className="font-serif tracking-widest text-sm uppercase">Gold</span>
                <p className="text-[9px] mt-1 font-mono tracking-widest text-[#f0e6d2]">OVER ¥1,000,000</p>
              </div>
              <span className="text-[10px] border border-white/40 px-3 py-1 font-mono tracking-widest">10%</span>
            </div>

            {/* Platinum */}
            <div className="border border-[#c0c4cc] p-4 flex justify-between items-center bg-gradient-to-br from-[#f4f5f7] to-[#cdd1d8] text-[#2c3036]">
              <div>
                <span className="font-serif tracking-widest text-sm uppercase font-bold">Platinum</span>
                <p className="text-[9px] mt-1 font-mono tracking-widest text-[#5a5f68]">COMING SOON</p>
              </div>
              <span className="text-[10px] border border-[#a0a6b2] px-3 py-1 font-mono tracking-widest font-bold">10%</span>
            </div>
          </div>
        </section>

        {/* クーポンについて */}
        <section className="bg-white border-l-2 border-[#a0a0a0] pl-5 p-4 shadow-sm">
          <div className="flex items-center space-x-3 mb-5">
            <Ticket className="text-[#5a5a5a]" size={18} strokeWidth={1.5} />
            <h3 className="text-[11px] font-bold text-[#5a5a5a] tracking-widest uppercase">Coupons</h3>
          </div>
          <ul className="text-xs text-[#7a7a7a] space-y-4 list-disc pl-4 leading-relaxed">
            <li>ご利用いただいたクーポンは、利用処理が行われた段階で「利用済み」状態となります。</li>
            <li>「お友達紹介クーポン」が利用された場合、該当クーポンに付与されている会員番号の会員様（紹介元）に、<strong className="text-[#4a4a4a]">ご利用の7日後</strong>にポイントが付与されます。</li>
          </ul>
        </section>
      </div>
    </div>
  );
};