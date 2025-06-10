import React from "react";
import { getUniqueStages, sortLevelsByOrder } from "../utils/stageUtils";
import { PROJECT_STATE_LABELS } from "../utils/projectUtils";

const ProjectFilter = ({
    projects = [],
    levels = [],
    stageFilter,
    levelFilter,
    onStageChange,
    onLevelChange,
    showStateFilter = false,
    stateFilter,
    onStateChange,
}) => {
    const uniqueStages = getUniqueStages(projects);
    const sortedLevels = sortLevelsByOrder(levels);

    const handleStageChange = (e) => {
        const value = e.target.value;
        onStageChange(value);
        if (value && onLevelChange) {
            onLevelChange("");
        }
    };

    const handleLevelChange = (e) => {
        const value = e.target.value;
        onLevelChange(value);
        if (value && onStageChange) {
            onStageChange("");
        }
    };

    return (
        <div className="card mb-2">
            <div className="card-header">
                <h3 className="card-title">Filter Projects</h3>
            </div>

            <div className={showStateFilter ? "grid grid-3" : "grid grid-2"}>
                <div>
                    <label className="form-label">Filter by Stage</label>
                    <select
                        value={stageFilter}
                        onChange={handleStageChange}
                        className="form-select"
                    >
                        <option value="">All Stages</option>
                        {uniqueStages.map((stage) => (
                            <option key={stage} value={stage}>
                                Stage {stage}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="form-label">Filter by Level</label>
                    <select
                        value={levelFilter}
                        onChange={handleLevelChange}
                        className="form-select"
                    >
                        <option value="">All Levels</option>
                        {sortedLevels.map((level) => (
                            <option key={level._id} value={level._id}>
                                {level.name} (Stages {level.stageStart}-
                                {level.stageEnd})
                            </option>
                        ))}
                    </select>
                </div>

                {showStateFilter && (
                    <div>
                        <label className="form-label">Filter by State</label>
                        <select
                            value={stateFilter}
                            onChange={(e) => onStateChange(e.target.value)}
                            className="form-select"
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
                )}
            </div>

            {(stageFilter || levelFilter || stateFilter) && (
                <div className="flex-between mt-1">
                    <span className="text-muted">
                        {stageFilter && `Showing Stage ${stageFilter}`}
                        {levelFilter &&
                            `Showing ${
                                sortedLevels.find((l) => l._id === levelFilter)
                                    ?.name || "Selected Level"
                            }`}
                        {stateFilter &&
                            ` • ${PROJECT_STATE_LABELS[stateFilter]} only`}
                    </span>
                    <button
                        onClick={() => {
                            onStageChange("");
                            onLevelChange("");
                            if (onStateChange) onStateChange("");
                        }}
                        className="btn btn-secondary btn-small"
                    >
                        Clear Filters
                    </button>
                </div>
            )}
        </div>
    );
};

export default ProjectFilter;
