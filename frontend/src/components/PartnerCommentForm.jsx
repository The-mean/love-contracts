import { useState } from 'react';
import Button from './Button';

const PartnerCommentForm = ({ contractId, partnerEmail, onSuccess }) => {
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!comment.trim()) {
            setError('Lütfen bir yorum yazın');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('http://localhost:5000/api/partner-comments/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contractId,
                    partnerEmail,
                    comment
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Yorum eklenirken bir hata oluştu');
            }

            setSuccess('Yorumunuz başarıyla eklendi');
            setComment('');
            if (onSuccess) onSuccess();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
                <h2 className="card-title">Sözleşme Hakkında Görüşünüz</h2>
                <p className="text-sm text-neutral/60">
                    Sözleşmeyi onayladıktan sonra görüşlerinizi paylaşabilirsiniz
                </p>

                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <div className="form-control">
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Görüşlerinizi buraya yazın..."
                            className="textarea textarea-bordered min-h-[120px]"
                            disabled={loading}
                        />
                    </div>

                    {error && (
                        <div className="alert alert-error">
                            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className="alert alert-success">
                            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{success}</span>
                        </div>
                    )}

                    <div className="flex justify-end">
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
            </div>
        </div>
    );
};

export default PartnerCommentForm; 