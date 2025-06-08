import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { curriculumAPI, projectAPI } from "../utils/api";
import LoadingSpinner from "../components/LoadingSpinner";
import Modal from "../components/Modal";
import CurriculumForm from "../components/CurriculumForm";
import ProjectForm from "../components/ProjectForm";
import ResourceForm from "../components/ResourceForm";

const CurriculumDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [curriculum, setCurriculum] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showEditModal, setShowEditModal] = useState(false);
    const [showProjectModal, setShowProjectModal] = useState(false);
    const [showResourceModal, setShowResourceModal] = useState(false);

    useEffect(() => {
        fetchCurriculum();
    }, [id]);

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
    };

    const handleProjectSuccess = (newProject) => {
        setCurriculum((prev) => ({
            ...prev,
            projects: [...(prev.projects || []), newProject],
        }));
        setShowProjectModal(false);
    };

    const handleResourceSuccess = (newResource) => {
        setCurriculum((prev) => ({
            ...prev,
            resources: [...(prev.resources || []), newResource],
        }));
        setShowResourceModal(false);
    };

    const handleDeleteProject = async (projectId) => {
        if (
            !window.confirm(
                "Are you sure you want to delete this project? This will also delete all associated notes."
            )
        ) {
            return;
        }

        try {
            await projectAPI.delete(projectId);
            setCurriculum((prev) => ({
                ...prev,
                projects: prev.projects.filter((p) => p._id !== projectId),
            }));
        } catch (error) {
            alert("Failed to delete project: " + error.message);
        }
    };

    const handleDeleteResource = async (resourceId) => {
        if (!window.confirm("Are you sure you want to delete this resource?")) {
            return;
        }

        try {
            await curriculumAPI.deleteResource(resourceId);
            setCurriculum((prev) => ({
                ...prev,
                resources: prev.resources.filter((r) => r._id !== resourceId),
            }));
        } catch (error) {
            alert("Failed to delete resource: " + error.message);
        }
    };

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

    return (
        <div>
            {/* Header */}
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
                </div>
                <button
                    onClick={() => setShowEditModal(true)}
                    className="btn btn-secondary"
                >
                    Edit Curriculum
                </button>
            </div>

            <div className="grid grid-2">
                {/* Resources Section */}
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
                            No resources yet
                        </p>
                    )}
                </div>

                {/* Projects Section */}
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

                    {curriculum.projects && curriculum.projects.length > 0 ? (
                        <div className="list">
                            {curriculum.projects.map((project) => (
                                <div key={project._id} className="list-item">
                                    <div style={{ flex: 1 }}>
                                        <h4>
                                            <Link
                                                to={`/project/${project._id}`}
                                                style={{
                                                    textDecoration: "none",
                                                    color: "inherit",
                                                }}
                                            >
                                                {project.name}
                                            </Link>
                                        </h4>
                                        <p
                                            className="text-muted"
                                            style={{ fontSize: "0.9rem" }}
                                        >
                                            {project.description}
                                        </p>
                                        {project.githubLink && (
                                            <a
                                                href={project.githubLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-primary"
                                                style={{ fontSize: "0.8rem" }}
                                            >
                                                GitHub →
                                            </a>
                                        )}
                                    </div>
                                    <div className="btn-group">
                                        <Link
                                            to={`/project/${project._id}`}
                                            className="btn btn-primary btn-small"
                                        >
                                            View
                                        </Link>
                                        <button
                                            onClick={() =>
                                                handleDeleteProject(project._id)
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
                        <p className="text-muted text-center">
                            No projects yet
                        </p>
                    )}
                </div>
            </div>

            {/* Modals */}
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
        </div>
    );
};

export default CurriculumDetail;
