import { useEffect, useState, ChangeEvent } from 'react';
import '../../styles/project-page/project-documents.css';
import { FileText, Image, FileArchive, File, FolderPlus, Upload, X } from 'lucide-react';
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
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [loadingDocs, setLoadingDocs] = useState(true);
    const [uploading, setUploading] = useState(false);
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

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleUpload = () => {
        if (!selectedFile) return;

        const formData = new FormData();
        formData.append('document', selectedFile);
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
                setSelectedFile(null);
                setModalOpen(false);
                fetchDocuments();
            })
            .catch(err => console.error(err))
            .finally(() => setUploading(false));
    };

    const handleModalClose = () => {
        setModalOpen(false);
        setSelectedFile(null);
    };

    const getIconByExtension = (filename: string) => {
        const ext = filename.split('.').pop()?.toLowerCase();
        switch (ext) {
            case 'pdf': return <File size={32} className="project-docs__icon project-docs__icon--pdf" />;
            case 'png':
            case 'jpg':
            case 'jpeg':
            case 'webp':
            case 'gif': return <Image size={32} className="project-docs__icon project-docs__icon--image" />;
            case 'zip':
            case 'rar':
            case '7z': return <FileArchive size={32} className="project-docs__icon project-docs__icon--archive" />;
            case 'txt':
            case 'doc':
            case 'docx': return <FileText size={32} className="project-docs__icon project-docs__icon--text" />;
            default: return <File size={32} className="project-docs__icon project-docs__icon--default" />;
        }
    };

    return (
        <div className="project-docs">
            <div className="project-docs__header">
                <div className="project-docs__meta">
                    <h3 className="project-docs__title">Документы проекта</h3>
                    <span className="project-docs__counter">Всего: {documents.length}</span>
                </div>
                <button
                    className="project-docs__upload-trigger"
                    onClick={() => setModalOpen(true)}
                    title="Загрузить документ"
                    type="button"
                >
                    <FolderPlus size={18} />
                    <span>Добавить</span>
                </button>
            </div>

            <div className="project-docs__grid">
                {loadingDocs ? (
                    [...Array(6)].map((_, i) => <div key={i} className="project-docs__tile project-docs__tile--skeleton" />)
                ) : documents.length === 0 ? (
                    <div className="project-docs__empty">Документы в проекте пока отсутствуют</div>
                ) : (
                    documents.map(doc => (
                        <a
                            key={doc.id}
                            href={rebuildFilePath(doc.filePath, 1)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="project-docs__tile"
                        >
                            <div className="project-docs__icon-wrapper">
                                {getIconByExtension(doc.title)}
                            </div>
                            <div className="project-docs__tile-title" title={doc.description || doc.title}>
                                {doc.description || doc.title}
                            </div>
                        </a>
                    ))
                )}
            </div>

            {modalOpen && (
                <div className="project-docs__backdrop" onClick={handleModalClose}>
                    <div className="project-docs__modal" onClick={(e) => e.stopPropagation()}>
                        <div className="project-docs__modal-header">
                            <h4 className="project-docs__modal-title">Загрузка документа</h4>
                            <button className="project-docs__modal-close" onClick={handleModalClose} type="button">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="project-docs__form-group">
                            <label className={`project-docs__dropzone ${selectedFile ? 'project-docs__dropzone--has-file' : ''}`}>
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    className="project-docs__file-input"
                                />
                                <Upload size={24} className="project-docs__dropzone-icon" />
                                <span className="project-docs__dropzone-text">
                                    {selectedFile ? selectedFile.name : "Выберите файл для загрузки"}
                                </span>
                            </label>
                        </div>

                        <button
                            className="project-docs__submit-btn"
                            onClick={handleUpload}
                            disabled={!selectedFile || uploading}
                            type="button"
                        >
                            {uploading ? 'Загрузка...' : 'Загрузить файл'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};