import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/Button';

const Checkout = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState('card');
    const [timeLeft, setTimeLeft] = useState({
        hours: 23,
        minutes: 59,
        seconds: 59
    });

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev.seconds > 0) {
                    return { ...prev, seconds: prev.seconds - 1 };
                } else if (prev.minutes > 0) {
                    return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
                } else if (prev.hours > 0) {
                    return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
                }
                return { hours: 23, minutes: 59, seconds: 59 };
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const handlePayment = async (e) => {
        e.preventDefault();
        setLoading(true);
        // Burada ödeme işlemi gerçekleştirilecek
        setTimeout(() => {
            setLoading(false);
            navigate('/dashboard');
        }, 2000);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 py-12">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold text-center mb-8">Güvenli Ödeme</h1>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Sol Taraf - Ödeme Formu */}
                        <div className="space-y-6">
                            {/* Ödeme Yöntemleri */}
                            <div className="card bg-base-100 shadow-xl">
                                <div className="card-body">
                                    <h2 className="card-title mb-4">Ödeme Yöntemi</h2>
                                    <div className="space-y-3">
                                        <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-base-200 transition-colors">
                                            <input
                                                type="radio"
                                                name="payment"
                                                value="card"
                                                checked={selectedPayment === 'card'}
                                                onChange={(e) => setSelectedPayment(e.target.value)}
                                                className="radio radio-primary"
                                            />
                                            <span className="flex items-center gap-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                                </svg>
                                                Kredi/Banka Kartı
                                            </span>
                                        </label>

                                        <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-base-200 transition-colors">
                                            <input
                                                type="radio"
                                                name="payment"
                                                value="paypal"
                                                checked={selectedPayment === 'paypal'}
                                                onChange={(e) => setSelectedPayment(e.target.value)}
                                                className="radio radio-primary"
                                            />
                                            <span className="flex items-center gap-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                                </svg>
                                                PayPal
                                            </span>
                                        </label>

                                        <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-base-200 transition-colors">
                                            <input
                                                type="radio"
                                                name="payment"
                                                value="googlepay"
                                                checked={selectedPayment === 'googlepay'}
                                                onChange={(e) => setSelectedPayment(e.target.value)}
                                                className="radio radio-primary"
                                            />
                                            <span className="flex items-center gap-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                                </svg>
                                                Google Pay
                                            </span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Güvenlik Rozetleri */}
                            <div className="card bg-base-100 shadow-xl">
                                <div className="card-body">
                                    <div className="flex flex-wrap justify-center gap-4">
                                        <div className="badge badge-lg gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                            </svg>
                                            SSL Güvenli
                                        </div>
                                        <div className="badge badge-lg gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                            256-bit Şifreleme
                                        </div>
                                        <div className="badge badge-lg gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                            Stripe Güvenli Ödeme
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sağ Taraf - Sepet Özeti */}
                        <div className="space-y-6">
                            <div className="card bg-base-100 shadow-xl">
                                <div className="card-body">
                                    <h2 className="card-title mb-4">Sipariş Özeti</h2>

                                    <div className="bg-base-200 p-4 rounded-lg mb-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-medium">Love Contracts Premium</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm line-through text-neutral/60">$17.99</span>
                                                <span className="text-lg font-bold text-primary">$9.99</span>
                                            </div>
                                        </div>
                                        <p className="text-sm text-neutral/60">
                                            Tüm özelliklere sınırsız erişim
                                        </p>
                                    </div>

                                    <div className="flex justify-between items-center text-lg font-bold mb-4">
                                        <span>Toplam</span>
                                        <span className="text-primary">$9.99</span>
                                    </div>

                                    <div className="alert alert-warning mb-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                        <span>
                                            Bu fırsat yalnızca{' '}
                                            <span className="font-bold">
                                                {String(timeLeft.hours).padStart(2, '0')}:
                                                {String(timeLeft.minutes).padStart(2, '0')}:
                                                {String(timeLeft.seconds).padStart(2, '0')}
                                            </span>{' '}
                                            geçerli!
                                        </span>
                                    </div>

                                    <Button
                                        onClick={handlePayment}
                                        variant="primary"
                                        className="w-full py-4 text-lg font-semibold rounded-full bg-gradient-to-r from-primary to-accent"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <span className="loading loading-spinner loading-md"></span>
                                        ) : (
                                            'Şimdi Satın Al – Sadece $9.99!'
                                        )}
                                    </Button>

                                    <p className="text-center text-sm text-neutral/60 mt-4">
                                        Satın alma işleminiz Stripe & SSL şifreleme ile korunmaktadır
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout; 