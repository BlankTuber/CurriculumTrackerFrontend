import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { projectAPI, noteAPI } from "../utils/api";
import LoadingSpinner from "../components/LoadingSpinner";
import Modal from "../components/Modal";
import ProjectForm from "../components/ProjectForm";
import ResourceForm from "../components/ResourceForm";
import NoteForm from "../components/NoteForm";
import Notification from "../components/Notification";

const ProjectDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [project, setProject] = useState(null);
    const [originalCurriculum, setOriginalCurriculum] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [toggleLoading, setToggleLoading] = useState(false);

    const [showEditModal, setShowEditModal] = useState(false);
    const [showResourceModal, setShowResourceModal] = useState(false);
    const [showNoteModal, setShowNoteModal] = useState(false);
    const [showDeleteResourceModal, setShowDeleteResourceModal] =
        useState(false);
    const [showDeleteNoteModal, setShowDeleteNoteModal] = useState(false);

    const [resourceToDelete, setResourceToDelete] = useState(null);
    const [noteToDelete, setNoteToDelete] = useState(null);

    // Notification state
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
            // Store the original curriculum info to preserve it during updates
            setOriginalCurriculum(data.project.curriculum);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleCompletion = async () => {
        if (!project) return;

        setToggleLoading(true);
        try {
            const result = await projectAPI.update(project._id, {
                completed: !project.completed,
            });
            // Always use the original curriculum info to prevent breadcrumb issues
            const projectWithCurriculum = {
                ...result.project,
                curriculum: originalCurriculum,
            };
            setProject(projectWithCurriculum);
            showNotification(
                "success",
                "Success",
                `Project marked as ${
                    result.project.completed ? "completed" : "incomplete"
                }!`
            );
        } catch (error) {
            showNotification(
                "error",
                "Error",
                `Failed to update project: ${error.message}`
            );
        } finally {
            setToggleLoading(false);
        }
    };

    const handleEditSuccess = (updatedProject) => {
        // Always use the original curriculum info to prevent breadcrumb issues
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

    return (
        <div>
            {/* Header */}
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
                        }}
                    >
                        <h1>{project.name}</h1>
                        {project.completed && (
                            <span
                                className="text-success"
                                style={{ fontSize: "1.5rem" }}
                            >
                                ✓
                            </span>
                        )}
                    </div>
                    <p className="text-muted">{project.description}</p>
                    <div
                        className="flex"
                        style={{ gap: "1rem", marginTop: "0.5rem" }}
                    >
                        {project.order && (
                            <span className="text-muted">
                                Order: {project.order}
                            </span>
                        )}
                        <span
                            className={
                                project.completed
                                    ? "text-success"
                                    : "text-warning"
                            }
                        >
                            Status:{" "}
                            {project.completed ? "Completed" : "In Progress"}
                        </span>
                    </div>
                    {project.githubLink && (
                        <a
                            href={project.githubLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary"
                            style={{ display: "block", marginTop: "0.5rem" }}
                        >
                            View on GitHub →
                        </a>
                    )}
                </div>
                <div className="btn-group">
                    <button
                        onClick={handleToggleCompletion}
                        className={`btn ${
                            project.completed ? "btn-warning" : "btn-success"
                        } btn-small`}
                        disabled={toggleLoading}
                    >
                        {toggleLoading
                            ? "Updating..."
                            : project.completed
                            ? "Mark Incomplete"
                            : "Mark Complete"}
                    </button>
                    <button
                        onClick={() => setShowEditModal(true)}
                        className="btn btn-secondary btn-small"
                    >
                        Edit Project
                    </button>
                </div>
            </div>

            {/* Prerequisites Section */}
            {project.prerequisites && project.prerequisites.length > 0 && (
                <div className="card mb-2">
                    <div className="card-header">
                        <h2 className="card-title">Prerequisites</h2>
                    </div>
                    <div className="list">
                        {project.prerequisites.map((prerequisite) => (
                            <div key={prerequisite._id} className="list-item">
                                <div style={{ flex: 1 }}>
                                    <h4>{prerequisite.name}</h4>
                                    <p
                                        className="text-muted"
                                        style={{ fontSize: "0.9rem" }}
                                    >
                                        {prerequisite.description}
                                    </p>
                                </div>
                                <div
                                    className="flex"
                                    style={{
                                        alignItems: "center",
                                        gap: "0.5rem",
                                    }}
                                >
                                    <span
                                        className={
                                            prerequisite.completed
                                                ? "text-success"
                                                : "text-warning"
                                        }
                                    >
                                        {prerequisite.completed
                                            ? "✓ Completed"
                                            : "In Progress"}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-2">
                {/* Resources Section */}
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

                {/* Notes Section */}
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

            {/* Edit Project Modal */}
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

            {/* Add Resource Modal */}
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

            {/* Add Note Modal */}
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

            {/* Delete Resource Confirmation Modal */}
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

            {/* Delete Note Confirmation Modal */}
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

            {/* Notification */}
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
