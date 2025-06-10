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
    if (!githubUsername || !githubRepo) return null;
    return `https://github.com/${githubUsername}/${githubRepo}`;
};

export const isProjectCompleted = (project) => {
    return project.state === PROJECT_STATES.COMPLETED;
};

export const validateIdentifier = (identifier) => {
    if (!identifier) return true;
    if (identifier.length > 20) return false;
    return /^[a-zA-Z0-9_-]+$/.test(identifier);
};

export const validateGithubRepo = (repoName) => {
    if (!repoName) return true;
    if (repoName.length > 100) return false;
    return /^[a-zA-Z0-9._-]+$/.test(repoName);
};

export const validateGithubUsername = (username) => {
    if (!username) return true;
    if (username.length > 39) return false;
    return /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/.test(username);
};
