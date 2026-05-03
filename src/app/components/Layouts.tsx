import { Outlet, NavLink, useLocation } from 'react-router';
import { Home, CreditCard, Ticket, Clock, Settings } from 'lucide-react';

export const UserLayout = () => {
  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-[#f8f9fa] text-[#4a4a4a] border-x border-gray-200 relative overflow-hidden font-sans">
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-[60px] scroll-smooth bg-[#f8f9fa] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <Outlet />
      </main>

      {/* Footer Nav */}
      <nav className="bg-[#7a7a7a] text-white flex justify-around items-center h-[60px] fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-10 border-t border-[#6a6a6a]">
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
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-[60px] scroll-smooth bg-[#f8f9fa] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <Outlet />
      </main>

      {/* Footer Nav */}
      <nav className="bg-white border-t border-[#d0d0d0] flex justify-around items-center h-[60px] fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-10 shadow-[0_-2px_10px_rgba(0,0,0,0.02)]">
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
