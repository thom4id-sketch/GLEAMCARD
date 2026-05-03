import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserPlus, Gift } from 'lucide-react';

export const RegisterPage = () => {
  const { completeRegistration } = useAuth();
  const [name, setName] = useState('');
  const [nameKana, setNameKana] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const hasInvitation = new URLSearchParams(window.location.search).has('inv');

  const isHiragana = (str: string) => /^[ぁ-ゖー\s　]+$/.test(str);

  const isFormValid = name.trim() && nameKana.trim() && isHiragana(nameKana.trim());

  const handleRegister = async () => {
    if (!isFormValid) return;
    if (!isHiragana(nameKana.trim())) {
      setError('ふりがなはひらがなで入力してください');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await completeRegistration(name.trim(), nameKana.trim());
    } catch (e) {
      setError(e instanceof Error ? e.message : '登録に失敗しました。もう一度お試しください。');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen max-w-md mx-auto flex items-center justify-center bg-[#f8f9fa] p-6">
      <div className="w-full bg-white border border-[#d0d0d0] shadow-sm">
        <div className="bg-[#5a5a5a] p-6 text-center">
          <h1 className="text-white text-xs tracking-[0.4em] font-serif uppercase">Gleam</h1>
        </div>

        <div className="p-8">
          <div className="flex justify-center mb-6">
            <div className="inline-flex bg-[#ececec] p-5 border border-[#d0d0d0]">
              <UserPlus className="w-8 h-8 text-[#5a5a5a] stroke-1" />
            </div>
          </div>

          <h2 className="text-sm font-bold text-[#4a4a4a] tracking-widest mb-4 uppercase font-serif text-center">
            Membership Registration
          </h2>

          <p className="text-xs text-[#7a7a7a] mb-6 tracking-wider leading-relaxed">
            Gleamメンバーズカードへようこそ。
            お名前を登録することで、ポイントの管理やクーポンの受け取りができます。
          </p>

          {hasInvitation && (
            <div className="bg-[#f8f9fa] border border-[#d0d0d0] p-4 mb-6 flex items-start space-x-3">
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

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-[11px] font-bold text-[#7a7a7a] tracking-widest mb-2">
                氏名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="例: 山田 太郎"
                className="w-full border border-[#d0d0d0] bg-white px-3 py-3 text-sm focus:outline-none focus:border-[#5a5a5a] text-[#4a4a4a] transition-colors"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#7a7a7a] tracking-widest mb-2">
                ふりがな <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={nameKana}
                onChange={e => setNameKana(e.target.value)}
                placeholder="例: やまだ たろう"
                className={`w-full border bg-white px-3 py-3 text-sm focus:outline-none text-[#4a4a4a] transition-colors ${
                  nameKana && !isHiragana(nameKana)
                    ? 'border-red-300 focus:border-red-400'
                    : 'border-[#d0d0d0] focus:border-[#5a5a5a]'
                }`}
              />
              {nameKana && !isHiragana(nameKana) && (
                <p className="text-[10px] text-red-500 mt-1 tracking-wide">ひらがなで入力してください</p>
              )}
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-500 mb-4 tracking-wide border border-red-200 bg-red-50 p-3">
              {error}
            </p>
          )}

          <button
            onClick={handleRegister}
            disabled={loading || !isFormValid}
            className="w-full bg-[#5a5a5a] text-white py-4 text-xs tracking-widest font-bold hover:bg-[#4a4a4a] transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '登録中...' : '会員登録する'}
          </button>

          <p className="mt-6 text-[10px] text-[#a0a0a0] tracking-wide leading-relaxed text-center">
            登録することで、利用規約・プライバシーポリシーに同意したものとみなします。
          </p>
        </div>
      </div>
    </div>
  );
};
