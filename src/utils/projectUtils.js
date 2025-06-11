export const PROJECT_STATES = {
    NOT_STARTED: "not_started",
    IN_PROGRESS: "in_progress",
    COMPLETED: "completed",
};

export const PROJECT_STATE_LABELS = {
    [PROJECT_STATES.NOT_STARTED]: "Not Started",
    [PROJECT_STATES.IN_PROGRESS]: "In Progress",
    [PROJECT_STATES.COMPLETED]: "Completed",
};

export const PROJECT_STATE_COLORS = {
    [PROJECT_STATES.NOT_STARTED]: "text-muted",
    [PROJECT_STATES.IN_PROGRESS]: "text-warning",
    [PROJECT_STATES.COMPLETED]: "text-success",
};

export const constructGithubUrl = (githubUsername, githubRepo) => {
    if (
        !githubUsername ||
        !githubRepo ||
        typeof githubUsername !== "string" ||
        typeof githubRepo !== "string"
    ) {
        return null;
    }

    const cleanUsername = githubUsername.trim();
    const cleanRepo = githubRepo.trim();

    if (!cleanUsername || !cleanRepo) return null;

    return `https://github.com/${cleanUsername}/${cleanRepo}`;
};

export const isProjectCompleted = (project) => {
    return project && project.state === PROJECT_STATES.COMPLETED;
};

export const validateIdentifier = (identifier) => {
    if (!identifier || typeof identifier !== "string") return true;
    if (identifier.length > 20) return false;
    return /^[a-zA-Z0-9_-]+$/.test(identifier);
};

export const validateGithubRepo = (repoName) => {
    if (!repoName || typeof repoName !== "string") return true;
    if (repoName.length > 100) return false;
    return /^[a-zA-Z0-9._-]+$/.test(repoName);
};

export const validateGithubUsername = (username) => {
    if (!username || typeof username !== "string") return true;
    if (username.length > 39) return false;
    return /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/.test(username);
};

export const safeFormatDate = (dateString, options = {}) => {
    if (!dateString) return "N/A";

    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "Invalid Date";

        const defaultOptions = {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            ...options,
        };

        return date.toLocaleDateString("en-US", defaultOptions);
    } catch (error) {
        return "Invalid Date";
    }
};

export const getProjectStateInfo = (state) => {
    if (!state || typeof state !== "string") {
        return {
            label: PROJECT_STATE_LABELS[PROJECT_STATES.NOT_STARTED],
            color: PROJECT_STATE_COLORS[PROJECT_STATES.NOT_STARTED],
            value: PROJECT_STATES.NOT_STARTED,
        };
    }

    return {
        label: PROJECT_STATE_LABELS[state] || "Unknown",
        color: PROJECT_STATE_COLORS[state] || "text-muted",
        value: state,
    };
};
