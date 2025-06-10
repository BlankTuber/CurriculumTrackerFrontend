import React from "react";
import { getUniqueStages, sortLevelsByOrder } from "../utils/stageUtils";
import { PROJECT_STATE_LABELS } from "../utils/projectUtils";

const ProjectFilter = ({
    projects = [],
    levels = [],
    searchQuery = "",
    stageFilter,
    levelFilter,
    topicFilter = "",
    githubFilter = "",
    onSearchChange,
    onStageChange,
    onLevelChange,
    onTopicChange,
    onGithubChange,
    showStateFilter = false,
    stateFilter,
    onStateChange,
}) => {
    const uniqueStages = getUniqueStages(projects);
    const sortedLevels = sortLevelsByOrder(levels);

    const getUniqueTopics = () => {
        const allTopics = projects
            .flatMap((project) => project.topics || [])
            .filter((topic) => topic && topic.trim());
        return [...new Set(allTopics)].sort();
    };

    const uniqueTopics = getUniqueTopics();

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

    const clearAllFilters = () => {
        onSearchChange("");
        onStageChange("");
        onLevelChange("");
        onTopicChange("");
        onGithubChange("");
        if (onStateChange) onStateChange("");
    };

    const hasActiveFilters =
        searchQuery ||
        stageFilter ||
        levelFilter ||
        topicFilter ||
        githubFilter ||
        stateFilter;

    return (
        <div className="card">
            <div className="card-header">
                <h3 className="card-title">Search & Filters</h3>
            </div>

            <div className="form-group">
                <label className="form-label">Search Projects</label>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="form-input"
                    placeholder="Search by name, description, identifier, or topics..."
                />
            </div>

            <div className="grid grid-3">
                <div className="form-group">
                    <label className="form-label">Stage</label>
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

                <div className="form-group">
                    <label className="form-label">Level</label>
                    <select
                        value={levelFilter}
                        onChange={handleLevelChange}
                        className="form-select"
                    >
                        <option value="">All Levels</option>
                        {sortedLevels.map((level) => (
                            <option key={level._id} value={level._id}>
                                {level.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label className="form-label">Topic</label>
                    <select
                        value={topicFilter}
                        onChange={(e) => onTopicChange(e.target.value)}
                        className="form-select"
                    >
                        <option value="">All Topics</option>
                        {uniqueTopics.map((topic) => (
                            <option key={topic} value={topic}>
                                {topic}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className={showStateFilter ? "grid grid-2" : "grid grid-1"}>
                <div className="form-group">
                    <label className="form-label">GitHub Repository</label>
                    <select
                        value={githubFilter}
                        onChange={(e) => onGithubChange(e.target.value)}
                        className="form-select"
                    >
                        <option value="">All Projects</option>
                        <option value="with">With GitHub Repo</option>
                        <option value="without">Without GitHub Repo</option>
                    </select>
                </div>

                {showStateFilter && (
                    <div className="form-group">
                        <label className="form-label">State</label>
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

            {hasActiveFilters && (
                <div className="flex-between" style={{ marginTop: "0.5rem" }}>
                    <div className="text-muted text-xs" style={{ flex: 1 }}>
                        {searchQuery && `Search: "${searchQuery}"`}
                        {searchQuery &&
                            (stageFilter ||
                                levelFilter ||
                                topicFilter ||
                                githubFilter ||
                                stateFilter) &&
                            " • "}
                        {stageFilter && `Stage ${stageFilter}`}
                        {stageFilter &&
                            (levelFilter ||
                                topicFilter ||
                                githubFilter ||
                                stateFilter) &&
                            " • "}
                        {levelFilter &&
                            `${
                                sortedLevels.find((l) => l._id === levelFilter)
                                    ?.name || "Selected Level"
                            }`}
                        {levelFilter &&
                            (topicFilter || githubFilter || stateFilter) &&
                            " • "}
                        {topicFilter && `Topic: ${topicFilter}`}
                        {topicFilter && (githubFilter || stateFilter) && " • "}
                        {githubFilter &&
                            `${
                                githubFilter === "with"
                                    ? "With GitHub"
                                    : githubFilter === "without"
                                    ? "Without GitHub"
                                    : ""
                            }`}
                        {githubFilter && stateFilter && " • "}
                        {stateFilter && PROJECT_STATE_LABELS[stateFilter]}
                    </div>
                    <button
                        onClick={clearAllFilters}
                        className="btn btn-secondary btn-small"
                        style={{
                            padding: "0.25rem 0.5rem",
                            fontSize: "0.7rem",
                        }}
                    >
                        Clear All
                    </button>
                </div>
            )}
        </div>
    );
};

export default ProjectFilter;
