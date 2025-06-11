import React from "react";
import { Link } from "react-router-dom";
import { getLevelForStage } from "../utils/stageUtils";
import {
    PROJECT_STATE_LABELS,
    PROJECT_STATE_COLORS,
    isProjectCompleted,
} from "../utils/projectUtils";

const PrerequisiteSummary = ({
    prerequisites = [],
    levels = [],
    stages = [],
    showDetails = true,
    maxVisible = 3,
    onManageClick = null,
}) => {
    const getStageDefinition = (stageNumber) => {
        if (!stages || !Array.isArray(stages)) return null;
        return stages.find((s) => s.stageNumber === stageNumber);
    };

    if (prerequisites.length === 0) {
        return (
            <div className="flex-between" style={{ alignItems: "center" }}>
                <span className="text-muted">No prerequisites</span>
                {onManageClick && (
                    <button
                        onClick={onManageClick}
                        className="btn btn-secondary btn-small"
                    >
                        Add Prerequisites
                    </button>
                )}
            </div>
        );
    }

    const completedCount = prerequisites.filter((p) =>
        isProjectCompleted(p)
    ).length;
    const totalCount = prerequisites.length;
    const allCompleted = completedCount === totalCount;

    const visiblePrerequisites = prerequisites.slice(0, maxVisible);
    const hiddenCount = Math.max(0, prerequisites.length - maxVisible);

    return (
        <div>
            <div className="flex-between mb-1" style={{ alignItems: "center" }}>
                <div
                    className="flex"
                    style={{ gap: "1rem", alignItems: "center" }}
                >
                    <span className="text-muted">Prerequisites:</span>
                    <span
                        className={
                            allCompleted ? "text-success" : "text-warning"
                        }
                    >
                        {completedCount}/{totalCount} completed
                    </span>
                    {allCompleted && (
                        <span
                            className="text-success"
                            style={{ fontSize: "1.1rem" }}
                        >
                            ✓
                        </span>
                    )}
                </div>
                {onManageClick && (
                    <button
                        onClick={onManageClick}
                        className="btn btn-secondary btn-small"
                    >
                        Manage
                    </button>
                )}
            </div>

            {showDetails && (
                <div>
                    {visiblePrerequisites.map((prerequisite) => {
                        const level = getLevelForStage(
                            levels,
                            prerequisite.stage
                        );
                        const stageDefinition = getStageDefinition(
                            prerequisite.stage
                        );
                        return (
                            <div
                                key={prerequisite._id}
                                className="flex-between"
                                style={{
                                    padding: "0.5rem",
                                    marginBottom: "0.25rem",
                                    backgroundColor: "var(--bg-tertiary)",
                                    borderRadius: "4px",
                                    fontSize: "0.9rem",
                                }}
                            >
                                <div style={{ flex: 1 }}>
                                    <div
                                        className="flex"
                                        style={{
                                            gap: "0.5rem",
                                            alignItems: "center",
                                            marginBottom: "0.25rem",
                                            flexWrap: "wrap",
                                        }}
                                    >
                                        <Link
                                            to={`/project/${prerequisite._id}`}
                                            style={{
                                                textDecoration: "none",
                                                color: "inherit",
                                                fontWeight: "500",
                                            }}
                                        >
                                            {prerequisite.name}
                                        </Link>
                                        {prerequisite.identifier && (
                                            <span
                                                className="text-primary"
                                                style={{
                                                    fontSize: "0.8rem",
                                                    fontWeight: "600",
                                                }}
                                            >
                                                [{prerequisite.identifier}]
                                            </span>
                                        )}
                                        <span
                                            className="text-muted"
                                            style={{ fontSize: "0.8rem" }}
                                        >
                                            Stage {prerequisite.stage}
                                        </span>
                                        {stageDefinition?.name && (
                                            <span
                                                className="text-info"
                                                style={{ fontSize: "0.8rem" }}
                                            >
                                                {stageDefinition.name}
                                            </span>
                                        )}
                                        {level && (
                                            <span
                                                className="text-primary"
                                                style={{ fontSize: "0.8rem" }}
                                            >
                                                {level.name}
                                                {level.defaultIdentifier &&
                                                    ` (${level.defaultIdentifier})`}
                                            </span>
                                        )}
                                    </div>
                                    {prerequisite.topics &&
                                        prerequisite.topics.length > 0 && (
                                            <div
                                                className="flex"
                                                style={{
                                                    gap: "0.25rem",
                                                    flexWrap: "wrap",
                                                }}
                                            >
                                                {prerequisite.topics
                                                    .slice(0, 3)
                                                    .map((topic, index) => (
                                                        <span
                                                            key={index}
                                                            style={{
                                                                background:
                                                                    "var(--bg-primary)",
                                                                padding:
                                                                    "0.125rem 0.25rem",
                                                                borderRadius:
                                                                    "3px",
                                                                fontSize:
                                                                    "0.7rem",
                                                                color: "var(--text-secondary)",
                                                            }}
                                                        >
                                                            {topic}
                                                        </span>
                                                    ))}
                                                {prerequisite.topics.length >
                                                    3 && (
                                                    <span
                                                        style={{
                                                            fontSize: "0.7rem",
                                                            color: "var(--text-muted)",
                                                            fontStyle: "italic",
                                                        }}
                                                    >
                                                        +
                                                        {prerequisite.topics
                                                            .length - 3}{" "}
                                                        more
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                </div>
                                <span
                                    className={
                                        PROJECT_STATE_COLORS[prerequisite.state]
                                    }
                                    style={{ fontSize: "0.8rem" }}
                                >
                                    {PROJECT_STATE_LABELS[prerequisite.state]}
                                </span>
                            </div>
                        );
                    })}

                    {hiddenCount > 0 && (
                        <div
                            className="text-center text-muted"
                            style={{
                                padding: "0.5rem",
                                fontSize: "0.9rem",
                                fontStyle: "italic",
                            }}
                        >
                            + {hiddenCount} more prerequisite
                            {hiddenCount === 1 ? "" : "s"}
                        </div>
                    )}
                </div>
            )}

            {totalCount > 0 && (
                <div
                    style={{
                        background: "var(--bg-tertiary)",
                        borderRadius: "4px",
                        height: "4px",
                        width: "100%",
                        marginTop: "0.5rem",
                    }}
                >
                    <div
                        style={{
                            background: allCompleted
                                ? "var(--accent-success)"
                                : "var(--accent-warning)",
                            height: "100%",
                            borderRadius: "4px",
                            width: `${(completedCount / totalCount) * 100}%`,
                            transition: "width 0.3s ease",
                        }}
                    ></div>
                </div>
            )}
        </div>
    );
};

export default PrerequisiteSummary;
