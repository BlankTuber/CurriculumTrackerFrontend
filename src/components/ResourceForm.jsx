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
        name: resource?.name || "",
        type: resource?.type || "documentation",
        link: resource?.link || "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const validateForm = () => {
        if (!formData.name.trim()) {
            setError("Resource name is required");
            return false;
        }

        if (formData.name.length > 100) {
            setError("Resource name must be 100 characters or less");
            return false;
        }

        if (!formData.link.trim()) {
            setError("Resource URL is required");
            return false;
        }

        if (!isValidUrl(formData.link)) {
            setError(
                "Please provide a valid URL (must include http:// or https://)"
            );
            return false;
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
            let result;

            if (isEditing) {
                if (isProjectResource) {
                    result = await projectAPI.updateResource(
                        resource._id,
                        formData
                    );
                } else {
                    result = await curriculumAPI.updateResource(
                        resource._id,
                        formData
                    );
                }
            } else {
                if (isProjectResource) {
                    result = await projectAPI.createResource(
                        projectId,
                        formData
                    );
                } else {
                    result = await curriculumAPI.createResource(
                        curriculumId,
                        formData
                    );
                }
            }

            onSuccess(result.resource || result.projectResource);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const getResourceTypePlaceholder = (type) => {
        const placeholders = {
            documentation: "Official API documentation, framework guides",
            theory: "Computer Science concepts, design patterns",
            book: "Programming books, technical literature",
            "online resource": "Tutorials, blog posts, online courses",
            video: "YouTube tutorials, conference talks",
            tutorial: "Step-by-step guides, coding tutorials",
            article: "Technical articles, best practices",
            other: "Any other useful resource",
        };
        return placeholders[type] || "Resource name";
    };

    const getUrlPlaceholder = (type) => {
        const placeholders = {
            documentation: "https://docs.example.com/api",
            theory: "https://en.wikipedia.org/wiki/Design_pattern",
            book: "https://www.amazon.com/book-title",
            "online resource": "https://course.example.com",
            video: "https://youtube.com/watch?v=...",
            tutorial: "https://tutorial.example.com",
            article: "https://blog.example.com/article",
            other: "https://example.com",
        };
        return placeholders[type] || "https://example.com";
    };

    return (
        <form onSubmit={handleSubmit}>
            {error && <div className="error-message mb-1">{error}</div>}

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
                    placeholder={getResourceTypePlaceholder(formData.type)}
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
                <p
                    className="text-muted"
                    style={{ fontSize: "0.8rem", marginTop: "0.25rem" }}
                >
                    Choose the type that best describes this resource
                </p>
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
                    placeholder={getUrlPlaceholder(formData.type)}
                />
                <p
                    className="text-muted"
                    style={{ fontSize: "0.8rem", marginTop: "0.25rem" }}
                >
                    Must be a valid URL starting with http:// or https://
                </p>
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
