import React from "react";

const LoadingSpinner = ({ message = "Loading..." }) => {
    return (
        <div className="flex-center" style={{ minHeight: "200px" }}>
            <div className="flex-col text-center">
                <div className="spinner"></div>
                <p className="text-muted">{message}</p>
            </div>
        </div>
    );
};

export default LoadingSpinner;
