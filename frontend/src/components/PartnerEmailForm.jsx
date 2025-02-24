import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Button from './Button';

const PartnerEmailForm = ({ contractId, onSuccess }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const { user } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // E-posta doğrulama
        if (!email.trim()) {
            setError('E-posta adresi boş olamaz');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Geçerli bir e-posta adresi giriniz');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('http://localhost:5000/api/external-share/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({
                    contractId,
                    partnerEmail: email
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Sözleşme gönderilirken bir hata oluştu');
            }

            setSuccess('Sözleşme başarıyla gönderildi');
            setEmail('');
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
                <h2 className="card-title">Partner E-posta Adresi</h2>
                <p className="text-sm text-neutral/60">
                    Sözleşmeyi paylaşmak istediğiniz kişinin e-posta adresini girin
                </p>

                <form onSubmit={handleSubmit} className="mt-4">
                    <div className="form-control">
                        <div className="input-group">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="ornek@email.com"
                                className="input input-bordered w-full"
                                disabled={loading}
                            />
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="loading loading-spinner loading-sm"></span>
                                ) : (
                                    'Sözleşmeyi Gönder'
                                )}
                            </Button>
                        </div>
                    </div>

                    {error && (
                        <div className="alert alert-error mt-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className="alert alert-success mt-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{success}</span>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default PartnerEmailForm; 