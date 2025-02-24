import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';

const Home = () => {
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

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-primary/5 to-secondary/5">
            <div className="container mx-auto px-4 py-12">
                <div className="max-w-4xl mx-auto">
                    {/* Hero Section */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-6xl font-bold text-neutral mb-6 leading-tight">
                            İlişkinizi Güvence Altına Alın
                            <span className="text-primary block">Şimdi Özel Teklif!</span>
                        </h1>
                        <p className="text-lg md:text-xl text-neutral/80 max-w-2xl mx-auto mb-8">
                            İlişkinizde net kurallar belirleyin, sadakati güçlendirin ve anlaşmazlıkları en aza indirin.
                            <span className="block mt-2 font-medium">
                                Love Contracts ile ilişkinizi resmileştirin, huzuru ve güveni artırın.
                            </span>
                        </p>
                    </div>

                    {/* Pricing Section */}
                    <div className="card bg-base-100 shadow-xl mb-12">
                        <div className="card-body text-center">
                            <div className="badge badge-secondary gap-2 mx-auto mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Sınırlı Süreli İndirim
                            </div>
                            <div className="flex justify-center items-center gap-4 mb-4">
                                <span className="text-2xl line-through text-neutral/60">$17.99</span>
                                <span className="text-4xl font-bold text-primary">$9.99</span>
                            </div>
                            <div className="flex justify-center items-center gap-2 text-error">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>
                                    Bu fiyat yalnızca{' '}
                                    <span className="font-bold">
                                        {String(timeLeft.hours).padStart(2, '0')}:
                                        {String(timeLeft.minutes).padStart(2, '0')}:
                                        {String(timeLeft.seconds).padStart(2, '0')}
                                    </span>{' '}
                                    geçerlidir!
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Features Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                        <div className="card bg-base-100 shadow-xl">
                            <div className="card-body">
                                <h3 className="card-title text-xl mb-4">Öne Çıkan Avantajlar</h3>
                                <ul className="space-y-4">
                                    <li className="flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>Sözleşme Şablonları ile Kolay Kullanım</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>Partnerinizle Ortak Onay ve Güven</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>PDF Olarak Kaydetme ve Paylaşma</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>Sadece Bir Kez Öde, Ömür Boyu Kullan!</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="card bg-base-100 shadow-xl">
                            <div className="card-body">
                                <h3 className="card-title text-xl mb-4">
                                    <span className="flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                        </svg>
                                        Kullanıcı Yorumları
                                    </span>
                                    <span className="badge badge-primary">1000+ çift</span>
                                </h3>
                                <div className="space-y-4">
                                    <div className="bg-base-200 p-4 rounded-lg">
                                        <div className="flex text-warning mb-2">
                                            ⭐⭐⭐⭐⭐
                                        </div>
                                        <p className="italic">"Bu sözleşme sayesinde partnerimle hiç olmadığı kadar net anlaştık!"</p>
                                        <p className="text-sm text-neutral/60 mt-2">– Ayşe K.</p>
                                    </div>
                                    <div className="bg-base-200 p-4 rounded-lg">
                                        <div className="flex text-warning mb-2">
                                            ⭐⭐⭐⭐⭐
                                        </div>
                                        <p className="italic">"Anlaşmazlıklarımızı önlemek için harika bir araç!"</p>
                                        <p className="text-sm text-neutral/60 mt-2">– John D.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link to="/register" className="w-full sm:w-auto">
                            <Button
                                variant="primary"
                                size="lg"
                                className="w-full sm:w-auto px-8 py-4 rounded-full font-semibold text-lg bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 transition-all duration-300"
                            >
                                Şimdi Satın Al – Sadece $9.99!
                            </Button>
                        </Link>
                        <Link to="/templates" className="w-full sm:w-auto">
                            <Button
                                variant="outline"
                                size="lg"
                                className="w-full sm:w-auto px-8 py-4 rounded-full font-semibold text-lg hover:bg-base-200 transition-all duration-300"
                            >
                                Hazır Şablonlardan Seç
                            </Button>
                        </Link>
                        <Link to="/login" className="w-full sm:w-auto">
                            <Button
                                variant="ghost"
                                size="lg"
                                className="w-full sm:w-auto px-8 py-4 rounded-full font-semibold text-lg hover:bg-base-200 transition-all duration-300"
                            >
                                Daha Fazla Bilgi Al
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home; 