import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { curriculumAPI } from "../utils/api";
import {
    getLevelForStage,
    getProjectStats,
    getNextIncompleteProject,
} from "../utils/stageUtils";
import {
    PROJECT_STATE_COLORS,
    constructGithubUrl,
} from "../utils/projectUtils";
import { useAuth } from "../contexts/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";
import Modal from "../components/Modal";
import CurriculumForm from "../components/CurriculumForm";
import Notification from "../components/Notification";

const Dashboard = () => {
    const { user } = useAuth();
    const [curricula, setCurricula] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [curriculumToDelete, setCurriculumToDelete] = useState(null);

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
        return getProjectStats(curriculum.projects || []);
    };

    const getOverallStats = () => {
        const totalCurricula = curricula.length;
        const totalProjects = curricula.reduce(
            (sum, curr) => sum + (curr.projects?.length || 0),
            0
        );
        const completedProjects = curricula.reduce((sum, curr) => {
            const stats = getProjectStats(curr.projects || []);
            return sum + stats.completed;
        }, 0);

        return {
            totalCurricula,
            totalProjects,
            completedProjects,
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
            <div className="flex-between mb-1">
                <div>
                    <h1>My Curricula</h1>
                    <p className="text-muted text-sm">
                        {stats.totalCurricula} curricula •{" "}
                        {stats.completedProjects}/{stats.totalProjects} projects
                        completed
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

            {curricula.length === 0 ? (
                <div className="card text-center">
                    <h2 className="text-muted">No curricula yet</h2>
                    <p className="text-muted text-sm">
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
                <div className="grid grid-3">
                    {curricula.map((curriculum) => {
                        const progress = getCurriculumProgress(curriculum);
                        const nextProject = getNextIncompleteProject(
                            curriculum.projects || []
                        );

                        return (
                            <div key={curriculum._id} className="card">
                                <div className="flex-between mb-1">
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
                                    <span
                                        className={
                                            progress.percentage === 100
                                                ? "text-success"
                                                : "text-warning"
                                        }
                                        style={{
                                            fontSize: "0.9rem",
                                            fontWeight: "600",
                                        }}
                                    >
                                        {progress.percentage}%
                                    </span>
                                </div>

                                {progress.total > 0 && (
                                    <div className="mb-1">
                                        <div className="progress-bar">
                                            <div
                                                className="progress-fill"
                                                style={{
                                                    background:
                                                        progress.percentage ===
                                                        100
                                                            ? "var(--accent-success)"
                                                            : "var(--accent-primary)",
                                                    width: `${progress.percentage}%`,
                                                }}
                                            ></div>
                                        </div>
                                        <div
                                            className="flex-between text-xs text-muted"
                                            style={{ marginTop: "0.25rem" }}
                                        >
                                            <span>
                                                {progress.completed}/
                                                {progress.total} projects
                                            </span>
                                            <span>
                                                {curriculum.levels?.length || 0}{" "}
                                                levels
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {nextProject && (
                                    <div
                                        style={{
                                            background: "var(--bg-tertiary)",
                                            padding: "0.5rem",
                                            borderRadius: "4px",
                                            marginBottom: "0.75rem",
                                        }}
                                    >
                                        <div
                                            className="flex-between"
                                            style={{ alignItems: "flex-start" }}
                                        >
                                            <div style={{ flex: 1 }}>
                                                <div
                                                    className="flex"
                                                    style={{
                                                        gap: "0.25rem",
                                                        alignItems: "center",
                                                        marginBottom: "0.25rem",
                                                    }}
                                                >
                                                    <Link
                                                        to={`/project/${nextProject._id}`}
                                                        style={{
                                                            textDecoration:
                                                                "none",
                                                            color: "inherit",
                                                            fontSize: "0.9rem",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        {nextProject.name}
                                                    </Link>
                                                    {nextProject.identifier && (
                                                        <span
                                                            className="text-primary"
                                                            style={{
                                                                fontSize:
                                                                    "0.75rem",
                                                                fontWeight:
                                                                    "600",
                                                            }}
                                                        >
                                                            [
                                                            {
                                                                nextProject.identifier
                                                            }
                                                            ]
                                                        </span>
                                                    )}
                                                </div>
                                                <div
                                                    className="flex"
                                                    style={{
                                                        gap: "0.5rem",
                                                        alignItems: "center",
                                                        flexWrap: "wrap",
                                                    }}
                                                >
                                                    <span className="text-muted text-xs">
                                                        Stage{" "}
                                                        {nextProject.stage}
                                                        {nextProject.order &&
                                                            ` #${nextProject.order}`}
                                                    </span>
                                                    {(() => {
                                                        const stageDefinition =
                                                            curriculum.stages?.find(
                                                                (s) =>
                                                                    s.stageNumber ===
                                                                    nextProject.stage
                                                            );
                                                        if (
                                                            stageDefinition?.name
                                                        ) {
                                                            return (
                                                                <span className="text-info text-xs">
                                                                    {
                                                                        stageDefinition.name
                                                                    }
                                                                </span>
                                                            );
                                                        }
                                                        return null;
                                                    })()}
                                                    {(() => {
                                                        const level =
                                                            getLevelForStage(
                                                                curriculum.levels ||
                                                                    [],
                                                                nextProject.stage
                                                            );
                                                        return level ? (
                                                            <span className="text-primary text-xs">
                                                                {level.name}
                                                                {level.defaultIdentifier &&
                                                                    ` (${level.defaultIdentifier})`}
                                                            </span>
                                                        ) : null;
                                                    })()}
                                                </div>
                                            </div>
                                            <div
                                                className="flex"
                                                style={{
                                                    gap: "0.25rem",
                                                    alignItems: "center",
                                                }}
                                            >
                                                <span
                                                    className={
                                                        PROJECT_STATE_COLORS[
                                                            nextProject.state
                                                        ]
                                                    }
                                                    style={{
                                                        fontSize: "0.75rem",
                                                    }}
                                                >
                                                    ●
                                                </span>
                                                {nextProject.githubRepo &&
                                                    user?.githubUsername && (
                                                        <a
                                                            href={constructGithubUrl(
                                                                user.githubUsername,
                                                                nextProject.githubRepo
                                                            )}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-primary text-xs"
                                                        >
                                                            GitHub
                                                        </a>
                                                    )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="btn-group">
                                    <Link
                                        to={`/curriculum/${curriculum._id}`}
                                        className="btn btn-primary btn-small"
                                    >
                                        View
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
                    <p className="text-muted text-sm">
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
