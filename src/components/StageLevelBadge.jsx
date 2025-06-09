import React from "react";
import { getLevelForStage } from "../utils/stageUtils";

const StageLevelBadge = ({
    stage,
    order = null,
    levels = [],
    showLevel = true,
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
            style={{ gap: "0.5rem", alignItems: "center" }}
        >
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
