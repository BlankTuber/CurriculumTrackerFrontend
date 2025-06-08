const API_BASE_URL = "http://localhost:3000/api";

// Helper function to make API requests
const apiRequest = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
        credentials: "include", // Include cookies for session auth
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
        ...options,
    };

    try {
        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "An error occurred");
        }

        return data;
    } catch (error) {
        throw error;
    }
};

// User API functions
export const userAPI = {
    register: (userData) =>
        apiRequest("/user/register", {
            method: "POST",
            body: JSON.stringify(userData),
        }),

    login: (credentials) =>
        apiRequest("/user/login", {
            method: "POST",
            body: JSON.stringify(credentials),
        }),

    getProfile: () => apiRequest("/user"),

    updateUser: (userData) =>
        apiRequest("/user/updateUser", {
            method: "PUT",
            body: JSON.stringify(userData),
        }),

    deleteUser: (password) =>
        apiRequest("/user/deleteUser", {
            method: "DELETE",
            body: JSON.stringify({ password }),
        }),
};

// Curriculum API functions
export const curriculumAPI = {
    create: (curriculumData) =>
        apiRequest("/curricula/createCurriculum", {
            method: "POST",
            body: JSON.stringify(curriculumData),
        }),

    getAll: () => apiRequest("/curricula"),

    getById: (id) => apiRequest(`/curricula/${id}`),

    update: (id, data) =>
        apiRequest(`/curricula/${id}/updateCurriculum`, {
            method: "PUT",
            body: JSON.stringify(data),
        }),

    delete: (id) =>
        apiRequest(`/curricula/${id}/deleteCurriculum`, {
            method: "DELETE",
        }),

    // Resource functions
    createResource: (curriculumId, resourceData) =>
        apiRequest(`/curricula/resource/${curriculumId}/createResource`, {
            method: "POST",
            body: JSON.stringify(resourceData),
        }),

    getResource: (resourceId) =>
        apiRequest(`/curricula/resource/${resourceId}`),

    updateResource: (resourceId, resourceData) =>
        apiRequest(`/curricula/resource/${resourceId}/updateResource`, {
            method: "PUT",
            body: JSON.stringify(resourceData),
        }),

    deleteResource: (resourceId) =>
        apiRequest(`/curricula/resource/${resourceId}/deleteResource`, {
            method: "DELETE",
        }),
};

// Project API functions
export const projectAPI = {
    create: (curriculumId, projectData) =>
        apiRequest(`/projects/${curriculumId}/createProject`, {
            method: "POST",
            body: JSON.stringify(projectData),
        }),

    getAll: () => apiRequest("/projects"),

    getById: (id) => apiRequest(`/projects/${id}`),

    update: (id, data) =>
        apiRequest(`/projects/${id}/updateProject`, {
            method: "PUT",
            body: JSON.stringify(data),
        }),

    delete: (id) =>
        apiRequest(`/projects/${id}/deleteProject`, {
            method: "DELETE",
        }),

    // Project Resource functions
    createResource: (projectId, resourceData) =>
        apiRequest(`/projects/resource/${projectId}/createProjectResource`, {
            method: "POST",
            body: JSON.stringify(resourceData),
        }),

    getResource: (resourceId) => apiRequest(`/projects/resource/${resourceId}`),

    updateResource: (resourceId, resourceData) =>
        apiRequest(`/projects/resource/${resourceId}/updateProjectResource`, {
            method: "PUT",
            body: JSON.stringify(resourceData),
        }),

    deleteResource: (resourceId) =>
        apiRequest(`/projects/resource/${resourceId}/deleteProjectResource`, {
            method: "DELETE",
        }),
};

// Note API functions
export const noteAPI = {
    create: (projectId, noteData) =>
        apiRequest(`/notes/${projectId}/createNote`, {
            method: "POST",
            body: JSON.stringify(noteData),
        }),

    getById: (id) => apiRequest(`/notes/${id}`),

    update: (id, data) =>
        apiRequest(`/notes/${id}/updateNote`, {
            method: "PUT",
            body: JSON.stringify(data),
        }),

    delete: (id) =>
        apiRequest(`/notes/${id}/deleteNote`, {
            method: "DELETE",
        }),
};

// Health check
export const healthAPI = {
    check: () => apiRequest("/health"),
};
