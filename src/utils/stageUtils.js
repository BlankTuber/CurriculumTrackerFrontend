import { isProjectCompleted } from "./projectUtils";

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
    const completed = projects.filter((p) => isProjectCompleted(p)).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, percentage };
};

export const getNextIncompleteProject = (projects) => {
    if (!projects || !Array.isArray(projects)) return null;

    const sortedProjects = sortProjectsByStageAndOrder(projects);
    return sortedProjects.find((p) => !isProjectCompleted(p)) || null;
};

export const getNextAvailableOrder = (
    projects,
    stage,
    excludeProjectId = null
) => {
    if (!projects || !Array.isArray(projects)) return 1;

    const projectsInStage = projects
        .filter(
            (p) => p.stage === parseInt(stage) && p._id !== excludeProjectId
        )
        .map((p) => p.order)
        .filter((order) => order != null && order > 0)
        .sort((a, b) => a - b);

    if (projectsInStage.length === 0) return 1;

    for (let i = 1; i <= projectsInStage.length + 1; i++) {
        if (!projectsInStage.includes(i)) return i;
    }
    return projectsInStage.length + 1;
};

export const getUsedOrders = (projects, stage, excludeProjectId = null) => {
    if (!projects || !Array.isArray(projects)) return [];

    return projects
        .filter(
            (p) => p.stage === parseInt(stage) && p._id !== excludeProjectId
        )
        .map((p) => p.order)
        .filter((order) => order != null && order > 0)
        .sort((a, b) => a - b);
};

export const getNextAvailableStageRange = (levels, stageSize = 5) => {
    if (!levels || levels.length === 0) {
        return { stageStart: 1, stageEnd: stageSize };
    }

    const sortedLevels = levels
        .filter((level) => level.stageStart != null && level.stageEnd != null)
        .sort((a, b) => a.stageEnd - b.stageEnd);

    if (sortedLevels.length === 0) {
        return { stageStart: 1, stageEnd: stageSize };
    }

    const lastLevel = sortedLevels[sortedLevels.length - 1];
    const nextStart = lastLevel.stageEnd + 1;

    return {
        stageStart: nextStart,
        stageEnd: nextStart + stageSize - 1,
    };
};

export const getNextAvailableLevelOrder = (levels, excludeLevelId = null) => {
    if (!levels || !Array.isArray(levels)) return 1;

    const usedOrders = levels
        .filter((level) => level._id !== excludeLevelId && level.order != null)
        .map((level) => level.order)
        .sort((a, b) => a - b);

    if (usedOrders.length === 0) return 1;

    for (let i = 1; i <= usedOrders.length + 1; i++) {
        if (!usedOrders.includes(i)) return i;
    }
    return usedOrders.length + 1;
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
