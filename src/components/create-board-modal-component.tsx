import { useState } from "react";
import "../styles/boards-page/create-board-modal.css";
import Becklog from '../assets/Beclog.svg';
import Sprint from '../assets/Sprint.svg';
import Standart from '../assets/Standart.svg';

interface Props {
    projectId: number;
    onCreated: () => void;
    onClose: () => void;
}

export const CreateBoardModal = ({ projectId, onCreated, onClose }: Props) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedType, setSelectedType] = useState<'standard'>('standard');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
        if (!name.trim() || isLoading) return;

        setIsLoading(true);
        const token = localStorage.getItem('token');
        const body = {
            projectId,
            name: name.trim(),
            description: description.trim(),
            createdAt: new Date().toISOString(),
        };

        try {
            const response = await fetch('/api/board/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            });

            if (response.ok) {
                onCreated();
                onClose();
            } else {
                console.error('Failed to create board');
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && e.ctrlKey && name.trim() && !isLoading) {
            handleSubmit();
        }
    };

    return (
        <div className="board-modal-overlay" onClick={onClose}>
            <div className="board-modal" onClick={(e) => e.stopPropagation()}>
                <div className="board-modal-header">
                    <h2>Создание доски</h2>
                    <button className="board-close-button" onClick={onClose}>×</button>
                </div>

                <div style={{ padding: '0 28px 28px 28px' }}>
                    <div className="board-modal-section">
                        <h3>Тип доски</h3>
                        <div className="board-types">
                            <div
                                className={`board-type-option ${selectedType === 'standard' ? 'active' : ''}`}
                                onClick={() => setSelectedType('standard')}
                            >
                                <img className="icon" src={Standart} alt="Standard" />
                                <div className="board-title">Стандартная</div>
                                <div className="desc">Гибкая доска задач</div>
                            </div>
                            <div className="board-type-option disabled">
                                <img className="icon" src={Sprint} alt="Sprint" />
                                <div className="board-title">Спринт</div>
                                <div className="desc">Скоро будет доступно</div>
                            </div>
                            <div className="board-type-option disabled">
                                <img className="icon" src={Becklog} alt="Backlog" />
                                <div className="board-title">Бэклог</div>
                                <div className="desc">Скоро будет доступно</div>
                            </div>
                        </div>
                    </div>

                    <div className="board-modal-section">
                        <h3>Название доски</h3>
                        <input
                            type="text"
                            placeholder="Например: Frontend"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onKeyDown={handleKeyDown}
                            autoFocus
                        />
                    </div>

                    <div className="board-modal-section">
                        <h3>Описание</h3>
                        <textarea
                            placeholder="Опишите суть доски..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                    </div>

                    <div className="board-modal-actions">
                        <button onClick={handleSubmit} disabled={!name.trim() || isLoading}>
                            {isLoading ? 'Создание...' : 'Создать доску'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};