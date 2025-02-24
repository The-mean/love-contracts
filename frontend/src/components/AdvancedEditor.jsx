import { useState, useRef, useCallback, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useDrop } from 'react-dnd';
import { useAuth } from '../contexts/AuthContext';

// Quill modülleri ve formatları
const modules = {
    toolbar: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'align': [] }],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        ['blockquote', 'code-block'],
        ['link', 'image'],
        ['clean']
    ],
    clipboard: {
        matchVisual: false
    }
};

const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'align',
    'list', 'bullet',
    'blockquote', 'code-block',
    'link', 'image'
];

const AdvancedEditor = ({ initialValue = '', onChange, onSave }) => {
    const [content, setContent] = useState(initialValue);
    const [isDragging, setIsDragging] = useState(false);
    const [templates, setTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const quillRef = useRef(null);
    const { user } = useAuth();

    // Şablonları yükle
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
            }
        };

        fetchTemplates();
    }, [user.token]);

    // Şablon seçildiğinde
    const handleTemplateSelect = async (templateId) => {
        if (!templateId) {
            setSelectedTemplate(null);
            setContent(initialValue);
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`http://localhost:5000/api/templates/${templateId}`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Şablon yüklenirken bir hata oluştu');
            }

            setSelectedTemplate(data);
            setContent(data.content);
            if (onChange) {
                onChange(data.content);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Değişiklikleri yönet
    const handleChange = (value) => {
        setContent(value);
        if (onChange) {
            onChange(value);
        }
    };

    // Resim yükleme işleyicisi
    const handleImageUpload = useCallback(async (file) => {
        try {
            const reader = new FileReader();
            reader.onload = () => {
                const quill = quillRef.current.getEditor();
                const range = quill.getSelection(true);
                quill.insertEmbed(range.index, 'image', reader.result);
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('Resim yükleme hatası:', error);
        }
    }, []);

    // Sürükle-bırak işleyicisi
    const [, drop] = useDrop({
        accept: 'image/*',
        drop: (item, monitor) => {
            const file = monitor.getItem().files[0];
            if (file) {
                handleImageUpload(file);
            }
            setIsDragging(false);
        },
        hover: () => setIsDragging(true),
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        }),
    });

    // Kaydetme işleyicisi
    const handleSave = () => {
        if (onSave) {
            onSave(content);
        }
    };

    return (
        <>
            <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                    {/* Şablon Seçimi */}
                    <div className="form-control w-full max-w-xs mb-4">
                        <label className="label">
                            <span className="label-text">Şablon Seç</span>
                        </label>
                        <select
                            className="select select-bordered w-full"
                            onChange={(e) => handleTemplateSelect(e.target.value)}
                            disabled={loading}
                        >
                            <option value="">Şablon seçin veya boş başlayın</option>
                            {templates.map((template) => (
                                <option key={template.id} value={template.id}>
                                    {template.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Hata Mesajı */}
                    {error && (
                        <div className="alert alert-error mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Editör */}
                    <div
                        ref={drop}
                        className={`relative border rounded-lg ${isDragging ? 'border-primary border-dashed' : 'border-base-300'}`}
                    >
                        {isDragging && (
                            <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                                <div className="text-primary text-lg font-semibold">
                                    Resmi buraya bırakın
                                </div>
                            </div>
                        )}
                        {loading ? (
                            <div className="flex justify-center items-center min-h-[200px]">
                                <span className="loading loading-spinner loading-lg"></span>
                            </div>
                        ) : (
                            <ReactQuill
                                ref={quillRef}
                                theme="snow"
                                value={content}
                                onChange={handleChange}
                                modules={modules}
                                formats={formats}
                                className="min-h-[200px]"
                            />
                        )}
                    </div>

                    {/* Butonlar */}
                    <div className="flex justify-end mt-4 gap-2">
                        <button
                            onClick={() => {
                                setSelectedTemplate(null);
                                setContent(initialValue);
                                if (onChange) onChange(initialValue);
                            }}
                            className="btn btn-ghost"
                        >
                            Sıfırla
                        </button>
                        <button
                            onClick={handleSave}
                            className="btn btn-primary"
                        >
                            Kaydet
                        </button>
                    </div>
                </div>
            </div>

            {/* Özel Öğeler Paleti */}
            <div className="card bg-base-100 shadow-xl mt-4">
                <div className="card-body">
                    <h3 className="card-title text-lg">Özel Öğeler</h3>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => {
                                const quill = quillRef.current.getEditor();
                                const range = quill.getSelection(true);
                                quill.insertText(range.index, '📝 ', 'user');
                            }}
                            className="btn btn-sm"
                        >
                            📝 İmza Alanı
                        </button>
                        <button
                            onClick={() => {
                                const quill = quillRef.current.getEditor();
                                const range = quill.getSelection(true);
                                quill.insertText(range.index, '📅 ', 'user');
                            }}
                            className="btn btn-sm"
                        >
                            📅 Tarih
                        </button>
                        <button
                            onClick={() => {
                                const quill = quillRef.current.getEditor();
                                const range = quill.getSelection(true);
                                quill.insertText(range.index, '✍️ ', 'user');
                            }}
                            className="btn btn-sm"
                        >
                            ✍️ Paraf
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AdvancedEditor; 