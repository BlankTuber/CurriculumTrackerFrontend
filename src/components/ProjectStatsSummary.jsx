import React from "react";
import {
    getProjectStats,
    sortLevelsByOrder,
    filterProjectsByLevel,
} from "../utils/stageUtils";
import { PROJECT_STATES, PROJECT_STATE_LABELS } from "../utils/projectUtils";

const ProjectStatsSummary = ({
    projects = [],
    levels = [],
    showLevelBreakdown = false,
    showStateBreakdown = false,
}) => {
    const overallStats = getProjectStats(projects);
    const sortedLevels = sortLevelsByOrder(levels);

    const getLevelStats = (level) => {
        const levelProjects = filterProjectsByLevel(
            projects,
            levels,
            level._id
        );
        return getProjectStats(levelProjects);
    };

    const getStateStats = () => {
        const stats = {};
        Object.keys(PROJECT_STATES).forEach((stateKey) => {
            const stateValue = PROJECT_STATES[stateKey];
            stats[stateValue] = projects.filter(
                (p) => p.state === stateValue
            ).length;
        });
        return stats;
    };

    const stateStats = showStateBreakdown ? getStateStats() : {};

    return (
        <div className="card">
            <div className="card-header">
                <h3 className="card-title">Project Statistics</h3>
            </div>

            <div className="mb-2">
                <div className="flex-between mb-1">
                    <span className="text-muted">Total Projects:</span>
                    <span className="text-primary">{overallStats.total}</span>
                </div>
                <div className="flex-between mb-1">
                    <span className="text-muted">Completed:</span>
                    <span className="text-success">
                        {overallStats.completed}
                    </span>
                </div>
                <div className="flex-between mb-1">
                    <span className="text-muted">In Progress:</span>
                    <span className="text-warning">
                        {overallStats.total - overallStats.completed}
                    </span>
                </div>
                <div className="flex-between mb-1">
                    <span className="text-muted">Overall Progress:</span>
                    <span
                        className={
                            overallStats.percentage === 100
                                ? "text-success"
                                : "text-warning"
                        }
                    >
                        {overallStats.percentage}%
                    </span>
                </div>

                {overallStats.total > 0 && (
                    <div
                        style={{
                            background: "var(--bg-tertiary)",
                            borderRadius: "6px",
                            height: "8px",
                            width: "100%",
                            marginTop: "0.5rem",
                        }}
                    >
                        <div
                            style={{
                                background:
                                    overallStats.percentage === 100
                                        ? "var(--accent-success)"
                                        : "var(--accent-primary)",
                                height: "100%",
                                borderRadius: "6px",
                                width: `${overallStats.percentage}%`,
                                transition: "width 0.3s ease",
                            }}
                        ></div>
                    </div>
                )}
            </div>

            {showStateBreakdown && Object.keys(stateStats).length > 0 && (
                <div className="mb-2">
                    <h4
                        className="text-muted mb-1"
                        style={{ fontSize: "0.9rem" }}
                    >
                        Projects by State
                    </h4>
                    {Object.entries(stateStats).map(([state, count]) => (
                        <div key={state} className="flex-between mb-1">
                            <span style={{ fontSize: "0.9rem" }}>
                                {PROJECT_STATE_LABELS[state]}:
                            </span>
                            <span
                                className="text-muted"
                                style={{ fontSize: "0.8rem" }}
                            >
                                {count}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {showLevelBreakdown && sortedLevels.length > 0 && (
                <div>
                    <h4
                        className="text-muted mb-1"
                        style={{ fontSize: "0.9rem" }}
                    >
                        Progress by Level
                    </h4>
                    {sortedLevels.map((level) => {
                        const levelStats = getLevelStats(level);
                        return (
                            <div key={level._id} className="mb-1">
                                <div className="flex-between">
                                    <span style={{ fontSize: "0.9rem" }}>
                                        {level.name}
                                    </span>
                                    <span
                                        className="text-muted"
                                        style={{ fontSize: "0.8rem" }}
                                    >
                                        {levelStats.completed}/
                                        {levelStats.total}
                                        {levelStats.total > 0 &&
                                            ` (${levelStats.percentage}%)`}
                                    </span>
                                </div>
                                {levelStats.total > 0 && (
                                    <div
                                        style={{
                                            background: "var(--bg-tertiary)",
                                            borderRadius: "4px",
                                            height: "4px",
                                            width: "100%",
                                            marginTop: "0.25rem",
                                        }}
                                    >
                                        <div
                                            style={{
                                                background:
                                                    levelStats.percentage ===
                                                    100
                                                        ? "var(--accent-success)"
                                                        : "var(--accent-primary)",
                                                height: "100%",
                                                borderRadius: "4px",
                                                width: `${levelStats.percentage}%`,
                                                transition: "width 0.3s ease",
                                            }}
                                        ></div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ProjectStatsSummary;
