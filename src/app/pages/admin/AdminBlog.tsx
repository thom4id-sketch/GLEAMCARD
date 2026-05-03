import { useState, useRef } from 'react';
import { Send, CheckCircle, Upload } from 'lucide-react';
import { api } from '../../lib/api';

export const AdminBlog = () => {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !imageFile) return;

    setLoading(true);
    setError('');
    try {
      const form = new FormData();
      form.append('title', title.trim());
      if (url.trim()) form.append('linkUrl', url.trim());
      form.append('image', imageFile);

      await api.postForm('/api/admin/posts', form);

      setTitle('');
      setUrl('');
      setImageFile(null);
      setImagePreview('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '投稿に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-5 h-full flex flex-col overflow-y-auto bg-[#f8f9fa] font-sans">
      <h2 className="text-xs font-bold text-[#5a5a5a] border-b border-[#d0d0d0] pb-3 mb-6 tracking-widest flex items-center">
        イベント・ニュース投稿
      </h2>

      {success && (
        <div className="bg-white border border-[#5a5a5a] text-[#5a5a5a] p-4 flex items-center space-x-3 mb-6 text-xs font-bold tracking-wide">
          <CheckCircle className="w-5 h-5 stroke-1" />
          <span>投稿が完了しました</span>
        </div>
      )}

      {error && (
        <div className="border border-red-200 bg-red-50 text-red-600 p-4 mb-6 text-xs tracking-wide">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col space-y-6 pb-10">
        <div>
          <label className="block text-[11px] font-bold text-[#7a7a7a] tracking-widest mb-2">
            画像データ <span className="text-red-500">*</span>
          </label>
          <div
            className="border border-dashed border-[#a0a0a0] bg-[#f8f9fa] p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-[#ececec] transition relative overflow-hidden min-h-[160px]"
            onClick={() => fileInputRef.current?.click()}
          >
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <>
                <Upload className="w-8 h-8 text-[#a0a0a0] mb-2 stroke-1" />
                <span className="text-[11px] text-[#7a7a7a] font-bold tracking-widest">タップして画像を選択</span>
                <span className="text-[10px] text-[#a0a0a0] mt-1 tracking-wider">JPEG / PNG / WebP</span>
              </>
            )}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImageChange}
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-[#7a7a7a] tracking-widest mb-2">
            タイトル <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full border border-[#d0d0d0] bg-white px-3 py-3 text-sm focus:outline-none focus:border-[#5a5a5a] text-[#4a4a4a] transition-colors"
            placeholder="例: 【博多店】 2026SS 新作トランクショー開催"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-[#7a7a7a] tracking-widest mb-2">
            リンク先URL <span className="text-[#a0a0a0] font-normal">（任意）</span>
          </label>
          <input
            type="url"
            value={url}
            onChange={e => setUrl(e.target.value)}
            className="w-full border border-[#d0d0d0] bg-white px-3 py-3 text-sm focus:outline-none focus:border-[#5a5a5a] text-[#4a4a4a] transition-colors"
            placeholder="https://example.com/news/123"
          />
        </div>

        <div className="pt-6 mt-auto">
          <button
            type="submit"
            disabled={loading || !title.trim() || !imageFile}
            className="w-full bg-[#5a5a5a] text-white py-4 text-xs tracking-widest font-bold flex items-center justify-center space-x-2 hover:bg-[#4a4a4a] transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4 stroke-1" />
            <span>{loading ? '投稿中...' : '投稿して更新する'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
