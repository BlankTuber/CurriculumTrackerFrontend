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

    const [resources, setResources] = useState(
        curriculum?.resources || [{ name: "", type: "documentation", link: "" }]
    );

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
        if (resources.length > 1) {
            setResources((prev) => prev.filter((_, i) => i !== index));
        }
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

        // Validate resources
        for (let i = 0; i < resources.length; i++) {
            const resource = resources[i];
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setError("");

        try {
            // Filter out empty resources
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
        <form onSubmit={handleSubmit}>
            {error && <div className="error-message mb-1">{error}</div>}

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
                    placeholder="Optional description of your curriculum"
                />
            </div>

            <div className="form-group">
                <div className="flex-between mb-1">
                    <label className="form-label">Resources</label>
                    <button
                        type="button"
                        onClick={addResource}
                        className="btn btn-secondary btn-small"
                        disabled={loading}
                    >
                        Add Resource
                    </button>
                </div>

                {resources.map((resource, index) => (
                    <div key={index} className="card mb-1">
                        <div className="flex-between mb-1">
                            <h4>Resource {index + 1}</h4>
                            {resources.length > 1 && (
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
