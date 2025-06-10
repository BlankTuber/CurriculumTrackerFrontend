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
        name: curriculum?.name || "",
        description: curriculum?.description || "",
    });

    const [resources, setResources] = useState(curriculum?.resources || []);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
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

    const validateForm = () => {
        if (!formData.name.trim()) {
            setError("Curriculum name is required");
            return false;
        }

        if (formData.name.length > 100) {
            setError("Curriculum name must be 100 characters or less");
            return false;
        }

        if (formData.description.length > 1000) {
            setError("Description must be 1000 characters or less");
            return false;
        }

        for (let i = 0; i < resources.length; i++) {
            const resource = resources[i];
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
            const validResources = resources.filter(
                (resource) => resource.name.trim() && resource.link.trim()
            );

            const submitData = {
                ...formData,
                resources: validResources,
            };

            let result;
            if (isEditing) {
                result = await curriculumAPI.update(curriculum._id, submitData);
            } else {
                result = await curriculumAPI.create(submitData);
            }

            onSuccess(result.curriculum);
        } catch (error) {
            setError(error.message);
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
