import { useState, useEffect } from 'react';

const PartnerCommentsList = ({ contractId }) => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchComments = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/partner-comments/get/${contractId}`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Yorumlar yüklenirken bir hata oluştu');
                }

                setComments(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchComments();
    }, [contractId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center p-8">
                <span className="loading loading-spinner loading-md"></span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-error">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
            </div>
        );
    }

    if (comments.length === 0) {
        return (
            <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                    <div className="text-center text-neutral/60">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <p>Henüz hiç yorum yapılmamış</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
                <h2 className="card-title mb-4">Partner Yorumları</h2>
                <div className="space-y-4">
                    {comments.map((comment) => (
                        <div key={comment.id} className="bg-base-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="avatar placeholder">
                                        <div className="bg-primary text-white rounded-full w-8">
                                            <span className="text-xs">{comment.partner_email[0].toUpperCase()}</span>
                                        </div>
                                    </div>
                                    <span className="font-medium">{comment.partner_email}</span>
                                </div>
                                <span className="text-sm text-neutral/60">
                                    {new Date(comment.created_at).toLocaleDateString('tr-TR', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </span>
                            </div>
                            <p className="text-neutral/80 whitespace-pre-wrap">{comment.comment}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PartnerCommentsList; 