import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Button from './Button';
import { useEmailNotification } from './EmailNotification';

const InviteUserForm = ({ contractId }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [collaborators, setCollaborators] = useState([]);
    const { user } = useAuth();
    const { sendEmail, NotificationComponent } = useEmailNotification();

    // Ortakları getir
    const fetchCollaborators = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/collaborations/list/${contractId}`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Ortaklar listelenirken bir hata oluştu');
            }

            setCollaborators(data);
        } catch (err) {
            console.error('Ortakları getirme hatası:', err);
        }
    };

    useEffect(() => {
        fetchCollaborators();
    }, [contractId, user.token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            // Önce davet oluştur
            const response = await fetch('http://localhost:5000/api/collaborations/invite', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({
                    contractId,
                    invitedEmail: email
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Davet gönderilirken bir hata oluştu');
            }

            // Davet e-postası gönder
            await sendEmail({
                to: email,
                type: 'invitation',
                contractId
            });

            setSuccess('Davet başarıyla gönderildi');
            setEmail('');
            fetchCollaborators(); // Ortakları yeniden yükle
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mt-8">
            <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                    <h2 className="card-title mb-4">Ortak Davet Et</h2>

                    {/* Davet Formu */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Email Adresi</span>
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="ornek@email.com"
                                    className="input input-bordered flex-1"
                                    required
                                />
                                <Button
                                    type="submit"
                                    variant="primary"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <span className="loading loading-spinner loading-sm"></span>
                                    ) : (
                                        'Davet Gönder'
                                    )}
                                </Button>
                            </div>
                        </div>
                    </form>

                    {/* Başarı Mesajı */}
                    {success && (
                        <div className="alert alert-success mt-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{success}</span>
                        </div>
                    )}

                    {/* Hata Mesajı */}
                    {error && (
                        <div className="alert alert-error mt-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Ortaklar Listesi */}
                    <div className="divider">Ortaklar</div>
                    <div className="space-y-2">
                        {collaborators.map((collaborator) => (
                            <div
                                key={collaborator.id}
                                className="flex items-center justify-between p-3 bg-base-200 rounded-lg"
                            >
                                <div>
                                    <p className="font-medium">{collaborator.invited_user_email}</p>
                                    <p className="text-sm text-neutral/60">
                                        {new Date(collaborator.created_at).toLocaleDateString('tr-TR', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </p>
                                </div>
                                <div className="badge badge-primary">
                                    {collaborator.status === 'pending' ? 'Bekliyor' : 'Kabul Edildi'}
                                </div>
                            </div>
                        ))}

                        {collaborators.length === 0 && (
                            <div className="text-center py-4 text-neutral/60">
                                Henüz hiç ortak eklenmemiş
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Email Bildirimi */}
            {NotificationComponent}
        </div>
    );
};

export default InviteUserForm; 