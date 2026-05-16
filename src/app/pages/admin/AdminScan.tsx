import { useState, useEffect } from 'react';
import { Scan, Calculator, UserCheck, CheckCircle, Info } from 'lucide-react';
import liff from '@line/liff';
import { api } from '../../lib/api';

interface StoreDto {
  id: number;
  name: string;
}

interface MemberScanDto {
  id: number;
  memberNo: string;
  name: string;
  rank: string;
  pointRate: number;
  points: number;
  availableCoupons: {
    id: number;
    name: string;
    discountDesc: string;
    couponType: string;
    expiresAt: string | null;
  }[];
}

interface ProcessPaymentResponse {
  purchaseId: number;
  pointsToGrant: number;
  rankChanged: boolean;
  newRank: string;
}

export const AdminScan = () => {
  const [step, setStep] = useState<1 | 2>(1);
  const [scannedNo, setScannedNo] = useState('');
  const [targetMember, setTargetMember] = useState<MemberScanDto | null>(null);
  const [scanLoading, setScanLoading] = useState(false);
  const [scanError, setScanError] = useState('');

  const [stores, setStores] = useState<StoreDto[]>([]);
  const [selectedStore, setSelectedStore] = useState('');
  const [amount, setAmount] = useState('');
  const [pointsUsed, setPointsUsed] = useState('');
  const [selectedCoupon, setSelectedCoupon] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    api.get<StoreDto[]>('/api/admin/stores').then(setStores).catch(() => {});
  }, []);

  const parsedAmount = parseInt(amount, 10) || 0;
  // 税抜き換算（10%）— 浮動小数点誤差を避けるため * 10 / 11 の整数演算
  const taxExcluded = Math.trunc(parsedAmount * 10 / 11);
  const grantedPoints = targetMember
    ? Math.floor(taxExcluded * targetMember.pointRate)
    : 0;

  const fetchMember = async (no: string) => {
    setScanLoading(true);
    setScanError('');
    try {
      const member = await api.get<MemberScanDto>(`/api/admin/members/${no.trim()}`);
      setTargetMember(member);
      setStep(2);
      setAmount('');
      setPointsUsed('');
      setSelectedCoupon('');
      setSelectedStore(stores.length === 1 ? String(stores[0].id) : '');
    } catch (e) {
      setScanError(e instanceof Error ? e.message : '会員情報の取得に失敗しました');
    } finally {
      setScanLoading(false);
    }
  };

  const handleQrScan = async () => {
    setScanError('');
    try {
      const result = await liff.scanCodeV2();
      if (result.value) {
        setScannedNo(result.value);
        await fetchMember(result.value);
      }
    } catch (e) {
      setScanError('QRの読み取りに失敗しました');
    }
  };

  const handleScan = async () => {
    if (!scannedNo.trim()) return;
    await fetchMember(scannedNo);
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetMember) return;

    const numAmount = parseInt(amount, 10);
    const numPoints = parseInt(pointsUsed, 10) || 0;

    if (isNaN(numAmount) || numAmount <= 0) {
      alert('正しい金額を入力してください');
      return;
    }
    if (!selectedStore) {
      alert('店舗を選択してください');
      return;
    }
    if (numPoints > targetMember.points) {
      alert('利用可能ポイントを超えています');
      return;
    }

    setSubmitLoading(true);
    try {
      const res = await api.post<ProcessPaymentResponse>('/api/admin/payments', {
        memberNo: targetMember.memberNo,
        storeId: Number(selectedStore),
        amount: numAmount,
        pointsUsed: numPoints,
        couponId: selectedCoupon ? Number(selectedCoupon) : undefined,
      });

      const rankMsg = res.rankChanged ? `\nランクが ${res.newRank} にアップしました！` : '';
      alert(`決済が完了しました。\n付与予定ポイント: ${res.pointsToGrant} pt（3日後に付与）${rankMsg}`);
      setStep(1);
      setTargetMember(null);
      setScannedNo('');
    } catch (e) {
      alert(e instanceof Error ? e.message : '決済処理に失敗しました');
    } finally {
      setSubmitLoading(false);
    }
  };

  const rankLabel = (rank: string) => {
    if (rank === 'PLATINUM') return 'Platinum';
    if (rank === 'GOLD') return 'Gold';
    return 'Regular';
  };

  return (
    <div className="h-full flex flex-col bg-[#f8f9fa] font-sans">
      <div className="bg-white border-b border-[#d0d0d0] p-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <h2 className="text-sm font-bold text-[#5a5a5a] tracking-widest flex items-center space-x-2">
          {step === 1
            ? <><Scan className="w-5 h-5 mr-1" strokeWidth={1.5} /><span>会員QR読み取り</span></>
            : <><Calculator className="w-5 h-5 mr-1" strokeWidth={1.5} /><span>決済情報入力</span></>}
        </h2>
      </div>

      <div className="p-5 flex-1 overflow-y-auto">
        {step === 1 && (
          <div className="flex flex-col items-center justify-center h-full space-y-8">
            <button
              onClick={handleQrScan}
              disabled={scanLoading}
              className="w-64 h-64 bg-white border border-[#d0d0d0] flex flex-col items-center justify-center shadow-sm relative active:bg-[#f8f9fa] transition disabled:opacity-50"
            >
              <div className="absolute w-8 h-8 border-t border-l border-[#5a5a5a] top-4 left-4"></div>
              <div className="absolute w-8 h-8 border-t border-r border-[#5a5a5a] top-4 right-4"></div>
              <div className="absolute w-8 h-8 border-b border-l border-[#5a5a5a] bottom-4 left-4"></div>
              <div className="absolute w-8 h-8 border-b border-r border-[#5a5a5a] bottom-4 right-4"></div>
              <Scan className="w-16 h-16 text-[#5a5a5a] mb-4 stroke-1" />
              <p className="text-[#5a5a5a] font-bold text-xs tracking-widest">
                {scanLoading ? '読み取り中...' : 'タップしてQRを読み取る'}
              </p>
            </button>

            <div className="w-full bg-white p-5 border border-[#d0d0d0] shadow-sm">
              <p className="text-[11px] text-[#7a7a7a] mb-3 font-bold tracking-widest">会員番号を入力</p>
              {scanError && (
                <p className="text-xs text-red-500 mb-3 tracking-wide">{scanError}</p>
              )}
              <div className="flex border border-[#d0d0d0] bg-[#f8f9fa] p-1">
                <input
                  type="text"
                  value={scannedNo}
                  onChange={e => setScannedNo(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleScan()}
                  placeholder="例: 10001"
                  className="w-full min-w-0 bg-transparent px-3 py-3 text-sm font-mono tracking-widest focus:outline-none placeholder:text-[#c0c0c0] text-[#4a4a4a]"
                />
                <button
                  onClick={handleScan}
                  disabled={scanLoading}
                  className="flex-shrink-0 bg-[#5a5a5a] text-white px-5 py-3 text-xs tracking-widest font-bold hover:bg-[#4a4a4a] transition disabled:opacity-50"
                >
                  {scanLoading ? '...' : '確認'}
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 2 && targetMember && (
          <form onSubmit={handlePayment} className="space-y-6">
            <div className="bg-white p-5 border border-[#d0d0d0] shadow-sm flex items-center space-x-4">
              <div className="bg-[#f8f9fa] p-3 border border-[#d0d0d0]">
                <UserCheck className="w-6 h-6 text-[#5a5a5a] stroke-1" />
              </div>
              <div>
                <p className="text-[11px] tracking-widest text-[#7a7a7a] mb-1 font-bold">
                  会員番号: {targetMember.memberNo} ({rankLabel(targetMember.rank)})
                </p>
                <p className="text-base font-bold text-[#4a4a4a] tracking-wide font-serif">
                  {targetMember.name} 様
                </p>
              </div>
            </div>

            <div className="bg-white p-5 border border-[#d0d0d0] shadow-sm space-y-6">
              <div>
                <label className="block text-[11px] tracking-widest font-bold text-[#7a7a7a] mb-2">店舗</label>
                <select
                  value={selectedStore}
                  onChange={e => setSelectedStore(e.target.value)}
                  required
                  className="w-full border border-[#d0d0d0] bg-[#f8f9fa] px-3 py-3 text-sm focus:outline-none focus:border-[#5a5a5a] text-[#4a4a4a]"
                >
                  <option value="">選択してください</option>
                  {stores.map(s => (
                    <option key={s.id} value={String(s.id)}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] tracking-widest font-bold text-[#7a7a7a] mb-2">購入金額（税込）</label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="w-full border border-[#d0d0d0] bg-[#f8f9fa] pl-3 pr-10 py-3 text-right font-mono text-lg focus:outline-none focus:border-[#5a5a5a] text-[#4a4a4a]"
                    placeholder="0"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7a7a7a] text-[11px] font-bold tracking-widest">円</span>
                </div>
              </div>

              <div>
                <label className="flex justify-between items-end text-[11px] tracking-widest font-bold text-[#7a7a7a] mb-2">
                  <span>利用ポイント</span>
                  <span className="text-[10px] text-[#5a5a5a] font-mono tracking-wider font-normal">
                    利用可能: {targetMember.points} pt
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={pointsUsed}
                    onChange={e => setPointsUsed(e.target.value)}
                    className="w-full border border-[#d0d0d0] bg-[#f8f9fa] pl-3 pr-10 py-3 text-right font-mono text-lg focus:outline-none focus:border-[#5a5a5a] text-[#4a4a4a]"
                    placeholder="0"
                    max={targetMember.points}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7a7a7a] text-[11px] font-bold tracking-widest">pt</span>
                </div>
              </div>

              {targetMember.availableCoupons.length > 0 && (
                <div>
                  <label className="block text-[11px] tracking-widest font-bold text-[#7a7a7a] mb-2">利用クーポン</label>
                  <select
                    value={selectedCoupon}
                    onChange={e => setSelectedCoupon(e.target.value)}
                    className="w-full border border-[#d0d0d0] bg-[#f8f9fa] px-3 py-3 text-sm focus:outline-none focus:border-[#5a5a5a] text-[#4a4a4a]"
                  >
                    <option value="">利用しない</option>
                    {targetMember.availableCoupons.map(c => (
                      <option key={c.id} value={String(c.id)}>
                        {c.name}（{c.discountDesc}）
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {parsedAmount > 0 && (
                <div className="bg-[#f8f9fa] p-4 border border-[#d0d0d0] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#7a7a7a] tracking-widest flex items-center">
                      <Info className="w-3.5 h-3.5 mr-1 stroke-1" />
                      税抜き金額（ポイント基準）
                    </span>
                    <span className="text-xs font-mono text-[#7a7a7a]">{taxExcluded.toLocaleString()} 円</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#5a5a5a] tracking-widest">
                      付与予定ポイント（{Math.round(targetMember.pointRate * 100)}%）
                    </span>
                    <span className="text-sm font-bold font-mono text-[#4a4a4a]">+{grantedPoints} pt</span>
                  </div>
                  <p className="text-[10px] text-[#7a7a7a] tracking-widest">※クーポン適用後の税抜き金額が基準。購入の3日後に自動付与されます。</p>
                </div>
              )}
            </div>

            <div className="pt-2 flex space-x-3">
              <button
                type="button"
                onClick={() => { setStep(1); setTargetMember(null); setScannedNo(''); setSelectedStore(''); }}
                className="flex-1 py-4 bg-white border border-[#a0a0a0] text-[#7a7a7a] text-xs tracking-widest font-bold hover:bg-[#f8f9fa] transition"
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={submitLoading}
                className="flex-[2] py-4 bg-[#5a5a5a] text-white text-xs tracking-widest font-bold flex items-center justify-center space-x-2 hover:bg-[#4a4a4a] transition shadow-sm disabled:opacity-50"
              >
                <CheckCircle className="w-5 h-5 stroke-1" />
                <span>{submitLoading ? '処理中...' : '決済を完了する'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
