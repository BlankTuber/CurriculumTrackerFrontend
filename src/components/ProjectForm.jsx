import React, { useState, useEffect } from "react";
import { projectAPI, curriculumAPI } from "../utils/api";
import {
    PROJECT_STATES,
    PROJECT_STATE_LABELS,
    validateIdentifier,
    validateGithubRepo,
} from "../utils/projectUtils";
import {
    getNextAvailableOrder,
    getUsedOrders,
    getUniqueStages,
} from "../utils/stageUtils";
import TopicInput from "./TopicInput";

const RESOURCE_TYPES = [
    "documentation",
    "theory",
    "book",
    "online resource",
    "video",
    "tutorial",
    "article",
    "other",
];

const ProjectForm = ({ project = null, curriculumId, onSuccess, onCancel }) => {
    const isEditing = !!project;

    const [formData, setFormData] = useState({
        name: (project && project.name) || "",
        description: (project && project.description) || "",
        identifier: (project && project.identifier) || "",
        topics: project && Array.isArray(project.topics) ? project.topics : [],
        githubRepo: (project && project.githubRepo) || "",
        state: (project && project.state) || PROJECT_STATES.NOT_STARTED,
        stage: project && project.stage ? project.stage.toString() : "",
        order: project && project.order ? project.order.toString() : "",
    });

    const [projectResources, setProjectResources] = useState(
        project &&
            project.projectResources &&
            Array.isArray(project.projectResources) &&
            project.projectResources.length > 0
            ? project.projectResources
            : []
    );

    const [allProjects, setAllProjects] = useState([]);
    const [curriculumData, setCurriculumData] = useState(null);
    const [projectsLoaded, setProjectsLoaded] = useState(false);
    const [defaultsSet, setDefaultsSet] = useState(isEditing);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (curriculumId) {
            fetchProjectsAndCurriculum();
        }
    }, [curriculumId]);

    useEffect(() => {
        if (!defaultsSet && projectsLoaded) {
            setInitialDefaults();
            setDefaultsSet(true);
        }
    }, [allProjects, isEditing, defaultsSet, projectsLoaded]);

    useEffect(() => {
        if (!isEditing && projectsLoaded && curriculumData && formData.stage) {
            const level = getLevelForStage(formData.stage);
            const stageDefinition = getStageDefinition(formData.stage);

            setFormData((prev) => {
                const updates = {};

                if (level && level.defaultIdentifier && !prev.identifier) {
                    const identifierNumber = getNextIdentifierNumber(
                        formData.stage
                    );
                    updates.identifier = `${level.defaultIdentifier}${identifierNumber}`;
                }

                if (
                    stageDefinition &&
                    stageDefinition.defaultGithubRepo &&
                    !prev.githubRepo
                ) {
                    updates.githubRepo = stageDefinition.defaultGithubRepo;
                }

                return Object.keys(updates).length > 0
                    ? { ...prev, ...updates }
                    : prev;
            });
        }
    }, [
        curriculumData,
        projectsLoaded,
        formData.stage,
        allProjects,
        isEditing,
    ]);

    const fetchProjectsAndCurriculum = async () => {
        try {
            setError("");
            const [projectsData, curriculumDetails] = await Promise.all([
                projectAPI.getAll(),
                curriculumAPI.getById(curriculumId),
            ]);

            if (!curriculumDetails || !curriculumDetails.curriculum) {
                throw new Error("Failed to load curriculum data");
            }

            const projects =
                projectsData && Array.isArray(projectsData.projects)
                    ? projectsData.projects
                    : [];
            const curriculum = curriculumDetails.curriculum;

            setAllProjects(
                projects.filter(
                    (p) =>
                        p && p.curriculum && p.curriculum._id === curriculumId
                )
            );
            setCurriculumData(curriculum);
        } catch (error) {
            setError(`Failed to fetch curriculum data: ${error.message}`);
        } finally {
            setProjectsLoaded(true);
        }
    };

    const setInitialDefaults = () => {
        if (isEditing) return;

        const sortedByDate = [...allProjects].sort((a, b) => {
            const aDate = new Date(a.createdAt || 0);
            const bDate = new Date(b.createdAt || 0);
            return bDate - aDate;
        });
        const mostRecentProject = sortedByDate[0];

        const defaultStage =
            mostRecentProject && mostRecentProject.stage
                ? mostRecentProject.stage
                : 1;
        const defaultOrder = getNextAvailableOrder(allProjects, defaultStage);

        setFormData((prev) => ({
            ...prev,
            stage: defaultStage.toString(),
            order: defaultOrder.toString(),
        }));
    };

    const getStageDefinition = (stageNumber) => {
        if (
            !curriculumData ||
            !curriculumData.stages ||
            !Array.isArray(curriculumData.stages) ||
            !stageNumber
        ) {
            return null;
        }
        const stageNum = parseInt(stageNumber);
        if (isNaN(stageNum)) return null;

        return curriculumData.stages.find(
            (s) => s && s.stageNumber === stageNum
        );
    };

    const getInheritedGithubRepo = () => {
        if (formData.githubRepo && formData.githubRepo.trim()) {
            return formData.githubRepo;
        }

        const stageDefinition = getStageDefinition(formData.stage);
        return (stageDefinition && stageDefinition.defaultGithubRepo) || "";
    };

    const getLevelForStage = (stageNumber) => {
        if (
            !curriculumData ||
            !curriculumData.levels ||
            !Array.isArray(curriculumData.levels) ||
            !stageNumber
        ) {
            return null;
        }
        const stage = parseInt(stageNumber);
        if (isNaN(stage)) return null;

        return curriculumData.levels.find(
            (level) =>
                level &&
                typeof level.stageStart === "number" &&
                typeof level.stageEnd === "number" &&
                stage >= level.stageStart &&
                stage <= level.stageEnd
        );
    };

    const getDefaultIdentifierPrefix = () => {
        const level = getLevelForStage(formData.stage);
        return (level && level.defaultIdentifier) || "";
    };

    const getNextIdentifierNumber = (stage) => {
        const level = getLevelForStage(stage);
        if (!level) return 1;

        const projectsInLevel = allProjects.filter((p) => {
            if (!p || typeof p.stage !== "number") return false;
            return (
                p.stage >= level.stageStart &&
                p.stage <= level.stageEnd &&
                p._id !== (project && project._id)
            );
        });

        return projectsInLevel.length + 1;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        if (error) setError("");
    };

    const handleStageChange = (e) => {
        const stage = e.target.value;
        setFormData((prev) => {
            const newData = { ...prev, stage };

            if (!isEditing && stage) {
                const defaultOrder = getNextAvailableOrder(
                    allProjects,
                    stage,
                    project && project._id
                );
                newData.order = defaultOrder.toString();

                if (curriculumData) {
                    const level = getLevelForStage(stage);
                    const stageDefinition = getStageDefinition(stage);

                    if (level && level.defaultIdentifier) {
                        const identifierNumber = getNextIdentifierNumber(stage);
                        newData.identifier = `${level.defaultIdentifier}${identifierNumber}`;
                    } else {
                        newData.identifier = "";
                    }

                    newData.githubRepo =
                        (stageDefinition &&
                            stageDefinition.defaultGithubRepo) ||
                        "";
                }
            }

            return newData;
        });
    };

    const handleTopicsChange = (newTopics) => {
        setFormData((prev) => ({
            ...prev,
            topics: Array.isArray(newTopics) ? newTopics : [],
        }));
    };

    const handleResourceChange = (index, field, value) => {
        setProjectResources((prev) =>
            prev.map((resource, i) =>
                i === index ? { ...resource, [field]: value } : resource
            )
        );
    };

    const addResource = () => {
        setProjectResources((prev) => [
            ...prev,
            { name: "", type: "documentation", link: "" },
        ]);
    };

    const removeResource = (index) => {
        setProjectResources((prev) => prev.filter((_, i) => i !== index));
    };

    const isValidUrl = (string) => {
        if (!string || typeof string !== "string") return false;
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    };

    const validateForm = () => {
        const trimmedName = formData.name.trim();
        const trimmedDescription = formData.description.trim();

        if (!trimmedName) {
            setError("Project name is required");
            return false;
        }

        if (trimmedName.length > 100) {
            setError("Project name must be 100 characters or less");
            return false;
        }

        if (!trimmedDescription) {
            setError("Project description is required");
            return false;
        }

        if (trimmedDescription.length > 2000) {
            setError("Description must be 2000 characters or less");
            return false;
        }

        if (formData.identifier && !validateIdentifier(formData.identifier)) {
            setError(
                "Identifier can only contain letters, numbers, underscores, and hyphens (max 20 characters)"
            );
            return false;
        }

        if (formData.githubRepo && !validateGithubRepo(formData.githubRepo)) {
            setError(
                "GitHub repository name can only contain letters, numbers, dots, underscores, and hyphens (max 100 characters)"
            );
            return false;
        }

        if (!formData.stage) {
            setError("Stage is required");
            return false;
        }

        const stage = parseInt(formData.stage);
        if (isNaN(stage) || stage < 1) {
            setError("Stage must be a positive number");
            return false;
        }

        if (formData.order) {
            const order = parseInt(formData.order);
            if (isNaN(order) || order < 1) {
                setError("Order must be a positive number");
                return false;
            }

            const usedOrders = getUsedOrders(
                allProjects,
                stage,
                project && project._id
            );
            if (usedOrders.includes(order)) {
                setError(
                    `Order ${order} is already used by another project in stage ${stage}`
                );
                return false;
            }
        }

        if (!Object.values(PROJECT_STATES).includes(formData.state)) {
            setError("Please select a valid project state");
            return false;
        }

        for (let i = 0; i < formData.topics.length; i++) {
            const topic = formData.topics[i];
            if (!topic || typeof topic !== "string") continue;
            if (topic.length > 50) {
                setError(`Topic "${topic}" is too long (max 50 characters)`);
                return false;
            }
        }

        for (let i = 0; i < projectResources.length; i++) {
            const resource = projectResources[i];
            if (!resource) continue;

            const hasName = resource.name && resource.name.trim();
            const hasLink = resource.link && resource.link.trim();

            if (hasName && !hasLink) {
                setError(
                    `Resource ${i + 1}: URL is required when name is provided`
                );
                return false;
            }
            if (hasLink && !hasName) {
                setError(
                    `Resource ${i + 1}: Name is required when URL is provided`
                );
                return false;
            }
            if (hasName && hasLink && !isValidUrl(resource.link)) {
                setError(`Resource ${i + 1}: Invalid URL`);
                return false;
            }
            if (hasName && resource.name.trim().length > 100) {
                setError(
                    `Resource ${i + 1}: Name must be 100 characters or less`
                );
                return false;
            }
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setError("");

        try {
            const validResources = projectResources
                .filter(
                    (resource) =>
                        resource &&
                        resource.name &&
                        resource.name.trim() &&
                        resource.link &&
                        resource.link.trim()
                )
                .map((resource) => ({
                    name: resource.name.trim(),
                    type: resource.type || "documentation",
                    link: resource.link.trim(),
                }));

            const submitData = {
                name: formData.name.trim(),
                description: formData.description.trim(),
                identifier: formData.identifier.trim() || undefined,
                topics: Array.isArray(formData.topics)
                    ? formData.topics.filter((t) => t && t.trim())
                    : [],
                githubRepo: formData.githubRepo.trim() || undefined,
                state: formData.state,
                stage: parseInt(formData.stage),
                order: formData.order ? parseInt(formData.order) : undefined,
                projectResources: validResources,
            };

            let result;
            if (isEditing) {
                if (!project || !project._id) {
                    throw new Error("Project ID is required for editing");
                }
                result = await projectAPI.update(project._id, submitData);
            } else {
                if (!curriculumId) {
                    throw new Error("Curriculum ID is required");
                }
                result = await projectAPI.create(curriculumId, submitData);
            }

            if (!result || !result.project) {
                throw new Error("Invalid response from server");
            }

            onSuccess(result.project);
        } catch (error) {
            setError(
                error.message || "An error occurred while saving the project"
            );
        } finally {
            setLoading(false);
        }
    };

    const getCurrentStageUsedOrders = () => {
        if (!formData.stage) return [];
        return getUsedOrders(
            allProjects,
            formData.stage,
            project && project._id
        );
    };

    const getStageInfo = () => {
        if (!formData.stage) return null;

        const stage = parseInt(formData.stage);
        if (isNaN(stage)) return null;

        const projectsInStage = allProjects.filter(
            (p) => p && p.stage === stage
        );
        const usedOrders = getCurrentStageUsedOrders();
        const availableOrder = getNextAvailableOrder(
            allProjects,
            stage,
            project && project._id
        );
        const stageDefinition = getStageDefinition(stage);

        return {
            projectCount: projectsInStage.length,
            usedOrders,
            availableOrder,
            stageDefinition,
        };
    };

    const usedStages = getUniqueStages(allProjects);
    const stageInfo = getStageInfo();
    const inheritedRepo = getInheritedGithubRepo();
    const defaultIdentifierPrefix = getDefaultIdentifierPrefix();

    return (
        <form onSubmit={handleSubmit} className="form-compact">
            {error && <div className="error-message">{error}</div>}

            <div className="grid grid-2">
                <div className="form-group">
                    <label className="form-label" htmlFor="name">
                        Project Name *
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="form-input"
                        maxLength={100}
                        required
                        disabled={loading}
                        placeholder="e.g., Todo List App"
                    />
                </div>

                <div className="form-group">
                    <label className="form-label" htmlFor="identifier">
                        Identifier (optional)
                    </label>
                    <input
                        type="text"
                        id="identifier"
                        name="identifier"
                        value={formData.identifier}
                        onChange={handleChange}
                        className="form-input"
                        maxLength={20}
                        disabled={loading}
                        placeholder={
                            defaultIdentifierPrefix
                                ? `e.g., ${defaultIdentifierPrefix}1, ${defaultIdentifierPrefix}${
                                      formData.order || "1"
                                  }`
                                : "e.g., R1, L2P3"
                        }
                    />
                    {defaultIdentifierPrefix && (
                        <p
                            className="text-muted text-xs"
                            style={{ marginTop: "0.25rem" }}
                        >
                            Suggested prefix: {defaultIdentifierPrefix} (from
                            level)
                        </p>
                    )}
                </div>
            </div>

            <div className="form-group">
                <label className="form-label" htmlFor="description">
                    Description *
                </label>
                <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="form-textarea"
                    maxLength={2000}
                    required
                    disabled={loading}
                    placeholder="Describe what this project does and what you'll learn..."
                />
            </div>

            <div className="grid grid-4">
                <div className="form-group">
                    <label className="form-label" htmlFor="stage">
                        Stage *
                    </label>
                    <input
                        type="number"
                        id="stage"
                        name="stage"
                        value={formData.stage}
                        onChange={handleStageChange}
                        className="form-input"
                        min="1"
                        required
                        disabled={loading}
                        placeholder={
                            usedStages.length > 0 ? usedStages.join(", ") : "1"
                        }
                    />
                    {stageInfo && stageInfo.stageDefinition && (
                        <p
                            className="text-muted text-xs"
                            style={{ marginTop: "0.25rem" }}
                        >
                            {stageInfo.stageDefinition.name &&
                                `${stageInfo.stageDefinition.name}: `}
                            {stageInfo.stageDefinition.description ||
                                "Stage definition found"}
                        </p>
                    )}
                </div>

                <div className="form-group">
                    <label className="form-label" htmlFor="order">
                        Order (optional)
                    </label>
                    <input
                        type="number"
                        id="order"
                        name="order"
                        value={formData.order}
                        onChange={handleChange}
                        className="form-input"
                        min="1"
                        disabled={loading}
                        placeholder={
                            stageInfo
                                ? stageInfo.availableOrder.toString()
                                : "1"
                        }
                    />
                </div>

                <div className="form-group">
                    <label className="form-label" htmlFor="githubRepo">
                        GitHub Repo (optional)
                    </label>
                    <input
                        type="text"
                        id="githubRepo"
                        name="githubRepo"
                        value={formData.githubRepo}
                        onChange={handleChange}
                        className="form-input"
                        maxLength={100}
                        disabled={loading}
                        placeholder={
                            (stageInfo &&
                                stageInfo.stageDefinition &&
                                stageInfo.stageDefinition.defaultGithubRepo) ||
                            "repo-name"
                        }
                    />
                    {stageInfo &&
                        stageInfo.stageDefinition &&
                        stageInfo.stageDefinition.defaultGithubRepo &&
                        !formData.githubRepo && (
                            <p
                                className="text-success text-xs"
                                style={{ marginTop: "0.25rem" }}
                            >
                                Will inherit:{" "}
                                {stageInfo.stageDefinition.defaultGithubRepo}{" "}
                                (from stage {formData.stage})
                            </p>
                        )}
                    {inheritedRepo && formData.githubRepo && (
                        <p
                            className="text-muted text-xs"
                            style={{ marginTop: "0.25rem" }}
                        >
                            Using custom repository name
                        </p>
                    )}
                </div>

                <div className="form-group">
                    <label className="form-label" htmlFor="state">
                        State
                    </label>
                    <select
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        className="form-select"
                        disabled={loading}
                    >
                        {Object.entries(PROJECT_STATE_LABELS).map(
                            ([value, label]) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            )
                        )}
                    </select>
                </div>
            </div>

            <TopicInput
                topics={formData.topics}
                onTopicsChange={handleTopicsChange}
                existingProjects={allProjects}
                disabled={loading}
            />

            <div className="form-group">
                <div className="flex-between">
                    <label className="form-label">
                        Project Resources (optional)
                    </label>
                    <button
                        type="button"
                        onClick={addResource}
                        className="btn btn-secondary btn-small"
                        disabled={loading}
                    >
                        Add Resource
                    </button>
                </div>

                {projectResources.length === 0 ? (
                    <p
                        className="text-muted text-center text-sm"
                        style={{
                            padding: "1rem",
                            border: "1px dashed var(--border-color)",
                            borderRadius: "4px",
                        }}
                    >
                        No project resources yet. Click "Add Resource" to add
                        project-specific resources.
                    </p>
                ) : (
                    <div className="scrollable-list">
                        {projectResources.map((resource, index) => (
                            <div key={index} className="resource-grid">
                                <input
                                    type="text"
                                    value={resource.name || ""}
                                    onChange={(e) =>
                                        handleResourceChange(
                                            index,
                                            "name",
                                            e.target.value
                                        )
                                    }
                                    className="form-input"
                                    maxLength={100}
                                    disabled={loading}
                                    placeholder="Resource name"
                                />

                                <select
                                    value={resource.type || "documentation"}
                                    onChange={(e) =>
                                        handleResourceChange(
                                            index,
                                            "type",
                                            e.target.value
                                        )
                                    }
                                    className="form-select"
                                    disabled={loading}
                                >
                                    {RESOURCE_TYPES.map((type) => (
                                        <option key={type} value={type}>
                                            {type.charAt(0).toUpperCase() +
                                                type.slice(1)}
                                        </option>
                                    ))}
                                </select>

                                <input
                                    type="url"
                                    value={resource.link || ""}
                                    onChange={(e) =>
                                        handleResourceChange(
                                            index,
                                            "link",
                                            e.target.value
                                        )
                                    }
                                    className="form-input"
                                    disabled={loading}
                                    placeholder="https://example.com"
                                />

                                <button
                                    type="button"
                                    onClick={() => removeResource(index)}
                                    className="btn btn-danger btn-small"
                                    disabled={loading}
                                    style={{
                                        padding: "0.25rem 0.5rem",
                                        fontSize: "0.7rem",
                                    }}
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="btn-group">
                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                >
                    {loading
                        ? isEditing
                            ? "Updating..."
                            : "Creating..."
                        : isEditing
                        ? "Update Project"
                        : "Create Project"}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="btn btn-secondary"
                    disabled={loading}
                >
                    Cancel
                </button>
            </div>
        </form>
    );
};

export default ProjectForm;
