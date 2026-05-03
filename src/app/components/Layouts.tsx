import { Outlet, NavLink, useLocation } from 'react-router';
import { Home, CreditCard, Ticket, Clock, Settings, User, Search, ShoppingCart } from 'lucide-react';

export const UserLayout = () => {
  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-[#f8f9fa] text-[#4a4a4a] border-x border-gray-200 relative overflow-hidden font-sans">
      {/* Header */}
      <header className="bg-white px-4 h-14 flex items-center justify-between border-b border-gray-300 z-10 relative">
        <div className="w-16"></div> {/* Spacer for flex-between */}
        <h1 className="absolute left-1/2 -translate-x-1/2 text-sm font-bold text-[#5a5a5a] tracking-[0.3em] font-serif uppercase pointer-events-none">Gleam</h1>
        <NavLink to="/admin" className="text-[10px] font-medium text-[#7a7a7a] border border-[#d0d0d0] px-2 py-1 hover:bg-[#f0f0f0] transition-colors uppercase tracking-wider z-10">
          Admin
        </NavLink>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-[60px] scroll-smooth bg-[#f8f9fa] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <Outlet />
      </main>

      {/* Footer Nav */}
      <nav className="bg-[#7a7a7a] text-white flex justify-around items-center h-[60px] absolute bottom-0 w-full z-10 border-t border-[#6a6a6a]">
        <NavItem to="/" icon={<Home size={22} strokeWidth={1} />} label="HOME" />
        <NavItem to="/card" icon={<CreditCard size={22} strokeWidth={1} />} label="CARD" />
        <NavItem to="/coupons" icon={<Ticket size={22} strokeWidth={1} />} label="COUPON" />
        <NavItem to="/history" icon={<Clock size={22} strokeWidth={1} />} label="HISTORY" />
      </nav>
    </div>
  );
};

export const AdminLayout = () => {
  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-[#f8f9fa] text-[#4a4a4a] border-x border-[#d0d0d0] relative overflow-hidden font-sans">
      {/* Header */}
      <header className="bg-[#5a5a5a] px-4 h-14 flex items-center justify-between border-b border-[#4a4a4a] z-10 relative shadow-sm">
        <h1 className="text-xs font-bold text-white tracking-widest font-sans">店舗管理システム</h1>
        <NavLink to="/" className="text-[10px] font-bold text-[#5a5a5a] bg-white border border-[#d0d0d0] px-2 py-1 hover:bg-[#f8f9fa] transition-colors tracking-widest">
          ユーザーモード
        </NavLink>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-[60px] scroll-smooth bg-[#f8f9fa] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <Outlet />
      </main>

      {/* Footer Nav */}
      <nav className="bg-white border-t border-[#d0d0d0] flex justify-around items-center h-[60px] absolute bottom-0 w-full z-10 shadow-[0_-2px_10px_rgba(0,0,0,0.02)]">
        <NavItem to="/admin" icon={<Settings size={22} strokeWidth={1} />} label="投稿" admin />
        <NavItem to="/admin/coupon" icon={<Ticket size={22} strokeWidth={1} />} label="クーポン" admin />
        <NavItem to="/admin/scan" icon={<CreditCard size={22} strokeWidth={1} />} label="決済" admin />
        <NavItem to="/admin/history" icon={<Clock size={22} strokeWidth={1} />} label="履歴" admin />
      </nav>
    </div>
  );
};

const NavItem = ({ to, icon, label, admin = false }: { to: string, icon: React.ReactNode, label: string, admin?: boolean }) => {
  const location = useLocation();
  const isActive = to === '/' || to === '/admin' 
    ? location.pathname === to 
    : location.pathname.startsWith(to);

  const activeColor = admin ? 'text-[#5a5a5a] border-t-[3px] border-[#5a5a5a] pt-1' : 'text-white font-bold drop-shadow-md';
  const inactiveColor = admin ? 'text-[#a0a0a0] border-t-[3px] border-transparent pt-1 hover:text-[#7a7a7a]' : 'text-[#d0d0d0]';

  return (
    <NavLink 
      to={to} 
      className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive ? activeColor : inactiveColor}`}
    >
      {icon}
      <span className={`text-[10px] tracking-widest ${!admin && 'uppercase'}`}>{label}</span>
    </NavLink>
  );
};
