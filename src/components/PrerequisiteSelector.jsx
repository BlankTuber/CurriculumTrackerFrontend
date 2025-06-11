import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
    sortProjectsByStageAndOrder,
    getLevelForStage,
} from "../utils/stageUtils";
import {
    PROJECT_STATE_LABELS,
    PROJECT_STATE_COLORS,
    isProjectCompleted,
} from "../utils/projectUtils";

const PrerequisiteSelector = ({
    availableProjects = [],
    selectedPrerequisites = [],
    onSelectionChange,
    levels = [],
    disabled = false,
}) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [stageFilter, setStageFilter] = useState("");
    const [stateFilter, setStateFilter] = useState("");

    const filteredAndSortedProjects = useMemo(() => {
        let filtered = [...availableProjects];

        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            filtered = filtered.filter(
                (project) =>
                    project.name.toLowerCase().includes(search) ||
                    (project.identifier &&
                        project.identifier.toLowerCase().includes(search)) ||
                    (project.topics &&
                        project.topics.some((topic) =>
                            topic.toLowerCase().includes(search)
                        ))
            );
        }

        if (stageFilter) {
            const stage = parseInt(stageFilter);
            filtered = filtered.filter((project) => project.stage === stage);
        }

        if (stateFilter) {
            filtered = filtered.filter(
                (project) => project.state === stateFilter
            );
        }

        return sortProjectsByStageAndOrder(filtered);
    }, [availableProjects, searchTerm, stageFilter, stateFilter]);

    const handleTogglePrerequisite = (projectId) => {
        const newSelection = selectedPrerequisites.includes(projectId)
            ? selectedPrerequisites.filter((id) => id !== projectId)
            : [...selectedPrerequisites, projectId];

        onSelectionChange(newSelection);
    };

    const clearFilters = () => {
        setSearchTerm("");
        setStageFilter("");
        setStateFilter("");
    };

    const uniqueStages = [
        ...new Set(availableProjects.map((p) => p.stage)),
    ].sort((a, b) => a - b);

    const groupedProjects = useMemo(() => {
        const groups = {};
        filteredAndSortedProjects.forEach((project) => {
            const stage = project.stage;
            if (!groups[stage]) {
                groups[stage] = [];
            }
            groups[stage].push(project);
        });
        return groups;
    }, [filteredAndSortedProjects]);

    if (availableProjects.length === 0) {
        return (
            <div
                className="text-center text-muted text-sm"
                style={{ padding: "1rem" }}
            >
                No other projects available in this curriculum
            </div>
        );
    }

    return (
        <div className="form-compact">
            <div className="form-group">
                <input
                    type="text"
                    placeholder="Search by name, identifier, or topics..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-input"
                    disabled={disabled}
                />
            </div>

            <div className="grid grid-3">
                <div className="form-group">
                    <select
                        value={stageFilter}
                        onChange={(e) => setStageFilter(e.target.value)}
                        className="form-select"
                        disabled={disabled}
                    >
                        <option value="">All Stages</option>
                        {uniqueStages.map((stage) => (
                            <option key={stage} value={stage}>
                                Stage {stage}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <select
                        value={stateFilter}
                        onChange={(e) => setStateFilter(e.target.value)}
                        className="form-select"
                        disabled={disabled}
                    >
                        <option value="">All States</option>
                        {Object.entries(PROJECT_STATE_LABELS).map(
                            ([value, label]) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            )
                        )}
                    </select>
                </div>

                <div className="form-group">
                    {(searchTerm || stageFilter || stateFilter) && (
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="btn btn-secondary btn-small"
                            disabled={disabled}
                            style={{ width: "100%" }}
                        >
                            Clear Filters
                        </button>
                    )}
                </div>
            </div>

            {(searchTerm || stageFilter || stateFilter) && (
                <div
                    className="text-muted text-xs text-center"
                    style={{ marginBottom: "0.5rem" }}
                >
                    Showing {filteredAndSortedProjects.length} of{" "}
                    {availableProjects.length} projects
                </div>
            )}

            <div className="scrollable-list" style={{ maxHeight: "400px" }}>
                {Object.keys(groupedProjects).length === 0 ? (
                    <div className="text-center text-muted text-sm">
                        No projects match your filters
                    </div>
                ) : (
                    Object.entries(groupedProjects)
                        .sort(([a], [b]) => parseInt(a) - parseInt(b))
                        .map(([stage, projects]) => {
                            const level = getLevelForStage(
                                levels,
                                parseInt(stage)
                            );
                            return (
                                <div
                                    key={stage}
                                    style={{ marginBottom: "1rem" }}
                                >
                                    <div
                                        className="flex"
                                        style={{
                                            gap: "0.5rem",
                                            alignItems: "center",
                                            marginBottom: "0.5rem",
                                        }}
                                    >
                                        <h4
                                            style={{
                                                fontSize: "0.9rem",
                                                margin: 0,
                                            }}
                                        >
                                            Stage {stage}
                                        </h4>
                                        {level && (
                                            <span className="text-primary text-xs">
                                                ({level.name})
                                            </span>
                                        )}
                                    </div>

                                    {projects.map((project) => (
                                        <div
                                            key={project._id}
                                            style={{ marginBottom: "0.5rem" }}
                                        >
                                            <div
                                                className={`selection-card ${
                                                    selectedPrerequisites.includes(
                                                        project._id
                                                    )
                                                        ? "selected"
                                                        : ""
                                                } ${
                                                    disabled ? "disabled" : ""
                                                }`}
                                                onClick={() =>
                                                    !disabled &&
                                                    handleTogglePrerequisite(
                                                        project._id
                                                    )
                                                }
                                                style={{ padding: "0.5rem" }}
                                            >
                                                <div style={{ flex: 1 }}>
                                                    <div
                                                        className="flex"
                                                        style={{
                                                            gap: "0.5rem",
                                                            alignItems:
                                                                "center",
                                                            marginBottom:
                                                                "0.25rem",
                                                            flexWrap: "wrap",
                                                        }}
                                                    >
                                                        <span
                                                            style={{
                                                                fontWeight:
                                                                    "500",
                                                                fontSize:
                                                                    "0.9rem",
                                                            }}
                                                        >
                                                            {project.name}
                                                        </span>
                                                        {project.identifier && (
                                                            <span
                                                                className="text-primary"
                                                                style={{
                                                                    fontSize:
                                                                        "0.75rem",
                                                                    fontWeight:
                                                                        "600",
                                                                }}
                                                            >
                                                                [
                                                                {
                                                                    project.identifier
                                                                }
                                                                ]
                                                            </span>
                                                        )}
                                                        {project.order && (
                                                            <span
                                                                className="text-muted"
                                                                style={{
                                                                    fontSize:
                                                                        "0.75rem",
                                                                }}
                                                            >
                                                                #{project.order}
                                                            </span>
                                                        )}
                                                        <span
                                                            className={
                                                                PROJECT_STATE_COLORS[
                                                                    project
                                                                        .state
                                                                ]
                                                            }
                                                            style={{
                                                                fontSize:
                                                                    "0.75rem",
                                                            }}
                                                        >
                                                            {
                                                                PROJECT_STATE_LABELS[
                                                                    project
                                                                        .state
                                                                ]
                                                            }
                                                        </span>
                                                        {selectedPrerequisites.includes(
                                                            project._id
                                                        ) && (
                                                            <span
                                                                className="text-success"
                                                                style={{
                                                                    fontSize:
                                                                        "0.8rem",
                                                                    marginLeft:
                                                                        "auto",
                                                                }}
                                                            >
                                                                ✓
                                                            </span>
                                                        )}
                                                    </div>
                                                    {project.topics &&
                                                        project.topics.length >
                                                            0 && (
                                                            <div
                                                                className="flex"
                                                                style={{
                                                                    gap: "0.25rem",
                                                                    flexWrap:
                                                                        "wrap",
                                                                }}
                                                            >
                                                                {project.topics
                                                                    .slice(0, 3)
                                                                    .map(
                                                                        (
                                                                            topic,
                                                                            index
                                                                        ) => (
                                                                            <span
                                                                                key={
                                                                                    index
                                                                                }
                                                                                style={{
                                                                                    background:
                                                                                        "var(--bg-primary)",
                                                                                    padding:
                                                                                        "0.125rem 0.25rem",
                                                                                    borderRadius:
                                                                                        "3px",
                                                                                    fontSize:
                                                                                        "0.65rem",
                                                                                    color: "var(--text-secondary)",
                                                                                }}
                                                                            >
                                                                                {
                                                                                    topic
                                                                                }
                                                                            </span>
                                                                        )
                                                                    )}
                                                                {project.topics
                                                                    .length >
                                                                    3 && (
                                                                    <span
                                                                        style={{
                                                                            fontSize:
                                                                                "0.65rem",
                                                                            color: "var(--text-muted)",
                                                                            fontStyle:
                                                                                "italic",
                                                                        }}
                                                                    >
                                                                        +
                                                                        {project
                                                                            .topics
                                                                            .length -
                                                                            3}{" "}
                                                                        more
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                    <div
                                                        style={{
                                                            marginTop: "0.5rem",
                                                            fontSize: "0.75rem",
                                                        }}
                                                    >
                                                        <Link
                                                            to={`/project/${project._id}`}
                                                            className="text-primary"
                                                            onClick={(e) =>
                                                                e.stopPropagation()
                                                            }
                                                        >
                                                            View Project →
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            );
                        })
                )}
            </div>

            {selectedPrerequisites.length > 0 && (
                <div
                    className="text-muted text-sm text-center"
                    style={{ marginTop: "0.5rem" }}
                >
                    Selected {selectedPrerequisites.length} prerequisite
                    {selectedPrerequisites.length === 1 ? "" : "s"}
                </div>
            )}
        </div>
    );
};

export default PrerequisiteSelector;
