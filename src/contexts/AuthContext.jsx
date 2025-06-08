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

    // Check if user is logged in on app load
    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            const data = await userAPI.getProfile();
            setUser(data.user);
        } catch (error) {
            // User is not authenticated
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (credentials) => {
        try {
            setError("");
            const data = await userAPI.login(credentials);
            setUser(data.user);
            return { success: true };
        } catch (error) {
            setError(error.message);
            return { success: false, error: error.message };
        }
    };

    const register = async (userData) => {
        try {
            setError("");
            const data = await userAPI.register(userData);
            setUser(data.user);
            return { success: true };
        } catch (error) {
            setError(error.message);
            return { success: false, error: error.message };
        }
    };

    const logout = () => {
        setUser(null);
        setError("");
    };

    const updateUser = async (userData) => {
        try {
            setError("");
            const data = await userAPI.updateUser(userData);
            setUser(data.user);
            return { success: true };
        } catch (error) {
            setError(error.message);
            return { success: false, error: error.message };
        }
    };

    const deleteAccount = async (password) => {
        try {
            setError("");
            await userAPI.deleteUser(password);
            setUser(null);
            return { success: true };
        } catch (error) {
            setError(error.message);
            return { success: false, error: error.message };
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
