import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import Button from '../components/Button';
import AdvancedEditor from "../components/AdvancedEditor";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const CreateContract = () => {
    const location = useLocation();
    const templateData = location.state?.template;

    const [formData, setFormData] = useState({
        title: templateData?.title || '',
        content: templateData?.content || '',
        partnerEmail: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { user } = useAuth();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleContentChange = (content) => {
        setFormData(prev => ({
            ...prev,
            content
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await api.contracts.create(formData, user.token);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="min-h-screen bg-base-200 p-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold mb-8">
                        {templateData ? 'Şablondan Sözleşme Oluştur' : 'Yeni Sözleşme Oluştur'}
                    </h1>

                    {error && (
                        <div className="alert alert-error mb-4">
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="card bg-base-100 shadow-xl">
                            <div className="card-body">
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">Sözleşme Başlığı</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        placeholder="Sözleşme başlığını girin"
                                        className="input input-bordered"
                                        required
                                    />
                                </div>

                                <div className="form-control mt-4">
                                    <label className="label">
                                        <span className="label-text">Partner Email</span>
                                    </label>
                                    <input
                                        type="email"
                                        name="partnerEmail"
                                        value={formData.partnerEmail}
                                        onChange={handleChange}
                                        placeholder="Partner email adresini girin"
                                        className="input input-bordered"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Gelişmiş Editör */}
                        <AdvancedEditor
                            initialValue={formData.content}
                            onChange={handleContentChange}
                            onSave={handleSubmit}
                        />

                        <div className="flex justify-end gap-4">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => navigate('/templates')}
                                disabled={loading}
                            >
                                Şablonlara Dön
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="loading loading-spinner loading-sm"></span>
                                ) : (
                                    'Sözleşme Oluştur'
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </DndProvider>
    );
};

export default CreateContract; 