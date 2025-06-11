import React, { createContext, useContext, useState, useEffect } from "react";
import { userAPI } from "../utils/api";

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            setError("");
            const data = await userAPI.getProfile();
            if (data && data.user) {
                setUser(data.user);
            } else {
                setUser(null);
            }
        } catch (error) {
            setUser(null);
            setError("");
        } finally {
            setLoading(false);
        }
    };

    const login = async (credentials) => {
        if (!credentials || !credentials.username || !credentials.password) {
            const errorMessage = "Username and password are required";
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }

        try {
            setError("");
            const data = await userAPI.login(credentials);
            if (data && data.user) {
                setUser(data.user);
                return { success: true };
            } else {
                const errorMessage = "Invalid response from server";
                setError(errorMessage);
                return { success: false, error: errorMessage };
            }
        } catch (error) {
            const errorMessage = error.message || "Login failed";
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    };

    const register = async (userData) => {
        if (!userData || !userData.username || !userData.password) {
            const errorMessage = "Username and password are required";
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }

        try {
            setError("");
            const data = await userAPI.register(userData);
            if (data && data.user) {
                setUser(data.user);
                return { success: true };
            } else {
                const errorMessage = "Invalid response from server";
                setError(errorMessage);
                return { success: false, error: errorMessage };
            }
        } catch (error) {
            const errorMessage = error.message || "Registration failed";
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    };

    const logout = () => {
        setUser(null);
        setError("");
    };

    const updateUser = async (userData) => {
        if (!userData || Object.keys(userData).length === 0) {
            const errorMessage = "No update data provided";
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }

        try {
            setError("");
            const data = await userAPI.updateUser(userData);
            if (data && data.user) {
                setUser(data.user);
                return { success: true };
            } else {
                const errorMessage = "Invalid response from server";
                setError(errorMessage);
                return { success: false, error: errorMessage };
            }
        } catch (error) {
            const errorMessage = error.message || "Update failed";
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    };

    const deleteAccount = async (password) => {
        if (!password || typeof password !== "string") {
            const errorMessage = "Password is required to delete account";
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }

        try {
            setError("");
            await userAPI.deleteUser(password);
            setUser(null);
            return { success: true };
        } catch (error) {
            const errorMessage = error.message || "Account deletion failed";
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    };

    const clearError = () => setError("");

    const value = {
        user,
        loading,
        error,
        login,
        register,
        logout,
        updateUser,
        deleteAccount,
        clearError,
        checkAuthStatus,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};
