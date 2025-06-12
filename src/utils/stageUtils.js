import { isProjectCompleted } from "./projectUtils";

export const getLevelForStage = (levels, stage) => {
    if (!levels || !Array.isArray(levels) || typeof stage !== "number")
        return null;
    return levels.find(
        (level) =>
            level &&
            typeof level.stageStart === "number" &&
            typeof level.stageEnd === "number" &&
            stage >= level.stageStart &&
            stage <= level.stageEnd
    );
};

export const sortProjectsByStageAndOrder = (projects) => {
    if (!projects || !Array.isArray(projects)) return [];

    return [...projects].sort((a, b) => {
        if (!a || !b) return 0;

        const aStage = typeof a.stage === "number" ? a.stage : 0;
        const bStage = typeof b.stage === "number" ? b.stage : 0;

        if (aStage !== bStage) return aStage - bStage;

        const aOrder = typeof a.order === "number" ? a.order : null;
        const bOrder = typeof b.order === "number" ? b.order : null;

        if (aOrder && bOrder) return aOrder - bOrder;
        if (aOrder && !bOrder) return -1;
        if (!aOrder && bOrder) return 1;

        const aDate = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const bDate = b.createdAt ? new Date(b.createdAt) : new Date(0);
        return aDate - bDate;
    });
};

export const sortLevelsByOrder = (levels) => {
    if (!levels || !Array.isArray(levels)) return [];
    return [...levels].sort((a, b) => {
        if (!a || !b) return 0;
        const aOrder = typeof a.order === "number" ? a.order : 0;
        const bOrder = typeof b.order === "number" ? b.order : 0;
        return aOrder - bOrder;
    });
};

export const getUniqueStages = (projects) => {
    if (!projects || !Array.isArray(projects)) return [];
    const stages = projects
        .map((p) => (p && typeof p.stage === "number" ? p.stage : null))
        .filter((stage) => stage !== null);
    return [...new Set(stages)].sort((a, b) => a - b);
};

export const filterProjectsByStage = (projects, stage) => {
    if (!projects || !Array.isArray(projects) || !stage) return projects;
    const stageNumber = parseInt(stage);
    if (isNaN(stageNumber)) return projects;
    return projects.filter((p) => p && p.stage === stageNumber);
};

export const filterProjectsByLevel = (projects, levels, levelId) => {
    if (
        !projects ||
        !Array.isArray(projects) ||
        !levels ||
        !Array.isArray(levels) ||
        !levelId
    ) {
        return projects;
    }

    const selectedLevel = levels.find((l) => l && l._id === levelId);
    if (
        !selectedLevel ||
        typeof selectedLevel.stageStart !== "number" ||
        typeof selectedLevel.stageEnd !== "number"
    ) {
        return projects;
    }

    return projects.filter(
        (p) =>
            p &&
            typeof p.stage === "number" &&
            p.stage >= selectedLevel.stageStart &&
            p.stage <= selectedLevel.stageEnd
    );
};

export const getProjectStats = (projects) => {
    if (!projects || !Array.isArray(projects)) {
        return { total: 0, completed: 0, percentage: 0 };
    }

    const validProjects = projects.filter((p) => p);
    const total = validProjects.length;
    const completed = validProjects.filter((p) => isProjectCompleted(p)).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, percentage };
};

export const getNextIncompleteProject = (projects) => {
    if (!projects || !Array.isArray(projects)) return null;

    const sortedProjects = sortProjectsByStageAndOrder(projects);
    return sortedProjects.find((p) => p && !isProjectCompleted(p)) || null;
};

export const getNextProjects = (projects, count = 3) => {
    if (!projects || !Array.isArray(projects)) return [];

    const sortedProjects = sortProjectsByStageAndOrder(projects);
    const incompleteProjects = sortedProjects.filter(
        (p) => p && !isProjectCompleted(p)
    );

    return incompleteProjects.slice(0, count);
};

export const getNextAvailableOrder = (
    projects,
    stage,
    excludeProjectId = null
) => {
    if (!projects || !Array.isArray(projects)) return 1;

    const stageNumber = parseInt(stage);
    if (isNaN(stageNumber)) return 1;

    const projectsInStage = projects
        .filter(
            (p) =>
                p &&
                p.stage === stageNumber &&
                p._id !== excludeProjectId &&
                typeof p.order === "number" &&
                p.order > 0
        )
        .map((p) => p.order)
        .sort((a, b) => a - b);

    if (projectsInStage.length === 0) return 1;

    for (let i = 1; i <= projectsInStage.length + 1; i++) {
        if (!projectsInStage.includes(i)) return i;
    }
    return projectsInStage.length + 1;
};

export const getUsedOrders = (projects, stage, excludeProjectId = null) => {
    if (!projects || !Array.isArray(projects)) return [];

    const stageNumber = parseInt(stage);
    if (isNaN(stageNumber)) return [];

    return projects
        .filter(
            (p) =>
                p &&
                p.stage === stageNumber &&
                p._id !== excludeProjectId &&
                typeof p.order === "number" &&
                p.order > 0
        )
        .map((p) => p.order)
        .sort((a, b) => a - b);
};

export const getNextAvailableStageRange = (levels, stageSize = 5) => {
    if (!levels || !Array.isArray(levels)) {
        return { stageStart: 1, stageEnd: stageSize };
    }

    const validLevels = levels.filter(
        (level) =>
            level &&
            typeof level.stageStart === "number" &&
            typeof level.stageEnd === "number"
    );

    if (validLevels.length === 0) {
        return { stageStart: 1, stageEnd: stageSize };
    }

    const sortedLevels = validLevels.sort((a, b) => a.stageEnd - b.stageEnd);
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
        .filter(
            (level) =>
                level &&
                level._id !== excludeLevelId &&
                typeof level.order === "number"
        )
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
    if (typeof stageStart !== "number" || typeof stageEnd !== "number") {
        return { valid: false, error: "Stage start and end must be numbers" };
    }

    if (stageStart < 1) {
        return { valid: false, error: "Stage start must be at least 1" };
    }

    if (stageEnd < stageStart) {
        return {
            valid: false,
            error: "Stage end must be greater than or equal to stage start",
        };
    }

    if (!existingLevels || !Array.isArray(existingLevels)) {
        return { valid: true };
    }

    const filteredLevels = existingLevels.filter(
        (level) =>
            level &&
            level._id !== excludeLevelId &&
            typeof level.stageStart === "number" &&
            typeof level.stageEnd === "number"
    );

    for (const level of filteredLevels) {
        const hasOverlap = !(
            stageEnd < level.stageStart || stageStart > level.stageEnd
        );
        if (hasOverlap) {
            return {
                valid: false,
                error: `Stage range overlaps with "${
                    level.name || "Unnamed Level"
                }" (stages ${level.stageStart}-${level.stageEnd})`,
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
    if (typeof order !== "number" || order < 1) {
        return { valid: false, error: "Order must be a number greater than 0" };
    }

    if (!existingLevels || !Array.isArray(existingLevels)) {
        return { valid: true };
    }

    const filteredLevels = existingLevels.filter(
        (level) => level && level._id !== excludeLevelId
    );

    const existingLevel = filteredLevels.find((level) => level.order === order);

    if (existingLevel) {
        return {
            valid: false,
            error: `A level with order ${order} already exists: "${
                existingLevel.name || "Unnamed Level"
            }"`,
        };
    }

    return { valid: true };
};
