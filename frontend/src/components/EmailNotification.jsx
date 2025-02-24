import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const EmailNotification = ({ onClose }) => {
    const [notification, setNotification] = useState(null);
    const { user } = useAuth();

    // E-posta gönderme fonksiyonu
    const sendEmail = async ({ to, type, contractId }) => {
        try {
            const response = await fetch('http://localhost:5000/api/notifications/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({ to, type, contractId })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'E-posta gönderilirken bir hata oluştu');
            }

            showNotification('success', 'E-posta başarıyla gönderildi');
            return true;
        } catch (err) {
            showNotification('error', err.message);
            return false;
        }
    };

    // Bildirim gösterme fonksiyonu
    const showNotification = (type, message) => {
        setNotification({ type, message });

        // 5 saniye sonra bildirimi kaldır
        setTimeout(() => {
            setNotification(null);
            if (onClose) onClose();
        }, 5000);
    };

    // Bildirimi manuel olarak kapat
    const handleClose = () => {
        setNotification(null);
        if (onClose) onClose();
    };

    if (!notification) return null;

    return (
        <div className="toast toast-top toast-end">
            <div className={`alert ${notification.type === 'success' ? 'alert-success' : 'alert-error'}`}>
                <div className="flex items-center gap-2">
                    {notification.type === 'success' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    )}
                    <span>{notification.message}</span>
                    <button onClick={handleClose} className="btn btn-ghost btn-xs">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

// Hook olarak kullanım için
export const useEmailNotification = () => {
    const [notificationComponent, setNotificationComponent] = useState(null);
    const { user } = useAuth();

    const sendEmail = async ({ to, type, contractId }) => {
        try {
            const response = await fetch('http://localhost:5000/api/notifications/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({ to, type, contractId })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'E-posta gönderilirken bir hata oluştu');
            }

            setNotificationComponent(
                <EmailNotification
                    onClose={() => setNotificationComponent(null)}
                />
            );

            return true;
        } catch (err) {
            setNotificationComponent(
                <EmailNotification
                    onClose={() => setNotificationComponent(null)}
                />
            );
            return false;
        }
    };

    return {
        sendEmail,
        NotificationComponent: notificationComponent
    };
};

export default EmailNotification; 