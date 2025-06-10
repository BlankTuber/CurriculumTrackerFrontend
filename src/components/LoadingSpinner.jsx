import React from "react";

const LoadingSpinner = ({ message = "Loading..." }) => {
    return (
        <div className="flex-center" style={{ minHeight: "150px" }}>
            <div className="flex-col text-center">
                <div className="spinner"></div>
                <p className="text-muted text-sm">{message}</p>
            </div>
        </div>
    );
};

export default LoadingSpinner;
