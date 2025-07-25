import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { curriculumAPI, projectAPI, levelAPI, stageAPI } from "../utils/api";
import {
    getLevelForStage,
    sortProjectsByStageAndOrder,
    sortLevelsByOrder,
    filterProjectsByStage,
    filterProjectsByLevel,
    getProjectStats,
} from "../utils/stageUtils";
import {
    PROJECT_STATES,
    PROJECT_STATE_LABELS,
    constructGithubUrl,
} from "../utils/projectUtils";
import { useAuth } from "../contexts/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";
import Modal from "../components/Modal";
import CurriculumForm from "../components/CurriculumForm";
import ProjectForm from "../components/ProjectForm";
import ResourceForm from "../components/ResourceForm";
import LevelForm from "../components/LevelForm";
import StageForm from "../components/StageForm";
import ProjectNavigator from "../components/ProjectNavigator";
import ProjectStateToggle from "../components/ProjectStateToggle";
import Notification from "../components/Notification";

const CurriculumDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [curriculum, setCurriculum] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showEditModal, setShowEditModal] = useState(false);
    const [showProjectModal, setShowProjectModal] = useState(false);
    const [showResourceModal, setShowResourceModal] = useState(false);
    const [showLevelModal, setShowLevelModal] = useState(false);
    const [showStageModal, setShowStageModal] = useState(false);
    const [showDeleteProjectModal, setShowDeleteProjectModal] = useState(false);
    const [showDeleteResourceModal, setShowDeleteResourceModal] =
        useState(false);
    const [showDeleteLevelModal, setShowDeleteLevelModal] = useState(false);
    const [showDeleteStageModal, setShowDeleteStageModal] = useState(false);
    const [showEditLevelModal, setShowEditLevelModal] = useState(false);
    const [showEditStageModal, setShowEditStageModal] = useState(false);

    const [projectToDelete, setProjectToDelete] = useState(null);
    const [resourceToDelete, setResourceToDelete] = useState(null);
    const [levelToDelete, setLevelToDelete] = useState(null);
    const [stageToDelete, setStageToDelete] = useState(null);
    const [levelToEdit, setLevelToEdit] = useState(null);
    const [stageToEdit, setStageToEdit] = useState(null);

    const [searchQuery, setSearchQuery] = useState("");
    const [stageFilter, setStageFilter] = useState("");
    const [levelFilter, setLevelFilter] = useState("");
    const [topicFilter, setTopicFilter] = useState("");
    const [githubFilter, setGithubFilter] = useState("");
    const [stateFilter, setStateFilter] = useState("");

    const [selectedLevel, setSelectedLevel] = useState(null);
    const [selectedStage, setSelectedStage] = useState(null);

    const [navigationMode, setNavigationMode] = useState("browser");

    const [updatingStates, setUpdatingStates] = useState(new Set());

    const [notification, setNotification] = useState({
        isOpen: false,
        type: "info",
        title: "",
        message: "",
    });

    useEffect(() => {
        if (id) {
            fetchCurriculum();
        }
    }, [id]);

    const showNotification = (type, title, message) => {
        setNotification({
            isOpen: true,
            type,
            title,
            message,
        });
    };

    const closeNotification = () => {
        setNotification((prev) => ({
            ...prev,
            isOpen: false,
        }));
    };

    const fetchCurriculum = async () => {
        try {
            setError("");
            const data = await curriculumAPI.getById(id);

            if (!data || !data.curriculum) {
                throw new Error("Curriculum not found");
            }

            setCurriculum(data.curriculum);
        } catch (error) {
            setError(error.message || "Failed to load curriculum");
        } finally {
            setLoading(false);
        }
    };

    const handleEditSuccess = (updatedCurriculum) => {
        if (!updatedCurriculum) {
            showNotification(
                "error",
                "Error",
                "Invalid curriculum data received"
            );
            return;
        }
        setCurriculum(updatedCurriculum);
        setShowEditModal(false);
        showNotification(
            "success",
            "Success",
            "Curriculum updated successfully!"
        );
    };

    const handleProjectSuccess = (newProject) => {
        if (!newProject) {
            showNotification("error", "Error", "Invalid project data received");
            return;
        }

        const projectWithCurriculum = {
            ...newProject,
            curriculum: newProject.curriculum || {
                _id: curriculum._id,
                name: curriculum.name,
            },
        };
        setCurriculum((prev) => ({
            ...prev,
            projects: [...(prev.projects || []), projectWithCurriculum],
        }));
        setShowProjectModal(false);
        showNotification("success", "Success", "Project created successfully!");
    };

    const handleResourceSuccess = (newResource) => {
        if (!newResource) {
            showNotification(
                "error",
                "Error",
                "Invalid resource data received"
            );
            return;
        }
        setCurriculum((prev) => ({
            ...prev,
            resources: [...(prev.resources || []), newResource],
        }));
        setShowResourceModal(false);
        showNotification("success", "Success", "Resource added successfully!");
    };

    const handleLevelSuccess = (newLevel) => {
        if (!newLevel) {
            showNotification("error", "Error", "Invalid level data received");
            return;
        }
        setCurriculum((prev) => ({
            ...prev,
            levels: [...(prev.levels || []), newLevel],
        }));
        setShowLevelModal(false);
        showNotification("success", "Success", "Level created successfully!");
    };

    const handleStageSuccess = (newStage) => {
        if (!newStage) {
            showNotification("error", "Error", "Invalid stage data received");
            return;
        }
        setCurriculum((prev) => ({
            ...prev,
            stages: [...(prev.stages || []), newStage],
        }));
        setShowStageModal(false);
        showNotification("success", "Success", "Stage created successfully!");
    };

    const handleEditLevelSuccess = (updatedLevel) => {
        if (!updatedLevel) {
            showNotification("error", "Error", "Invalid level data received");
            return;
        }
        setCurriculum((prev) => ({
            ...prev,
            levels: (prev.levels || []).map((level) =>
                level._id === updatedLevel._id ? updatedLevel : level
            ),
        }));
        setShowEditLevelModal(false);
        setLevelToEdit(null);
        showNotification("success", "Success", "Level updated successfully!");
    };

    const handleEditStageSuccess = (updatedStage) => {
        if (!updatedStage) {
            showNotification("error", "Error", "Invalid stage data received");
            return;
        }
        setCurriculum((prev) => ({
            ...prev,
            stages: (prev.stages || []).map((stage) =>
                stage._id === updatedStage._id ? updatedStage : stage
            ),
        }));
        setShowEditStageModal(false);
        setStageToEdit(null);
        showNotification("success", "Success", "Stage updated successfully!");
    };

    const handleUpdateProjectState = async (project, newState) => {
        if (
            !project ||
            !project._id ||
            !Object.values(PROJECT_STATES).includes(newState)
        ) {
            showNotification("error", "Error", "Invalid project or state");
            return;
        }

        setUpdatingStates((prev) => new Set(prev).add(project._id));

        try {
            const result = await projectAPI.update(project._id, {
                state: newState,
            });

            if (!result || !result.project) {
                throw new Error("Invalid response from server");
            }

            setCurriculum((prev) => ({
                ...prev,
                projects: (prev.projects || []).map((p) =>
                    p._id === project._id
                        ? {
                              ...result.project,
                              curriculum:
                                  result.project.curriculum || p.curriculum,
                              prerequisites:
                                  result.project.prerequisites ||
                                  p.prerequisites,
                          }
                        : p
                ),
            }));

            showNotification(
                "success",
                "Success",
                `Project "${project.name || "Untitled"}" state updated to ${
                    PROJECT_STATE_LABELS[newState]
                }!`
            );
        } catch (error) {
            showNotification(
                "error",
                "Error",
                `Failed to update project: ${error.message}`
            );
        } finally {
            setUpdatingStates((prev) => {
                const newSet = new Set(prev);
                newSet.delete(project._id);
                return newSet;
            });
        }
    };

    const handleDeleteProjectClick = (project) => {
        if (!project || !project._id) {
            showNotification("error", "Error", "Invalid project");
            return;
        }
        setProjectToDelete(project);
        setShowDeleteProjectModal(true);
    };

    const handleDeleteProjectConfirm = async () => {
        if (!projectToDelete || !projectToDelete._id) return;

        try {
            await projectAPI.delete(projectToDelete._id);
            setCurriculum((prev) => ({
                ...prev,
                projects: (prev.projects || []).filter(
                    (p) => p._id !== projectToDelete._id
                ),
            }));
            setShowDeleteProjectModal(false);
            setProjectToDelete(null);
            showNotification(
                "success",
                "Success",
                "Project deleted successfully!"
            );
        } catch (error) {
            showNotification(
                "error",
                "Error",
                `Failed to delete project: ${error.message}`
            );
        }
    };

    const handleDeleteProjectCancel = () => {
        setShowDeleteProjectModal(false);
        setProjectToDelete(null);
    };

    const handleDeleteResourceClick = (resource) => {
        if (!resource || !resource._id) {
            showNotification("error", "Error", "Invalid resource");
            return;
        }
        setResourceToDelete(resource);
        setShowDeleteResourceModal(true);
    };

    const handleDeleteResourceConfirm = async () => {
        if (!resourceToDelete || !resourceToDelete._id) return;

        try {
            await curriculumAPI.deleteResource(resourceToDelete._id);
            setCurriculum((prev) => ({
                ...prev,
                resources: (prev.resources || []).filter(
                    (r) => r._id !== resourceToDelete._id
                ),
            }));
            setShowDeleteResourceModal(false);
            setResourceToDelete(null);
            showNotification(
                "success",
                "Success",
                "Resource deleted successfully!"
            );
        } catch (error) {
            showNotification(
                "error",
                "Error",
                `Failed to delete resource: ${error.message}`
            );
        }
    };

    const handleDeleteResourceCancel = () => {
        setShowDeleteResourceModal(false);
        setResourceToDelete(null);
    };

    const handleDeleteLevelClick = (level) => {
        if (!level || !level._id) {
            showNotification("error", "Error", "Invalid level");
            return;
        }
        setLevelToDelete(level);
        setShowDeleteLevelModal(true);
    };

    const handleDeleteLevelConfirm = async () => {
        if (!levelToDelete || !levelToDelete._id) return;

        try {
            await levelAPI.delete(levelToDelete._id);
            setCurriculum((prev) => ({
                ...prev,
                levels: (prev.levels || []).filter(
                    (l) => l._id !== levelToDelete._id
                ),
            }));
            setShowDeleteLevelModal(false);
            setLevelToDelete(null);
            showNotification(
                "success",
                "Success",
                "Level deleted successfully!"
            );
        } catch (error) {
            showNotification(
                "error",
                "Error",
                `Failed to delete level: ${error.message}`
            );
        }
    };

    const handleDeleteLevelCancel = () => {
        setShowDeleteLevelModal(false);
        setLevelToDelete(null);
    };

    const handleDeleteStageClick = (stage) => {
        if (!stage || !stage._id) {
            showNotification("error", "Error", "Invalid stage");
            return;
        }
        setStageToDelete(stage);
        setShowDeleteStageModal(true);
    };

    const handleDeleteStageConfirm = async () => {
        if (!stageToDelete || !stageToDelete._id) return;

        try {
            await stageAPI.delete(stageToDelete._id);
            setCurriculum((prev) => ({
                ...prev,
                stages: (prev.stages || []).filter(
                    (s) => s._id !== stageToDelete._id
                ),
            }));
            setShowDeleteStageModal(false);
            setStageToDelete(null);
            showNotification(
                "success",
                "Success",
                "Stage deleted successfully!"
            );
        } catch (error) {
            showNotification(
                "error",
                "Error",
                `Failed to delete stage: ${error.message}`
            );
        }
    };

    const handleDeleteStageCancel = () => {
        setShowDeleteStageModal(false);
        setStageToDelete(null);
    };

    const handleEditLevelClick = (level) => {
        if (!level || !level._id) {
            showNotification("error", "Error", "Invalid level");
            return;
        }
        setLevelToEdit(level);
        setShowEditLevelModal(true);
    };

    const handleEditStageClick = (stage) => {
        if (!stage || !stage._id) {
            showNotification("error", "Error", "Invalid stage");
            return;
        }
        setStageToEdit(stage);
        setShowEditStageModal(true);
    };

    const handleHierarchyLevelChange = (level) => {
        setSelectedLevel(level);
        setSelectedStage(null);
    };

    const handleHierarchyStageChange = (stage) => {
        setSelectedStage(stage);
    };

    const handleNavigationModeChange = (mode) => {
        setNavigationMode(mode);
        if (mode === "filter") {
            setSelectedLevel(null);
            setSelectedStage(null);
        } else {
            setSearchQuery("");
            setStageFilter("");
            setLevelFilter("");
            setTopicFilter("");
            setGithubFilter("");
            setStateFilter("");
        }
    };

    const isUsingFilters = () => {
        return (
            searchQuery ||
            stageFilter ||
            levelFilter ||
            topicFilter ||
            githubFilter ||
            stateFilter
        );
    };

    const getFilteredProjects = () => {
        if (
            !curriculum ||
            !curriculum.projects ||
            !Array.isArray(curriculum.projects)
        ) {
            return [];
        }

        let filteredProjects = [...curriculum.projects];

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filteredProjects = filteredProjects.filter((project) => {
                if (!project) return false;

                const matchesName =
                    project.name && project.name.toLowerCase().includes(query);
                const matchesDescription =
                    project.description &&
                    project.description.toLowerCase().includes(query);
                const matchesIdentifier =
                    project.identifier &&
                    project.identifier.toLowerCase().includes(query);
                const matchesTopics =
                    project.topics &&
                    Array.isArray(project.topics) &&
                    project.topics.some(
                        (topic) => topic && topic.toLowerCase().includes(query)
                    );

                return (
                    matchesName ||
                    matchesDescription ||
                    matchesIdentifier ||
                    matchesTopics
                );
            });
        }

        if (stageFilter) {
            filteredProjects = filterProjectsByStage(
                filteredProjects,
                stageFilter
            );
        }

        if (levelFilter) {
            filteredProjects = filterProjectsByLevel(
                filteredProjects,
                curriculum.levels || [],
                levelFilter
            );
        }

        if (topicFilter) {
            filteredProjects = filteredProjects.filter(
                (project) =>
                    project &&
                    project.topics &&
                    Array.isArray(project.topics) &&
                    project.topics.includes(topicFilter)
            );
        }

        if (githubFilter) {
            if (githubFilter === "with") {
                filteredProjects = filteredProjects.filter(
                    (project) =>
                        project &&
                        project.githubRepo &&
                        project.githubRepo.trim()
                );
            } else if (githubFilter === "without") {
                filteredProjects = filteredProjects.filter(
                    (project) =>
                        !project ||
                        !project.githubRepo ||
                        !project.githubRepo.trim()
                );
            }
        }

        if (stateFilter) {
            filteredProjects = filteredProjects.filter(
                (p) => p && p.state === stateFilter
            );
        }

        return sortProjectsByStageAndOrder(filteredProjects);
    };

    const getHierarchyProjects = () => {
        if (
            !curriculum ||
            !curriculum.projects ||
            !Array.isArray(curriculum.projects) ||
            !selectedLevel ||
            !selectedStage
        ) {
            return [];
        }

        const filteredProjects = curriculum.projects.filter(
            (project) => project && project.stage === selectedStage
        );

        return sortProjectsByStageAndOrder(filteredProjects);
    };

    const getCurrentProjects = () => {
        if (navigationMode === "filter" && isUsingFilters()) {
            return getFilteredProjects();
        } else if (
            navigationMode === "browser" &&
            selectedLevel &&
            selectedStage
        ) {
            return getHierarchyProjects();
        }
        return [];
    };

    const getProjectsTitle = () => {
        if (navigationMode === "filter" && isUsingFilters()) {
            const count = getFilteredProjects().length;
            const total = curriculum?.projects?.length || 0;
            return `Filtered Projects (${count}${
                total > 0 ? `/${total}` : ""
            })`;
        } else if (
            navigationMode === "browser" &&
            selectedLevel &&
            selectedStage
        ) {
            const count = getHierarchyProjects().length;
            return `Projects in ${selectedLevel.name} - Stage ${selectedStage} (${count})`;
        }
        return "Projects";
    };

    const getProjectsSubtitle = () => {
        if (navigationMode === "filter" && isUsingFilters()) {
            return "Results based on your search and filter criteria";
        } else if (
            navigationMode === "browser" &&
            selectedLevel &&
            selectedStage
        ) {
            return `Showing all projects for the selected level and stage`;
        }
        return "Use the search filters or browse hierarchy to find projects";
    };

    const renderProjectCard = (project) => {
        if (!project || !project._id) return null;

        const isUpdating = updatingStates.has(project._id);

        return (
            <div
                key={project._id}
                className="compact-item"
                style={{ alignItems: "flex-start" }}
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
                            to={`/project/${project._id}`}
                            style={{
                                textDecoration: "none",
                                color: "inherit",
                                fontSize: "0.9rem",
                                fontWeight: "500",
                            }}
                        >
                            {project.name || "Untitled Project"}
                        </Link>
                        {project.identifier && (
                            <span
                                className="text-primary"
                                style={{
                                    fontSize: "0.75rem",
                                    fontWeight: "600",
                                }}
                            >
                                [{project.identifier}]
                            </span>
                        )}
                        {navigationMode === "filter" && (
                            <span className="text-muted text-xs">
                                Stage {project.stage || "N/A"}
                                {project.order && ` #${project.order}`}
                            </span>
                        )}
                        {navigationMode === "browser" && project.order && (
                            <span className="text-muted text-xs">
                                #{project.order}
                            </span>
                        )}
                    </div>
                </div>
                <div className="btn-group">
                    <ProjectStateToggle
                        currentState={
                            project.state || PROJECT_STATES.NOT_STARTED
                        }
                        onStateChange={(newState) =>
                            handleUpdateProjectState(project, newState)
                        }
                        disabled={isUpdating}
                        size="small"
                    />
                    <Link
                        to={`/project/${project._id}`}
                        className="btn btn-primary btn-small"
                        style={{
                            padding: "0.25rem 0.5rem",
                            fontSize: "0.7rem",
                        }}
                    >
                        View
                    </Link>
                    <button
                        onClick={() => handleDeleteProjectClick(project)}
                        className="btn btn-danger btn-small"
                        style={{
                            padding: "0.25rem 0.5rem",
                            fontSize: "0.7rem",
                        }}
                    >
                        Delete
                    </button>
                </div>
            </div>
        );
    };

    const sortedLevels = sortLevelsByOrder(
        (curriculum && curriculum.levels) || []
    );
    const sortedStages =
        curriculum && curriculum.stages && Array.isArray(curriculum.stages)
            ? curriculum.stages.sort(
                  (a, b) => (a.stageNumber || 0) - (b.stageNumber || 0)
              )
            : [];
    const currentProjects = getCurrentProjects();

    if (loading) {
        return <LoadingSpinner message="Loading curriculum..." />;
    }

    if (error) {
        return (
            <div className="error-message">
                <p>{error}</p>
                <button
                    onClick={() => navigate("/dashboard")}
                    className="btn btn-secondary"
                >
                    Back to Dashboard
                </button>
            </div>
        );
    }

    if (!curriculum) {
        return (
            <div className="text-center">
                <h2>Curriculum not found</h2>
                <button
                    onClick={() => navigate("/dashboard")}
                    className="btn btn-secondary"
                >
                    Back to Dashboard
                </button>
            </div>
        );
    }

    const { total, completed } = getProjectStats(curriculum.projects || []);

    return (
        <div>
            <div className="flex-between mb-1">
                <div>
                    <Link
                        to="/dashboard"
                        className="text-muted text-sm"
                        style={{ textDecoration: "none" }}
                    >
                        ← Back to Dashboard
                    </Link>
                    <h1>{curriculum.name || "Untitled Curriculum"}</h1>
                    {curriculum.description && (
                        <p className="text-muted text-sm">
                            {curriculum.description}
                        </p>
                    )}
                    {total > 0 && (
                        <div
                            className="flex"
                            style={{ gap: "1rem", marginTop: "0.25rem" }}
                        >
                            <span className="text-muted text-sm">
                                {completed}/{total} projects completed
                            </span>
                            <span
                                className={
                                    completed === total
                                        ? "text-success"
                                        : "text-warning"
                                }
                                style={{
                                    fontSize: "0.85rem",
                                    fontWeight: "600",
                                }}
                            >
                                ({Math.round((completed / total) * 100)}%)
                            </span>
                        </div>
                    )}
                </div>
                <button
                    onClick={() => setShowEditModal(true)}
                    className="btn btn-secondary"
                >
                    Edit Curriculum
                </button>
            </div>

            <div className="grid grid-2">
                <ProjectNavigator
                    projects={curriculum.projects || []}
                    levels={curriculum.levels || []}
                    stages={curriculum.stages || []}
                    searchQuery={searchQuery}
                    stageFilter={stageFilter}
                    levelFilter={levelFilter}
                    topicFilter={topicFilter}
                    githubFilter={githubFilter}
                    stateFilter={stateFilter}
                    onSearchChange={setSearchQuery}
                    onStageChange={setStageFilter}
                    onLevelChange={setLevelFilter}
                    onTopicChange={setTopicFilter}
                    onGithubChange={setGithubFilter}
                    onStateChange={setStateFilter}
                    selectedLevel={selectedLevel}
                    selectedStage={selectedStage}
                    onHierarchyLevelChange={handleHierarchyLevelChange}
                    onHierarchyStageChange={handleHierarchyStageChange}
                    onAddProject={() => setShowProjectModal(true)}
                    onModeChange={handleNavigationModeChange}
                />

                <div className="card">
                    <div className="card-header">
                        <div className="flex-between">
                            <div>
                                <h2 className="card-title">
                                    {getProjectsTitle()}
                                </h2>
                                <p className="card-subtitle">
                                    {getProjectsSubtitle()}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowProjectModal(true)}
                                className="btn btn-primary btn-small"
                            >
                                Add Project
                            </button>
                        </div>
                    </div>

                    {currentProjects.length > 0 ? (
                        <div className="scrollable-list-extended">
                            <div className="compact-list">
                                {currentProjects.map(renderProjectCard)}
                            </div>
                        </div>
                    ) : (
                        <p className="text-muted text-center text-sm">
                            {navigationMode === "filter" && isUsingFilters()
                                ? "No projects match the current filters"
                                : navigationMode === "browser" &&
                                  selectedLevel &&
                                  selectedStage
                                ? `No projects found in ${selectedLevel.name}, Stage ${selectedStage}`
                                : "Use the navigation panel to search for projects or browse by hierarchy"}
                        </p>
                    )}
                </div>
            </div>

            <div className="grid grid-2">
                <div className="card">
                    <div className="card-header">
                        <div className="flex-between">
                            <h2 className="card-title">
                                Levels ({sortedLevels.length})
                            </h2>
                            <button
                                onClick={() => setShowLevelModal(true)}
                                className="btn btn-primary btn-small"
                            >
                                Add Level
                            </button>
                        </div>
                    </div>

                    {sortedLevels.length > 0 ? (
                        <div className="scrollable-list">
                            <div className="compact-list">
                                {sortedLevels.map((level) => {
                                    if (!level || !level._id) return null;
                                    return (
                                        <div
                                            key={level._id}
                                            className="compact-item"
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
                                                    <strong
                                                        style={{
                                                            fontSize: "0.9rem",
                                                        }}
                                                    >
                                                        {level.name ||
                                                            "Unnamed Level"}
                                                    </strong>
                                                    <span className="text-muted text-xs">
                                                        Stages{" "}
                                                        {level.stageStart ||
                                                            "N/A"}
                                                        -
                                                        {level.stageEnd ||
                                                            "N/A"}
                                                    </span>
                                                    <span className="text-muted text-xs">
                                                        Order{" "}
                                                        {level.order || "N/A"}
                                                    </span>
                                                    {level.defaultIdentifier && (
                                                        <span className="text-primary text-xs">
                                                            ID:{" "}
                                                            {
                                                                level.defaultIdentifier
                                                            }
                                                        </span>
                                                    )}
                                                </div>
                                                {level.description && (
                                                    <p
                                                        className="text-muted text-xs"
                                                        style={{
                                                            margin: 0,
                                                            lineHeight: "1.3",
                                                        }}
                                                    >
                                                        {level.description}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="btn-group">
                                                <button
                                                    onClick={() =>
                                                        handleEditLevelClick(
                                                            level
                                                        )
                                                    }
                                                    className="btn btn-secondary btn-small"
                                                    style={{
                                                        padding:
                                                            "0.25rem 0.5rem",
                                                        fontSize: "0.7rem",
                                                    }}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleDeleteLevelClick(
                                                            level
                                                        )
                                                    }
                                                    className="btn btn-danger btn-small"
                                                    style={{
                                                        padding:
                                                            "0.25rem 0.5rem",
                                                        fontSize: "0.7rem",
                                                    }}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <p className="text-muted text-center text-sm">
                            No levels yet
                        </p>
                    )}
                </div>

                <div className="card">
                    <div className="card-header">
                        <div className="flex-between">
                            <h2 className="card-title">
                                Stages ({sortedStages.length})
                            </h2>
                            <button
                                onClick={() => setShowStageModal(true)}
                                className="btn btn-primary btn-small"
                            >
                                Add Stage
                            </button>
                        </div>
                    </div>

                    {sortedStages.length > 0 ? (
                        <div className="scrollable-list">
                            <div className="compact-list">
                                {sortedStages.map((stage) => {
                                    if (!stage || !stage._id) return null;
                                    return (
                                        <div
                                            key={stage._id}
                                            className="compact-item"
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
                                                    <strong
                                                        style={{
                                                            fontSize: "0.9rem",
                                                        }}
                                                    >
                                                        Stage{" "}
                                                        {stage.stageNumber ||
                                                            "N/A"}
                                                        {stage.name &&
                                                            `: ${stage.name}`}
                                                    </strong>
                                                    {stage.defaultGithubRepo && (
                                                        <span className="text-primary text-xs">
                                                            Repo:{" "}
                                                            {
                                                                stage.defaultGithubRepo
                                                            }
                                                        </span>
                                                    )}
                                                </div>
                                                {stage.description && (
                                                    <p
                                                        className="text-muted text-xs"
                                                        style={{
                                                            margin: 0,
                                                            lineHeight: "1.3",
                                                        }}
                                                    >
                                                        {stage.description}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="btn-group">
                                                <button
                                                    onClick={() =>
                                                        handleEditStageClick(
                                                            stage
                                                        )
                                                    }
                                                    className="btn btn-secondary btn-small"
                                                    style={{
                                                        padding:
                                                            "0.25rem 0.5rem",
                                                        fontSize: "0.7rem",
                                                    }}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleDeleteStageClick(
                                                            stage
                                                        )
                                                    }
                                                    className="btn btn-danger btn-small"
                                                    style={{
                                                        padding:
                                                            "0.25rem 0.5rem",
                                                        fontSize: "0.7rem",
                                                    }}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <p className="text-muted text-center text-sm">
                            No stages yet
                        </p>
                    )}
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <div className="flex-between">
                        <h2 className="card-title">
                            Resources (
                            {curriculum.resources &&
                            Array.isArray(curriculum.resources)
                                ? curriculum.resources.length
                                : 0}
                            )
                        </h2>
                        <button
                            onClick={() => setShowResourceModal(true)}
                            className="btn btn-primary btn-small"
                        >
                            Add Resource
                        </button>
                    </div>
                </div>

                {curriculum.resources &&
                Array.isArray(curriculum.resources) &&
                curriculum.resources.length > 0 ? (
                    <div className="scrollable-list">
                        <div className="compact-list">
                            {curriculum.resources.map((resource) => {
                                if (!resource || !resource._id) return null;
                                return (
                                    <div
                                        key={resource._id}
                                        className="compact-item"
                                    >
                                        <div style={{ flex: 1 }}>
                                            <div
                                                className="flex"
                                                style={{
                                                    gap: "0.5rem",
                                                    alignItems: "center",
                                                }}
                                            >
                                                <strong
                                                    style={{
                                                        fontSize: "0.9rem",
                                                    }}
                                                >
                                                    {resource.name ||
                                                        "Untitled Resource"}
                                                </strong>
                                                <span className="text-muted text-xs">
                                                    {resource.type
                                                        ? resource.type
                                                              .charAt(0)
                                                              .toUpperCase() +
                                                          resource.type.slice(1)
                                                        : "Unknown Type"}
                                                </span>
                                            </div>
                                            {resource.link && (
                                                <a
                                                    href={resource.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-primary text-xs"
                                                >
                                                    {resource.link}
                                                </a>
                                            )}
                                        </div>
                                        <button
                                            onClick={() =>
                                                handleDeleteResourceClick(
                                                    resource
                                                )
                                            }
                                            className="btn btn-danger btn-small"
                                            style={{
                                                padding: "0.25rem 0.5rem",
                                                fontSize: "0.7rem",
                                            }}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <p className="text-muted text-center text-sm">
                        No resources yet
                    </p>
                )}
            </div>

            <Modal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                title="Edit Curriculum"
            >
                <CurriculumForm
                    curriculum={curriculum}
                    onSuccess={handleEditSuccess}
                    onCancel={() => setShowEditModal(false)}
                />
            </Modal>

            <Modal
                isOpen={showProjectModal}
                onClose={() => setShowProjectModal(false)}
                title="Create New Project"
            >
                <ProjectForm
                    curriculumId={curriculum._id}
                    onSuccess={handleProjectSuccess}
                    onCancel={() => setShowProjectModal(false)}
                />
            </Modal>

            <Modal
                isOpen={showResourceModal}
                onClose={() => setShowResourceModal(false)}
                title="Add Resource"
            >
                <ResourceForm
                    curriculumId={curriculum._id}
                    onSuccess={handleResourceSuccess}
                    onCancel={() => setShowResourceModal(false)}
                />
            </Modal>

            <Modal
                isOpen={showLevelModal}
                onClose={() => setShowLevelModal(false)}
                title="Create New Level"
            >
                <LevelForm
                    curriculumId={curriculum._id}
                    onSuccess={handleLevelSuccess}
                    onCancel={() => setShowLevelModal(false)}
                />
            </Modal>

            <Modal
                isOpen={showStageModal}
                onClose={() => setShowStageModal(false)}
                title="Create New Stage"
            >
                <StageForm
                    curriculumId={curriculum._id}
                    onSuccess={handleStageSuccess}
                    onCancel={() => setShowStageModal(false)}
                />
            </Modal>

            <Modal
                isOpen={showEditLevelModal}
                onClose={() => setShowEditLevelModal(false)}
                title="Edit Level"
            >
                <LevelForm
                    level={levelToEdit}
                    curriculumId={curriculum._id}
                    onSuccess={handleEditLevelSuccess}
                    onCancel={() => setShowEditLevelModal(false)}
                />
            </Modal>

            <Modal
                isOpen={showEditStageModal}
                onClose={() => setShowEditStageModal(false)}
                title="Edit Stage"
            >
                <StageForm
                    stage={stageToEdit}
                    curriculumId={curriculum._id}
                    onSuccess={handleEditStageSuccess}
                    onCancel={() => setShowEditStageModal(false)}
                />
            </Modal>

            <Modal
                isOpen={showDeleteProjectModal}
                onClose={handleDeleteProjectCancel}
                title="Delete Project"
            >
                <div className="mb-1">
                    <p className="text-error mb-1">
                        ⚠️ Are you sure you want to delete "
                        {(projectToDelete && projectToDelete.name) ||
                            "this project"}
                        "?
                    </p>
                    <p className="text-muted text-sm">
                        This will permanently delete the project and all
                        associated notes. This action cannot be undone.
                    </p>
                </div>

                <div className="btn-group">
                    <button
                        onClick={handleDeleteProjectConfirm}
                        className="btn btn-danger"
                    >
                        Delete Project
                    </button>
                    <button
                        onClick={handleDeleteProjectCancel}
                        className="btn btn-secondary"
                    >
                        Cancel
                    </button>
                </div>
            </Modal>

            <Modal
                isOpen={showDeleteResourceModal}
                onClose={handleDeleteResourceCancel}
                title="Delete Resource"
            >
                <div className="mb-1">
                    <p className="text-error mb-1">
                        ⚠️ Are you sure you want to delete "
                        {(resourceToDelete && resourceToDelete.name) ||
                            "this resource"}
                        "?
                    </p>
                    <p className="text-muted text-sm">
                        This action cannot be undone.
                    </p>
                </div>

                <div className="btn-group">
                    <button
                        onClick={handleDeleteResourceConfirm}
                        className="btn btn-danger"
                    >
                        Delete Resource
                    </button>
                    <button
                        onClick={handleDeleteResourceCancel}
                        className="btn btn-secondary"
                    >
                        Cancel
                    </button>
                </div>
            </Modal>

            <Modal
                isOpen={showDeleteLevelModal}
                onClose={handleDeleteLevelCancel}
                title="Delete Level"
            >
                <div className="mb-1">
                    <p className="text-error mb-1">
                        ⚠️ Are you sure you want to delete "
                        {(levelToDelete && levelToDelete.name) || "this level"}
                        "?
                    </p>
                    <p className="text-muted text-sm">
                        This action cannot be undone.
                    </p>
                </div>

                <div className="btn-group">
                    <button
                        onClick={handleDeleteLevelConfirm}
                        className="btn btn-danger"
                    >
                        Delete Level
                    </button>
                    <button
                        onClick={handleDeleteLevelCancel}
                        className="btn btn-secondary"
                    >
                        Cancel
                    </button>
                </div>
            </Modal>

            <Modal
                isOpen={showDeleteStageModal}
                onClose={handleDeleteStageCancel}
                title="Delete Stage"
            >
                <div className="mb-1">
                    <p className="text-error mb-1">
                        ⚠️ Are you sure you want to delete "Stage{" "}
                        {(stageToDelete && stageToDelete.stageNumber) || "N/A"}
                        {stageToDelete &&
                            stageToDelete.name &&
                            `: ${stageToDelete.name}`}
                        "?
                    </p>
                    <p className="text-muted text-sm">
                        This action cannot be undone.
                    </p>
                </div>

                <div className="btn-group">
                    <button
                        onClick={handleDeleteStageConfirm}
                        className="btn btn-danger"
                    >
                        Delete Stage
                    </button>
                    <button
                        onClick={handleDeleteStageCancel}
                        className="btn btn-secondary"
                    >
                        Cancel
                    </button>
                </div>
            </Modal>

            <Notification
                isOpen={notification.isOpen}
                onClose={closeNotification}
                type={notification.type}
                title={notification.title}
                message={notification.message}
            />
        </div>
    );
};

export default CurriculumDetail;
