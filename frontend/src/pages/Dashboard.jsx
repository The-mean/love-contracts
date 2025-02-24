import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/Button';
import ReferralDashboard from '../components/ReferralDashboard';

const Dashboard = () => {
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('contracts');
    const { user } = useAuth();

    useEffect(() => {
        const fetchContracts = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/contracts', {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    }
                });
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Sözleşmeler yüklenirken bir hata oluştu');
                }

                setContracts(data);
            } catch (err) {
                setError(err.message);
                console.error('Sözleşme yükleme hatası:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchContracts();
    }, [user.token]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Üst Başlık ve Butonlar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <div className="flex flex-col sm:flex-row gap-2">
                    <Link to="/create-contract">
                        <Button variant="primary">Yeni Sözleşme Oluştur</Button>
                    </Link>
                    <Link to="/templates">
                        <Button variant="ghost">Şablonlardan Seç</Button>
                    </Link>
                </div>
            </div>

            {/* Tab Menüsü */}
            <div className="tabs tabs-boxed mb-6">
                <button
                    className={`tab ${activeTab === 'contracts' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('contracts')}
                >
                    Sözleşmelerim
                </button>
                <button
                    className={`tab ${activeTab === 'referrals' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('referrals')}
                >
                    Referans Programı
                </button>
            </div>

            {error && (
                <div className="alert alert-error mb-8">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{error}</span>
                </div>
            )}

            {/* Tab İçerikleri */}
            {activeTab === 'contracts' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {contracts.map((contract) => (
                        <div key={contract.id} className="card bg-base-100 shadow-xl">
                            <div className="card-body">
                                <h2 className="card-title">{contract.title}</h2>
                                <div className="flex gap-2 my-2">
                                    <div className={`badge ${contract.status === 'pending' ? 'badge-warning' : contract.status === 'accepted' ? 'badge-success' : 'badge-error'}`}>
                                        {contract.status === 'pending' ? 'Bekliyor' : contract.status === 'accepted' ? 'Kabul Edildi' : 'Reddedildi'}
                                    </div>
                                    {contract.partner_email && (
                                        <div className="badge badge-neutral">
                                            Partner: {contract.partner_email}
                                        </div>
                                    )}
                                </div>
                                <p className="text-sm text-neutral/60">
                                    {new Date(contract.created_at).toLocaleDateString('tr-TR', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                    })}
                                </p>
                                <div className="card-actions justify-end mt-4">
                                    <Link to={`/contracts/${contract.id}`}>
                                        <Button variant="ghost" size="sm">Görüntüle</Button>
                                    </Link>
                                    <Link to={`/contracts/${contract.id}/edit`}>
                                        <Button variant="primary" size="sm">Düzenle</Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}

                    {contracts.length === 0 && (
                        <div className="col-span-full text-center py-12 text-neutral/60">
                            Henüz hiç sözleşme oluşturmadınız
                        </div>
                    )}
                </div>
            ) : (
                <ReferralDashboard />
            )}
        </div>
    );
};

export default Dashboard; 