import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/Button';

const Templates = () => {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/templates', {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    }
                });
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Şablonlar yüklenirken bir hata oluştu');
                }

                setTemplates(data);
            } catch (err) {
                setError(err.message);
                console.error('Şablon yükleme hatası:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchTemplates();
    }, [user.token]);

    const handleUseTemplate = (template) => {
        navigate('/create-contract', {
            state: {
                template: {
                    title: template.title,
                    content: template.content
                }
            }
        });
    };

    const categories = ['all', ...new Set(templates.map(t => t.category || 'other'))];
    const filteredTemplates = selectedCategory === 'all'
        ? templates
        : templates.filter(t => t.category === selectedCategory);

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

    return (
        <div className="min-h-screen bg-base-200 py-8">
            <div className="container mx-auto px-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Sözleşme Şablonları</h1>
                        <p className="text-base-content/60">
                            Hazır şablonlardan birini seçerek hızlıca sözleşme oluşturun
                        </p>
                    </div>
                    <Button
                        variant="primary"
                        onClick={() => navigate('/create-contract')}
                    >
                        Yeni Sözleşme Oluştur
                    </Button>
                </div>

                {/* Kategori Seçimi */}
                <div className="tabs tabs-boxed mb-6">
                    {categories.map(category => (
                        <button
                            key={category}
                            className={`tab ${selectedCategory === category ? 'tab-active' : ''}`}
                            onClick={() => setSelectedCategory(category)}
                        >
                            {category === 'all' ? 'Tümü' : category.charAt(0).toUpperCase() + category.slice(1)}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTemplates.map((template) => (
                        <div key={template.id} className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
                            <div className="card-body">
                                <div className="flex items-start justify-between">
                                    <h2 className="card-title text-lg">{template.title}</h2>
                                    {template.category && (
                                        <div className="badge badge-primary">{template.category}</div>
                                    )}
                                </div>
                                <p className="text-base-content/60 line-clamp-3 mt-2">{template.description}</p>
                                <div className="card-actions justify-end mt-4">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleUseTemplate(template)}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                                        </svg>
                                        Bu Şablonu Kullan
                                    </Button>
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={() => navigate(`/templates/${template.id}/edit`)}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        Düzenle
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {filteredTemplates.length === 0 && (
                        <div className="col-span-full card bg-base-100 shadow-xl">
                            <div className="card-body items-center text-center py-12">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-base-content/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <h3 className="text-lg font-semibold mt-4">Henüz hiç şablon eklenmemiş</h3>
                                <p className="text-base-content/60 mt-2">
                                    {selectedCategory === 'all'
                                        ? 'Şu anda kullanılabilir şablon bulunmuyor.'
                                        : `${selectedCategory} kategorisinde henüz şablon bulunmuyor.`}
                                </p>
                                <Button
                                    variant="primary"
                                    className="mt-4"
                                    onClick={() => navigate('/create-contract')}
                                >
                                    Yeni Şablon Oluştur
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Templates; 