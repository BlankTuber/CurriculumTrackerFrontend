import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Header = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <header className="header">
            <div className="container">
                <div className="header-content">
                    <Link to="/dashboard" className="logo">
                        Curriculum Tracker
                    </Link>

                    {user && (
                        <div className="user-info">
                            <span>Welcome, {user.username}</span>
                            <div className="btn-group">
                                <Link
                                    to="/profile"
                                    className="btn btn-secondary btn-small"
                                >
                                    Profile
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="btn btn-secondary btn-small"
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
