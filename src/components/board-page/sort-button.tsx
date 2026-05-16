import { useEffect, useRef, useState } from 'react';
import { FunnelPlus } from 'lucide-react';
import '../../styles/board-page/sort-button.css';

export interface SortButtonProps {
    onSortChange: (sortType: 'default' | 'date' | 'priority') => void;
}

export const SortButton = ({ onSortChange }: SortButtonProps) => {
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleSort = (type: 'default' | 'date'| 'priority') => {
        onSortChange(type);
        setOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="sort-button-wrapper" ref={dropdownRef}>
            <button className="sort-toggle" onClick={() => setOpen(!open)}>
                <FunnelPlus size={20} className="sort-icon" />
            </button>
            {open && (
                <div className="sort-dropdown">
                    <div onClick={() => handleSort('date')}>По дедлайну</div>
                    <div onClick={() => handleSort('priority')}>По приоретету</div>
                </div>
            )}
        </div>
    );
};
