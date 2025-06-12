import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { curriculumAPI } from "../utils/api";
import {
    getLevelForStage,
    getProjectStats,
    getNextProjects,
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

            if (!data) {
                throw new Error("Invalid response from server");
            }

            setCurricula(Array.isArray(data.curricula) ? data.curricula : []);
        } catch (error) {
            setError(error.message || "Failed to load curricula");
            setCurricula([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSuccess = (newCurriculum) => {
        if (!newCurriculum) {
            showNotification(
                "error",
                "Error",
                "Invalid curriculum data received"
            );
            return;
        }

        setCurricula((prev) => [...prev, newCurriculum]);
        setShowCreateModal(false);
        showNotification(
            "success",
            "Success",
            "Curriculum created successfully!"
        );
    };

    const handleDeleteClick = (curriculum) => {
        if (!curriculum || !curriculum._id) {
            showNotification("error", "Error", "Invalid curriculum");
            return;
        }
        setCurriculumToDelete(curriculum);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (!curriculumToDelete || !curriculumToDelete._id) return;

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
        if (!curriculum) return { total: 0, completed: 0, percentage: 0 };
        return getProjectStats(curriculum.projects || []);
    };

    const getOverallStats = () => {
        const totalCurricula = curricula.length;
        let totalProjects = 0;
        let completedProjects = 0;

        curricula.forEach((curriculum) => {
            if (curriculum && Array.isArray(curriculum.projects)) {
                const stats = getProjectStats(curriculum.projects);
                totalProjects += stats.total;
                completedProjects += stats.completed;
            }
        });

        const overallProgress =
            totalProjects > 0
                ? Math.round((completedProjects / totalProjects) * 100)
                : 0;

        return {
            totalCurricula,
            totalProjects,
            completedProjects,
            overallProgress,
        };
    };

    const renderNextProjectCard = (project, index, curriculum) => {
        const level = getLevelForStage(curriculum.levels || [], project.stage);
        const stageDefinition =
            curriculum.stages && Array.isArray(curriculum.stages)
                ? curriculum.stages.find(
                      (s) => s && s.stageNumber === project.stage
                  )
                : null;
        const githubUrl =
            user && user.githubUsername && project.githubRepo
                ? constructGithubUrl(user.githubUsername, project.githubRepo)
                : null;

        const isMainProject = index === 0;
        const cardStyle = isMainProject
            ? {
                  background: "var(--bg-tertiary)",
                  padding: "0.75rem",
                  borderRadius: "4px",
                  marginBottom: "0.75rem",
              }
            : {
                  background: "var(--bg-secondary)",
                  padding: "0.5rem",
                  borderRadius: "4px",
                  marginBottom: "0.5rem",
                  opacity: "0.8",
              };

        return (
            <div key={project._id} style={cardStyle}>
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
                                flexWrap: "wrap",
                            }}
                        >
                            <Link
                                to={`/project/${project._id}`}
                                style={{
                                    textDecoration: "none",
                                    color: "inherit",
                                    fontSize: isMainProject
                                        ? "0.9rem"
                                        : "0.85rem",
                                    fontWeight: isMainProject ? "500" : "400",
                                }}
                            >
                                {project.name || "Untitled Project"}
                            </Link>
                            {project.identifier && (
                                <span
                                    className="text-primary"
                                    style={{
                                        fontSize: isMainProject
                                            ? "0.75rem"
                                            : "0.7rem",
                                        fontWeight: "600",
                                    }}
                                >
                                    [{project.identifier}]
                                </span>
                            )}
                            {!isMainProject && (
                                <span
                                    className="text-muted"
                                    style={{ fontSize: "0.7rem" }}
                                >
                                    (Up next)
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
                            <span
                                className="text-muted"
                                style={{
                                    fontSize: isMainProject
                                        ? "0.75rem"
                                        : "0.7rem",
                                }}
                            >
                                Stage {project.stage || "N/A"}
                                {project.order && ` #${project.order}`}
                            </span>
                            {stageDefinition && stageDefinition.name && (
                                <span
                                    className="text-info"
                                    style={{
                                        fontSize: isMainProject
                                            ? "0.75rem"
                                            : "0.7rem",
                                    }}
                                >
                                    {stageDefinition.name}
                                </span>
                            )}
                            {level && (
                                <span
                                    className="text-primary"
                                    style={{
                                        fontSize: isMainProject
                                            ? "0.75rem"
                                            : "0.7rem",
                                    }}
                                >
                                    {level.name || "Unnamed Level"}
                                    {level.defaultIdentifier &&
                                        ` (${level.defaultIdentifier})`}
                                </span>
                            )}
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
                                PROJECT_STATE_COLORS[project.state] ||
                                "text-muted"
                            }
                            style={{
                                fontSize: isMainProject ? "0.75rem" : "0.7rem",
                            }}
                        >
                            ●
                        </span>
                        {githubUrl && isMainProject && (
                            <a
                                href={githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary"
                                style={{ fontSize: "0.75rem" }}
                            >
                                GitHub
                            </a>
                        )}
                    </div>
                </div>
            </div>
        );
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
                        {stats.totalProjects > 0 && (
                            <span className="text-primary">
                                {" "}
                                • {stats.overallProgress}% overall
                            </span>
                        )}
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
                        if (!curriculum || !curriculum._id) return null;

                        const progress = getCurriculumProgress(curriculum);
                        const nextProjects = getNextProjects(
                            curriculum.projects || [],
                            3
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
                                            {curriculum.name ||
                                                "Untitled Curriculum"}
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
                                                {curriculum.levels &&
                                                Array.isArray(curriculum.levels)
                                                    ? curriculum.levels.length
                                                    : 0}{" "}
                                                levels
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {curriculum.description && (
                                    <p
                                        className="text-muted text-sm"
                                        style={{
                                            marginBottom: "0.75rem",
                                            lineHeight: "1.3",
                                            display: "-webkit-box",
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: "vertical",
                                            overflow: "hidden",
                                        }}
                                    >
                                        {curriculum.description}
                                    </p>
                                )}

                                {nextProjects.length > 0 && (
                                    <div style={{ marginBottom: "0.75rem" }}>
                                        <h4
                                            className="text-muted"
                                            style={{
                                                fontSize: "0.85rem",
                                                marginBottom: "0.5rem",
                                            }}
                                        >
                                            {nextProjects.length === 1
                                                ? "Next Project"
                                                : `Next ${nextProjects.length} Projects`}
                                        </h4>
                                        {nextProjects.map((project, index) =>
                                            renderNextProjectCard(
                                                project,
                                                index,
                                                curriculum
                                            )
                                        )}
                                        {nextProjects.length < 3 &&
                                            progress.percentage < 100 && (
                                                <p
                                                    className="text-muted text-xs text-center"
                                                    style={{
                                                        marginTop: "0.5rem",
                                                    }}
                                                >
                                                    {nextProjects.length === 1
                                                        ? "Only 1 project remaining"
                                                        : `${nextProjects.length} projects remaining`}
                                                </p>
                                            )}
                                    </div>
                                )}

                                {nextProjects.length === 0 &&
                                    progress.percentage === 100 && (
                                        <div
                                            style={{
                                                background:
                                                    "var(--bg-tertiary)",
                                                padding: "0.75rem",
                                                borderRadius: "4px",
                                                marginBottom: "0.75rem",
                                                textAlign: "center",
                                            }}
                                        >
                                            <span className="text-success">
                                                🎉 Curriculum Complete!
                                            </span>
                                        </div>
                                    )}

                                {nextProjects.length === 0 &&
                                    progress.percentage < 100 &&
                                    progress.total > 0 && (
                                        <div
                                            style={{
                                                background:
                                                    "var(--bg-tertiary)",
                                                padding: "0.75rem",
                                                borderRadius: "4px",
                                                marginBottom: "0.75rem",
                                                textAlign: "center",
                                            }}
                                        >
                                            <p
                                                className="text-info text-sm"
                                                style={{ margin: 0 }}
                                            >
                                                All projects in progress
                                            </p>
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
                        {(curriculumToDelete && curriculumToDelete.name) ||
                            "this curriculum"}
                        "?
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
