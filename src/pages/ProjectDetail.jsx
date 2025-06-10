import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { projectAPI, noteAPI } from "../utils/api";
import {
    PROJECT_STATES,
    PROJECT_STATE_LABELS,
    PROJECT_STATE_COLORS,
    constructGithubUrl,
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
        fetchProject();
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
            setProject(data.project);
            setOriginalCurriculum(data.project.curriculum);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProjectState = async (newState) => {
        if (!project) return;

        setStateUpdateLoading(true);
        try {
            const result = await projectAPI.update(project._id, {
                state: newState,
            });
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
        const projectWithCurriculum = {
            ...updatedProject,
            curriculum: originalCurriculum,
        };
        setProject(projectWithCurriculum);
        setShowEditModal(false);
        showNotification("success", "Success", "Project updated successfully!");
    };

    const handleResourceSuccess = (newResource) => {
        setProject((prev) => ({
            ...prev,
            projectResources: [...(prev.projectResources || []), newResource],
        }));
        setShowResourceModal(false);
        showNotification("success", "Success", "Resource added successfully!");
    };

    const handleNoteSuccess = (newNote) => {
        setProject((prev) => ({
            ...prev,
            notes: [...(prev.notes || []), newNote],
        }));
        setShowNoteModal(false);
        showNotification("success", "Success", "Note added successfully!");
    };

    const handlePrerequisiteSuccess = (updatedProject) => {
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
        setResourceToDelete(resource);
        setShowDeleteResourceModal(true);
    };

    const handleDeleteResourceConfirm = async () => {
        if (!resourceToDelete) return;

        try {
            await projectAPI.deleteResource(resourceToDelete._id);
            setProject((prev) => ({
                ...prev,
                projectResources: prev.projectResources.filter(
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
        setNoteToDelete(note);
        setShowDeleteNoteModal(true);
    };

    const handleDeleteNoteConfirm = async () => {
        if (!noteToDelete) return;

        try {
            await noteAPI.delete(noteToDelete._id);
            setProject((prev) => ({
                ...prev,
                notes: prev.notes.filter((n) => n._id !== noteToDelete._id),
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

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
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
        if (!originalCurriculum?.levels) return null;
        return originalCurriculum.levels.find(
            (level) => stage >= level.stageStart && stage <= level.stageEnd
        );
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
    const githubUrl = constructGithubUrl(
        user?.githubUsername,
        project.githubRepo
    );

    return (
        <div>
            <div className="flex-between mb-2">
                <div>
                    <Link
                        to={`/curriculum/${
                            originalCurriculum?._id || project.curriculum?._id
                        }`}
                        className="text-muted"
                        style={{ textDecoration: "none" }}
                    >
                        ← Back to{" "}
                        {originalCurriculum?.name || project.curriculum?.name}
                    </Link>
                    <div
                        className="flex"
                        style={{
                            alignItems: "center",
                            gap: "1rem",
                            marginTop: "0.5rem",
                            flexWrap: "wrap",
                        }}
                    >
                        <h1>{project.name}</h1>
                        {project.identifier && (
                            <span
                                className="text-primary"
                                style={{
                                    fontSize: "1.25rem",
                                    fontWeight: "600",
                                }}
                            >
                                [{project.identifier}]
                            </span>
                        )}
                        <span
                            className={PROJECT_STATE_COLORS[project.state]}
                            style={{
                                fontSize: "1.1rem",
                                fontWeight: "500",
                            }}
                        >
                            {PROJECT_STATE_LABELS[project.state]}
                        </span>
                    </div>
                    <p className="text-muted">{project.description}</p>
                    <div
                        className="flex"
                        style={{
                            gap: "1rem",
                            marginTop: "0.5rem",
                            flexWrap: "wrap",
                        }}
                    >
                        <span className="text-muted">
                            Stage {project.stage}
                            {project.order && ` #${project.order}`}
                        </span>
                        {projectLevel && (
                            <span className="text-primary">
                                Level: {projectLevel.name}
                            </span>
                        )}
                        {githubUrl && (
                            <a
                                href={githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary"
                            >
                                View on GitHub →
                            </a>
                        )}
                    </div>
                    {project.topics && project.topics.length > 0 && (
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
                                        borderRadius: "4px",
                                        fontSize: "0.8rem",
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
                        value={project.state}
                        onChange={(e) =>
                            handleUpdateProjectState(e.target.value)
                        }
                        className="btn btn-secondary btn-small"
                        disabled={stateUpdateLoading}
                        style={{
                            padding: "0.5rem",
                            minWidth: "auto",
                            border: "1px solid var(--border-color)",
                            borderRadius: "6px",
                            background: "var(--bg-tertiary)",
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
                    <button
                        onClick={() => setShowEditModal(true)}
                        className="btn btn-secondary btn-small"
                    >
                        Edit Project
                    </button>
                </div>
            </div>

            {project.prerequisites && project.prerequisites.length > 0 && (
                <div className="card mb-2">
                    <div className="card-header">
                        <div className="flex-between">
                            <h2 className="card-title">Prerequisites</h2>
                            <button
                                onClick={() => setShowPrerequisiteModal(true)}
                                className="btn btn-secondary btn-small"
                            >
                                Manage Prerequisites
                            </button>
                        </div>
                    </div>
                    <div className="list">
                        {project.prerequisites.map((prerequisite) => (
                            <div key={prerequisite._id} className="list-item">
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
                                        <h4>{prerequisite.name}</h4>
                                        {prerequisite.identifier && (
                                            <span
                                                className="text-primary"
                                                style={{
                                                    fontSize: "0.9rem",
                                                    fontWeight: "600",
                                                }}
                                            >
                                                [{prerequisite.identifier}]
                                            </span>
                                        )}
                                        <span
                                            className={
                                                PROJECT_STATE_COLORS[
                                                    prerequisite.state
                                                ]
                                            }
                                            style={{ fontSize: "0.9rem" }}
                                        >
                                            {
                                                PROJECT_STATE_LABELS[
                                                    prerequisite.state
                                                ]
                                            }
                                        </span>
                                    </div>
                                    <p
                                        className="text-muted"
                                        style={{ fontSize: "0.9rem" }}
                                    >
                                        {prerequisite.description}
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
                                            Stage {prerequisite.stage}
                                        </span>
                                    </div>
                                    {prerequisite.topics &&
                                        prerequisite.topics.length > 0 && (
                                            <div
                                                className="flex"
                                                style={{
                                                    gap: "0.25rem",
                                                    flexWrap: "wrap",
                                                    marginTop: "0.25rem",
                                                }}
                                            >
                                                {prerequisite.topics
                                                    .slice(0, 3)
                                                    .map((topic, index) => (
                                                        <span
                                                            key={index}
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
                                                            {topic}
                                                        </span>
                                                    ))}
                                                {prerequisite.topics.length >
                                                    3 && (
                                                    <span
                                                        style={{
                                                            fontSize: "0.7rem",
                                                            color: "var(--text-muted)",
                                                            fontStyle: "italic",
                                                        }}
                                                    >
                                                        +
                                                        {prerequisite.topics
                                                            .length - 3}{" "}
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
            )}

            {(!project.prerequisites || project.prerequisites.length === 0) && (
                <div className="card mb-2">
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
                    <p className="text-muted text-center">
                        No prerequisites set for this project
                    </p>
                </div>
            )}

            <div className="grid grid-2">
                <div className="card">
                    <div className="card-header">
                        <div className="flex-between">
                            <h2 className="card-title">Project Resources</h2>
                            <button
                                onClick={() => setShowResourceModal(true)}
                                className="btn btn-primary btn-small"
                            >
                                Add Resource
                            </button>
                        </div>
                    </div>

                    {project.projectResources &&
                    project.projectResources.length > 0 ? (
                        <div className="list">
                            {project.projectResources.map((resource) => (
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
                            No project resources yet
                        </p>
                    )}
                </div>

                <div className="card">
                    <div className="card-header">
                        <div className="flex-between">
                            <h2 className="card-title">Notes</h2>
                            <button
                                onClick={() => setShowNoteModal(true)}
                                className="btn btn-primary btn-small"
                            >
                                Add Note
                            </button>
                        </div>
                    </div>

                    {project.notes && project.notes.length > 0 ? (
                        <div className="list">
                            {project.notes
                                .sort(
                                    (a, b) =>
                                        new Date(b.createdAt) -
                                        new Date(a.createdAt)
                                )
                                .map((note) => (
                                    <div
                                        key={note._id}
                                        className="list-item"
                                        style={{
                                            flexDirection: "column",
                                            alignItems: "stretch",
                                        }}
                                    >
                                        <div className="flex-between mb-1">
                                            <span
                                                className={`${getNoteTypeColor(
                                                    note.type
                                                )} font-weight-bold`}
                                            >
                                                {note.type
                                                    .charAt(0)
                                                    .toUpperCase() +
                                                    note.type.slice(1)}
                                            </span>
                                            <div className="flex gap-1">
                                                <span
                                                    className="text-muted"
                                                    style={{
                                                        fontSize: "0.8rem",
                                                    }}
                                                >
                                                    {formatDate(note.createdAt)}
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
                                            }}
                                        >
                                            {note.content}
                                        </p>
                                    </div>
                                ))}
                        </div>
                    ) : (
                        <p className="text-muted text-center">No notes yet</p>
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
                    curriculumId={
                        originalCurriculum?._id || project.curriculum?._id
                    }
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
                isOpen={showDeleteNoteModal}
                onClose={handleDeleteNoteCancel}
                title="Delete Note"
            >
                <div className="mb-1">
                    <p className="text-error mb-1">
                        ⚠️ Are you sure you want to delete this note?
                    </p>
                    <p className="text-muted">This action cannot be undone.</p>
                    <div
                        className="card mt-1"
                        style={{ background: "var(--bg-tertiary)" }}
                    >
                        <strong>
                            {noteToDelete?.type?.charAt(0).toUpperCase() +
                                noteToDelete?.type?.slice(1)}
                        </strong>
                        <p
                            style={{
                                margin: "0.5rem 0 0 0",
                                whiteSpace: "pre-wrap",
                            }}
                        >
                            {noteToDelete?.content}
                        </p>
                    </div>
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
