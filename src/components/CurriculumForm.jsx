import React, { useState } from "react";
import { curriculumAPI } from "../utils/api";

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

const CurriculumForm = ({ curriculum = null, onSuccess, onCancel }) => {
    const isEditing = !!curriculum;

    const [formData, setFormData] = useState({
        name: (curriculum && curriculum.name) || "",
        description: (curriculum && curriculum.description) || "",
    });

    const [resources, setResources] = useState(
        curriculum && Array.isArray(curriculum.resources)
            ? curriculum.resources
            : []
    );

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        if (error) setError("");
    };

    const handleResourceChange = (index, field, value) => {
        setResources((prev) =>
            prev.map((resource, i) =>
                i === index ? { ...resource, [field]: value } : resource
            )
        );
    };

    const addResource = () => {
        setResources((prev) => [
            ...prev,
            { name: "", type: "documentation", link: "" },
        ]);
    };

    const removeResource = (index) => {
        setResources((prev) => prev.filter((_, i) => i !== index));
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

        if (!trimmedName) {
            setError("Curriculum name is required");
            return false;
        }

        if (trimmedName.length > 100) {
            setError("Curriculum name must be 100 characters or less");
            return false;
        }

        if (formData.description.length > 1000) {
            setError("Description must be 1000 characters or less");
            return false;
        }

        for (let i = 0; i < resources.length; i++) {
            const resource = resources[i];
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
            if (resource.type && !RESOURCE_TYPES.includes(resource.type)) {
                setError(`Resource ${i + 1}: Invalid resource type`);
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
            const validResources = resources
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
                description: formData.description.trim() || undefined,
                resources: validResources,
            };

            let result;
            if (isEditing) {
                if (!curriculum || !curriculum._id) {
                    throw new Error("Curriculum ID is required for editing");
                }
                result = await curriculumAPI.update(curriculum._id, submitData);
            } else {
                result = await curriculumAPI.create(submitData);
            }

            if (!result || !result.curriculum) {
                throw new Error("Invalid response from server");
            }

            onSuccess(result.curriculum);
        } catch (error) {
            setError(
                error.message || "An error occurred while saving the curriculum"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="form-compact">
            {error && <div className="error-message">{error}</div>}

            <div className="grid grid-2">
                <div className="form-group">
                    <label className="form-label" htmlFor="name">
                        Curriculum Name *
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
                        placeholder="e.g., Full Stack Web Development"
                    />
                </div>

                <div className="form-group">
                    <label className="form-label" htmlFor="description">
                        Description
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="form-textarea"
                        maxLength={1000}
                        disabled={loading}
                        placeholder="Optional description"
                    />
                </div>
            </div>

            <div className="form-group">
                <div className="flex-between">
                    <label className="form-label">Resources (optional)</label>
                    <button
                        type="button"
                        onClick={addResource}
                        className="btn btn-secondary btn-small"
                        disabled={loading}
                    >
                        Add Resource
                    </button>
                </div>

                {resources.length === 0 ? (
                    <p
                        className="text-muted text-center text-sm"
                        style={{
                            padding: "1rem",
                            border: "1px dashed var(--border-color)",
                            borderRadius: "4px",
                        }}
                    >
                        No resources yet. Click "Add Resource" to add
                        curriculum-wide resources.
                    </p>
                ) : (
                    <div className="scrollable-list">
                        {resources.map((resource, index) => (
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
                        ? "Update Curriculum"
                        : "Create Curriculum"}
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

export default CurriculumForm;
