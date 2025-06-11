const API_BASE_URL = "http://localhost:3000/api";

const apiRequest = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
        credentials: "include",
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

export const levelAPI = {
    create: (curriculumId, levelData) =>
        apiRequest(`/curricula/level/${curriculumId}/createLevel`, {
            method: "POST",
            body: JSON.stringify(levelData),
        }),

    getById: (levelId) => apiRequest(`/curricula/level/${levelId}`),

    update: (levelId, levelData) =>
        apiRequest(`/curricula/level/${levelId}/updateLevel`, {
            method: "PUT",
            body: JSON.stringify(levelData),
        }),

    delete: (levelId) =>
        apiRequest(`/curricula/level/${levelId}/deleteLevel`, {
            method: "DELETE",
        }),
};

export const stageAPI = {
    create: (curriculumId, stageData) =>
        apiRequest(`/curricula/stage/${curriculumId}/createStage`, {
            method: "POST",
            body: JSON.stringify(stageData),
        }),

    getById: (stageId) => apiRequest(`/curricula/stage/${stageId}`),

    update: (stageId, stageData) =>
        apiRequest(`/curricula/stage/${stageId}/updateStage`, {
            method: "PUT",
            body: JSON.stringify(stageData),
        }),

    delete: (stageId) =>
        apiRequest(`/curricula/stage/${stageId}/deleteStage`, {
            method: "DELETE",
        }),
};

export const projectAPI = {
    create: (curriculumId, projectData) =>
        apiRequest(`/projects/${curriculumId}/createProject`, {
            method: "POST",
            body: JSON.stringify(projectData),
        }),

    getAll: () => apiRequest("/projects"),

    getById: (id) => apiRequest(`/projects/${id}`),

    getByCurriculumStage: (curriculumId, params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.stage) queryParams.append("stage", params.stage);
        if (params.level) queryParams.append("level", params.level);

        const queryString = queryParams.toString();
        const endpoint = `/projects/curriculum/${curriculumId}/stage${
            queryString ? `?${queryString}` : ""
        }`;

        return apiRequest(endpoint);
    },

    update: (id, data) =>
        apiRequest(`/projects/${id}/updateProject`, {
            method: "PUT",
            body: JSON.stringify(data),
        }),

    delete: (id) =>
        apiRequest(`/projects/${id}/deleteProject`, {
            method: "DELETE",
        }),

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

export const healthAPI = {
    check: () => apiRequest("/health"),
};
