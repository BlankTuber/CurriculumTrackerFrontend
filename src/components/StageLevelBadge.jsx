import React from "react";
import { getLevelForStage } from "../utils/stageUtils";

const StageLevelBadge = ({
    stage,
    order = null,
    identifier = null,
    levels = [],
    stages = [],
    showLevel = true,
    showStage = true,
    showIdentifier = true,
    size = "normal",
    className = "",
}) => {
    const level = showLevel ? getLevelForStage(levels, stage) : null;
    const stageDefinition =
        stages?.find((s) => s.stageNumber === stage) || null;

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
            {showStage && (
                <div
                    className="flex"
                    style={{ gap: "0.25rem", alignItems: "center" }}
                >
                    <span className={`text-muted ${textSize}`}>
                        Stage {stage}
                        {order && ` #${order}`}
                    </span>
                    {stageDefinition?.name && (
                        <span
                            className={`text-info ${textSize}`}
                            style={{ fontWeight: "500" }}
                        >
                            ({stageDefinition.name})
                        </span>
                    )}
                </div>
            )}
            {level && (
                <div
                    className="flex"
                    style={{ gap: "0.25rem", alignItems: "center" }}
                >
                    <span className={`text-primary ${textSize}`}>
                        {level.name}
                    </span>
                    {level.defaultIdentifier && (
                        <span
                            className={`text-primary ${textSize}`}
                            style={{ fontWeight: "600" }}
                        >
                            [{level.defaultIdentifier}]
                        </span>
                    )}
                </div>
            )}
        </div>
    );
};

export default StageLevelBadge;
