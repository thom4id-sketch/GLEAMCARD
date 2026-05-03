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
            <li>お買い上げ金額と現在の会員ランクの付与率に応じてポイントが貯��ります。</li>
            <li>商品ご購入時に、店舗スタッフがポイントの付与処理を行います。</li>
            <li><strong className="text-[#4a4a4a]">ポイントが付与されるのはご購入の3日後（72時間後）</strong>となります。</li>
            <li>貯まったポイントは、次回以降のお買い物で「1ポイント＝1円」としてご利用いただけます。</li>
            <li>ポイントの有効期限は、最終お買い上げ日から1年間となります。</li>
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
              年間（1月1日〜12月31日）のお買い上げ金額に応じてランクアップし、ポイント付与率が上昇します。
            </p>
            <ul className="list-disc pl-4 space-y-3">
              <li>年間購入額の条件を満たした場合、<strong className="text-[#4a4a4a]">即時ランクアップ</strong>となり、新しいランクの付与率は<strong className="text-[#4a4a4a]">次の決済から有効</strong>となります。</li>
              <li>獲得した会員ランクは、<strong className="text-[#4a4a4a]">翌年の12月31日まで有効</strong>です。</li>
              <li>
                <div className="bg-[#f8f9fa] p-4 border border-[#d0d0d0] mt-3 mb-2 font-mono text-[10px] leading-relaxed text-[#5a5a5a]">
                  <strong className="text-[#4a4a4a]">【EX】</strong> 顧客A様が 2024年3月5日に「GOLD」にランクアップした場合<br/><br/>
                  ・2025年12月31日までGOLDが有効となり、2026年1月1日にランクリセットが行われます。<br/>
                  ・2025年内のランクポイントは2025年内の購入情報で貯まり、この結果に応じて2026年の会員ランクが決定します。
                </div>
              </li>
              <li>尚、年度内の総合ランクポイントが前年度を超え、来年反映予定の会員ランクが現在の会員ランクを上回った場合は、<strong className="text-[#4a4a4a]">当年度にも直ちに新しい会員ランクが反映</strong>されます。</li>
            </ul>
          </div>
          
          <div className="space-y-4">
            {/* Regular */}
            <div className="border border-[#c0c0c0] p-4 relative overflow-hidden flex justify-between items-center bg-[#4a4a4a] text-white">
              <div>
                <span className="font-serif tracking-widest text-sm uppercase">Regular</span>
                <p className="text-[9px] mt-1 font-mono tracking-widest text-[#d0d0d0]">BASIC RANK</p>
              </div>
              <span className="text-[10px] border border-white/40 px-3 py-1 font-mono tracking-widest">5%</span>
            </div>

            {/* Gold */}
            <div className="border border-[#c2a76f] p-4 relative overflow-hidden flex justify-between items-center bg-[#b89b5e] text-white">
              <div>
                <span className="font-serif tracking-widest text-sm uppercase">Gold</span>
                <p className="text-[9px] mt-1 font-mono tracking-widest text-[#f0e6d2]">OVER ¥50,000</p>
              </div>
              <span className="text-[10px] border border-white/40 px-3 py-1 font-mono tracking-widest">8%</span>
            </div>

            {/* Platinum */}
            <div className="border border-[#c0c4cc] p-4 relative overflow-hidden flex justify-between items-center bg-gradient-to-br from-[#f4f5f7] to-[#cdd1d8] text-[#2c3036]">
              <div>
                <span className="font-serif tracking-widest text-sm uppercase font-bold">Platinum</span>
                <p className="text-[9px] mt-1 font-mono tracking-widest text-[#5a5f68]">OVER ¥100,000</p>
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