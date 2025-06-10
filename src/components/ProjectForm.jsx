import React, { useState, useEffect } from "react";
import { projectAPI } from "../utils/api";
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
        name: project?.name || "",
        description: project?.description || "",
        identifier: project?.identifier || "",
        topics: project?.topics || [],
        githubRepo: project?.githubRepo || "",
        state: project?.state || PROJECT_STATES.NOT_STARTED,
        stage: project?.stage || "",
        order: project?.order || "",
    });

    const [topicInput, setTopicInput] = useState("");

    const [projectResources, setProjectResources] = useState(
        project?.projectResources && project.projectResources.length > 0
            ? project.projectResources
            : []
    );

    const [allProjects, setAllProjects] = useState([]);
    const [defaultsSet, setDefaultsSet] = useState(isEditing);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchAllProjects();
    }, []);

    useEffect(() => {
        if (!defaultsSet && allProjects.length >= 0) {
            setInitialDefaults();
            setDefaultsSet(true);
        }
    }, [allProjects, defaultsSet, isEditing]);

    useEffect(() => {
        if (formData.stage && !isEditing && defaultsSet) {
            const defaultOrder = getNextAvailableOrder(
                allProjects,
                formData.stage
            );
            setFormData((prev) => ({
                ...prev,
                order: defaultOrder.toString(),
            }));
        }
    }, [formData.stage, allProjects, isEditing, defaultsSet]);

    const fetchAllProjects = async () => {
        try {
            const data = await projectAPI.getAll();
            setAllProjects(
                data.projects.filter((p) => p.curriculum._id === curriculumId)
            );
        } catch (error) {
            console.error("Failed to fetch projects:", error);
        }
    };

    const setInitialDefaults = () => {
        if (isEditing) return;

        const usedStages = getUniqueStages(allProjects);
        const defaultStage =
            usedStages.length > 0 ? Math.max(...usedStages) : 1;
        const defaultOrder = getNextAvailableOrder(allProjects, defaultStage);

        setFormData((prev) => ({
            ...prev,
            stage: defaultStage.toString(),
            order: defaultOrder.toString(),
        }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleStageChange = (e) => {
        const stage = e.target.value;
        setFormData((prev) => {
            const newData = { ...prev, stage };

            if (!isEditing && stage) {
                const defaultOrder = getNextAvailableOrder(
                    allProjects,
                    stage,
                    project?._id
                );
                newData.order = defaultOrder.toString();
            }

            return newData;
        });
    };

    const handleTopicAdd = () => {
        const trimmedTopic = topicInput.trim();
        if (trimmedTopic && !formData.topics.includes(trimmedTopic)) {
            setFormData((prev) => ({
                ...prev,
                topics: [...prev.topics, trimmedTopic],
            }));
            setTopicInput("");
        }
    };

    const handleTopicRemove = (topicToRemove) => {
        setFormData((prev) => ({
            ...prev,
            topics: prev.topics.filter((topic) => topic !== topicToRemove),
        }));
    };

    const handleTopicInputKeyPress = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleTopicAdd();
        }
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

    const validateForm = () => {
        if (!formData.name.trim()) {
            setError("Project name is required");
            return false;
        }

        if (formData.name.length > 100) {
            setError("Project name must be 100 characters or less");
            return false;
        }

        if (!formData.description.trim()) {
            setError("Project description is required");
            return false;
        }

        if (formData.description.length > 2000) {
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

            const usedOrders = getUsedOrders(allProjects, stage, project?._id);
            if (usedOrders.includes(order)) {
                setError(
                    `Order ${order} is already used by another project in stage ${stage}`
                );
                return false;
            }
        }

        for (let i = 0; i < formData.topics.length; i++) {
            if (formData.topics[i].length > 50) {
                setError(
                    `Topic "${formData.topics[i]}" is too long (max 50 characters)`
                );
                return false;
            }
        }

        for (let i = 0; i < projectResources.length; i++) {
            const resource = projectResources[i];
            if (resource.name.trim() && !resource.link.trim()) {
                setError(
                    `Resource ${i + 1}: URL is required when name is provided`
                );
                return false;
            }
            if (resource.link.trim() && !resource.name.trim()) {
                setError(
                    `Resource ${i + 1}: Name is required when URL is provided`
                );
                return false;
            }
            if (resource.name.trim() && !isValidUrl(resource.link)) {
                setError(`Resource ${i + 1}: Invalid URL`);
                return false;
            }
        }

        return true;
    };

    const isValidUrl = (string) => {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setError("");

        try {
            const validResources = projectResources.filter(
                (resource) => resource.name.trim() && resource.link.trim()
            );

            const submitData = {
                ...formData,
                stage: parseInt(formData.stage),
                order: formData.order ? parseInt(formData.order) : undefined,
                projectResources: validResources,
            };

            let result;
            if (isEditing) {
                result = await projectAPI.update(project._id, submitData);
            } else {
                result = await projectAPI.create(curriculumId, submitData);
            }

            onSuccess(result.project);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const getCurrentStageUsedOrders = () => {
        if (!formData.stage) return [];
        return getUsedOrders(allProjects, formData.stage, project?._id);
    };

    const getStageInfo = () => {
        if (!formData.stage) return null;

        const stage = parseInt(formData.stage);
        const projectsInStage = allProjects.filter((p) => p.stage === stage);
        const usedOrders = getCurrentStageUsedOrders();
        const availableOrder = getNextAvailableOrder(
            allProjects,
            stage,
            project?._id
        );

        return {
            projectCount: projectsInStage.length,
            usedOrders,
            availableOrder,
        };
    };

    const usedStages = getUniqueStages(allProjects);
    const stageInfo = getStageInfo();

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
                        placeholder="e.g., R1, L2P3"
                    />
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
                        placeholder="repo-name"
                    />
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

            <div className="form-group">
                <label className="form-label">Topics</label>
                <div className="inline-form">
                    <div className="form-group" style={{ flex: 2 }}>
                        <input
                            type="text"
                            value={topicInput}
                            onChange={(e) => setTopicInput(e.target.value)}
                            onKeyPress={handleTopicInputKeyPress}
                            className="form-input"
                            maxLength={50}
                            disabled={loading}
                            placeholder="e.g., React, Authentication"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={handleTopicAdd}
                        className="btn btn-secondary btn-small"
                        disabled={loading || !topicInput.trim()}
                    >
                        Add
                    </button>
                </div>
                {formData.topics.length > 0 && (
                    <div
                        className="flex"
                        style={{
                            gap: "0.25rem",
                            flexWrap: "wrap",
                            marginTop: "0.25rem",
                        }}
                    >
                        {formData.topics.map((topic, index) => (
                            <span
                                key={index}
                                className="tag"
                                style={{
                                    background: "var(--bg-tertiary)",
                                    padding: "0.25rem 0.5rem",
                                    borderRadius: "4px",
                                    fontSize: "0.75rem",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.25rem",
                                }}
                            >
                                {topic}
                                <button
                                    type="button"
                                    onClick={() => handleTopicRemove(topic)}
                                    disabled={loading}
                                    style={{
                                        background: "none",
                                        border: "none",
                                        color: "var(--text-muted)",
                                        cursor: "pointer",
                                        padding: "0",
                                        fontSize: "0.8rem",
                                    }}
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>
                )}
            </div>

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
                                    value={resource.name}
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
                                    value={resource.type}
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
                                    value={resource.link}
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
