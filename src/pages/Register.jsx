import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { validateGithubUsername } from "../utils/projectUtils";

const Register = () => {
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        confirmPassword: "",
        githubUsername: "",
    });
    const [loading, setLoading] = useState(false);
    const [validationError, setValidationError] = useState("");

    const { register, error, clearError } = useAuth();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        clearError();
        setValidationError("");
    };

    const validateForm = () => {
        if (formData.username.length < 3 || formData.username.length > 30) {
            setValidationError("Username must be between 3 and 30 characters");
            return false;
        }

        if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
            setValidationError(
                "Username can only contain letters, numbers, and underscores"
            );
            return false;
        }

        if (formData.password.length < 6) {
            setValidationError("Password must be at least 6 characters long");
            return false;
        }

        if (formData.password !== formData.confirmPassword) {
            setValidationError("Passwords do not match");
            return false;
        }

        if (
            formData.githubUsername &&
            !validateGithubUsername(formData.githubUsername)
        ) {
            setValidationError(
                "GitHub username must be between 1-39 characters and contain only letters, numbers, and hyphens (cannot start/end with hyphen)"
            );
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        const { confirmPassword, ...registerData } = formData;

        if (!registerData.githubUsername.trim()) {
            delete registerData.githubUsername;
        }

        await register(registerData);
        setLoading(false);
    };

    const displayError = validationError || error;

    return (
        <div className="flex-center" style={{ minHeight: "50vh" }}>
            <div className="card" style={{ maxWidth: "400px", width: "100%" }}>
                <div className="card-header text-center">
                    <h1 className="card-title">Register</h1>
                    <p className="card-subtitle">
                        Create your Curriculum Tracker account
                    </p>
                </div>

                {displayError && (
                    <div className="error-message">{displayError}</div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="username">
                            Username
                        </label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className="form-input"
                            required
                            disabled={loading}
                            placeholder="3-30 characters, letters, numbers, and underscores only"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="githubUsername">
                            GitHub Username (optional)
                        </label>
                        <input
                            type="text"
                            id="githubUsername"
                            name="githubUsername"
                            value={formData.githubUsername}
                            onChange={handleChange}
                            className="form-input"
                            maxLength={39}
                            disabled={loading}
                            placeholder="your-github-username"
                        />
                        <p
                            className="text-muted text-xs"
                            style={{ marginTop: "0.25rem" }}
                        >
                            Used to automatically generate GitHub links for your
                            projects
                        </p>
                    </div>

                    <div className="grid grid-2">
                        <div className="form-group">
                            <label className="form-label" htmlFor="password">
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="form-input"
                                required
                                disabled={loading}
                                placeholder="At least 6 characters"
                            />
                        </div>

                        <div className="form-group">
                            <label
                                className="form-label"
                                htmlFor="confirmPassword"
                            >
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="form-input"
                                required
                                disabled={loading}
                                placeholder="Re-enter your password"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: "100%" }}
                        disabled={loading}
                    >
                        {loading ? "Creating Account..." : "Register"}
                    </button>
                </form>

                <div className="text-center" style={{ marginTop: "0.75rem" }}>
                    <p className="text-muted text-sm">
                        Already have an account?{" "}
                        <Link to="/login" className="text-primary">
                            Login here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
