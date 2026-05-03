import { useState, useRef, useEffect } from 'react';
import { Send, CheckCircle, Upload, Pencil, Trash2, X } from 'lucide-react';
import { api } from '../../lib/api';

interface PostItem {
  id: number;
  title: string;
  imageData: string;
  linkUrl: string | null;
  createdAt: string;
}

export const AdminBlog = () => {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  // 投稿フォーム
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 編集モード
  const [editingPost, setEditingPost] = useState<PostItem | null>(null);

  const fetchPosts = async () => {
    try {
      const data = await api.get<{ content: PostItem[] }>('/api/posts?size=50');
      setPosts(data.content);
    } catch {
      // 取得失敗は無視
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => { fetchPosts(); }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const resetForm = () => {
    setTitle('');
    setUrl('');
    setImageFile(null);
    setImagePreview('');
    setEditingPost(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const startEdit = (post: PostItem) => {
    setEditingPost(post);
    setTitle(post.title);
    setUrl(post.linkUrl ?? '');
    setImagePreview(post.imageData);
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    if (!editingPost && !imageFile) return;

    setLoading(true);
    setError('');
    try {
      const form = new FormData();
      form.append('title', title.trim());
      if (url.trim()) form.append('linkUrl', url.trim());
      if (imageFile) form.append('image', imageFile);

      if (editingPost) {
        await api.postForm(`/api/admin/posts/${editingPost.id}`, form, 'PUT');
      } else {
        await api.postForm('/api/admin/posts', form);
      }

      resetForm();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      fetchPosts();
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (post: PostItem) => {
    if (!confirm(`「${post.title}」を削除しますか？`)) return;
    try {
      await api.delete(`/api/admin/posts/${post.id}`);
      fetchPosts();
    } catch {
      setError('削除に失敗しました');
    }
  };

  return (
    <div className="p-5 h-full flex flex-col overflow-y-auto bg-[#f8f9fa] font-sans pb-20">
      <h2 className="text-xs font-bold text-[#5a5a5a] border-b border-[#d0d0d0] pb-3 mb-6 tracking-widest">
        イベント・ニュース投稿
      </h2>

      {success && (
        <div className="bg-white border border-[#5a5a5a] text-[#5a5a5a] p-4 flex items-center space-x-3 mb-6 text-xs font-bold tracking-wide">
          <CheckCircle className="w-5 h-5 stroke-1" />
          <span>{editingPost ? '更新' : '投稿'}が完了しました</span>
        </div>
      )}
      {error && (
        <div className="border border-red-200 bg-red-50 text-red-600 p-4 mb-6 text-xs tracking-wide">
          {error}
        </div>
      )}

      {/* 投稿フォーム */}
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4 mb-10">
        {editingPost && (
          <div className="flex items-center justify-between bg-[#5a5a5a] text-white px-3 py-2 text-[11px] tracking-widest">
            <span>編集中: {editingPost.title}</span>
            <button type="button" onClick={resetForm}><X className="w-4 h-4" /></button>
          </div>
        )}

        <div>
          <label className="block text-[11px] font-bold text-[#7a7a7a] tracking-widest mb-2">
            画像 {!editingPost && <span className="text-red-500">*</span>}
            {editingPost && <span className="text-[#a0a0a0] font-normal">（変更する場合のみ選択）</span>}
          </label>
          <div
            className="border border-dashed border-[#a0a0a0] bg-[#f8f9fa] p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-[#ececec] transition relative overflow-hidden min-h-[140px]"
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
            <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" ref={fileInputRef} onChange={handleImageChange} />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-[#7a7a7a] tracking-widest mb-2">
            タイトル <span className="text-red-500">*</span>
          </label>
          <input
            type="text" required value={title} onChange={e => setTitle(e.target.value)}
            className="w-full border border-[#d0d0d0] bg-white px-3 py-3 text-sm focus:outline-none focus:border-[#5a5a5a] text-[#4a4a4a]"
            placeholder="例: 2026SS 新作トランクショー開催"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-[#7a7a7a] tracking-widest mb-2">
            リンク先URL <span className="text-[#a0a0a0] font-normal">（任意）</span>
          </label>
          <input
            type="url" value={url} onChange={e => setUrl(e.target.value)}
            className="w-full border border-[#d0d0d0] bg-white px-3 py-3 text-sm focus:outline-none focus:border-[#5a5a5a] text-[#4a4a4a]"
            placeholder="https://example.com"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !title.trim() || (!editingPost && !imageFile)}
          className="w-full bg-[#5a5a5a] text-white py-4 text-xs tracking-widest font-bold flex items-center justify-center space-x-2 hover:bg-[#4a4a4a] transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4 stroke-1" />
          <span>{loading ? '処理中...' : editingPost ? '更新する' : '投稿する'}</span>
        </button>
      </form>

      {/* 投稿一覧 */}
      <h3 className="text-[11px] font-bold text-[#7a7a7a] tracking-widest border-b border-[#d0d0d0] pb-2 mb-4">
        投稿一覧
      </h3>
      {loadingPosts ? (
        <p className="text-[11px] text-[#a0a0a0] tracking-widest text-center py-6">読み込み中...</p>
      ) : posts.length === 0 ? (
        <p className="text-[11px] text-[#a0a0a0] tracking-widest text-center py-6">投稿がありません</p>
      ) : (
        <div className="flex flex-col space-y-3">
          {posts.map(post => (
            <div key={post.id} className="bg-white border border-[#e0e0e0] flex items-center space-x-3 p-3">
              <img src={post.imageData} alt={post.title} className="w-16 h-12 object-cover flex-shrink-0 border border-[#e0e0e0]" />
              <p className="flex-1 text-xs text-[#4a4a4a] line-clamp-2">{post.title}</p>
              <div className="flex space-x-2 flex-shrink-0">
                <button onClick={() => startEdit(post)} className="p-2 text-[#7a7a7a] hover:text-[#4a4a4a] transition">
                  <Pencil className="w-4 h-4 stroke-1" />
                </button>
                <button onClick={() => handleDelete(post)} className="p-2 text-red-400 hover:text-red-600 transition">
                  <Trash2 className="w-4 h-4 stroke-1" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
