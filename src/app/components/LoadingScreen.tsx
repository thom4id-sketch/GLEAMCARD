export const LoadingScreen = () => (
  <div className="fixed inset-0 flex flex-col items-center justify-center bg-white">
    <img
      src="/gleam-logo.jpeg"
      alt="GLEAM"
      className="w-44"
      style={{ animation: 'gleam-fade-up 0.7s ease-out forwards' }}
      onError={e => {
        (e.currentTarget as HTMLImageElement).style.display = 'none';
        const fallback = e.currentTarget.nextElementSibling as HTMLElement | null;
        if (fallback) fallback.style.display = 'block';
      }}
    />
    <p
      className="text-[#1a1a1a] text-2xl font-bold tracking-[0.5em] hidden"
      style={{ animation: 'gleam-fade-up 0.7s ease-out forwards' }}
    >
      GLEAM
    </p>

    {/* スウィープ型ローディングバー */}
    <div className="mt-10 w-32 h-px bg-[#e0e0e0] overflow-hidden relative">
      <div
        className="absolute inset-y-0 w-1/2 bg-[#3a3a3a]"
        style={{ animation: 'gleam-sweep 1.4s cubic-bezier(0.4,0,0.6,1) infinite' }}
      />
    </div>
  </div>
);
