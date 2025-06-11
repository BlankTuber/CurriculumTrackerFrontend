import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { projectAPI, noteAPI } from "../utils/api";
import {
    PROJECT_STATES,
    PROJECT_STATE_LABELS,
    PROJECT_STATE_COLORS,
    constructGithubUrl,
    safeFormatDate,
} from "../utils/projectUtils";
import { useAuth } from "../contexts/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";
import Modal from "../components/Modal";
import ProjectForm from "../components/ProjectForm";
import ResourceForm from "../components/ResourceForm";
import NoteForm from "../components/NoteForm";
import PrerequisiteManager from "../components/PrerequisiteManager";
import Notification from "../components/Notification";

const ProjectDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [project, setProject] = useState(null);
    const [originalCurriculum, setOriginalCurriculum] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [stateUpdateLoading, setStateUpdateLoading] = useState(false);

    const [showEditModal, setShowEditModal] = useState(false);
    const [showResourceModal, setShowResourceModal] = useState(false);
    const [showNoteModal, setShowNoteModal] = useState(false);
    const [showPrerequisiteModal, setShowPrerequisiteModal] = useState(false);
    const [showDeleteResourceModal, setShowDeleteResourceModal] =
        useState(false);
    const [showDeleteNoteModal, setShowDeleteNoteModal] = useState(false);

    const [resourceToDelete, setResourceToDelete] = useState(null);
    const [noteToDelete, setNoteToDelete] = useState(null);

    const [notification, setNotification] = useState({
        isOpen: false,
        type: "info",
        title: "",
        message: "",
    });

    useEffect(() => {
        if (id) {
            fetchProject();
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

    const fetchProject = async () => {
        try {
            setError("");
            const data = await projectAPI.getById(id);

            if (!data || !data.project) {
                throw new Error("Project not found");
            }

            setProject(data.project);
            setOriginalCurriculum(data.project.curriculum || null);
        } catch (error) {
            setError(error.message || "Failed to load project");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProjectState = async (newState) => {
        if (!project || !Object.values(PROJECT_STATES).includes(newState)) {
            showNotification("error", "Error", "Invalid project state");
            return;
        }

        setStateUpdateLoading(true);
        try {
            const result = await projectAPI.update(project._id, {
                state: newState,
            });

            if (!result || !result.project) {
                throw new Error("Invalid response from server");
            }

            const projectWithCurriculum = {
                ...result.project,
                curriculum: originalCurriculum,
            };
            setProject(projectWithCurriculum);
            showNotification(
                "success",
                "Success",
                `Project state updated to ${PROJECT_STATE_LABELS[newState]}!`
            );
        } catch (error) {
            showNotification(
                "error",
                "Error",
                `Failed to update project: ${error.message}`
            );
        } finally {
            setStateUpdateLoading(false);
        }
    };

    const handleEditSuccess = (updatedProject) => {
        if (!updatedProject) {
            showNotification("error", "Error", "Invalid project data received");
            return;
        }

        const projectWithCurriculum = {
            ...updatedProject,
            curriculum: originalCurriculum,
        };
        setProject(projectWithCurriculum);
        setShowEditModal(false);
        showNotification("success", "Success", "Project updated successfully!");
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

        setProject((prev) => ({
            ...prev,
            projectResources: [...(prev.projectResources || []), newResource],
        }));
        setShowResourceModal(false);
        showNotification("success", "Success", "Resource added successfully!");
    };

    const handleNoteSuccess = (newNote) => {
        if (!newNote) {
            showNotification("error", "Error", "Invalid note data received");
            return;
        }

        setProject((prev) => ({
            ...prev,
            notes: [...(prev.notes || []), newNote],
        }));
        setShowNoteModal(false);
        showNotification("success", "Success", "Note added successfully!");
    };

    const handlePrerequisiteSuccess = (updatedProject) => {
        if (!updatedProject) {
            showNotification("error", "Error", "Invalid project data received");
            return;
        }

        const projectWithCurriculum = {
            ...updatedProject,
            curriculum: originalCurriculum,
        };
        setProject(projectWithCurriculum);
        setShowPrerequisiteModal(false);
        showNotification(
            "success",
            "Success",
            "Prerequisites updated successfully!"
        );
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
            await projectAPI.deleteResource(resourceToDelete._id);
            setProject((prev) => ({
                ...prev,
                projectResources: (prev.projectResources || []).filter(
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

    const handleDeleteNoteClick = (note) => {
        if (!note || !note._id) {
            showNotification("error", "Error", "Invalid note");
            return;
        }
        setNoteToDelete(note);
        setShowDeleteNoteModal(true);
    };

    const handleDeleteNoteConfirm = async () => {
        if (!noteToDelete || !noteToDelete._id) return;

        try {
            await noteAPI.delete(noteToDelete._id);
            setProject((prev) => ({
                ...prev,
                notes: (prev.notes || []).filter(
                    (n) => n._id !== noteToDelete._id
                ),
            }));
            setShowDeleteNoteModal(false);
            setNoteToDelete(null);
            showNotification(
                "success",
                "Success",
                "Note deleted successfully!"
            );
        } catch (error) {
            showNotification(
                "error",
                "Error",
                `Failed to delete note: ${error.message}`
            );
        }
    };

    const handleDeleteNoteCancel = () => {
        setShowDeleteNoteModal(false);
        setNoteToDelete(null);
    };

    const getNoteTypeColor = (type) => {
        const colors = {
            reflection: "text-success",
            todo: "text-warning",
            idea: "text-primary",
            bug: "text-error",
            improvement: "text-success",
            question: "text-warning",
            achievement: "text-success",
            other: "text-muted",
        };
        return colors[type] || "text-muted";
    };

    const getLevelForStage = (stage) => {
        if (
            !originalCurriculum ||
            !originalCurriculum.levels ||
            !Array.isArray(originalCurriculum.levels) ||
            typeof stage !== "number"
        ) {
            return null;
        }
        return originalCurriculum.levels.find(
            (level) =>
                level &&
                typeof level.stageStart === "number" &&
                typeof level.stageEnd === "number" &&
                stage >= level.stageStart &&
                stage <= level.stageEnd
        );
    };

    const getStageDefinition = (stageNumber) => {
        if (
            !originalCurriculum ||
            !originalCurriculum.stages ||
            !Array.isArray(originalCurriculum.stages) ||
            typeof stageNumber !== "number"
        ) {
            return null;
        }
        return originalCurriculum.stages.find(
            (s) => s && s.stageNumber === stageNumber
        );
    };

    const getGithubRepoSource = () => {
        if (!project) return { repo: null, source: null };

        if (project.githubRepo) {
            const stageDefinition = getStageDefinition(project.stage);
            if (
                stageDefinition &&
                stageDefinition.defaultGithubRepo === project.githubRepo
            ) {
                return { repo: project.githubRepo, source: "stage" };
            }
            return { repo: project.githubRepo, source: "project" };
        }

        return { repo: null, source: null };
    };

    if (loading) {
        return <LoadingSpinner message="Loading project..." />;
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

    if (!project) {
        return (
            <div className="text-center">
                <h2>Project not found</h2>
                <button
                    onClick={() => navigate("/dashboard")}
                    className="btn btn-secondary"
                >
                    Back to Dashboard
                </button>
            </div>
        );
    }

    const projectLevel = getLevelForStage(project.stage);
    const stageDefinition = getStageDefinition(project.stage);
    const { repo: githubRepo, source: repoSource } = getGithubRepoSource();
    const githubUrl = constructGithubUrl(
        user && user.githubUsername,
        githubRepo
    );
    const curriculumId =
        (originalCurriculum && originalCurriculum._id) ||
        (project.curriculum && project.curriculum._id);
    const curriculumName =
        (originalCurriculum && originalCurriculum.name) ||
        (project.curriculum && project.curriculum.name);

    return (
        <div>
            <div className="flex-between mb-1">
                <div>
                    <Link
                        to={`/curriculum/${curriculumId}`}
                        className="text-muted text-sm"
                        style={{ textDecoration: "none" }}
                    >
                        ← Back to {curriculumName || "Curriculum"}
                    </Link>
                    <div
                        className="flex"
                        style={{
                            alignItems: "center",
                            gap: "0.75rem",
                            marginTop: "0.25rem",
                            flexWrap: "wrap",
                        }}
                    >
                        <h1>{project.name || "Untitled Project"}</h1>
                        {project.identifier && (
                            <span
                                className="text-primary"
                                style={{
                                    fontSize: "1.1rem",
                                    fontWeight: "600",
                                }}
                            >
                                [{project.identifier}]
                            </span>
                        )}
                        <span
                            className={
                                PROJECT_STATE_COLORS[project.state] ||
                                "text-muted"
                            }
                            style={{ fontSize: "0.9rem", fontWeight: "500" }}
                        >
                            {PROJECT_STATE_LABELS[project.state] || "Unknown"}
                        </span>
                    </div>
                    {project.description && (
                        <p
                            className="text-muted text-sm"
                            style={{ marginTop: "0.25rem" }}
                        >
                            {project.description}
                        </p>
                    )}
                    <div
                        className="flex"
                        style={{
                            gap: "0.75rem",
                            marginTop: "0.25rem",
                            flexWrap: "wrap",
                            alignItems: "center",
                        }}
                    >
                        <span className="text-muted text-sm">
                            Stage {project.stage || "N/A"}
                            {project.order && ` #${project.order}`}
                        </span>
                        {stageDefinition && stageDefinition.name && (
                            <span className="text-info text-sm">
                                {stageDefinition.name}
                            </span>
                        )}
                        {projectLevel && (
                            <span className="text-primary text-sm">
                                Level: {projectLevel.name || "Unnamed Level"}
                                {projectLevel.defaultIdentifier &&
                                    ` (${projectLevel.defaultIdentifier})`}
                            </span>
                        )}
                        {githubUrl && (
                            <div
                                className="flex"
                                style={{ gap: "0.25rem", alignItems: "center" }}
                            >
                                <a
                                    href={githubUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary text-sm"
                                >
                                    View on GitHub →
                                </a>
                                {repoSource === "stage" && (
                                    <span className="text-muted text-xs">
                                        (inherited from stage)
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                    {project.topics &&
                        Array.isArray(project.topics) &&
                        project.topics.length > 0 && (
                            <div
                                className="flex"
                                style={{
                                    gap: "0.25rem",
                                    flexWrap: "wrap",
                                    marginTop: "0.5rem",
                                }}
                            >
                                {project.topics.map((topic, index) => (
                                    <span
                                        key={index}
                                        style={{
                                            background: "var(--bg-tertiary)",
                                            padding: "0.25rem 0.5rem",
                                            borderRadius: "3px",
                                            fontSize: "0.75rem",
                                            color: "var(--text-secondary)",
                                        }}
                                    >
                                        {topic}
                                    </span>
                                ))}
                            </div>
                        )}
                </div>
                <div className="btn-group">
                    <select
                        value={project.state || PROJECT_STATES.NOT_STARTED}
                        onChange={(e) =>
                            handleUpdateProjectState(e.target.value)
                        }
                        className="form-select"
                        disabled={stateUpdateLoading}
                        style={{ width: "auto", minWidth: "130px" }}
                    >
                        {Object.entries(PROJECT_STATE_LABELS).map(
                            ([value, label]) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            )
                        )}
                    </select>
                    <button
                        onClick={() => setShowEditModal(true)}
                        className="btn btn-secondary btn-small"
                    >
                        Edit
                    </button>
                </div>
            </div>

            {stageDefinition &&
                (stageDefinition.description ||
                    stageDefinition.defaultGithubRepo) && (
                    <div
                        className="card mb-1"
                        style={{ background: "var(--bg-tertiary)" }}
                    >
                        <div className="card-header">
                            <h3 className="card-title">
                                Stage {project.stage} Information
                                {stageDefinition.name &&
                                    ` - ${stageDefinition.name}`}
                            </h3>
                        </div>
                        {stageDefinition.description && (
                            <p
                                className="text-muted text-sm"
                                style={{ marginBottom: "0.5rem" }}
                            >
                                {stageDefinition.description}
                            </p>
                        )}
                        {stageDefinition.defaultGithubRepo && (
                            <div
                                className="flex"
                                style={{ gap: "0.5rem", alignItems: "center" }}
                            >
                                <span className="text-muted text-sm">
                                    Default Repository:
                                </span>
                                <span className="text-primary text-sm">
                                    {stageDefinition.defaultGithubRepo}
                                </span>
                                {repoSource !== "stage" &&
                                    project.githubRepo && (
                                        <span className="text-muted text-xs">
                                            (project uses custom repo)
                                        </span>
                                    )}
                            </div>
                        )}
                    </div>
                )}

            {project.prerequisites &&
                Array.isArray(project.prerequisites) &&
                project.prerequisites.length > 0 && (
                    <div className="card mb-1">
                        <div className="card-header">
                            <div className="flex-between">
                                <h2 className="card-title">
                                    Prerequisites (
                                    {project.prerequisites.length})
                                </h2>
                                <button
                                    onClick={() =>
                                        setShowPrerequisiteModal(true)
                                    }
                                    className="btn btn-secondary btn-small"
                                >
                                    Manage
                                </button>
                            </div>
                        </div>
                        <div className="scrollable-list">
                            <div className="compact-list">
                                {project.prerequisites.map((prerequisite) => (
                                    <div
                                        key={prerequisite._id}
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
                                                <Link
                                                    to={`/project/${prerequisite._id}`}
                                                    style={{
                                                        textDecoration: "none",
                                                        color: "inherit",
                                                        fontSize: "0.9rem",
                                                        fontWeight: "500",
                                                    }}
                                                >
                                                    {prerequisite.name ||
                                                        "Untitled Project"}
                                                </Link>
                                                {prerequisite.identifier && (
                                                    <span
                                                        className="text-primary"
                                                        style={{
                                                            fontSize: "0.75rem",
                                                            fontWeight: "600",
                                                        }}
                                                    >
                                                        [
                                                        {
                                                            prerequisite.identifier
                                                        }
                                                        ]
                                                    </span>
                                                )}
                                                <span className="text-muted text-xs">
                                                    Stage{" "}
                                                    {prerequisite.stage ||
                                                        "N/A"}
                                                </span>
                                                <span
                                                    className={
                                                        PROJECT_STATE_COLORS[
                                                            prerequisite.state
                                                        ] || "text-muted"
                                                    }
                                                    style={{
                                                        fontSize: "0.75rem",
                                                    }}
                                                >
                                                    {PROJECT_STATE_LABELS[
                                                        prerequisite.state
                                                    ] || "Unknown"}
                                                </span>
                                            </div>
                                            {prerequisite.topics &&
                                                Array.isArray(
                                                    prerequisite.topics
                                                ) &&
                                                prerequisite.topics.length >
                                                    0 && (
                                                    <div
                                                        className="flex"
                                                        style={{
                                                            gap: "0.25rem",
                                                            flexWrap: "wrap",
                                                        }}
                                                    >
                                                        {prerequisite.topics
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
                                                                        {topic}
                                                                    </span>
                                                                )
                                                            )}
                                                        {prerequisite.topics
                                                            .length > 3 && (
                                                            <span
                                                                className="text-muted"
                                                                style={{
                                                                    fontSize:
                                                                        "0.65rem",
                                                                    fontStyle:
                                                                        "italic",
                                                                }}
                                                            >
                                                                +
                                                                {prerequisite
                                                                    .topics
                                                                    .length -
                                                                    3}{" "}
                                                                more
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

            {(!project.prerequisites ||
                !Array.isArray(project.prerequisites) ||
                project.prerequisites.length === 0) && (
                <div className="card mb-1">
                    <div className="card-header">
                        <div className="flex-between">
                            <h2 className="card-title">Prerequisites</h2>
                            <button
                                onClick={() => setShowPrerequisiteModal(true)}
                                className="btn btn-primary btn-small"
                            >
                                Add Prerequisites
                            </button>
                        </div>
                    </div>
                    <p className="text-muted text-center text-sm">
                        No prerequisites set for this project
                    </p>
                </div>
            )}

            <div className="grid grid-2">
                <div className="card">
                    <div className="card-header">
                        <div className="flex-between">
                            <h2 className="card-title">
                                Resources (
                                {project.projectResources &&
                                Array.isArray(project.projectResources)
                                    ? project.projectResources.length
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

                    {project.projectResources &&
                    Array.isArray(project.projectResources) &&
                    project.projectResources.length > 0 ? (
                        <div className="scrollable-list">
                            <div className="compact-list">
                                {project.projectResources.map((resource) => (
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
                                ))}
                            </div>
                        </div>
                    ) : (
                        <p className="text-muted text-center text-sm">
                            No project resources yet
                        </p>
                    )}
                </div>

                <div className="card">
                    <div className="card-header">
                        <div className="flex-between">
                            <h2 className="card-title">
                                Notes (
                                {project.notes && Array.isArray(project.notes)
                                    ? project.notes.length
                                    : 0}
                                )
                            </h2>
                            <button
                                onClick={() => setShowNoteModal(true)}
                                className="btn btn-primary btn-small"
                            >
                                Add Note
                            </button>
                        </div>
                    </div>

                    {project.notes &&
                    Array.isArray(project.notes) &&
                    project.notes.length > 0 ? (
                        <div className="scrollable-list">
                            <div className="compact-list">
                                {project.notes
                                    .sort((a, b) => {
                                        const aDate = new Date(
                                            a.createdAt || 0
                                        );
                                        const bDate = new Date(
                                            b.createdAt || 0
                                        );
                                        return bDate - aDate;
                                    })
                                    .map((note) => (
                                        <div
                                            key={note._id}
                                            className="compact-item"
                                            style={{
                                                alignItems: "flex-start",
                                                flexDirection: "column",
                                            }}
                                        >
                                            <div
                                                className="flex-between"
                                                style={{
                                                    width: "100%",
                                                    marginBottom: "0.5rem",
                                                }}
                                            >
                                                <span
                                                    className={`${getNoteTypeColor(
                                                        note.type
                                                    )}`}
                                                    style={{
                                                        fontSize: "0.85rem",
                                                        fontWeight: "600",
                                                    }}
                                                >
                                                    {note.type
                                                        ? note.type
                                                              .charAt(0)
                                                              .toUpperCase() +
                                                          note.type.slice(1)
                                                        : "Other"}
                                                </span>
                                                <div
                                                    className="flex"
                                                    style={{
                                                        gap: "0.5rem",
                                                        alignItems: "center",
                                                    }}
                                                >
                                                    <span className="text-muted text-xs">
                                                        {safeFormatDate(
                                                            note.createdAt
                                                        )}
                                                    </span>
                                                    <button
                                                        onClick={() =>
                                                            handleDeleteNoteClick(
                                                                note
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
                                            <p
                                                style={{
                                                    margin: 0,
                                                    whiteSpace: "pre-wrap",
                                                    fontSize: "0.85rem",
                                                    lineHeight: "1.4",
                                                }}
                                            >
                                                {note.content || "No content"}
                                            </p>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    ) : (
                        <p className="text-muted text-center text-sm">
                            No notes yet
                        </p>
                    )}
                </div>
            </div>

            <Modal
                isOpen={showPrerequisiteModal}
                onClose={() => setShowPrerequisiteModal(false)}
                title="Manage Prerequisites"
            >
                <PrerequisiteManager
                    project={project}
                    onSuccess={handlePrerequisiteSuccess}
                    onCancel={() => setShowPrerequisiteModal(false)}
                />
            </Modal>

            <Modal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                title="Edit Project"
            >
                <ProjectForm
                    project={project}
                    curriculumId={curriculumId}
                    onSuccess={handleEditSuccess}
                    onCancel={() => setShowEditModal(false)}
                />
            </Modal>

            <Modal
                isOpen={showResourceModal}
                onClose={() => setShowResourceModal(false)}
                title="Add Project Resource"
            >
                <ResourceForm
                    projectId={project._id}
                    onSuccess={handleResourceSuccess}
                    onCancel={() => setShowResourceModal(false)}
                />
            </Modal>

            <Modal
                isOpen={showNoteModal}
                onClose={() => setShowNoteModal(false)}
                title="Add Note"
            >
                <NoteForm
                    projectId={project._id}
                    onSuccess={handleNoteSuccess}
                    onCancel={() => setShowNoteModal(false)}
                />
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
                isOpen={showDeleteNoteModal}
                onClose={handleDeleteNoteCancel}
                title="Delete Note"
            >
                <div className="mb-1">
                    <p className="text-error mb-1">
                        ⚠️ Are you sure you want to delete this note?
                    </p>
                    <p className="text-muted text-sm">
                        This action cannot be undone.
                    </p>
                    {noteToDelete && (
                        <div
                            className="card mt-1"
                            style={{ background: "var(--bg-tertiary)" }}
                        >
                            <strong>
                                {noteToDelete.type
                                    ? noteToDelete.type
                                          .charAt(0)
                                          .toUpperCase() +
                                      noteToDelete.type.slice(1)
                                    : "Other"}
                            </strong>
                            <p
                                style={{
                                    margin: "0.5rem 0 0 0",
                                    whiteSpace: "pre-wrap",
                                    fontSize: "0.85rem",
                                }}
                            >
                                {noteToDelete.content || "No content"}
                            </p>
                        </div>
                    )}
                </div>

                <div className="btn-group">
                    <button
                        onClick={handleDeleteNoteConfirm}
                        className="btn btn-danger"
                    >
                        Delete Note
                    </button>
                    <button
                        onClick={handleDeleteNoteCancel}
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

export default ProjectDetail;
