import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserPlus, Gift } from 'lucide-react';

/**
 * 新規会員登録画面。
 * LIFF 経由で初回ログインした未登録ユーザーにのみ表示される。
 */
export const RegisterPage = () => {
  const { completeRegistration } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ?inv= パラメータが存在する場合は友達招待経由
  const hasInvitation = new URLSearchParams(window.location.search).has('inv');

  const handleRegister = async () => {
    setLoading(true);
    setError('');
    try {
      await completeRegistration();
    } catch (e) {
      setError(e instanceof Error ? e.message : '登録に失敗しました。もう一度お試しください。');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen max-w-md mx-auto flex items-center justify-center bg-[#f8f9fa] p-6">
      <div className="w-full bg-white border border-[#d0d0d0] shadow-sm">
        {/* ヘッダー */}
        <div className="bg-[#5a5a5a] p-6 text-center">
          <h1 className="text-white text-xs tracking-[0.4em] font-serif uppercase">Gleam</h1>
        </div>

        <div className="p-8 text-center">
          <div className="inline-flex bg-[#ececec] p-5 mb-6 border border-[#d0d0d0]">
            <UserPlus className="w-8 h-8 text-[#5a5a5a] stroke-1" />
          </div>

          <h2 className="text-sm font-bold text-[#4a4a4a] tracking-widest mb-4 uppercase font-serif">
            Membership Registration
          </h2>

          <p className="text-xs text-[#7a7a7a] mb-6 tracking-wider leading-relaxed text-left">
            Gleamメンバーズカードへようこそ。
            会員登録をすることで、お買い物でポイントを貯めたり、
            お得なクーポンを受け取ることができます。
          </p>

          {hasInvitation && (
            <div className="bg-[#f8f9fa] border border-[#d0d0d0] p-4 mb-6 flex items-start space-x-3 text-left">
              <Gift className="w-5 h-5 text-[#5a5a5a] stroke-1 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] font-bold text-[#4a4a4a] tracking-widest mb-1">
                  お友達紹介特典
                </p>
                <p className="text-[11px] text-[#7a7a7a] tracking-wide">
                  登録完了後、<span className="font-bold text-[#5a5a5a]">1,000円OFFクーポン</span>をプレゼントします。
                </p>
              </div>
            </div>
          )}

          {error && (
            <p className="text-xs text-red-500 mb-4 tracking-wide border border-red-200 bg-red-50 p-3">
              {error}
            </p>
          )}

          <button
            onClick={handleRegister}
            disabled={loading}
            className="w-full bg-[#5a5a5a] text-white py-4 text-xs tracking-widest font-bold hover:bg-[#4a4a4a] transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '登録中...' : '会員登録する'}
          </button>

          <p className="mt-6 text-[10px] text-[#a0a0a0] tracking-wide leading-relaxed">
            登録することで、利用規約・プライバシーポリシーに同意したものとみなします。
          </p>
        </div>
      </div>
    </div>
  );
};
