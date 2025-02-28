import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';

const CreateContract = () => {
    const [templates, setTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        partner_email: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/templates');
            if (!response.ok) {
                throw new Error('Failed to fetch templates');
            }
            const data = await response.json();
            setTemplates(data);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleTemplateSelect = (template) => {
        setSelectedTemplate(template);
        setFormData(prev => ({
            ...prev,
            title: template.title,
            content: template.content,
        }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/contracts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Failed to create contract');
            }

            const data = await response.json();
            navigate(`/contracts/${data.id}`);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-primary/5 to-secondary/5">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-2xl font-bold text-neutral mb-8">Create New Contract</h1>

                    {error && (
                        <div className="alert alert-error mb-6">
                            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Template Selection */}
                    <div className="card bg-base-100 shadow-xl mb-8">
                        <div className="card-body">
                            <h2 className="card-title text-lg mb-4">Choose a Template</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {templates.map(template => (
                                    <div
                                        key={template.id}
                                        className={`card bg-base-200 cursor-pointer transition-all duration-300 hover:shadow-md ${selectedTemplate?.id === template.id ? 'ring-2 ring-primary' : ''}`}
                                        onClick={() => handleTemplateSelect(template)}
                                    >
                                        <div className="card-body">
                                            <h3 className="font-medium">{template.title}</h3>
                                            <p className="text-sm text-neutral/70 line-clamp-2">
                                                {template.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Contract Form */}
                    <form onSubmit={handleSubmit} className="card bg-base-100 shadow-xl">
                        <div className="card-body space-y-6">
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Contract Title</span>
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="Enter contract title"
                                    className="input input-bordered w-full"
                                    required
                                />
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Partner's Email</span>
                                </label>
                                <input
                                    type="email"
                                    name="partner_email"
                                    value={formData.partner_email}
                                    onChange={handleChange}
                                    placeholder="Enter your partner's email"
                                    className="input input-bordered w-full"
                                    required
                                />
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Contract Content</span>
                                </label>
                                <textarea
                                    name="content"
                                    value={formData.content}
                                    onChange={handleChange}
                                    placeholder="Enter contract content"
                                    className="textarea textarea-bordered min-h-[200px]"
                                    required
                                />
                            </div>

                            <div className="card-actions justify-end">
                                <Button
                                    type="submit"
                                    variant="primary"
                                    className="w-full sm:w-auto"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <span className="loading loading-spinner loading-sm"></span>
                                    ) : (
                                        'Create Contract'
                                    )}
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateContract; 