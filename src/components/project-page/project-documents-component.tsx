import { useEffect, useState, ChangeEvent } from 'react';
import '../../styles/project-page/project-documents.css';
import { FileText, Image, FileArchive, File, FolderPlus } from 'lucide-react';
import {rebuildFilePath} from "../../utils.ts";

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
            case 'pdf': return <File size={36} color="#90A4AE" />;
            case 'png':
            case 'jpg':
            case 'jpeg':
            case 'webp':
            case 'gif': return <Image size={36} color="#43A047" />;
            case 'zip':
            case 'rar':
            case '7z': return <FileArchive size={36} color="#F9A825" />;
            case 'txt':
            case 'doc':
            case 'docx': return <FileText size={36} color="#1E88E5" />;
            default: return <File size={36} color="#90A4AE" />;
        }
    };

    return (
        <div className="project-documents-container">
            <div className="documents-header">
                <h3>Документы проекта</h3>
                <button className="upload-icon-btn" onClick={() => setModalOpen(true)} title="Загрузить документ">
                    <FolderPlus size={24} />
                </button>
            </div>

            <div className={`documents-grid ${loadingDocs ? 'loading' : ''}`}>
                {loadingDocs ? (
                    [...Array(5)].map((_, i) => <div key={i} className="document-tile skeleton" />)
                ) : (
                    documents.map(doc => (
                        <a
                            key={doc.id}
                            href={rebuildFilePath(doc.filePath, 1)}
                            target="_blank"
                            className="document-tile"
                        >
                            {getIconByExtension(doc.title)}
                            <div className="document-title" title={doc.description}>{doc.description}</div>
                        </a>
                    ))
                )}
            </div>

            {modalOpen && (
                <div className="modal-backdrop" onClick={handleModalClose}>
                    <div className="upload-modal" onClick={(e) => e.stopPropagation()}>
                        <h4>Загрузка документа</h4>
                        <input type="file" onChange={handleFileChange} />
                        <button className="upload-btn" onClick={handleUpload} disabled={!selectedFile || uploading}>
                            {uploading ? 'Загрузка...' : 'Загрузить'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
