import React from "react";
import { PROJECT_STATES, PROJECT_STATE_LABELS } from "../utils/projectUtils";

const ProjectStateToggle = ({
    currentState,
    onStateChange,
    disabled = false,
    className = "",
    size = "normal",
}) => {
    const getNextState = (state) => {
        switch (state) {
            case PROJECT_STATES.NOT_STARTED:
                return PROJECT_STATES.IN_PROGRESS;
            case PROJECT_STATES.IN_PROGRESS:
                return PROJECT_STATES.COMPLETED;
            case PROJECT_STATES.COMPLETED:
                return PROJECT_STATES.NOT_STARTED;
            default:
                return PROJECT_STATES.IN_PROGRESS;
        }
    };

    const getStateColor = (state) => {
        switch (state) {
            case PROJECT_STATES.NOT_STARTED:
                return "muted";
            case PROJECT_STATES.IN_PROGRESS:
                return "warning";
            case PROJECT_STATES.COMPLETED:
                return "success";
            default:
                return "muted";
        }
    };

    const handleClick = () => {
        if (!disabled) {
            const nextState = getNextState(currentState);
            onStateChange(nextState);
        }
    };

    const stateColor = getStateColor(currentState);
    const sizeClass = size === "small" ? "btn-small" : "";

    return (
        <button
            onClick={handleClick}
            disabled={disabled}
            className={`btn btn-secondary ${sizeClass} ${className}`}
            style={{
                color: `var(--accent-${stateColor})`,
                borderColor: `var(--accent-${stateColor})`,
                minWidth: size === "small" ? "100px" : "130px",
            }}
        >
            {disabled
                ? "Updating..."
                : PROJECT_STATE_LABELS[currentState] || "Unknown"}
        </button>
    );
};

export default ProjectStateToggle;
