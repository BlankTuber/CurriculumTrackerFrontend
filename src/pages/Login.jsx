import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Login = () => {
    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);

    const { login, error, clearError } = useAuth();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        clearError();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        await login(formData);
        setLoading(false);
    };

    return (
        <div className="flex-center" style={{ minHeight: "50vh" }}>
            <div className="card" style={{ maxWidth: "350px", width: "100%" }}>
                <div className="card-header text-center">
                    <h1 className="card-title">Login</h1>
                    <p className="card-subtitle">
                        Welcome back to Curriculum Tracker
                    </p>
                </div>

                {error && <div className="error-message">{error}</div>}

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
                        />
                    </div>

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
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: "100%" }}
                        disabled={loading}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>

                <div className="text-center" style={{ marginTop: "0.75rem" }}>
                    <p className="text-muted text-sm">
                        Don't have an account?{" "}
                        <Link to="/register" className="text-primary">
                            Register here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
