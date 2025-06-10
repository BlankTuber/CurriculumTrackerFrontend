import React from "react";
import { PROJECT_STATE_LABELS } from "../utils/projectUtils";

const ProjectStateDropdown = ({
    value,
    onChange,
    disabled = false,
    className = "",
    style = {},
}) => {
    return (
        <select
            value={value}
            onChange={onChange}
            className={`form-select ${className}`}
            disabled={disabled}
            style={{
                width: "auto",
                minWidth: "150px",
                ...style,
            }}
        >
            {Object.entries(PROJECT_STATE_LABELS).map(([stateValue, label]) => (
                <option key={stateValue} value={stateValue}>
                    {label}
                </option>
            ))}
        </select>
    );
};

export default ProjectStateDropdown;
