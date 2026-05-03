import { Outlet, NavLink, useLocation } from 'react-router';
import { Home, CreditCard, Ticket, Clock, Settings } from 'lucide-react';

export const UserLayout = () => {
  return (
    <div className="h-[100dvh] max-w-md mx-auto bg-[#f8f9fa] text-[#4a4a4a] border-x border-gray-200 font-sans">
      <main className="h-full overflow-y-auto pb-[60px] scroll-smooth bg-[#f8f9fa] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <Outlet />
      </main>
      <nav className="fixed bottom-0 inset-x-0 max-w-md mx-auto h-[60px] bg-white border-t border-[#d0d0d0] flex justify-around items-center shadow-[0_-2px_10px_rgba(0,0,0,0.02)] z-10">
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
    <div className="h-[100dvh] max-w-md mx-auto bg-[#f8f9fa] text-[#4a4a4a] border-x border-[#d0d0d0] font-sans">
      <main className="h-full overflow-y-auto pb-[60px] scroll-smooth bg-[#f8f9fa] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <Outlet />
      </main>
      <nav className="fixed bottom-0 inset-x-0 max-w-md mx-auto h-[60px] bg-white border-t border-[#d0d0d0] flex justify-around items-center shadow-[0_-2px_10px_rgba(0,0,0,0.02)] z-10">
        <NavItem to="/admin" icon={<Settings size={22} strokeWidth={1} />} label="投稿" />
        <NavItem to="/admin/coupon" icon={<Ticket size={22} strokeWidth={1} />} label="クーポン" />
        <NavItem to="/admin/scan" icon={<CreditCard size={22} strokeWidth={1} />} label="決済" />
        <NavItem to="/admin/history" icon={<Clock size={22} strokeWidth={1} />} label="履歴" />
      </nav>
    </div>
  );
};

const NavItem = ({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) => {
  const location = useLocation();
  const isActive = to === '/' || to === '/admin'
    ? location.pathname === to
    : location.pathname.startsWith(to);

  return (
    <NavLink
      to={to}
      className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors border-t-[3px] pt-1
        ${isActive ? 'text-[#5a5a5a] border-[#5a5a5a]' : 'text-[#a0a0a0] border-transparent hover:text-[#7a7a7a]'}`}
    >
      {icon}
      <span className="text-[10px] tracking-widest">{label}</span>
    </NavLink>
  );
};
