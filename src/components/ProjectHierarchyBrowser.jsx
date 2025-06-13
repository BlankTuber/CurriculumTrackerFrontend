import React from "react";
import { sortLevelsByOrder } from "../utils/stageUtils";

const ProjectHierarchyBrowser = ({
    levels = [],
    projects = [],
    stages = [],
    selectedLevel,
    selectedStage,
    onLevelChange,
    onStageChange,
    onAddProject,
    hideTitle = false,
}) => {
    const sortedLevels = sortLevelsByOrder(levels);

    const getStagesForLevel = (level) => {
        if (!level) return [];
        const stageNumbers = [];
        for (let i = level.stageStart; i <= level.stageEnd; i++) {
            stageNumbers.push(i);
        }
        return stageNumbers;
    };

    const getStageDefinition = (stageNumber) => {
        if (!stages || !Array.isArray(stages)) return null;
        return stages.find((s) => s.stageNumber === stageNumber);
    };

    const getProjectsForStage = (stage) => {
        return projects.filter((p) => p.stage === stage);
    };

    const availableStages = selectedLevel
        ? getStagesForLevel(selectedLevel)
        : [];

    const handleLevelClick = (level) => {
        onLevelChange(level);
        onStageChange(null);
    };

    const handleStageClick = (stage) => {
        onStageChange(stage);
    };

    const handleBack = () => {
        if (selectedStage) {
            onStageChange(null);
        } else if (selectedLevel) {
            onLevelChange(null);
        }
    };

    const getProjectStats = (level) => {
        const levelProjects = projects.filter(
            (p) => p.stage >= level.stageStart && p.stage <= level.stageEnd
        );
        return {
            total: levelProjects.length,
            completed: levelProjects.filter((p) => p.state === "completed")
                .length,
        };
    };

    const headerContent = (
        <div className="flex-between">
            <div>
                <h3 className="card-title">Browse Projects</h3>
                <p className="card-subtitle">
                    {!selectedLevel && "Select a level to begin"}
                    {selectedLevel &&
                        !selectedStage &&
                        `Select a stage in ${selectedLevel.name}`}
                    {selectedLevel &&
                        selectedStage &&
                        `${selectedLevel.name} - Stage ${selectedStage}`}
                </p>
            </div>
            <div className="btn-group">
                {onAddProject && (
                    <button
                        onClick={onAddProject}
                        className="btn btn-primary btn-small"
                    >
                        Add Project
                    </button>
                )}
                {(selectedLevel || selectedStage) && (
                    <button
                        onClick={handleBack}
                        className="btn btn-secondary btn-small"
                    >
                        ← Back
                    </button>
                )}
            </div>
        </div>
    );

    const content = (
        <>
            {!selectedLevel && (
                <div>
                    {sortedLevels.length === 0 ? (
                        <div
                            className="text-center text-muted text-sm"
                            style={{ padding: "2rem" }}
                        >
                            No levels created yet. Add a level to organize your
                            projects.
                        </div>
                    ) : (
                        <div className="grid grid-2" style={{ gap: "0.75rem" }}>
                            {sortedLevels.map((level) => {
                                const stats = getProjectStats(level);
                                return (
                                    <div
                                        key={level._id}
                                        className="selection-card"
                                        onClick={() => handleLevelClick(level)}
                                        style={{
                                            cursor: "pointer",
                                            padding: "1rem",
                                            marginBottom: 0,
                                        }}
                                    >
                                        <div style={{ marginBottom: "0.5rem" }}>
                                            <div
                                                className="flex"
                                                style={{
                                                    gap: "0.5rem",
                                                    alignItems: "center",
                                                    marginBottom: "0.25rem",
                                                    flexWrap: "wrap",
                                                }}
                                            >
                                                <h4
                                                    style={{
                                                        margin: 0,
                                                        fontSize: "1rem",
                                                        fontWeight: "600",
                                                    }}
                                                >
                                                    {level.name}
                                                </h4>
                                                {level.defaultIdentifier && (
                                                    <span
                                                        className="text-primary"
                                                        style={{
                                                            fontSize: "0.8rem",
                                                            fontWeight: "600",
                                                        }}
                                                    >
                                                        [
                                                        {
                                                            level.defaultIdentifier
                                                        }
                                                        ]
                                                    </span>
                                                )}
                                            </div>
                                            <p
                                                className="text-muted text-sm"
                                                style={{
                                                    margin: "0.25rem 0 0 0",
                                                }}
                                            >
                                                Stages {level.stageStart}-
                                                {level.stageEnd}
                                            </p>
                                        </div>

                                        {level.description && (
                                            <p
                                                className="text-muted text-xs"
                                                style={{
                                                    margin: "0 0 0.5rem 0",
                                                    lineHeight: "1.3",
                                                    display: "-webkit-box",
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: "vertical",
                                                    overflow: "hidden",
                                                }}
                                            >
                                                {level.description}
                                            </p>
                                        )}

                                        <div
                                            className="flex-between"
                                            style={{ alignItems: "center" }}
                                        >
                                            <span className="text-muted text-xs">
                                                {stats.total} project
                                                {stats.total !== 1 ? "s" : ""}
                                            </span>
                                            {stats.total > 0 && (
                                                <span
                                                    className={
                                                        stats.completed ===
                                                        stats.total
                                                            ? "text-success"
                                                            : "text-warning"
                                                    }
                                                    style={{
                                                        fontSize: "0.75rem",
                                                    }}
                                                >
                                                    {stats.completed}/
                                                    {stats.total} completed
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {selectedLevel && !selectedStage && (
                <div>
                    <div style={{ marginBottom: "0.75rem" }}>
                        <div
                            className="flex"
                            style={{
                                gap: "0.5rem",
                                alignItems: "center",
                                marginBottom: "0.25rem",
                                flexWrap: "wrap",
                            }}
                        >
                            <h4
                                style={{
                                    fontSize: "0.9rem",
                                    margin: "0",
                                }}
                            >
                                {selectedLevel.name}
                            </h4>
                            {selectedLevel.defaultIdentifier && (
                                <span
                                    className="text-primary"
                                    style={{
                                        fontSize: "0.8rem",
                                        fontWeight: "600",
                                    }}
                                >
                                    [{selectedLevel.defaultIdentifier}]
                                </span>
                            )}
                        </div>
                        <p className="text-muted text-sm" style={{ margin: 0 }}>
                            Choose a stage to view projects
                        </p>
                    </div>

                    <div className="grid grid-3" style={{ gap: "0.5rem" }}>
                        {availableStages.map((stage) => {
                            const stageProjects = getProjectsForStage(stage);
                            const completedProjects = stageProjects.filter(
                                (p) => p.state === "completed"
                            );
                            const stageDefinition = getStageDefinition(stage);

                            return (
                                <div
                                    key={stage}
                                    className="selection-card"
                                    onClick={() => handleStageClick(stage)}
                                    style={{
                                        cursor: "pointer",
                                        padding: "0.75rem",
                                        marginBottom: 0,
                                        textAlign: "center",
                                    }}
                                >
                                    <div style={{ marginBottom: "0.5rem" }}>
                                        <h5
                                            style={{
                                                margin: 0,
                                                fontSize: "0.9rem",
                                                fontWeight: "600",
                                                marginBottom: "0.25rem",
                                            }}
                                        >
                                            Stage {stage}
                                        </h5>
                                        {stageDefinition?.name && (
                                            <p
                                                className="text-primary text-xs"
                                                style={{
                                                    margin: 0,
                                                    fontWeight: "500",
                                                }}
                                            >
                                                {stageDefinition.name}
                                            </p>
                                        )}
                                    </div>

                                    <div style={{ marginBottom: "0.25rem" }}>
                                        <span className="text-muted text-xs">
                                            {stageProjects.length} project
                                            {stageProjects.length !== 1
                                                ? "s"
                                                : ""}
                                        </span>
                                    </div>

                                    {stageProjects.length > 0 && (
                                        <div>
                                            <span
                                                className={
                                                    completedProjects.length ===
                                                    stageProjects.length
                                                        ? "text-success"
                                                        : "text-warning"
                                                }
                                                style={{ fontSize: "0.7rem" }}
                                            >
                                                {completedProjects.length}/
                                                {stageProjects.length} done
                                            </span>
                                        </div>
                                    )}

                                    {stageDefinition?.description && (
                                        <p
                                            className="text-muted text-xs"
                                            style={{
                                                margin: "0.25rem 0 0 0",
                                                lineHeight: "1.2",
                                                display: "-webkit-box",
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: "vertical",
                                                overflow: "hidden",
                                            }}
                                        >
                                            {stageDefinition.description}
                                        </p>
                                    )}

                                    {stageDefinition?.defaultGithubRepo && (
                                        <p
                                            className="text-info text-xs"
                                            style={{
                                                margin: "0.25rem 0 0 0",
                                                fontFamily: "monospace",
                                                fontSize: "0.65rem",
                                            }}
                                        >
                                            {stageDefinition.defaultGithubRepo}
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {selectedLevel && selectedStage && (
                <div style={{ textAlign: "center", padding: "1rem" }}>
                    <p className="text-muted text-sm">
                        Projects for {selectedLevel.name}, Stage {selectedStage}{" "}
                        will appear in the projects panel.
                    </p>
                    {(() => {
                        const stageDefinition =
                            getStageDefinition(selectedStage);
                        if (stageDefinition) {
                            return (
                                <div
                                    style={{
                                        marginTop: "0.5rem",
                                        padding: "0.5rem",
                                        background: "var(--bg-tertiary)",
                                        borderRadius: "4px",
                                    }}
                                >
                                    {stageDefinition.name && (
                                        <p
                                            className="text-primary text-sm"
                                            style={{
                                                margin: "0 0 0.25rem 0",
                                                fontWeight: "600",
                                            }}
                                        >
                                            {stageDefinition.name}
                                        </p>
                                    )}
                                    {stageDefinition.description && (
                                        <p
                                            className="text-muted text-xs"
                                            style={{ margin: "0 0 0.25rem 0" }}
                                        >
                                            {stageDefinition.description}
                                        </p>
                                    )}
                                    {stageDefinition.defaultGithubRepo && (
                                        <p
                                            className="text-info text-xs"
                                            style={{
                                                margin: 0,
                                                fontFamily: "monospace",
                                            }}
                                        >
                                            Default repo:{" "}
                                            {stageDefinition.defaultGithubRepo}
                                        </p>
                                    )}
                                </div>
                            );
                        }
                        return null;
                    })()}
                </div>
            )}
        </>
    );

    if (hideTitle) {
        return (
            <div>
                <div style={{ marginBottom: "1rem" }}>{headerContent}</div>
                {content}
            </div>
        );
    }

    return (
        <div className="card">
            <div className="card-header">{headerContent}</div>
            {content}
        </div>
    );
};

export default ProjectHierarchyBrowser;
