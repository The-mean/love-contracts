import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const ContractStatus = ({ contractId }) => {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useAuth();

    const fetchStatus = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/contracts/${contractId}`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Sözleşme durumu alınamadı');
            }

            setStatus(data.partner_approval_status);
            setError('');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();

        // Her 30 saniyede bir durumu güncelle
        const interval = setInterval(fetchStatus, 30000);

        return () => clearInterval(interval);
    }, [contractId, user.token]);

    if (loading) {
        return (
            <div className="flex items-center gap-2">
                <span className="loading loading-spinner loading-sm"></span>
                <span className="text-neutral/60">Durum yükleniyor...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-error text-sm flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2">
            {status === 'approved' ? (
                <>
                    <div className="badge badge-success gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Onaylandı
                    </div>
                    <span className="text-sm text-success">Partner sözleşmeyi onayladı</span>
                </>
            ) : (
                <>
                    <div className="badge badge-warning gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Bekleniyor
                    </div>
                    <span className="text-sm text-warning">Partner onayı bekleniyor</span>
                </>
            )}

            <button
                onClick={fetchStatus}
                className="btn btn-ghost btn-xs"
                title="Durumu güncelle"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
            </button>
        </div>
    );
};

export default ContractStatus; 