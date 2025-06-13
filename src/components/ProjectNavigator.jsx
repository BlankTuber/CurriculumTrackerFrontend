import React, { useState } from "react";
import ProjectFilter from "./ProjectFilter";
import ProjectHierarchyBrowser from "./ProjectHierarchyBrowser";

const ProjectNavigator = ({
    projects = [],
    levels = [],
    stages = [],
    searchQuery = "",
    stageFilter,
    levelFilter,
    topicFilter = "",
    githubFilter = "",
    stateFilter,
    onSearchChange,
    onStageChange,
    onLevelChange,
    onTopicChange,
    onGithubChange,
    onStateChange,
    selectedLevel,
    selectedStage,
    onHierarchyLevelChange,
    onHierarchyStageChange,
    onAddProject,
    onModeChange,
}) => {
    const [activeTab, setActiveTab] = useState("browser");

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        if (onModeChange) {
            onModeChange(tab);
        }
    };

    return (
        <div className="card">
            <div className="card-header">
                <div className="flex-between" style={{ alignItems: "center" }}>
                    <h3 className="card-title">Find Projects</h3>
                    <div className="btn-group">
                        <button
                            onClick={() => handleTabChange("browser")}
                            className={`btn btn-small ${
                                activeTab === "browser"
                                    ? "btn-primary"
                                    : "btn-secondary"
                            }`}
                        >
                            Browse Hierarchy
                        </button>
                        <button
                            onClick={() => handleTabChange("filter")}
                            className={`btn btn-small ${
                                activeTab === "filter"
                                    ? "btn-primary"
                                    : "btn-secondary"
                            }`}
                        >
                            Search & Filter
                        </button>
                    </div>
                </div>
            </div>

            {activeTab === "browser" && (
                <div style={{ border: "none", padding: "0" }}>
                    <ProjectHierarchyBrowser
                        levels={levels}
                        projects={projects}
                        stages={stages}
                        selectedLevel={selectedLevel}
                        selectedStage={selectedStage}
                        onLevelChange={onHierarchyLevelChange}
                        onStageChange={onHierarchyStageChange}
                        onAddProject={onAddProject}
                        hideTitle={true}
                    />
                </div>
            )}

            {activeTab === "filter" && (
                <div style={{ border: "none", padding: "0" }}>
                    <ProjectFilter
                        projects={projects}
                        levels={levels}
                        searchQuery={searchQuery}
                        stageFilter={stageFilter}
                        levelFilter={levelFilter}
                        topicFilter={topicFilter}
                        githubFilter={githubFilter}
                        stateFilter={stateFilter}
                        onSearchChange={onSearchChange}
                        onStageChange={onStageChange}
                        onLevelChange={onLevelChange}
                        onTopicChange={onTopicChange}
                        onGithubChange={onGithubChange}
                        onStateChange={onStateChange}
                        showStateFilter={true}
                        hideTitle={true}
                    />
                </div>
            )}
        </div>
    );
};

export default ProjectNavigator;
