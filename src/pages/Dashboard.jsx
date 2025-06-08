import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { curriculumAPI } from "../utils/api";
import LoadingSpinner from "../components/LoadingSpinner";
import Modal from "../components/Modal";
import CurriculumForm from "../components/CurriculumForm";

const Dashboard = () => {
    const [curricula, setCurricula] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        fetchCurricula();
    }, []);

    const fetchCurricula = async () => {
        try {
            setError("");
            const data = await curriculumAPI.getAll();
            setCurricula(data.curriculua || []);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSuccess = (newCurriculum) => {
        setCurricula((prev) => [...prev, newCurriculum]);
        setShowCreateModal(false);
    };

    const handleDeleteCurriculum = async (curriculumId) => {
        if (
            !window.confirm(
                "Are you sure you want to delete this curriculum? This will also delete all associated projects and notes."
            )
        ) {
            return;
        }

        try {
            await curriculumAPI.delete(curriculumId);
            setCurricula((prev) => prev.filter((c) => c._id !== curriculumId));
        } catch (error) {
            alert("Failed to delete curriculum: " + error.message);
        }
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
                                        handleDeleteCurriculum(curriculum._id)
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
        </div>
    );
};

export default Dashboard;
