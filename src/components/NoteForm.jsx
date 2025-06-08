import React, { useState } from "react";
import { noteAPI } from "../utils/api";

const NOTE_TYPES = [
    "reflection",
    "todo",
    "idea",
    "bug",
    "improvement",
    "question",
    "achievement",
    "other",
];

const NoteForm = ({ note = null, projectId, onSuccess, onCancel }) => {
    const isEditing = !!note;

    const [formData, setFormData] = useState({
        type: note?.type || "reflection",
        content: note?.content || "",
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
        if (!formData.content.trim()) {
            setError("Note content is required");
            return false;
        }

        if (formData.content.length > 5000) {
            setError("Note content must be 5000 characters or less");
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
            let result;

            if (isEditing) {
                result = await noteAPI.update(note._id, formData);
            } else {
                result = await noteAPI.create(projectId, formData);
            }

            onSuccess(result.note);
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
                <label className="form-label" htmlFor="type">
                    Note Type *
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
                    {NOTE_TYPES.map((type) => (
                        <option key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                        </option>
                    ))}
                </select>
            </div>

            <div className="form-group">
                <label className="form-label" htmlFor="content">
                    Content *
                </label>
                <textarea
                    id="content"
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    className="form-textarea"
                    maxLength={5000}
                    required
                    disabled={loading}
                    placeholder="Enter your note content..."
                    style={{ minHeight: "150px" }}
                />
                <div
                    className="text-right text-muted"
                    style={{ fontSize: "0.8rem", marginTop: "0.25rem" }}
                >
                    {formData.content.length}/5000 characters
                </div>
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
                        ? "Update Note"
                        : "Create Note"}
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

export default NoteForm;
