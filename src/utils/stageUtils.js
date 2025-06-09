export const getLevelForStage = (levels, stage) => {
    if (!levels || !Array.isArray(levels)) return null;
    return levels.find(
        (level) => stage >= level.stageStart && stage <= level.stageEnd
    );
};

export const sortProjectsByStageAndOrder = (projects) => {
    if (!projects || !Array.isArray(projects)) return [];

    return [...projects].sort((a, b) => {
        if (a.stage !== b.stage) return a.stage - b.stage;
        if (a.order && b.order) return a.order - b.order;
        if (a.order && !b.order) return -1;
        if (!a.order && b.order) return 1;
        return new Date(a.createdAt) - new Date(b.createdAt);
    });
};

export const sortLevelsByOrder = (levels) => {
    if (!levels || !Array.isArray(levels)) return [];
    return [...levels].sort((a, b) => a.order - b.order);
};

export const getUniqueStages = (projects) => {
    if (!projects || !Array.isArray(projects)) return [];
    return [...new Set(projects.map((p) => p.stage))].sort((a, b) => a - b);
};

export const filterProjectsByStage = (projects, stage) => {
    if (!projects || !stage) return projects;
    return projects.filter((p) => p.stage === parseInt(stage));
};

export const filterProjectsByLevel = (projects, levels, levelId) => {
    if (!projects || !levels || !levelId) return projects;

    const selectedLevel = levels.find((l) => l._id === levelId);
    if (!selectedLevel) return projects;

    return projects.filter(
        (p) =>
            p.stage >= selectedLevel.stageStart &&
            p.stage <= selectedLevel.stageEnd
    );
};

export const getProjectStats = (projects) => {
    if (!projects || !Array.isArray(projects)) {
        return { total: 0, completed: 0, percentage: 0 };
    }

    const total = projects.length;
    const completed = projects.filter((p) => p.completed).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, percentage };
};

export const getNextIncompleteProject = (projects) => {
    if (!projects || !Array.isArray(projects)) return null;

    const sortedProjects = sortProjectsByStageAndOrder(projects);
    return sortedProjects.find((p) => !p.completed) || null;
};

export const validateStageRange = (
    stageStart,
    stageEnd,
    existingLevels = [],
    excludeLevelId = null
) => {
    if (stageStart < 1) {
        return { valid: false, error: "Stage start must be at least 1" };
    }

    if (stageEnd < stageStart) {
        return {
            valid: false,
            error: "Stage end must be greater than or equal to stage start",
        };
    }

    const filteredLevels = existingLevels.filter(
        (level) => level._id !== excludeLevelId
    );

    for (const level of filteredLevels) {
        const hasOverlap = !(
            stageEnd < level.stageStart || stageStart > level.stageEnd
        );
        if (hasOverlap) {
            return {
                valid: false,
                error: `Stage range overlaps with "${level.name}" (stages ${level.stageStart}-${level.stageEnd})`,
            };
        }
    }

    return { valid: true };
};

export const validateLevelOrder = (
    order,
    existingLevels = [],
    excludeLevelId = null
) => {
    if (order < 1) {
        return { valid: false, error: "Order must be at least 1" };
    }

    const filteredLevels = existingLevels.filter(
        (level) => level._id !== excludeLevelId
    );
    const existingLevel = filteredLevels.find((level) => level.order === order);

    if (existingLevel) {
        return {
            valid: false,
            error: `A level with order ${order} already exists: "${existingLevel.name}"`,
        };
    }

    return { valid: true };
};
