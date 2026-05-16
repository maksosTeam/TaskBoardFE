import React from 'react';
import '../styles/header-component.css';

export const HeaderComponent: React.FC = () => {
    return (
        <header className="main-header">
            <div className="header-brand">
                TaskBoard<span className="brand-dot">.</span>
            </div>
        </header>
    );
};