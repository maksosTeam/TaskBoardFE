import { useState } from "react";
import "../styles/boards-page/create-board-modal.css";
import Becklog from '../assets/Beclog.svg';
import Sprint from '../assets/Sprint.svg';
import Standart from '../assets/Standart.svg'

interface Props {
    projectId: number;
    onCreated: () => void;  // перезагрузить список в родителе
    onClose: () => void;
}

export const CreateBoardModal = ({ projectId, onCreated, onClose }: Props)=> {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedType, setSelectedType] = useState<'standard'>('standard'); // только standard доступен

    const handleSubmit = async () => {
        const token = localStorage.getItem('token');
        const body = {
            projectId,
            name,
            description,
            createdAt: new Date().toISOString(),
        };

        await fetch('/api/board/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(body),
        });

        onCreated();
        onClose();
    };

    return (
        <div className="board-modal-overlay">
            <div className="board-modal">
                <div className="board-modal-header">
                    <h2>Создание доски</h2>
                    <button className="board-close-button" onClick={onClose}>×</button>
                </div>
                <div style={{ padding: '24px' }}>
                <div className="board-modal-section">
                    <h3>Тип доски:</h3>
                    <div className="board-types">
                        <div
                            className={`board-type-option ${selectedType === 'standard' ? 'active' : ''}`}
                            onClick={() => setSelectedType('standard')}
                        >
                            <img className="icon" src={Standart}/>
                            <div className="boardtitle">Стандартная</div>
                        </div>
                        <div className="board-type-option disabled">
                            <img className="icon" src={Sprint}/>
                            <div className="board-title">Спринт</div>
                            <div className="desc">Скоро будет доступно</div>
                        </div>
                        <div className="board-type-option disabled">
                            <img className="icon" src={Becklog}/>
                            <div className="board-title">Бэклог</div>
                            <div className="desc">Скоро будет доступно</div>
                        </div>
                    </div>
                </div>

                <div className="board-modal-section">
                    <h3>Название доски:</h3>
                    <input
                        type="text"
                        placeholder='Например: "Frontend"'
                        value={name}
                        required
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                <div className="board-modal-section">
                    <h3>Описание:</h3>
                    <textarea
                        placeholder='Опишите суть доски...'
                        value={description}
                        required
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>

                <div className="board-modal-actions">
                    <button onClick={handleSubmit} disabled={!name.trim()}>Создать</button>
                </div>
                </div>
            </div>
        </div>
    );
}
