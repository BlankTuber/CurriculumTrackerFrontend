import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { projectAPI, noteAPI } from "../utils/api";
import LoadingSpinner from "../components/LoadingSpinner";
import Modal from "../components/Modal";
import ProjectForm from "../components/ProjectForm";
import ResourceForm from "../components/ResourceForm";
import NoteForm from "../components/NoteForm";

const ProjectDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showEditModal, setShowEditModal] = useState(false);
    const [showResourceModal, setShowResourceModal] = useState(false);
    const [showNoteModal, setShowNoteModal] = useState(false);

    useEffect(() => {
        fetchProject();
    }, [id]);

    const fetchProject = async () => {
        try {
            setError("");
            const data = await projectAPI.getById(id);
            setProject(data.project);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEditSuccess = (updatedProject) => {
        setProject(updatedProject);
        setShowEditModal(false);
    };

    const handleResourceSuccess = (newResource) => {
        setProject((prev) => ({
            ...prev,
            projectResources: [...(prev.projectResources || []), newResource],
        }));
        setShowResourceModal(false);
    };

    const handleNoteSuccess = (newNote) => {
        setProject((prev) => ({
            ...prev,
            notes: [...(prev.notes || []), newNote],
        }));
        setShowNoteModal(false);
    };

    const handleDeleteResource = async (resourceId) => {
        if (!window.confirm("Are you sure you want to delete this resource?")) {
            return;
        }

        try {
            await projectAPI.deleteResource(resourceId);
            setProject((prev) => ({
                ...prev,
                projectResources: prev.projectResources.filter(
                    (r) => r._id !== resourceId
                ),
            }));
        } catch (error) {
            alert("Failed to delete resource: " + error.message);
        }
    };

    const handleDeleteNote = async (noteId) => {
        if (!window.confirm("Are you sure you want to delete this note?")) {
            return;
        }

        try {
            await noteAPI.delete(noteId);
            setProject((prev) => ({
                ...prev,
                notes: prev.notes.filter((n) => n._id !== noteId),
            }));
        } catch (error) {
            alert("Failed to delete note: " + error.message);
        }
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
                        to={`/curriculum/${project.curriculum._id}`}
                        className="text-muted"
                        style={{ textDecoration: "none" }}
                    >
                        ← Back to {project.curriculum.name}
                    </Link>
                    <h1>{project.name}</h1>
                    <p className="text-muted">{project.description}</p>
                    {project.githubLink && (
                        <a
                            href={project.githubLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary"
                        >
                            View on GitHub →
                        </a>
                    )}
                </div>
                <button
                    onClick={() => setShowEditModal(true)}
                    className="btn btn-secondary"
                >
                    Edit Project
                </button>
            </div>

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
                                            handleDeleteResource(resource._id)
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
                                                        handleDeleteNote(
                                                            note._id
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

            {/* Modals */}
            <Modal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                title="Edit Project"
            >
                <ProjectForm
                    project={project}
                    curriculumId={project.curriculum._id}
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
        </div>
    );
};

export default ProjectDetail;
