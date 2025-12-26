import React, { useEffect } from 'react';

const Toast = ({ message, type = 'success', onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const styles = {
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: type === 'error' ? '#ff6b6b' : '#51cf66',
        color: 'white',
        padding: '1rem 2rem',
        borderRadius: '50px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
        zIndex: 1000,
        animation: 'slideIn 0.3s ease-out',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontWeight: 'bold',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.2)'
    };

    return (
        <div className="toast" style={styles}>
            <span>{message}</span>
        </div>
    );
};

export default Toast;
