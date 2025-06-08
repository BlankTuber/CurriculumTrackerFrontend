import React, { useState, useEffect } from "react";
import { projectAPI } from "../utils/api";

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
        githubLink: project?.githubLink || "",
        completed: project?.completed || false,
        order: project?.order || "",
        prerequisites: project?.prerequisites?.map((p) => p._id) || [],
    });

    const [projectResources, setProjectResources] = useState(
        project?.projectResources || [
            { name: "", type: "documentation", link: "" },
        ]
    );

    const [availableProjects, setAvailableProjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchAvailableProjects();
    }, []);

    const fetchAvailableProjects = async () => {
        try {
            const data = await projectAPI.getAll();
            // Filter out current project if editing and only show projects from same curriculum
            const filtered = data.projects.filter(
                (p) =>
                    p._id !== project?._id && p.curriculum._id === curriculumId
            );
            setAvailableProjects(filtered);
        } catch (error) {
            console.error("Failed to fetch projects:", error);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handlePrerequisiteChange = (e) => {
        const { value, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            prerequisites: checked
                ? [...prev.prerequisites, value]
                : prev.prerequisites.filter((id) => id !== value),
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
        if (projectResources.length > 1) {
            setProjectResources((prev) => prev.filter((_, i) => i !== index));
        }
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

        if (!formData.githubLink.trim()) {
            setError("GitHub link is required");
            return false;
        }

        if (!isValidGitHubUrl(formData.githubLink)) {
            setError("Please provide a valid GitHub URL");
            return false;
        }

        if (formData.order && (isNaN(formData.order) || formData.order < 1)) {
            setError("Order must be a positive number");
            return false;
        }

        // Validate project resources
        for (let i = 0; i < projectResources.length; i++) {
            const resource = projectResources[i];
            if (
                resource.name.trim() &&
                (!resource.link.trim() || !isValidUrl(resource.link))
            ) {
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

    const isValidGitHubUrl = (url) => {
        try {
            const urlObj = new URL(url);
            return urlObj.hostname === "github.com";
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
            // Filter out empty resources
            const validResources = projectResources.filter(
                (resource) => resource.name.trim() && resource.link.trim()
            );

            const submitData = {
                ...formData,
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

    return (
        <form onSubmit={handleSubmit}>
            {error && <div className="error-message mb-1">{error}</div>}

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
                />
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
                    placeholder="Describe your project..."
                    style={{ minHeight: "120px" }}
                />
            </div>

            <div className="form-group">
                <label className="form-label" htmlFor="githubLink">
                    GitHub Link *
                </label>
                <input
                    type="url"
                    id="githubLink"
                    name="githubLink"
                    value={formData.githubLink}
                    onChange={handleChange}
                    className="form-input"
                    required
                    disabled={loading}
                    placeholder="https://github.com/username/repository"
                />
            </div>

            <div className="grid grid-2">
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
                        placeholder="Project order"
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">
                        <input
                            type="checkbox"
                            name="completed"
                            checked={formData.completed}
                            onChange={handleChange}
                            disabled={loading}
                            style={{ marginRight: "0.5rem" }}
                        />
                        Mark as completed
                    </label>
                </div>
            </div>

            {availableProjects.length > 0 && (
                <div className="form-group">
                    <label className="form-label">Prerequisites</label>
                    <div
                        style={{
                            maxHeight: "150px",
                            overflowY: "auto",
                            border: "1px solid var(--border-color)",
                            borderRadius: "6px",
                            padding: "0.5rem",
                        }}
                    >
                        {availableProjects.map((availableProject) => (
                            <div
                                key={availableProject._id}
                                style={{ marginBottom: "0.5rem" }}
                            >
                                <label
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        cursor: "pointer",
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        value={availableProject._id}
                                        checked={formData.prerequisites.includes(
                                            availableProject._id
                                        )}
                                        onChange={handlePrerequisiteChange}
                                        disabled={loading}
                                        style={{ marginRight: "0.5rem" }}
                                    />
                                    <span>{availableProject.name}</span>
                                    {availableProject.completed && (
                                        <span
                                            className="text-success"
                                            style={{
                                                marginLeft: "0.5rem",
                                                fontSize: "0.8rem",
                                            }}
                                        >
                                            ✓ Completed
                                        </span>
                                    )}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="form-group">
                <div className="flex-between mb-1">
                    <label className="form-label">Project Resources</label>
                    <button
                        type="button"
                        onClick={addResource}
                        className="btn btn-secondary btn-small"
                        disabled={loading}
                    >
                        Add Resource
                    </button>
                </div>

                {projectResources.map((resource, index) => (
                    <div key={index} className="card mb-1">
                        <div className="flex-between mb-1">
                            <h4>Resource {index + 1}</h4>
                            {projectResources.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeResource(index)}
                                    className="btn btn-danger btn-small"
                                    disabled={loading}
                                >
                                    Remove
                                </button>
                            )}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Name</label>
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
                        </div>

                        <div className="form-group">
                            <label className="form-label">Type</label>
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
                        </div>

                        <div className="form-group">
                            <label className="form-label">URL</label>
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
                        </div>
                    </div>
                ))}
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
