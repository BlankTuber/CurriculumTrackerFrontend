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
            // Fix the typo: was data.curriculua, should be data.curricula
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

    if (loading) {
        return <LoadingSpinner message="Loading your curricula..." />;
    }

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
                    {curricula.map((curriculum) => (
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
                                    <span>
                                        {curriculum.projects?.length || 0}
                                    </span>
                                </div>
                            </div>

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
                    ))}
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
