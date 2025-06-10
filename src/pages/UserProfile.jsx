import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { userAPI } from "../utils/api";
import { validateGithubUsername } from "../utils/projectUtils";
import LoadingSpinner from "../components/LoadingSpinner";
import Modal from "../components/Modal";
import Notification from "../components/Notification";

const UserProfile = () => {
    const navigate = useNavigate();
    const { user, updateUser, deleteAccount, logout } = useAuth();

    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [updateLoading, setUpdateLoading] = useState(false);
    const [updateForm, setUpdateForm] = useState({
        username: "",
        githubUsername: "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [updateError, setUpdateError] = useState("");

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deletePassword, setDeletePassword] = useState("");
    const [deleteError, setDeleteError] = useState("");

    const [notification, setNotification] = useState({
        isOpen: false,
        type: "info",
        title: "",
        message: "",
    });

    useEffect(() => {
        fetchUserProfile();
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

    const fetchUserProfile = async () => {
        try {
            setError("");
            const data = await userAPI.getProfile();
            setStats(data.stats);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();

        if (
            !updateForm.username &&
            !updateForm.githubUsername &&
            !updateForm.newPassword
        ) {
            setUpdateError(
                "Please provide a new username, GitHub username, or password"
            );
            return;
        }

        if (updateForm.newPassword) {
            if (!updateForm.currentPassword) {
                setUpdateError(
                    "Current password is required to change password"
                );
                return;
            }
            if (updateForm.newPassword.length < 6) {
                setUpdateError(
                    "New password must be at least 6 characters long"
                );
                return;
            }
            if (updateForm.newPassword !== updateForm.confirmPassword) {
                setUpdateError("New passwords do not match");
                return;
            }
        }

        if (updateForm.username) {
            if (
                updateForm.username.length < 3 ||
                updateForm.username.length > 30
            ) {
                setUpdateError("Username must be between 3 and 30 characters");
                return;
            }
            if (!/^[a-zA-Z0-9_]+$/.test(updateForm.username)) {
                setUpdateError(
                    "Username can only contain letters, numbers, and underscores"
                );
                return;
            }
        }

        if (
            updateForm.githubUsername &&
            !validateGithubUsername(updateForm.githubUsername)
        ) {
            setUpdateError(
                "GitHub username must be between 1-39 characters and contain only letters, numbers, and hyphens (cannot start/end with hyphen)"
            );
            return;
        }

        setUpdateLoading(true);
        setUpdateError("");

        try {
            const updateData = {};

            if (updateForm.username && updateForm.username !== user.username) {
                updateData.username = updateForm.username;
            }

            if (updateForm.githubUsername !== (user.githubUsername || "")) {
                updateData.githubUsername = updateForm.githubUsername || null;
            }

            if (updateForm.newPassword) {
                updateData.password = updateForm.newPassword;
                updateData.currentPassword = updateForm.currentPassword;
            }

            const result = await updateUser(updateData);

            if (result.success) {
                setSuccess("Profile updated successfully");
                setShowUpdateModal(false);
                setUpdateForm({
                    username: "",
                    githubUsername: "",
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                });
                showNotification(
                    "success",
                    "Success",
                    "Profile updated successfully!"
                );
            } else {
                setUpdateError(result.error);
            }
        } catch (error) {
            setUpdateError(error.message);
        } finally {
            setUpdateLoading(false);
        }
    };

    const handleDeleteSubmit = async (e) => {
        e.preventDefault();

        if (!deletePassword) {
            setDeleteError("Password is required to delete account");
            return;
        }

        setDeleteLoading(true);
        setDeleteError("");

        try {
            const result = await deleteAccount(deletePassword);

            if (result.success) {
                showNotification(
                    "success",
                    "Account Deleted",
                    "Your account has been successfully deleted.",
                    false
                );
                setShowDeleteModal(false);
                setTimeout(() => {
                    logout();
                    navigate("/login");
                }, 2000);
            } else {
                setDeleteError(result.error);
            }
        } catch (error) {
            setDeleteError(error.message);
        } finally {
            setDeleteLoading(false);
        }
    };

    const openUpdateModal = () => {
        setUpdateForm({
            username: user?.username || "",
            githubUsername: user?.githubUsername || "",
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        });
        setUpdateError("");
        setShowUpdateModal(true);
    };

    const openDeleteModal = () => {
        setDeletePassword("");
        setDeleteError("");
        setShowDeleteModal(true);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (loading) {
        return <LoadingSpinner message="Loading profile..." />;
    }

    return (
        <div>
            <div className="flex-between mb-2">
                <div>
                    <h1>User Profile</h1>
                    <p className="text-muted">Manage your account settings</p>
                </div>
            </div>

            {error && <div className="error-message mb-2">{error}</div>}

            {success && <div className="success-message mb-2">{success}</div>}

            <div className="grid grid-2">
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">Profile Information</h2>
                    </div>

                    <div className="mb-1">
                        <div className="flex-between mb-1">
                            <span className="text-muted">Username:</span>
                            <span>{user?.username}</span>
                        </div>
                        <div className="flex-between mb-1">
                            <span className="text-muted">GitHub Username:</span>
                            <span>{user?.githubUsername || "Not set"}</span>
                        </div>
                        <div className="flex-between mb-1">
                            <span className="text-muted">Member since:</span>
                            <span>
                                {user?.createdAt
                                    ? formatDate(user.createdAt)
                                    : "N/A"}
                            </span>
                        </div>
                        <div className="flex-between mb-1">
                            <span className="text-muted">Last updated:</span>
                            <span>
                                {user?.updatedAt
                                    ? formatDate(user.updatedAt)
                                    : "N/A"}
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={openUpdateModal}
                        className="btn btn-primary"
                    >
                        Update Profile
                    </button>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">Statistics</h2>
                    </div>

                    {stats ? (
                        <div className="mb-1">
                            <div className="flex-between mb-1">
                                <span className="text-muted">
                                    Total Curricula:
                                </span>
                                <span className="text-success">
                                    {stats.curriculaCount || 0}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <p className="text-muted">No statistics available</p>
                    )}
                </div>
            </div>

            <div
                className="card mt-2"
                style={{ borderColor: "var(--accent-error)" }}
            >
                <div className="card-header">
                    <h2 className="card-title text-error">Danger Zone</h2>
                    <p className="card-subtitle">
                        Once you delete your account, there is no going back.
                        Please be certain.
                    </p>
                </div>

                <button onClick={openDeleteModal} className="btn btn-danger">
                    Delete Account
                </button>
            </div>

            <Modal
                isOpen={showUpdateModal}
                onClose={() => setShowUpdateModal(false)}
                title="Update Profile"
            >
                <form onSubmit={handleUpdateSubmit}>
                    {updateError && (
                        <div className="error-message mb-1">{updateError}</div>
                    )}

                    <div className="grid grid-2">
                        <div className="form-group">
                            <label className="form-label" htmlFor="username">
                                New Username (optional)
                            </label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={updateForm.username}
                                onChange={(e) =>
                                    setUpdateForm((prev) => ({
                                        ...prev,
                                        username: e.target.value,
                                    }))
                                }
                                className="form-input"
                                maxLength={30}
                                disabled={updateLoading}
                                placeholder="Leave blank to keep current username"
                            />
                        </div>

                        <div className="form-group">
                            <label
                                className="form-label"
                                htmlFor="githubUsername"
                            >
                                GitHub Username (optional)
                            </label>
                            <input
                                type="text"
                                id="githubUsername"
                                name="githubUsername"
                                value={updateForm.githubUsername}
                                onChange={(e) =>
                                    setUpdateForm((prev) => ({
                                        ...prev,
                                        githubUsername: e.target.value,
                                    }))
                                }
                                className="form-input"
                                maxLength={39}
                                disabled={updateLoading}
                                placeholder="your-github-username"
                            />
                            <p
                                className="text-muted"
                                style={{
                                    fontSize: "0.8rem",
                                    marginTop: "0.25rem",
                                }}
                            >
                                Used to automatically generate GitHub links for
                                your projects. Leave blank to remove.
                            </p>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="currentPassword">
                            Current Password (required if changing password)
                        </label>
                        <input
                            type="password"
                            id="currentPassword"
                            name="currentPassword"
                            value={updateForm.currentPassword}
                            onChange={(e) =>
                                setUpdateForm((prev) => ({
                                    ...prev,
                                    currentPassword: e.target.value,
                                }))
                            }
                            className="form-input"
                            disabled={updateLoading}
                        />
                    </div>

                    <div className="grid grid-2">
                        <div className="form-group">
                            <label className="form-label" htmlFor="newPassword">
                                New Password (optional)
                            </label>
                            <input
                                type="password"
                                id="newPassword"
                                name="newPassword"
                                value={updateForm.newPassword}
                                onChange={(e) =>
                                    setUpdateForm((prev) => ({
                                        ...prev,
                                        newPassword: e.target.value,
                                    }))
                                }
                                className="form-input"
                                disabled={updateLoading}
                                placeholder="Leave blank to keep current password"
                            />
                        </div>

                        {updateForm.newPassword && (
                            <div className="form-group">
                                <label
                                    className="form-label"
                                    htmlFor="confirmPassword"
                                >
                                    Confirm New Password
                                </label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={updateForm.confirmPassword}
                                    onChange={(e) =>
                                        setUpdateForm((prev) => ({
                                            ...prev,
                                            confirmPassword: e.target.value,
                                        }))
                                    }
                                    className="form-input"
                                    disabled={updateLoading}
                                    placeholder="Re-enter your new password"
                                />
                            </div>
                        )}
                    </div>

                    <div className="btn-group">
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={updateLoading}
                        >
                            {updateLoading ? "Updating..." : "Update Profile"}
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowUpdateModal(false)}
                            className="btn btn-secondary"
                            disabled={updateLoading}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </Modal>

            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Delete Account"
            >
                <div className="mb-1">
                    <p className="text-error mb-1">
                        ⚠️ This action cannot be undone. This will permanently
                        delete your account and all associated data including:
                    </p>
                    <ul style={{ marginLeft: "1.5rem", marginBottom: "1rem" }}>
                        <li>All your curricula</li>
                        <li>All your projects</li>
                        <li>All your notes</li>
                        <li>All your resources</li>
                    </ul>
                </div>

                <form onSubmit={handleDeleteSubmit}>
                    {deleteError && (
                        <div className="error-message mb-1">{deleteError}</div>
                    )}

                    <div className="form-group">
                        <label className="form-label" htmlFor="deletePassword">
                            Enter your password to confirm deletion *
                        </label>
                        <input
                            type="password"
                            id="deletePassword"
                            value={deletePassword}
                            onChange={(e) => setDeletePassword(e.target.value)}
                            className="form-input"
                            required
                            disabled={deleteLoading}
                            placeholder="Your current password"
                        />
                    </div>

                    <div className="btn-group">
                        <button
                            type="submit"
                            className="btn btn-danger"
                            disabled={deleteLoading || !deletePassword}
                        >
                            {deleteLoading
                                ? "Deleting..."
                                : "I understand, delete my account"}
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowDeleteModal(false)}
                            className="btn btn-secondary"
                            disabled={deleteLoading}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </Modal>

            <Notification
                isOpen={notification.isOpen}
                onClose={closeNotification}
                type={notification.type}
                title={notification.title}
                message={notification.message}
                autoClose={
                    notification.type !== "success" ||
                    notification.title !== "Account Deleted"
                }
            />
        </div>
    );
};

export default UserProfile;
