import React, { useState } from "react";
import { curriculumAPI, projectAPI } from "../utils/api";

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

const ResourceForm = ({
    resource = null,
    curriculumId = null,
    projectId = null,
    onSuccess,
    onCancel,
}) => {
    const isEditing = !!resource;
    const isProjectResource = !!projectId;

    const [formData, setFormData] = useState({
        name: (resource && resource.name) || "",
        type: (resource && resource.type) || "documentation",
        link: (resource && resource.link) || "",
    });

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
        const trimmedLink = formData.link.trim();

        if (!trimmedName) {
            setError("Resource name is required");
            return false;
        }

        if (trimmedName.length > 100) {
            setError("Resource name must be 100 characters or less");
            return false;
        }

        if (!trimmedLink) {
            setError("Resource URL is required");
            return false;
        }

        if (!isValidUrl(trimmedLink)) {
            setError(
                "Please provide a valid URL (must include http:// or https://)"
            );
            return false;
        }

        if (!RESOURCE_TYPES.includes(formData.type)) {
            setError("Please select a valid resource type");
            return false;
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
            const submitData = {
                name: formData.name.trim(),
                type: formData.type,
                link: formData.link.trim(),
            };

            let result;

            if (isEditing) {
                if (!resource || !resource._id) {
                    throw new Error("Resource ID is required for editing");
                }

                if (isProjectResource) {
                    result = await projectAPI.updateResource(
                        resource._id,
                        submitData
                    );
                } else {
                    result = await curriculumAPI.updateResource(
                        resource._id,
                        submitData
                    );
                }
            } else {
                if (isProjectResource) {
                    if (!projectId) {
                        throw new Error("Project ID is required");
                    }
                    result = await projectAPI.createResource(
                        projectId,
                        submitData
                    );
                } else {
                    if (!curriculumId) {
                        throw new Error("Curriculum ID is required");
                    }
                    result = await curriculumAPI.createResource(
                        curriculumId,
                        submitData
                    );
                }
            }

            const resourceData = result.resource || result.projectResource;

            if (!resourceData) {
                throw new Error("Invalid response from server");
            }

            onSuccess(resourceData);
        } catch (error) {
            setError(
                error.message || "An error occurred while saving the resource"
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
                        Resource Name *
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
                        placeholder="e.g., React Documentation"
                    />
                </div>

                <div className="form-group">
                    <label className="form-label" htmlFor="type">
                        Resource Type *
                    </label>
                    <select
                        id="type"
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        className="form-select"
                        required
                        disabled={loading}
                    >
                        {RESOURCE_TYPES.map((type) => (
                            <option key={type} value={type}>
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="form-group">
                <label className="form-label" htmlFor="link">
                    URL *
                </label>
                <input
                    type="url"
                    id="link"
                    name="link"
                    value={formData.link}
                    onChange={handleChange}
                    className="form-input"
                    required
                    disabled={loading}
                    placeholder="https://example.com"
                />
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
                            : "Adding..."
                        : isEditing
                        ? "Update Resource"
                        : "Add Resource"}
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

export default ResourceForm;
