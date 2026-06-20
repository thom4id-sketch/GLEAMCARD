import { Link } from 'react-router';
import { ArrowLeft, Info, Ticket, ArrowLeftRight, Truck, PackageSearch, Shield, Mail, Clock } from 'lucide-react';

const O = () => <span className="text-[#4a4a4a] font-bold text-sm">○</span>;
const Dash = () => <span className="text-[#c0c0c0] text-sm">—</span>;

const services: { icon: React.ReactNode; name: string; sub?: string; cols: [boolean, boolean, boolean, boolean] }[] = [
  { icon: <ArrowLeftRight size={14} strokeWidth={1.5} />, name: 'ポイント交換サービス',          cols: [true,  true,  true,  true]  },
  { icon: <Truck          size={14} strokeWidth={1.5} />, name: '店舗でのお買い物 国内配送無料', cols: [false, true,  true,  true]  },
  { icon: <PackageSearch  size={14} strokeWidth={1.5} />, name: '店舗間取り寄せサービス',        cols: [false, false, true,  true]  },
  { icon: <Shield         size={14} strokeWidth={1.5} />, name: '1年間のランクキープサービス',   cols: [false, false, false, true]  },
  { icon: <Mail           size={14} strokeWidth={1.5} />, name: '特別なイベントへのご招待',      cols: [false, false, false, true]  },
  { icon: <Clock          size={14} strokeWidth={1.5} />, name: 'ポイント有効期限延長サービス', sub: '1年間延長', cols: [false, false, false, true] },
];

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
        {/* ランク別サービス比較表 */}
        <section className="bg-white shadow-sm overflow-hidden">
          <div className="text-center py-8 px-4 border-b border-[#e8e8e8]">
            <p className="text-[9px] text-[#a0a0a0] tracking-[0.25em] mb-2 uppercase">Membership Rank &amp; Services</p>
            <h3 className="text-lg font-bold text-[#333333] mb-3">会員ランク別サービス</h3>
            <p className="text-[11px] text-[#7a7a7a] leading-relaxed">
              3年間の累計ご利用金額に応じて4つのランクをご用意。<br />ランクごとに特別な特典をお楽しみいただけます。
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[320px] text-center border-collapse">
              {/* ヘッダー行：ランク名 */}
              <thead>
                <tr className="border-b border-[#e8e8e8]">
                  <th className="text-left text-[9px] text-[#a0a0a0] tracking-widest font-normal py-3 pl-4 w-[36%]">会員ランク</th>
                  {(['REGULAR','SILVER','GOLD','PLATINUM'] as const).map((r, i) => (
                    <th key={r} className={`py-3 text-[10px] font-bold tracking-widest ${i === 3 ? 'bg-[#f4f5f7] text-[#2c3036]' : 'text-[#4a4a4a]'}`}>
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-[#a0a0a0] text-base">♛</span>
                        <span>{r}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* 購入額 */}
                <tr className="border-b border-[#e8e8e8]">
                  <td className="text-left pl-4 py-4">
                    <p className="text-[11px] font-bold text-[#4a4a4a]">3年間累計利用金額</p>
                    <p className="text-[9px] text-[#a0a0a0] mt-0.5">税抜</p>
                  </td>
                  <td className="text-[10px] text-[#5a5a5a] leading-tight px-1">30万円<br/>未満</td>
                  <td className="text-[10px] text-[#5a5a5a] leading-tight px-1">30万円<br/>以上</td>
                  <td className="text-[10px] text-[#5a5a5a] leading-tight px-1">100万円<br/>以上</td>
                  <td className="text-[10px] text-[#5a5a5a] leading-tight px-1 bg-[#f4f5f7]">150万円<br/>以上</td>
                </tr>
                {/* ポイント付与率 */}
                <tr className="border-b border-[#e8e8e8]">
                  <td className="text-left pl-4 py-4">
                    <p className="text-[11px] font-bold text-[#4a4a4a]">ポイント付与率</p>
                    <p className="text-[9px] text-[#a0a0a0] mt-0.5">通常商品</p>
                  </td>
                  {(['5%','8%','10%','10%'] as const).map((v, i) => (
                    <td key={i} className={`py-4 font-bold text-sm text-[#4a4a4a] ${i === 3 ? 'bg-[#f4f5f7]' : ''}`}>{v}</td>
                  ))}
                </tr>
                {/* サービス行 */}
                {services.map((s, si) => (
                  <tr key={si} className="border-b border-[#e8e8e8]">
                    <td className="text-left pl-4 py-4">
                      <div className="flex items-start gap-2">
                        <span className="text-[#7a7a7a] mt-0.5 flex-shrink-0">{s.icon}</span>
                        <div>
                          <p className="text-[11px] text-[#4a4a4a] leading-snug">{s.name}</p>
                          {s.sub && <p className="text-[9px] text-[#a0a0a0] mt-0.5">{s.sub}</p>}
                        </div>
                      </div>
                    </td>
                    {s.cols.map((ok, ci) => (
                      <td key={ci} className={`py-4 ${ci === 3 ? 'bg-[#f4f5f7]' : ''}`}>
                        {ok ? <O /> : <Dash />}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 注釈 */}
          <div className="px-4 py-5 border-t border-[#e8e8e8] space-y-1.5">
            {[
              '集計期間：過去2年＋当年12月31日までの3年間の累計利用金額（税抜）で判定いたします。',
              'ポイント有効期限は最終購入日から3年間です。',
              'セール商品はポイント付与・利用ともに対象外となります。',
              'ランクは毎年1月1日AM0時に更新されます。',
              '特典内容は予告なく変更となる場合があります。',
            ].map((note, i) => (
              <p key={i} className="text-[9px] text-[#a0a0a0] leading-relaxed">※ {note}</p>
            ))}
          </div>
        </section>

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
            <li>ポイントはメガネ一式（フレーム＋レンズ）またはサングラスのご購入時にご利用いただけます。</li>
            <li>修理代、工賃、パーツ代、送料などには、ポイントは付与されません。</li>
          </ul>
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
