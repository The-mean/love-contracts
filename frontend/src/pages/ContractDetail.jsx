import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/Button';
import CommentSection from "../components/CommentSection";
import PartnerEmailForm from "../components/PartnerEmailForm";
import ContractStatus from "../components/ContractStatus";
import PartnerCommentsList from "../components/PartnerCommentsList";

const ContractDetail = () => {
    const { id } = useParams();
    const [contract, setContract] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useAuth();

    useEffect(() => {
        const fetchContract = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/contracts/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    }
                });
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
    }, [id, user.token]);

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
            <div className="space-y-8">
                {/* Sözleşme Detayları */}
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title text-2xl mb-4">{contract.title}</h2>

                        <div className="mb-6">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="badge badge-primary">{contract.status}</div>
                                {contract.partner_email && (
                                    <div className="badge badge-neutral">
                                        Partner: {contract.partner_email}
                                    </div>
                                )}
                                {contract.partner_email && (
                                    <ContractStatus contractId={id} />
                                )}
                            </div>
                        </div>

                        <div className="prose max-w-none mb-6">
                            <p className="whitespace-pre-wrap">{contract.content}</p>
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button variant="ghost">Düzenle</Button>
                            <Button variant="error">Sil</Button>
                        </div>
                    </div>
                </div>

                {/* Partner Email Form */}
                {!contract.partner_email && (
                    <PartnerEmailForm
                        contractId={id}
                        onSuccess={() => {
                            window.location.reload();
                        }}
                    />
                )}

                {/* Partner Yorumları */}
                {contract.partner_email && contract.partner_approval_status === 'approved' && (
                    <PartnerCommentsList contractId={contract.id} />
                )}

                {/* Yorum Bölümü */}
                <CommentSection contractId={id} />
            </div>
        </div>
    );
};

export default ContractDetail; 