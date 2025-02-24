import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Button from './Button';

const ReferralDashboard = () => {
    const [referralData, setReferralData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [copySuccess, setCopySuccess] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        fetchReferralData();
    }, [user.id]);

    const fetchReferralData = async () => {
        try {
            // Önce referral kodu al veya oluştur
            const codeResponse = await fetch('http://localhost:5000/api/referrals/generate', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });
            const codeData = await codeResponse.json();

            // Sonra istatistikleri al
            const statsResponse = await fetch(`http://localhost:5000/api/referrals/stats/${user.id}`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });
            const statsData = await statsResponse.json();

            setReferralData({
                ...codeData,
                ...statsData
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(referralData.referralLink);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        } catch (err) {
            setError('Link kopyalanırken bir hata oluştu');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center p-8">
                <span className="loading loading-spinner loading-lg"></span>
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

    const hasRewards = referralData?.summary?.paid_count > 0;

    return (
        <div className="space-y-6">
            {/* Referans Linki Kartı */}
            <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                    <h2 className="card-title">Referans Linkiniz</h2>
                    <p className="text-sm text-neutral/60 mb-4">
                        Bu linki paylaşarak arkadaşlarınızı davet edin ve ödüller kazanın!
                    </p>
                    <div className="join w-full">
                        <input
                            type="text"
                            value={referralData?.referralLink || ''}
                            readOnly
                            className="input input-bordered join-item w-full"
                        />
                        <Button
                            onClick={handleCopyLink}
                            className="join-item"
                            variant={copySuccess ? 'success' : 'primary'}
                        >
                            {copySuccess ? (
                                <span className="flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                    Kopyalandı!
                                </span>
                            ) : 'Linki Kopyala'}
                        </Button>
                    </div>
                </div>
            </div>

            {/* İstatistikler */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card bg-primary text-primary-content">
                    <div className="card-body">
                        <h2 className="card-title">Toplam Davet</h2>
                        <p className="text-3xl font-bold">
                            {referralData?.summary?.registered_count || 0}
                        </p>
                    </div>
                </div>
                <div className="card bg-secondary text-secondary-content">
                    <div className="card-body">
                        <h2 className="card-title">Ödeme Yapanlar</h2>
                        <p className="text-3xl font-bold">
                            {referralData?.summary?.paid_count || 0}
                        </p>
                    </div>
                </div>
                <div className="card bg-accent text-accent-content">
                    <div className="card-body">
                        <h2 className="card-title">Toplam Kazanç</h2>
                        <p className="text-3xl font-bold">
                            ${referralData?.summary?.total_rewards || '0.00'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Ödül Bildirimi */}
            {hasRewards && (
                <div className="alert alert-success">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                        <h3 className="font-bold">Tebrikler!</h3>
                        <div className="text-sm">%10 indirim kazandınız. Bir sonraki alışverişinizde kullanabilirsiniz.</div>
                    </div>
                </div>
            )}

            {/* Referans Tablosu */}
            <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                    <h2 className="card-title mb-4">Referans Geçmişi</h2>
                    <div className="overflow-x-auto">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Email</th>
                                    <th>Durum</th>
                                    <th>Kazanç</th>
                                    <th>Tarih</th>
                                </tr>
                            </thead>
                            <tbody>
                                {referralData?.referrals?.length > 0 ? (
                                    referralData.referrals.map((referral, index) => (
                                        <tr key={index}>
                                            <td>{referral.referred_email}</td>
                                            <td>
                                                <div className={`badge ${referral.status === 'paid' ? 'badge-success' :
                                                        referral.status === 'registered' ? 'badge-info' :
                                                            'badge-ghost'
                                                    }`}>
                                                    {referral.status === 'paid' ? 'Ödeme Yapıldı' :
                                                        referral.status === 'registered' ? 'Kayıt Oldu' :
                                                            'Beklemede'}
                                                </div>
                                            </td>
                                            <td>${referral.reward_amount}</td>
                                            <td>{new Date(referral.created_at).toLocaleDateString('tr-TR')}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="text-center text-neutral/60">
                                            Henüz hiç referans kaydınız yok
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReferralDashboard; 