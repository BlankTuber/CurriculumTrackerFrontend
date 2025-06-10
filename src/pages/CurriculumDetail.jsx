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

    const [stageFilter, setStageFilter] = useState("");
    const [levelFilter, setLevelFilter] = useState("");
    const [stateFilter, setStateFilter] = useState("");

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

    const getFilteredProjects = () => {
        if (!curriculum?.projects) return [];

        let filteredProjects = [...curriculum.projects];

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

        if (stateFilter) {
            filteredProjects = filteredProjects.filter(
                (p) => p.state === stateFilter
            );
        }

        return sortProjectsByStageAndOrder(filteredProjects);
    };

    const sortedLevels = sortLevelsByOrder(curriculum?.levels || []);
    const sortedProjects = getFilteredProjects();

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
            <div className="flex-between mb-2">
                <div>
                    <Link
                        to="/dashboard"
                        className="text-muted"
                        style={{ textDecoration: "none" }}
                    >
                        ← Back to Dashboard
                    </Link>
                    <h1>{curriculum.name}</h1>
                    {curriculum.description && (
                        <p className="text-muted">{curriculum.description}</p>
                    )}
                    {total > 0 && (
                        <div
                            className="flex"
                            style={{ gap: "1rem", marginTop: "0.5rem" }}
                        >
                            <span className="text-muted">
                                Progress: {completed}/{total} projects completed
                            </span>
                            <span
                                className={
                                    completed === total
                                        ? "text-success"
                                        : "text-warning"
                                }
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
                    stageFilter={stageFilter}
                    levelFilter={levelFilter}
                    stateFilter={stateFilter}
                    onStageChange={setStageFilter}
                    onLevelChange={setLevelFilter}
                    onStateChange={setStateFilter}
                    showStateFilter={true}
                />

                <div className="card">
                    <div className="card-header">
                        <div className="flex-between">
                            <h2 className="card-title">Levels</h2>
                            <button
                                onClick={() => setShowLevelModal(true)}
                                className="btn btn-primary btn-small"
                            >
                                Add Level
                            </button>
                        </div>
                    </div>

                    {sortedLevels.length > 0 ? (
                        <div className="list">
                            {sortedLevels.map((level) => (
                                <div key={level._id} className="list-item">
                                    <div style={{ flex: 1 }}>
                                        <h4>{level.name}</h4>
                                        <p
                                            className="text-muted"
                                            style={{ fontSize: "0.9rem" }}
                                        >
                                            {level.description}
                                        </p>
                                        <div
                                            className="flex"
                                            style={{
                                                gap: "1rem",
                                                alignItems: "center",
                                            }}
                                        >
                                            <span
                                                className="text-muted"
                                                style={{ fontSize: "0.8rem" }}
                                            >
                                                Stages {level.stageStart}-
                                                {level.stageEnd}
                                            </span>
                                            <span
                                                className="text-muted"
                                                style={{ fontSize: "0.8rem" }}
                                            >
                                                Order: {level.order}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="btn-group">
                                        <button
                                            onClick={() =>
                                                handleEditLevelClick(level)
                                            }
                                            className="btn btn-secondary btn-small"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleDeleteLevelClick(level)
                                            }
                                            className="btn btn-danger btn-small"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted text-center">No levels yet</p>
                    )}
                </div>

                <div className="card">
                    <div className="card-header">
                        <div className="flex-between">
                            <h2 className="card-title">Resources</h2>
                            <button
                                onClick={() => setShowResourceModal(true)}
                                className="btn btn-primary btn-small"
                            >
                                Add Resource
                            </button>
                        </div>
                    </div>

                    {curriculum.resources && curriculum.resources.length > 0 ? (
                        <div className="list">
                            {curriculum.resources.map((resource) => (
                                <div key={resource._id} className="list-item">
                                    <div style={{ flex: 1 }}>
                                        <h4>{resource.name}</h4>
                                        <p className="text-muted">
                                            {resource.type
                                                .charAt(0)
                                                .toUpperCase() +
                                                resource.type.slice(1)}
                                        </p>
                                        <a
                                            href={resource.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary"
                                            style={{ fontSize: "0.9rem" }}
                                        >
                                            {resource.link}
                                        </a>
                                    </div>
                                    <button
                                        onClick={() =>
                                            handleDeleteResourceClick(resource)
                                        }
                                        className="btn btn-danger btn-small"
                                    >
                                        Delete
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted text-center">
                            No resources yet
                        </p>
                    )}
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <div className="flex-between">
                        <h2 className="card-title">Projects</h2>
                        <button
                            onClick={() => setShowProjectModal(true)}
                            className="btn btn-primary btn-small"
                        >
                            Add Project
                        </button>
                    </div>
                </div>

                {sortedProjects.length > 0 ? (
                    <div className="list">
                        {sortedProjects.map((project) => {
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
                                    className="list-item"
                                    style={{
                                        flexDirection: "column",
                                        alignItems: "stretch",
                                    }}
                                >
                                    <div className="flex-between mb-1">
                                        <div style={{ flex: 1 }}>
                                            <div
                                                className="flex"
                                                style={{
                                                    alignItems: "center",
                                                    gap: "0.5rem",
                                                    marginBottom: "0.5rem",
                                                    flexWrap: "wrap",
                                                }}
                                            >
                                                <h4>
                                                    <Link
                                                        to={`/project/${project._id}`}
                                                        style={{
                                                            textDecoration:
                                                                "none",
                                                            color: "inherit",
                                                        }}
                                                    >
                                                        {project.name}
                                                    </Link>
                                                </h4>
                                                {project.identifier && (
                                                    <span
                                                        className="text-primary"
                                                        style={{
                                                            fontSize: "1rem",
                                                            fontWeight: "600",
                                                        }}
                                                    >
                                                        [{project.identifier}]
                                                    </span>
                                                )}
                                                <span
                                                    className={
                                                        PROJECT_STATE_COLORS[
                                                            project.state
                                                        ]
                                                    }
                                                    style={{
                                                        fontSize: "0.9rem",
                                                        fontWeight: "500",
                                                    }}
                                                >
                                                    {
                                                        PROJECT_STATE_LABELS[
                                                            project.state
                                                        ]
                                                    }
                                                </span>
                                            </div>
                                            <p
                                                className="text-muted"
                                                style={{
                                                    fontSize: "0.9rem",
                                                    margin: "0 0 0.5rem 0",
                                                }}
                                            >
                                                {project.description}
                                            </p>
                                            <div
                                                className="flex"
                                                style={{
                                                    gap: "1rem",
                                                    alignItems: "center",
                                                    marginBottom: "0.5rem",
                                                    flexWrap: "wrap",
                                                }}
                                            >
                                                <span
                                                    className="text-muted"
                                                    style={{
                                                        fontSize: "0.8rem",
                                                    }}
                                                >
                                                    Stage {project.stage}
                                                    {project.order &&
                                                        ` #${project.order}`}
                                                </span>
                                                {projectLevel && (
                                                    <span
                                                        className="text-primary"
                                                        style={{
                                                            fontSize: "0.8rem",
                                                        }}
                                                    >
                                                        {projectLevel.name}
                                                    </span>
                                                )}
                                                {githubUrl && (
                                                    <a
                                                        href={githubUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-primary"
                                                        style={{
                                                            fontSize: "0.8rem",
                                                        }}
                                                    >
                                                        GitHub →
                                                    </a>
                                                )}
                                            </div>
                                            {project.topics &&
                                                project.topics.length > 0 && (
                                                    <div
                                                        className="flex"
                                                        style={{
                                                            gap: "0.25rem",
                                                            flexWrap: "wrap",
                                                            marginBottom:
                                                                "0.5rem",
                                                        }}
                                                    >
                                                        {project.topics.map(
                                                            (topic, index) => (
                                                                <span
                                                                    key={index}
                                                                    style={{
                                                                        background:
                                                                            "var(--bg-tertiary)",
                                                                        padding:
                                                                            "0.125rem 0.25rem",
                                                                        borderRadius:
                                                                            "3px",
                                                                        fontSize:
                                                                            "0.7rem",
                                                                        color: "var(--text-secondary)",
                                                                    }}
                                                                >
                                                                    {topic}
                                                                </span>
                                                            )
                                                        )}
                                                    </div>
                                                )}
                                        </div>
                                    </div>
                                    <div className="btn-group">
                                        <select
                                            value={project.state}
                                            onChange={(e) =>
                                                handleUpdateProjectState(
                                                    project,
                                                    e.target.value
                                                )
                                            }
                                            className="form-select"
                                            style={{
                                                width: "auto",
                                                minWidth: "150px",
                                            }}
                                        >
                                            {Object.entries(
                                                PROJECT_STATE_LABELS
                                            ).map(([value, label]) => (
                                                <option
                                                    key={value}
                                                    value={value}
                                                >
                                                    {label}
                                                </option>
                                            ))}
                                        </select>
                                        <Link
                                            to={`/project/${project._id}`}
                                            className="btn btn-primary btn-small"
                                        >
                                            View
                                        </Link>
                                        <button
                                            onClick={() =>
                                                handleDeleteProjectClick(
                                                    project
                                                )
                                            }
                                            className="btn btn-danger btn-small"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-muted text-center">
                        {stageFilter || levelFilter || stateFilter
                            ? "No projects match the current filters"
                            : "No projects yet"}
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
                    <p className="text-muted">
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
                    <p className="text-muted">This action cannot be undone.</p>
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
                    <p className="text-muted">This action cannot be undone.</p>
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
