import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import PartnerCommentForm from "../components/PartnerCommentForm";

const PartnerApproval = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [contract, setContract] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isApproved, setIsApproved] = useState(false);

    useEffect(() => {
        const fetchContract = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/external-approval/view/${token}`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Sözleşme yüklenirken bir hata oluştu');
                }

                setContract(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchContract();
    }, [token]);

    const handleApprove = async () => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:5000/api/external-approval/approve/${token}`, {
                method: 'POST'
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Sözleşme onaylanırken bir hata oluştu');
            }

            setSuccess('Sözleşmeyi başarıyla onayladınız');
            setIsApproved(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async () => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:5000/api/external-approval/reject/${token}`, {
                method: 'POST'
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Sözleşme reddedilirken bir hata oluştu');
            }

            setSuccess('Sözleşmeyi reddettiniz');
            setTimeout(() => {
                navigate('/');
            }, 2000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="alert alert-error">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{error}</span>
                </div>
            </div>
        );
    }

    if (!contract) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="alert alert-warning">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>Sözleşme bulunamadı</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-3xl mx-auto">
                {success ? (
                    <div className="alert alert-success mb-8">
                        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{success}</span>
                    </div>
                ) : (
                    <div className="card bg-base-100 shadow-xl mb-8">
                        <div className="card-body">
                            <h2 className="card-title text-2xl mb-4">{contract.title}</h2>
                            <p className="text-sm text-neutral/60 mb-4">
                                Gönderen: {contract.ownerEmail}
                            </p>
                            <div className="prose max-w-none mb-6">
                                <p className="whitespace-pre-wrap">{contract.content}</p>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button
                                    variant="error"
                                    onClick={handleReject}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <span className="loading loading-spinner loading-sm"></span>
                                    ) : (
                                        'Reddet'
                                    )}
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={handleApprove}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <span className="loading loading-spinner loading-sm"></span>
                                    ) : (
                                        'Onayla'
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Sözleşme onaylandıktan sonra yorum formunu göster */}
                {isApproved && (
                    <PartnerCommentForm
                        contractId={contract.id}
                        partnerEmail={contract.partnerEmail}
                        onSuccess={() => {
                            setTimeout(() => {
                                navigate('/');
                            }, 2000);
                        }}
                    />
                )}
            </div>
        </div>
    );
};

export default PartnerApproval; 