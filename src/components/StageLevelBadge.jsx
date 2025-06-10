import React from "react";
import { getLevelForStage } from "../utils/stageUtils";

const StageLevelBadge = ({
    stage,
    order = null,
    identifier = null,
    levels = [],
    showLevel = true,
    showIdentifier = true,
    size = "normal",
    className = "",
}) => {
    const level = showLevel ? getLevelForStage(levels, stage) : null;

    const sizeClasses = {
        small: "text-xs",
        normal: "text-sm",
        large: "text-base",
    };

    const textSize = sizeClasses[size] || sizeClasses.normal;

    return (
        <div
            className={`flex ${className}`}
            style={{ gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}
        >
            {showIdentifier && identifier && (
                <span
                    className={`text-primary ${textSize}`}
                    style={{ fontWeight: "600" }}
                >
                    [{identifier}]
                </span>
            )}
            <span className={`text-muted ${textSize}`}>
                Stage {stage}
                {order && ` #${order}`}
            </span>
            {level && (
                <span className={`text-primary ${textSize}`}>{level.name}</span>
            )}
        </div>
    );
};

export default StageLevelBadge;
