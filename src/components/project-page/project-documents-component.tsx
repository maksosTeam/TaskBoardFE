import { useEffect, useState, ChangeEvent, DragEvent } from 'react';
import '../../styles/project-page/project-documents.css';
import {
    FileText, Image as ImageIcon, FileArchive, File, Upload,
    Search, FolderOpen, Download, Share2, Trash2
} from 'lucide-react';
import { rebuildFilePath } from "../../utils.ts";

interface ProjectDocumentsComponentProps {
    projectId: number;
}

interface ProjectDocument {
    id: number;
    projectId: number;
    authorId: number;
    title: string;
    filePath: string;
    uploadedAt: string;
    description: string;
}

export const ProjectDocumentsComponent = ({ projectId }: ProjectDocumentsComponentProps) => {
    const [documents, setDocuments] = useState<ProjectDocument[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loadingDocs, setLoadingDocs] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const token = localStorage.getItem('token');

    const fetchDocuments = () => {
        setLoadingDocs(true);
        fetch(`/api/project/get-project-documents/${projectId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'text/plain',
            },
        })
            .then(res => res.json())
            .then(data => setDocuments(data))
            .catch(err => console.error('Ошибка при загрузке документов:', err))
            .finally(() => setLoadingDocs(false));
    };

    useEffect(() => {
        fetchDocuments();
    }, [projectId]);

    const uploadFile = (file: File) => {
        const formData = new FormData();
        formData.append('document', file);
        setUploading(true);

        fetch(`/api/project/attach-document/${projectId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData,
        })
            .then(res => res.ok ? res.text() : Promise.reject('Ошибка загрузки'))
            .then(() => {
                fetchDocuments();
            })
            .catch(err => console.error(err))
            .finally(() => setUploading(false));
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            uploadFile(e.target.files[0]);
            e.target.value = ''; // Сбрасываем input
        }
    };

    const handleDrag = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            uploadFile(e.dataTransfer.files[0]);
        }
    };

    const handleDelete = (id: number) => {
        // Здесь должен быть вызов API для удаления, пока удаляем локально для вида
        setDocuments(documents.filter(doc => doc.id !== id));
        console.log(`Удаление документа ${id}`);
    };

    const handleCopyLink = (path: string) => {
        const fullUrl = window.location.origin + rebuildFilePath(path, 1);
        navigator.clipboard.writeText(fullUrl)
            .then(() => alert('Ссылка скопирована!'))
            .catch(err => console.error('Ошибка копирования:', err));
    };

    const getIconByExtension = (filename: string) => {
        const ext = filename.split('.').pop()?.toLowerCase();
        switch (ext) {
            case 'pdf': return FileText;
            case 'png':
            case 'jpg':
            case 'jpeg':
            case 'webp':
            case 'gif': return ImageIcon;
            case 'zip':
            case 'rar':
            case '7z': return FileArchive;
            case 'txt':
            case 'doc':
            case 'docx': return FileText;
            default: return File;
        }
    };

    const getDocumentType = (filename: string) => {
        return filename.split('.').pop()?.toUpperCase() || 'FILE';
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'Неизвестно';
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const filteredDocuments = documents.filter(doc =>
        doc.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="doc-page">
            <div className="doc-header">
                <div className="doc-search-wrapper">
                    <Search size={16} className="doc-search-icon" />
                    <input
                        type="text"
                        placeholder="Поиск документов..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="doc-search-input"
                    />
                </div>
                <label className="doc-btn-upload">
                    <Upload size={16} />
                    Загрузить файл
                    <input
                        type="file"
                        className="doc-hidden-input"
                        onChange={handleFileChange}
                    />
                </label>
            </div>



            {uploading && (
                <div className="doc-uploading-card">
                    <div className="doc-uploading-header">
                        <Upload size={16} className="doc-uploading-icon" />
                        <span className="doc-uploading-text">Загрузка файла...</span>
                    </div>
                    <div className="doc-progress-bar">
                        <div className="doc-progress-fill"></div>
                    </div>
                </div>
            )}

            {!loadingDocs && filteredDocuments.length === 0 && !uploading ? (
                <div
                    className={`doc-empty-state ${dragActive ? 'doc-empty-state--active' : ''}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <div className="doc-empty-icon-wrapper">
                        <FolderOpen size={32} />
                    </div>
                    <h3 className="doc-empty-title">Нет документов</h3>
                    <p className="doc-empty-subtitle">Перетащите файлы сюда или нажмите кнопку "Загрузить файл"</p>
                    <label className="doc-btn-upload">
                        <Upload size={16} />
                        Загрузить первый файл
                        <input
                            type="file"
                            className="doc-hidden-input"
                            onChange={handleFileChange}
                        />
                    </label>
                </div>
            ) : (
                <div className="doc-list">
                    {loadingDocs ? (
                        <div className="doc-loading">Загрузка документов...</div>
                    ) : (
                        filteredDocuments.map((doc) => {
                            const IconComponent = getIconByExtension(doc.title);
                            return (
                                <div key={doc.id} className="doc-card">
                                    <div className="doc-card-main">
                                        <div className="doc-icon-box">
                                            <IconComponent size={20} />
                                        </div>
                                        <div className="doc-info">
                                            <h3 className="doc-info-title">{doc.title}</h3>
                                            <div className="doc-info-meta">
                                                <span>{getDocumentType(doc.title)}</span>
                                                <span>•</span>
                                                <span>{formatDate(doc.uploadedAt)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="doc-actions">
                                        <a
                                            href={rebuildFilePath(doc.filePath, 1)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="doc-action-btn"
                                            title="Скачать"
                                        >
                                            <Download size={16} />
                                        </a>
                                        <button
                                            className="doc-action-btn"
                                            onClick={() => handleCopyLink(doc.filePath)}
                                            title="Поделиться ссылкой"
                                            type="button"
                                        >
                                            <Share2 size={16} />
                                        </button>
                                        <button
                                            className="doc-action-btn doc-action-btn--delete"
                                            onClick={() => handleDelete(doc.id)}
                                            title="Удалить"
                                            type="button"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
};