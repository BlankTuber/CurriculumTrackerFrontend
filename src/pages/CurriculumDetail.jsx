import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { curriculumAPI, projectAPI, levelAPI } from "../utils/api";
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
    PROJECT_STATE_COLORS,
    constructGithubUrl,
} from "../utils/projectUtils";
import { useAuth } from "../contexts/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";
import Modal from "../components/Modal";
import CurriculumForm from "../components/CurriculumForm";
import ProjectForm from "../components/ProjectForm";
import ResourceForm from "../components/ResourceForm";
import LevelForm from "../components/LevelForm";
import ProjectFilter from "../components/ProjectFilter";
import ProjectHierarchyBrowser from "../components/ProjectHierarchyBrowser";
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
    const [showDeleteProjectModal, setShowDeleteProjectModal] = useState(false);
    const [showDeleteResourceModal, setShowDeleteResourceModal] =
        useState(false);
    const [showDeleteLevelModal, setShowDeleteLevelModal] = useState(false);
    const [showEditLevelModal, setShowEditLevelModal] = useState(false);

    const [projectToDelete, setProjectToDelete] = useState(null);
    const [resourceToDelete, setResourceToDelete] = useState(null);
    const [levelToDelete, setLevelToDelete] = useState(null);
    const [levelToEdit, setLevelToEdit] = useState(null);

    const [searchQuery, setSearchQuery] = useState("");
    const [stageFilter, setStageFilter] = useState("");
    const [levelFilter, setLevelFilter] = useState("");
    const [topicFilter, setTopicFilter] = useState("");
    const [githubFilter, setGithubFilter] = useState("");
    const [stateFilter, setStateFilter] = useState("");

    const [selectedLevel, setSelectedLevel] = useState(null);
    const [selectedStage, setSelectedStage] = useState(null);

    const [notification, setNotification] = useState({
        isOpen: false,
        type: "info",
        title: "",
        message: "",
    });

    useEffect(() => {
        fetchCurriculum();
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
            setCurriculum(data.curriculum);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEditSuccess = (updatedCurriculum) => {
        setCurriculum(updatedCurriculum);
        setShowEditModal(false);
        showNotification(
            "success",
            "Success",
            "Curriculum updated successfully!"
        );
    };

    const handleProjectSuccess = (newProject) => {
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
        setCurriculum((prev) => ({
            ...prev,
            resources: [...(prev.resources || []), newResource],
        }));
        setShowResourceModal(false);
        showNotification("success", "Success", "Resource added successfully!");
    };

    const handleLevelSuccess = (newLevel) => {
        setCurriculum((prev) => ({
            ...prev,
            levels: [...(prev.levels || []), newLevel],
        }));
        setShowLevelModal(false);
        showNotification("success", "Success", "Level created successfully!");
    };

    const handleEditLevelSuccess = (updatedLevel) => {
        setCurriculum((prev) => ({
            ...prev,
            levels: prev.levels.map((level) =>
                level._id === updatedLevel._id ? updatedLevel : level
            ),
        }));
        setShowEditLevelModal(false);
        setLevelToEdit(null);
        showNotification("success", "Success", "Level updated successfully!");
    };

    const handleUpdateProjectState = async (project, newState) => {
        try {
            const result = await projectAPI.update(project._id, {
                state: newState,
            });

            setCurriculum((prev) => ({
                ...prev,
                projects: prev.projects.map((p) =>
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
                `Project "${project.name}" state updated to ${PROJECT_STATE_LABELS[newState]}!`
            );
        } catch (error) {
            showNotification(
                "error",
                "Error",
                `Failed to update project: ${error.message}`
            );
        }
    };

    const handleDeleteProjectClick = (project) => {
        setProjectToDelete(project);
        setShowDeleteProjectModal(true);
    };

    const handleDeleteProjectConfirm = async () => {
        if (!projectToDelete) return;

        try {
            await projectAPI.delete(projectToDelete._id);
            setCurriculum((prev) => ({
                ...prev,
                projects: prev.projects.filter(
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
        setResourceToDelete(resource);
        setShowDeleteResourceModal(true);
    };

    const handleDeleteResourceConfirm = async () => {
        if (!resourceToDelete) return;

        try {
            await curriculumAPI.deleteResource(resourceToDelete._id);
            setCurriculum((prev) => ({
                ...prev,
                resources: prev.resources.filter(
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
        setLevelToDelete(level);
        setShowDeleteLevelModal(true);
    };

    const handleDeleteLevelConfirm = async () => {
        if (!levelToDelete) return;

        try {
            await levelAPI.delete(levelToDelete._id);
            setCurriculum((prev) => ({
                ...prev,
                levels: prev.levels.filter((l) => l._id !== levelToDelete._id),
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

    const handleEditLevelClick = (level) => {
        setLevelToEdit(level);
        setShowEditLevelModal(true);
    };

    const handleHierarchyLevelChange = (level) => {
        setSelectedLevel(level);
        if (level) {
            clearAllFilters();
        }
    };

    const handleHierarchyStageChange = (stage) => {
        setSelectedStage(stage);
    };

    const clearAllFilters = () => {
        setSearchQuery("");
        setStageFilter("");
        setLevelFilter("");
        setTopicFilter("");
        setGithubFilter("");
        setStateFilter("");
    };

    const clearHierarchySelection = () => {
        setSelectedLevel(null);
        setSelectedStage(null);
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
        if (!curriculum?.projects) return [];

        let filteredProjects = [...curriculum.projects];

        if (isUsingFilters()) {
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                filteredProjects = filteredProjects.filter((project) => {
                    const matchesName = project.name
                        .toLowerCase()
                        .includes(query);
                    const matchesDescription = project.description
                        .toLowerCase()
                        .includes(query);
                    const matchesIdentifier = project.identifier
                        ?.toLowerCase()
                        .includes(query);
                    const matchesTopics = project.topics?.some((topic) =>
                        topic.toLowerCase().includes(query)
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
                    curriculum.levels,
                    levelFilter
                );
            }

            if (topicFilter) {
                filteredProjects = filteredProjects.filter((project) =>
                    project.topics?.includes(topicFilter)
                );
            }

            if (githubFilter) {
                if (githubFilter === "with") {
                    filteredProjects = filteredProjects.filter(
                        (project) =>
                            project.githubRepo && project.githubRepo.trim()
                    );
                } else if (githubFilter === "without") {
                    filteredProjects = filteredProjects.filter(
                        (project) =>
                            !project.githubRepo || !project.githubRepo.trim()
                    );
                }
            }

            if (stateFilter) {
                filteredProjects = filteredProjects.filter(
                    (p) => p.state === stateFilter
                );
            }
        } else if (selectedLevel && selectedStage) {
            filteredProjects = filteredProjects.filter(
                (project) => project.stage === selectedStage
            );
        } else {
            return [];
        }

        return sortProjectsByStageAndOrder(filteredProjects);
    };

    const renderProjectCard = (project) => {
        const projectLevel = getLevelForStage(
            curriculum.levels || [],
            project.stage
        );
        const githubUrl = constructGithubUrl(
            user?.githubUsername,
            project.githubRepo
        );

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
                            {project.name}
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
                        {!selectedStage && (
                            <span className="text-muted text-xs">
                                Stage {project.stage}
                                {project.order && ` #${project.order}`}
                            </span>
                        )}
                        {selectedStage && project.order && (
                            <span className="text-muted text-xs">
                                #{project.order}
                            </span>
                        )}
                        {projectLevel && !selectedLevel && (
                            <span className="text-primary text-xs">
                                {projectLevel.name}
                            </span>
                        )}
                        <span
                            className={PROJECT_STATE_COLORS[project.state]}
                            style={{
                                fontSize: "0.75rem",
                                fontWeight: "500",
                            }}
                        >
                            {PROJECT_STATE_LABELS[project.state]}
                        </span>
                        {githubUrl && (
                            <a
                                href={githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary text-xs"
                            >
                                GitHub
                            </a>
                        )}
                    </div>
                    {project.topics && project.topics.length > 0 && (
                        <div
                            className="flex"
                            style={{
                                gap: "0.25rem",
                                flexWrap: "wrap",
                            }}
                        >
                            {project.topics.slice(0, 4).map((topic, index) => (
                                <span
                                    key={index}
                                    style={{
                                        background: "var(--bg-primary)",
                                        padding: "0.125rem 0.25rem",
                                        borderRadius: "3px",
                                        fontSize: "0.65rem",
                                        color: "var(--text-secondary)",
                                    }}
                                >
                                    {topic}
                                </span>
                            ))}
                            {project.topics.length > 4 && (
                                <span
                                    className="text-muted"
                                    style={{
                                        fontSize: "0.65rem",
                                        fontStyle: "italic",
                                    }}
                                >
                                    +{project.topics.length - 4} more
                                </span>
                            )}
                        </div>
                    )}
                </div>
                <div className="btn-group">
                    <select
                        value={project.state}
                        onChange={(e) =>
                            handleUpdateProjectState(project, e.target.value)
                        }
                        className="form-select"
                        style={{
                            width: "auto",
                            minWidth: "120px",
                            fontSize: "0.75rem",
                            padding: "0.25rem",
                        }}
                    >
                        {Object.entries(PROJECT_STATE_LABELS).map(
                            ([value, label]) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            )
                        )}
                    </select>
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

    const sortedLevels = sortLevelsByOrder(curriculum?.levels || []);
    const sortedProjects = getFilteredProjects();
    const hasActiveFilters = isUsingFilters();
    const hasHierarchySelection = selectedLevel && selectedStage;

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

    const { total, completed } = getProjectStats(curriculum?.projects || []);

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
                    <h1>{curriculum.name}</h1>
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
                <ProjectFilter
                    projects={curriculum.projects || []}
                    levels={curriculum.levels || []}
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
                    showStateFilter={true}
                />

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
                                {sortedLevels.map((level) => (
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
                                                }}
                                            >
                                                <strong
                                                    style={{
                                                        fontSize: "0.9rem",
                                                    }}
                                                >
                                                    {level.name}
                                                </strong>
                                                <span className="text-muted text-xs">
                                                    Stages {level.stageStart}-
                                                    {level.stageEnd}
                                                </span>
                                                <span className="text-muted text-xs">
                                                    Order {level.order}
                                                </span>
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
                                                    handleEditLevelClick(level)
                                                }
                                                className="btn btn-secondary btn-small"
                                                style={{
                                                    padding: "0.25rem 0.5rem",
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
                                                    padding: "0.25rem 0.5rem",
                                                    fontSize: "0.7rem",
                                                }}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <p className="text-muted text-center text-sm">
                            No levels yet
                        </p>
                    )}
                </div>
            </div>

            <div className="grid grid-2">
                <div className="card">
                    <div className="card-header">
                        <div className="flex-between">
                            <h2 className="card-title">
                                Resources ({curriculum.resources?.length || 0})
                            </h2>
                            <button
                                onClick={() => setShowResourceModal(true)}
                                className="btn btn-primary btn-small"
                            >
                                Add Resource
                            </button>
                        </div>
                    </div>

                    {curriculum.resources && curriculum.resources.length > 0 ? (
                        <div className="scrollable-list">
                            <div className="compact-list">
                                {curriculum.resources.map((resource) => (
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
                                                    {resource.name}
                                                </strong>
                                                <span className="text-muted text-xs">
                                                    {resource.type
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                        resource.type.slice(1)}
                                                </span>
                                            </div>
                                            <a
                                                href={resource.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-primary text-xs"
                                            >
                                                {resource.link}
                                            </a>
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
                                ))}
                            </div>
                        </div>
                    ) : (
                        <p className="text-muted text-center text-sm">
                            No resources yet
                        </p>
                    )}
                </div>

                {!hasActiveFilters && (
                    <ProjectHierarchyBrowser
                        levels={curriculum.levels || []}
                        projects={curriculum.projects || []}
                        selectedLevel={selectedLevel}
                        selectedStage={selectedStage}
                        onLevelChange={handleHierarchyLevelChange}
                        onStageChange={handleHierarchyStageChange}
                        onAddProject={() => setShowProjectModal(true)}
                    />
                )}

                {hasActiveFilters && (
                    <div className="card">
                        <div className="card-header">
                            <div className="flex-between">
                                <h2 className="card-title">
                                    Filtered Projects ({sortedProjects.length}
                                    {curriculum.projects && (
                                        <span className="text-muted">
                                            /{curriculum.projects.length}
                                        </span>
                                    )}
                                    )
                                </h2>
                                <button
                                    onClick={() => setShowProjectModal(true)}
                                    className="btn btn-primary btn-small"
                                >
                                    Add Project
                                </button>
                            </div>
                        </div>

                        {sortedProjects.length > 0 ? (
                            <div className="scrollable-list">
                                <div className="compact-list">
                                    {sortedProjects.map(renderProjectCard)}
                                </div>
                            </div>
                        ) : (
                            <p className="text-muted text-center text-sm">
                                No projects match the current filters
                            </p>
                        )}
                    </div>
                )}
            </div>

            {hasHierarchySelection && (
                <div className="card">
                    <div className="card-header">
                        <div className="flex-between">
                            <h2 className="card-title">
                                Projects in {selectedLevel.name} - Stage{" "}
                                {selectedStage} ({sortedProjects.length})
                            </h2>
                            <button
                                onClick={clearHierarchySelection}
                                className="btn btn-secondary btn-small"
                            >
                                Clear Selection
                            </button>
                        </div>
                    </div>

                    {sortedProjects.length > 0 ? (
                        <div className="scrollable-list scrollable-list-extended">
                            <div className="compact-list">
                                {sortedProjects.map(renderProjectCard)}
                            </div>
                        </div>
                    ) : (
                        <p className="text-muted text-center text-sm">
                            No projects found in {selectedLevel.name}, Stage{" "}
                            {selectedStage}
                        </p>
                    )}
                </div>
            )}

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
                isOpen={showDeleteProjectModal}
                onClose={handleDeleteProjectCancel}
                title="Delete Project"
            >
                <div className="mb-1">
                    <p className="text-error mb-1">
                        ⚠️ Are you sure you want to delete "
                        {projectToDelete?.name}"?
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
                        {resourceToDelete?.name}"?
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
                        {levelToDelete?.name}"?
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
