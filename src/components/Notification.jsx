import React, { useState, useEffect } from "react";

const Notification = ({
    isOpen,
    onClose,
    type = "info",
    title,
    message,
    autoClose = true,
}) => {
    useEffect(() => {
        if (isOpen && autoClose) {
            const timer = setTimeout(() => {
                onClose();
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [isOpen, autoClose, onClose]);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
        }

        return () => {
            document.removeEventListener("keydown", handleEscape);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const getTypeStyles = () => {
        switch (type) {
            case "success":
                return {
                    backgroundColor: "rgba(76, 175, 80, 0.1)",
                    borderColor: "var(--accent-success)",
                    color: "var(--accent-success)",
                };
            case "error":
                return {
                    backgroundColor: "rgba(244, 67, 54, 0.1)",
                    borderColor: "var(--accent-error)",
                    color: "var(--accent-error)",
                };
            case "warning":
                return {
                    backgroundColor: "rgba(255, 152, 0, 0.1)",
                    borderColor: "var(--accent-warning)",
                    color: "var(--accent-warning)",
                };
            default:
                return {
                    backgroundColor: "rgba(100, 181, 246, 0.1)",
                    borderColor: "var(--accent-primary)",
                    color: "var(--accent-primary)",
                };
        }
    };

    const typeStyles = getTypeStyles();

    return (
        <div className="notification-overlay">
            <div
                className="notification"
                style={{
                    ...typeStyles,
                    border: `1px solid ${typeStyles.borderColor}`,
                    backgroundColor: typeStyles.backgroundColor,
                }}
            >
                <div className="notification-header">
                    {title && <h3 className="notification-title">{title}</h3>}
                    <button
                        onClick={onClose}
                        className="notification-close"
                        aria-label="Close notification"
                        style={{ color: typeStyles.color }}
                    >
                        ×
                    </button>
                </div>
                {message && <p className="notification-message">{message}</p>}
            </div>
        </div>
    );
};

export default Notification;
