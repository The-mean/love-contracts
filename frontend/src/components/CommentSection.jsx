import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Button from './Button';

const CommentSection = ({ contractId }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { user } = useAuth();

    // Yorumları API'den çek
    const fetchComments = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/comments/${contractId}`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Yorumlar yüklenirken bir hata oluştu');
            }
            setComments(data);
        } catch (err) {
            setError('Yorumlar yüklenirken bir hata oluştu');
            console.error('Yorum yükleme hatası:', err);
        }
    };

    // Component mount olduğunda yorumları çek
    useEffect(() => {
        fetchComments();
    }, [contractId]);

    // Yeni yorum ekle
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:5000/api/comments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({
                    contractId,
                    content: newComment
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Yorum eklenirken bir hata oluştu');
            }

            setNewComment('');
            fetchComments(); // Yorumları yeniden yükle
        } catch (err) {
            setError('Yorum eklenirken bir hata oluştu');
            console.error('Yorum ekleme hatası:', err);
        } finally {
            setLoading(false);
        }
    };

    // Yorum sil
    const handleDeleteComment = async (commentId) => {
        if (!window.confirm('Bu yorumu silmek istediğinizden emin misiniz?')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/comments/${commentId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Yorum silinirken bir hata oluştu');
            }

            fetchComments(); // Yorumları yeniden yükle
        } catch (err) {
            setError('Yorum silinirken bir hata oluştu');
            console.error('Yorum silme hatası:', err);
        }
    };

    return (
        <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">Yorumlar</h3>

            {/* Yorum Ekleme Formu */}
            <form onSubmit={handleSubmit} className="mb-6">
                <div className="form-control">
                    <textarea
                        className="textarea textarea-bordered h-24"
                        placeholder="Yorumunuzu yazın..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        required
                    />
                </div>
                <div className="mt-2">
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="loading loading-spinner loading-sm"></span>
                        ) : (
                            'Yorum Ekle'
                        )}
                    </Button>
                </div>
            </form>

            {/* Hata Mesajı */}
            {error && (
                <div className="alert alert-error mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{error}</span>
                </div>
            )}

            {/* Yorumlar Listesi */}
            <div className="space-y-4">
                {comments.map((comment) => (
                    <div key={comment.id} className="card bg-base-100 shadow-sm">
                        <div className="card-body py-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-neutral/60">
                                        {new Date(comment.created_at).toLocaleDateString('tr-TR', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                    <p className="mt-2">{comment.content}</p>
                                </div>
                                {comment.user_id === user.id && (
                                    <button
                                        className="btn btn-ghost btn-sm text-error"
                                        onClick={() => handleDeleteComment(comment.id)}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {comments.length === 0 && (
                    <div className="text-center py-8 text-neutral/60">
                        Henüz yorum yapılmamış
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommentSection; 