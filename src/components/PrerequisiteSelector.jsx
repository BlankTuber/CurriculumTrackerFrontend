import React, { useState, useMemo } from "react";
import {
    sortProjectsByStageAndOrder,
    getLevelForStage,
} from "../utils/stageUtils";

const PrerequisiteSelector = ({
    availableProjects = [],
    selectedPrerequisites = [],
    onSelectionChange,
    levels = [],
    disabled = false,
}) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [stageFilter, setStageFilter] = useState("");
    const [completionFilter, setCompletionFilter] = useState("");

    const filteredAndSortedProjects = useMemo(() => {
        let filtered = [...availableProjects];

        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            filtered = filtered.filter(
                (project) =>
                    project.name.toLowerCase().includes(search) ||
                    project.description.toLowerCase().includes(search)
            );
        }

        if (stageFilter) {
            const stage = parseInt(stageFilter);
            filtered = filtered.filter((project) => project.stage === stage);
        }

        if (completionFilter) {
            filtered = filtered.filter((project) =>
                completionFilter === "completed"
                    ? project.completed
                    : !project.completed
            );
        }

        return sortProjectsByStageAndOrder(filtered);
    }, [availableProjects, searchTerm, stageFilter, completionFilter]);

    const handleTogglePrerequisite = (projectId) => {
        const newSelection = selectedPrerequisites.includes(projectId)
            ? selectedPrerequisites.filter((id) => id !== projectId)
            : [...selectedPrerequisites, projectId];

        onSelectionChange(newSelection);
    };

    const clearFilters = () => {
        setSearchTerm("");
        setStageFilter("");
        setCompletionFilter("");
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
                        placeholder="Search projects by name or description..."
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
                            value={completionFilter}
                            onChange={(e) =>
                                setCompletionFilter(e.target.value)
                            }
                            className="form-select"
                            disabled={disabled}
                        >
                            <option value="">All Projects</option>
                            <option value="completed">Completed Only</option>
                            <option value="incomplete">In Progress Only</option>
                        </select>
                    </div>
                </div>

                {(searchTerm || stageFilter || completionFilter) && (
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
                                            <label
                                                style={{
                                                    display: "flex",
                                                    alignItems: "flex-start",
                                                    cursor: disabled
                                                        ? "default"
                                                        : "pointer",
                                                    padding: "0.5rem",
                                                    borderRadius: "4px",
                                                    transition:
                                                        "background-color 0.2s ease",
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (!disabled) {
                                                        e.target.style.backgroundColor =
                                                            "var(--hover-bg)";
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.target.style.backgroundColor =
                                                        "transparent";
                                                }}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedPrerequisites.includes(
                                                        project._id
                                                    )}
                                                    onChange={() =>
                                                        handleTogglePrerequisite(
                                                            project._id
                                                        )
                                                    }
                                                    disabled={disabled}
                                                    style={{
                                                        marginRight: "0.75rem",
                                                        marginTop: "0.25rem",
                                                        flexShrink: 0,
                                                    }}
                                                />
                                                <div style={{ flex: 1 }}>
                                                    <div
                                                        className="flex"
                                                        style={{
                                                            gap: "0.5rem",
                                                            alignItems:
                                                                "center",
                                                            marginBottom:
                                                                "0.25rem",
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
                                                        {project.completed && (
                                                            <span
                                                                className="text-success"
                                                                style={{
                                                                    fontSize:
                                                                        "0.8rem",
                                                                }}
                                                            >
                                                                ✓ Completed
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p
                                                        className="text-muted"
                                                        style={{
                                                            fontSize: "0.85rem",
                                                            margin: 0,
                                                            lineHeight: "1.3",
                                                        }}
                                                    >
                                                        {project.description}
                                                    </p>
                                                </div>
                                            </label>
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
