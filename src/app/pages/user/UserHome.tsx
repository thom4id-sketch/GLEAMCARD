import { useStore } from '../../context/StoreContext';
import { format, parseISO } from 'date-fns';
import { enUS } from 'date-fns/locale';

export const UserHome = () => {
  const { posts } = useStore();

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMM d, yyyy', { locale: enUS });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="bg-[#f8f9fa] min-h-full pb-8 pt-6 font-sans">
      <h2 className="text-center text-lg tracking-[0.2em] text-[#333333] font-bold uppercase mb-4 font-serif">News</h2>
      
      <div className="flex flex-col space-y-6 px-4">
        {posts.map((item, index) => (
          <div key={item.id} className="w-full">
            <a 
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-left relative group cursor-pointer"
            >
              <div className="relative w-full aspect-[4/3] overflow-hidden bg-gray-100 border border-[#e0e0e0] shadow-sm">
                <img
                  src={item.image}
                  alt={item.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {/* 透過のダークオーバーレイ */}
                <div className="absolute inset-0 bg-gray-900/40 group-hover:bg-gray-900/20 transition-colors duration-500"></div>
                
                {/* 内側の白い枠線 */}
                <div className="absolute inset-[10px] border border-white/40 pointer-events-none mix-blend-overlay"></div>
                
                {/* 日付 (Serif) */}
                <div className="absolute top-4 left-5 text-white/90 font-serif text-[10px] tracking-[0.2em] uppercase drop-shadow-sm">
                  {formatDate(item.date)}
                </div>
                
                {/* タイトル (中央配置) */}
                <div className="absolute inset-0 flex items-center justify-center px-8 text-center pointer-events-none">
                  <h3 className="text-white text-sm sm:text-base font-serif tracking-[0.2em] leading-relaxed uppercase drop-shadow-md">
                    {item.title}
                  </h3>
                </div>
              </div>
            </a>
          </div>
        ))}
        {posts.length === 0 && (
          <p className="text-center text-[#a0a0a0] mt-10 text-[10px] tracking-widest uppercase border border-dashed border-[#d0d0d0] py-16 bg-white">No News Available</p>
        )}
      </div>
    </div>
  );
};
