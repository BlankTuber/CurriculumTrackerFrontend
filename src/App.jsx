import React from "react";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Header from "./components/Header";
import LoadingSpinner from "./components/LoadingSpinner";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CurriculumDetail from "./pages/CurriculumDetail";
import ProjectDetail from "./pages/ProjectDetail";
import UserProfile from "./pages/UserProfile";

// Protected route component
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <LoadingSpinner />;
    }

    return user ? children : <Navigate to="/login" />;
};

// Public route component (redirect if authenticated)
const PublicRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <LoadingSpinner />;
    }

    return user ? <Navigate to="/dashboard" /> : children;
};

function AppContent() {
    const { loading } = useAuth();

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="app">
            <Header />
            <main className="main-content">
                <div className="container">
                    <Routes>
                        <Route
                            path="/"
                            element={<Navigate to="/dashboard" />}
                        />
                        <Route
                            path="/login"
                            element={
                                <PublicRoute>
                                    <Login />
                                </PublicRoute>
                            }
                        />
                        <Route
                            path="/register"
                            element={
                                <PublicRoute>
                                    <Register />
                                </PublicRoute>
                            }
                        />
                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/curriculum/:id"
                            element={
                                <ProtectedRoute>
                                    <CurriculumDetail />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/project/:id"
                            element={
                                <ProtectedRoute>
                                    <ProjectDetail />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/profile"
                            element={
                                <ProtectedRoute>
                                    <UserProfile />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="*"
                            element={<Navigate to="/dashboard" />}
                        />
                    </Routes>
                </div>
            </main>
        </div>
    );
}

function App() {
    return (
        <Router>
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </Router>
    );
}

export default App;
