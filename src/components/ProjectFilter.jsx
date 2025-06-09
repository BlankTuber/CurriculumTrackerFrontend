import React from "react";
import { getUniqueStages, sortLevelsByOrder } from "../utils/stageUtils";

const ProjectFilter = ({
    projects = [],
    levels = [],
    stageFilter,
    levelFilter,
    onStageChange,
    onLevelChange,
    showCompletionFilter = false,
    completionFilter,
    onCompletionChange,
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

            <div className="grid grid-3">
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

                {showCompletionFilter && (
                    <div>
                        <label className="form-label">Filter by Status</label>
                        <select
                            value={completionFilter}
                            onChange={(e) => onCompletionChange(e.target.value)}
                            className="form-select"
                        >
                            <option value="">All Projects</option>
                            <option value="completed">Completed</option>
                            <option value="incomplete">In Progress</option>
                        </select>
                    </div>
                )}
            </div>

            {(stageFilter || levelFilter || completionFilter) && (
                <div className="flex-between mt-1">
                    <span className="text-muted">
                        {stageFilter && `Showing Stage ${stageFilter}`}
                        {levelFilter &&
                            `Showing ${
                                sortedLevels.find((l) => l._id === levelFilter)
                                    ?.name || "Selected Level"
                            }`}
                        {completionFilter &&
                            ` • ${
                                completionFilter === "completed"
                                    ? "Completed"
                                    : "In Progress"
                            } only`}
                    </span>
                    <button
                        onClick={() => {
                            onStageChange("");
                            onLevelChange("");
                            if (onCompletionChange) onCompletionChange("");
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
