import { useState } from "react";
import { Link } from "react-router";
import { useStore } from "../../context/StoreContext";
import QRCode from "react-qr-code";
import { Award, X, ZoomIn } from "lucide-react";

export const UserCard = () => {
  const { currentUser } = useStore();
  const [qrZoomed, setQrZoomed] = useState(false);

  const rankColors = {
    Regular: "bg-[#4a4a4a] text-white",
    Silver: "bg-gradient-to-br from-[#7a7a7a] to-[#b0b0b0] text-white",
    Gold: "bg-[#b89b5e] text-white",
    Platinum: "bg-gradient-to-br from-[#f4f5f7] to-[#cdd1d8] text-[#2c3036]",
  };

  const rankLabels = {
    Regular: "REGULAR",
    Silver: "SILVER",
    Gold: "GOLD",
    Platinum: "PLATINUM",
  };

  return (
    <div className="px-5 py-8 flex flex-col items-center min-h-[calc(100vh-60px)] gap-6 bg-[#f8f9fa]">
      {/* Digital Card */}
      <div
        className={`w-full max-w-sm border border-[#a0a0a0] p-6 relative flex-shrink-0 shadow-sm ${rankColors[currentUser.rank]}`}
      >
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <Award size={100} strokeWidth={1} />
        </div>

        <div className="relative z-10">
          <div className="flex justify-between items-start mb-10">
            <div>
              <p className="text-[10px] tracking-widest opacity-80 mb-1 font-serif">
                MEMBER NO.
              </p>
              <p className="text-xl font-mono tracking-widest leading-none">
                {currentUser.memberNo}
              </p>
            </div>
            <div className={`border px-3 py-1 text-[10px] tracking-widest font-bold font-serif ${currentUser.rank === 'Platinum' ? 'border-[#5a5a5a]' : 'border-white/50'}`}>
              {rankLabels[currentUser.rank]}
            </div>
          </div>

          <div className="mb-8">
            <p className="text-xl font-serif tracking-widest uppercase">
              {currentUser.name}
            </p>
          </div>

          <div className={`border-t pt-4 ${currentUser.rank === 'Platinum' ? 'border-[#a0a0a0]' : 'border-white/30'}`}>
            <div className="flex justify-between items-end mb-1">
              <span className="text-[10px] tracking-widest opacity-80">
                ANNUAL PURCHASE
              </span>
              <span className="text-xl font-mono tracking-tighter leading-none">
                ¥{currentUser.annualPurchase.toLocaleString()}
              </span>
            </div>
            <p className="text-[9px] opacity-60 text-right tracking-widest">税抜き金額</p>
            {currentUser.rank === "Regular" && (
              <p className="text-[10px] opacity-80 mt-1 text-right tracking-widest">
                NEXT RANK: ¥{(300_000 - currentUser.annualPurchase).toLocaleString()}
              </p>
            )}
            {currentUser.rank === "Silver" && (
              <p className="text-[10px] opacity-80 mt-1 text-right tracking-widest">
                NEXT RANK: ¥{(1_000_000 - currentUser.annualPurchase).toLocaleString()}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* QR Code */}
      <button
        onClick={() => setQrZoomed(true)}
        className="bg-white border border-[#d0d0d0] p-6 flex flex-col items-center w-full max-w-sm flex-shrink-0 relative shadow-sm active:bg-[#f8f9fa] transition"
      >
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#a0a0a0] -ml-[1px] -mt-[1px]"></div>
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#a0a0a0] -mr-[1px] -mt-[1px]"></div>
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[#a0a0a0] -ml-[1px] -mb-[1px]"></div>
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#a0a0a0] -mr-[1px] -mb-[1px]"></div>


        <div className="bg-white p-1">
          <QRCode value={currentUser.memberNo} size={160} fgColor="#333333" />
        </div>
        <div className="mt-3 flex items-center space-x-1 text-[#a0a0a0]">
          <ZoomIn size={12} strokeWidth={1} />
          <span className="text-[10px] tracking-widest">タップして拡大</span>
        </div>
      </button>

      {/* QR Zoom Modal */}
      {qrZoomed && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex flex-col items-center justify-center"
          onClick={() => setQrZoomed(false)}
        >
          <div
            className="bg-white p-8 flex flex-col items-center relative mx-6 w-full max-w-xs"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setQrZoomed(false)}
              className="absolute top-3 right-3 text-[#a0a0a0] hover:text-[#5a5a5a] transition"
            >
              <X size={20} strokeWidth={1} />
            </button>
            <p className="text-[10px] tracking-widest text-[#5a5a5a] mb-6 font-bold font-serif">
              SCAN AT REGISTER
            </p>
            <div className="bg-white p-2">
              <QRCode value={currentUser.memberNo} size={220} fgColor="#333333" />
            </div>
            <p className="mt-5 text-sm text-[#5a5a5a] font-mono tracking-widest font-bold">
              {currentUser.memberNo}
            </p>
            <p className="mt-1 text-[10px] text-[#a0a0a0] tracking-widest">
              {currentUser.name}
            </p>
          </div>
          <p className="mt-6 text-white/50 text-[10px] tracking-widest">タップして閉じる</p>
        </div>
      )}

      {/* Points Info */}
      <div className="w-full max-w-sm bg-[#ececec] text-[#4a4a4a] border border-[#d0d0d0] py-3 px-6 flex justify-between items-center flex-shrink-0 shadow-sm">
        <div>
          <h3 className="text-[10px] tracking-widest opacity-80 mb-2 font-serif uppercase text-[#5a5a5a]">
            Available Points
          </h3>
          {currentUser.pointExpiresAt && (
            <p className="text-[9px] text-[#7a7a7a] font-mono tracking-widest mb-1">
              有効期限: {currentUser.pointExpiresAt.replace(/-/g, '/')}
            </p>
          )}
          <Link
            to="/point-info"
            className="text-[10px] underline decoration-[#a0a0a0] underline-offset-4 hover:text-[#7a7a7a] transition-colors"
          >
            ポイントについて
          </Link>
        </div>
        <div className="text-right">
          <p className="text-3xl font-mono tracking-tighter leading-none text-[#4a4a4a]">
            {currentUser.points.toLocaleString()}
            <span className="text-xs ml-1 font-sans text-[#7a7a7a]">
              pt
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};