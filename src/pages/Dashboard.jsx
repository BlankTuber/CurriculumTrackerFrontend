import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { curriculumAPI } from "../utils/api";
import LoadingSpinner from "../components/LoadingSpinner";
import Modal from "../components/Modal";
import CurriculumForm from "../components/CurriculumForm";
import Notification from "../components/Notification";

const Dashboard = () => {
    const [curricula, setCurricula] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [curriculumToDelete, setCurriculumToDelete] = useState(null);

    // Notification state
    const [notification, setNotification] = useState({
        isOpen: false,
        type: "info",
        title: "",
        message: "",
    });

    useEffect(() => {
        fetchCurricula();
    }, []);

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

    const fetchCurricula = async () => {
        try {
            setError("");
            const data = await curriculumAPI.getAll();
            setCurricula(data.curricula || []);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSuccess = (newCurriculum) => {
        setCurricula((prev) => [...prev, newCurriculum]);
        setShowCreateModal(false);
        showNotification(
            "success",
            "Success",
            "Curriculum created successfully!"
        );
    };

    const handleDeleteClick = (curriculum) => {
        setCurriculumToDelete(curriculum);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (!curriculumToDelete) return;

        try {
            await curriculumAPI.delete(curriculumToDelete._id);
            setCurricula((prev) =>
                prev.filter((c) => c._id !== curriculumToDelete._id)
            );
            setShowDeleteModal(false);
            setCurriculumToDelete(null);
            showNotification(
                "success",
                "Success",
                "Curriculum deleted successfully!"
            );
        } catch (error) {
            showNotification(
                "error",
                "Error",
                `Failed to delete curriculum: ${error.message}`
            );
        }
    };

    const handleDeleteCancel = () => {
        setShowDeleteModal(false);
        setCurriculumToDelete(null);
    };

    const getCurriculumProgress = (curriculum) => {
        if (!curriculum.projects || curriculum.projects.length === 0) {
            return { total: 0, completed: 0, percentage: 0 };
        }

        const total = curriculum.projects.length;
        const completed = curriculum.projects.filter((p) => p.completed).length;
        const percentage = Math.round((completed / total) * 100);

        return { total, completed, percentage };
    };

    const getOverallStats = () => {
        const totalCurricula = curricula.length;
        const totalProjects = curricula.reduce(
            (sum, curr) => sum + (curr.projects?.length || 0),
            0
        );
        const completedProjects = curricula.reduce(
            (sum, curr) =>
                sum + (curr.projects?.filter((p) => p.completed).length || 0),
            0
        );
        const totalResources = curricula.reduce(
            (sum, curr) => sum + (curr.resources?.length || 0),
            0
        );

        return {
            totalCurricula,
            totalProjects,
            completedProjects,
            totalResources,
            overallProgress:
                totalProjects > 0
                    ? Math.round((completedProjects / totalProjects) * 100)
                    : 0,
        };
    };

    if (loading) {
        return <LoadingSpinner message="Loading your curricula..." />;
    }

    const stats = getOverallStats();

    return (
        <div>
            <div className="flex-between mb-2">
                <div>
                    <h1>My Curricula</h1>
                    <p className="text-muted">
                        Manage your learning curricula and track your progress
                    </p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="btn btn-primary"
                >
                    Create New Curriculum
                </button>
            </div>

            {error && <div className="error-message mb-2">{error}</div>}

            {/* Overall Statistics */}
            {curricula.length > 0 && (
                <div className="card mb-2">
                    <h2 className="card-title">Overview</h2>
                    <div className="grid grid-2">
                        <div>
                            <div className="flex-between mb-1">
                                <span className="text-muted">
                                    Total Curricula:
                                </span>
                                <span className="text-primary">
                                    {stats.totalCurricula}
                                </span>
                            </div>
                            <div className="flex-between mb-1">
                                <span className="text-muted">
                                    Total Projects:
                                </span>
                                <span className="text-primary">
                                    {stats.totalProjects}
                                </span>
                            </div>
                            <div className="flex-between mb-1">
                                <span className="text-muted">
                                    Completed Projects:
                                </span>
                                <span className="text-success">
                                    {stats.completedProjects}
                                </span>
                            </div>
                            <div className="flex-between">
                                <span className="text-muted">
                                    Total Resources:
                                </span>
                                <span className="text-primary">
                                    {stats.totalResources}
                                </span>
                            </div>
                        </div>
                        <div>
                            <div className="text-center">
                                <h3
                                    className={
                                        stats.overallProgress === 100
                                            ? "text-success"
                                            : "text-warning"
                                    }
                                >
                                    {stats.overallProgress}%
                                </h3>
                                <p className="text-muted">Overall Progress</p>
                                <div
                                    style={{
                                        background: "var(--bg-tertiary)",
                                        borderRadius: "6px",
                                        height: "8px",
                                        width: "100%",
                                        marginTop: "0.5rem",
                                    }}
                                >
                                    <div
                                        style={{
                                            background:
                                                stats.overallProgress === 100
                                                    ? "var(--accent-success)"
                                                    : "var(--accent-primary)",
                                            height: "100%",
                                            borderRadius: "6px",
                                            width: `${stats.overallProgress}%`,
                                            transition: "width 0.3s ease",
                                        }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {curricula.length === 0 ? (
                <div className="card text-center">
                    <h2 className="text-muted">No curricula yet</h2>
                    <p className="text-muted">
                        Create your first curriculum to start tracking your
                        learning journey
                    </p>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="btn btn-primary"
                    >
                        Create Your First Curriculum
                    </button>
                </div>
            ) : (
                <div className="grid grid-2">
                    {curricula.map((curriculum) => {
                        const progress = getCurriculumProgress(curriculum);
                        const sortedProjects = curriculum.projects
                            ? [...curriculum.projects].sort((a, b) => {
                                  if (a.order && b.order)
                                      return a.order - b.order;
                                  if (a.order && !b.order) return -1;
                                  if (!a.order && b.order) return 1;
                                  return (
                                      new Date(a.createdAt) -
                                      new Date(b.createdAt)
                                  );
                              })
                            : [];

                        return (
                            <div key={curriculum._id} className="card">
                                <div className="card-header">
                                    <h3 className="card-title">
                                        <Link
                                            to={`/curriculum/${curriculum._id}`}
                                            style={{
                                                textDecoration: "none",
                                                color: "inherit",
                                            }}
                                        >
                                            {curriculum.name}
                                        </Link>
                                    </h3>
                                    {curriculum.description && (
                                        <p className="card-subtitle">
                                            {curriculum.description}
                                        </p>
                                    )}
                                </div>

                                <div className="mb-1">
                                    <div className="flex-between">
                                        <span className="text-muted">
                                            Resources:
                                        </span>
                                        <span>
                                            {curriculum.resources?.length || 0}
                                        </span>
                                    </div>
                                    <div className="flex-between">
                                        <span className="text-muted">
                                            Projects:
                                        </span>
                                        <span>{progress.total}</span>
                                    </div>
                                    {progress.total > 0 && (
                                        <>
                                            <div className="flex-between">
                                                <span className="text-muted">
                                                    Completed:
                                                </span>
                                                <span className="text-success">
                                                    {progress.completed}
                                                </span>
                                            </div>
                                            <div className="flex-between mb-1">
                                                <span className="text-muted">
                                                    Progress:
                                                </span>
                                                <span
                                                    className={
                                                        progress.percentage ===
                                                        100
                                                            ? "text-success"
                                                            : "text-warning"
                                                    }
                                                >
                                                    {progress.percentage}%
                                                </span>
                                            </div>
                                            <div
                                                style={{
                                                    background:
                                                        "var(--bg-tertiary)",
                                                    borderRadius: "4px",
                                                    height: "6px",
                                                    width: "100%",
                                                    marginBottom: "1rem",
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        background:
                                                            progress.percentage ===
                                                            100
                                                                ? "var(--accent-success)"
                                                                : "var(--accent-primary)",
                                                        height: "100%",
                                                        borderRadius: "4px",
                                                        width: `${progress.percentage}%`,
                                                        transition:
                                                            "width 0.3s ease",
                                                    }}
                                                ></div>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Show next incomplete project */}
                                {progress.total > 0 &&
                                    progress.completed < progress.total && (
                                        <div className="mb-1">
                                            <p
                                                className="text-muted"
                                                style={{
                                                    fontSize: "0.9rem",
                                                    marginBottom: "0.5rem",
                                                }}
                                            >
                                                Next project:
                                            </p>
                                            {(() => {
                                                const nextProject =
                                                    sortedProjects.find(
                                                        (p) => !p.completed
                                                    );
                                                return nextProject ? (
                                                    <div
                                                        style={{
                                                            background:
                                                                "var(--bg-tertiary)",
                                                            padding: "0.5rem",
                                                            borderRadius: "4px",
                                                            fontSize: "0.9rem",
                                                        }}
                                                    >
                                                        <strong>
                                                            {nextProject.name}
                                                        </strong>
                                                        {nextProject.order && (
                                                            <span
                                                                className="text-muted"
                                                                style={{
                                                                    marginLeft:
                                                                        "0.5rem",
                                                                }}
                                                            >
                                                                #
                                                                {
                                                                    nextProject.order
                                                                }
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : null;
                                            })()}
                                        </div>
                                    )}

                                <div className="btn-group">
                                    <Link
                                        to={`/curriculum/${curriculum._id}`}
                                        className="btn btn-primary btn-small"
                                    >
                                        View Details
                                    </Link>
                                    <button
                                        onClick={() =>
                                            handleDeleteClick(curriculum)
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
            )}

            {/* Create Curriculum Modal */}
            <Modal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                title="Create New Curriculum"
            >
                <CurriculumForm
                    onSuccess={handleCreateSuccess}
                    onCancel={() => setShowCreateModal(false)}
                />
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={showDeleteModal}
                onClose={handleDeleteCancel}
                title="Delete Curriculum"
            >
                <div className="mb-1">
                    <p className="text-error mb-1">
                        ⚠️ Are you sure you want to delete "
                        {curriculumToDelete?.name}"?
                    </p>
                    <p className="text-muted">
                        This will permanently delete the curriculum and all
                        associated projects and notes. This action cannot be
                        undone.
                    </p>
                </div>

                <div className="btn-group">
                    <button
                        onClick={handleDeleteConfirm}
                        className="btn btn-danger"
                    >
                        Delete Curriculum
                    </button>
                    <button
                        onClick={handleDeleteCancel}
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

export default Dashboard;
