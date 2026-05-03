import { Link } from 'react-router';
import { ArrowLeft, Ticket } from 'lucide-react';

export const UserCouponInfo = () => {
  return (
    <div className="bg-[#f8f9fa] min-h-full pb-10 font-sans">
      <div className="bg-white border-b border-[#d0d0d0] px-4 py-4 flex items-center sticky top-0 z-20 shadow-sm">
        <Link to="/coupons" className="text-[#5a5a5a] hover:text-[#333333] flex items-center p-1 -ml-1 transition-colors">
          <ArrowLeft size={20} strokeWidth={1} />
          <span className="sr-only">BACK</span>
        </Link>
        <h2 className="text-xs font-bold text-[#5a5a5a] ml-3 tracking-widest uppercase">Coupon Information</h2>
      </div>

      <div className="p-5 space-y-8 mt-2">
        <section className="bg-white border-l-2 border-[#a0a0a0] pl-5 p-6 shadow-sm">
          <div className="flex items-center space-x-3 mb-6">
            <Ticket className="text-[#5a5a5a]" size={18} strokeWidth={1.5} />
            <h3 className="text-[11px] font-bold text-[#5a5a5a] tracking-widest uppercase">クーポンについて</h3>
          </div>
          <ul className="text-xs text-[#7a7a7a] space-y-5 list-disc pl-4 leading-loose">
            <li>クーポンをご利用の際は、会計時に使用するクーポンをスタッフにお申し付けください。</li>
            <li>クーポンは１会計につき１つまでご利用いただけます。</li>
            <li>ショッピングローンをご利用の際は、クーポンの使用はできません。</li>
            <li>使用期限のあるクーポンは、期限を過ぎると使用できなくなります。</li>
          </ul>
        </section>
      </div>
    </div>
  );
};