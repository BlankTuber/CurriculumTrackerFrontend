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
                    project.description.toLowerCase().includes(search) ||
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
            <div className="text-center text-muted" style={{ padding: "2rem" }}>
                No other projects available in this curriculum
            </div>
        );
    }

    return (
        <div>
            <div className="mb-2">
                <div className="form-group">
                    <input
                        type="text"
                        placeholder="Search by name, description, identifier, or topics..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="form-input"
                        disabled={disabled}
                    />
                </div>

                <div className="grid grid-2">
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
                </div>

                {(searchTerm || stageFilter || stateFilter) && (
                    <div className="flex-between">
                        <span
                            className="text-muted"
                            style={{ fontSize: "0.9rem" }}
                        >
                            Showing {filteredAndSortedProjects.length} of{" "}
                            {availableProjects.length} projects
                        </span>
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="btn btn-secondary btn-small"
                            disabled={disabled}
                        >
                            Clear Filters
                        </button>
                    </div>
                )}
            </div>

            <div
                style={{
                    maxHeight: "300px",
                    overflowY: "auto",
                    border: "1px solid var(--border-color)",
                    borderRadius: "6px",
                    padding: "1rem",
                }}
            >
                {Object.keys(groupedProjects).length === 0 ? (
                    <div className="text-center text-muted">
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
                                <div key={stage} className="mb-2">
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
                                                fontSize: "1rem",
                                                margin: 0,
                                            }}
                                        >
                                            Stage {stage}
                                        </h4>
                                        {level && (
                                            <span
                                                className="text-primary"
                                                style={{ fontSize: "0.9rem" }}
                                            >
                                                ({level.name})
                                            </span>
                                        )}
                                    </div>

                                    {projects.map((project) => (
                                        <div key={project._id} className="mb-1">
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
                                                            }}
                                                        >
                                                            {project.name}
                                                        </span>
                                                        {project.identifier && (
                                                            <span
                                                                className="text-primary"
                                                                style={{
                                                                    fontSize:
                                                                        "0.8rem",
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
                                                                        "0.8rem",
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
                                                                    "0.8rem",
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
                                                                        "0.9rem",
                                                                    marginLeft:
                                                                        "auto",
                                                                }}
                                                            >
                                                                ✓
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p
                                                        className="text-muted"
                                                        style={{
                                                            fontSize: "0.85rem",
                                                            margin: 0,
                                                            lineHeight: "1.3",
                                                            marginBottom:
                                                                "0.25rem",
                                                        }}
                                                    >
                                                        {project.description}
                                                    </p>
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
                                                                {project.topics.map(
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
                                                                                    "0.7rem",
                                                                                color: "var(--text-secondary)",
                                                                            }}
                                                                        >
                                                                            {
                                                                                topic
                                                                            }
                                                                        </span>
                                                                    )
                                                                )}
                                                            </div>
                                                        )}
                                                    <div
                                                        style={{
                                                            marginTop: "0.5rem",
                                                            fontSize: "0.8rem",
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
                <div className="mt-1">
                    <p className="text-muted" style={{ fontSize: "0.9rem" }}>
                        Selected {selectedPrerequisites.length} prerequisite
                        {selectedPrerequisites.length === 1 ? "" : "s"}
                    </p>
                </div>
            )}
        </div>
    );
};

export default PrerequisiteSelector;
