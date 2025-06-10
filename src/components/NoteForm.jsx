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

    const getNotePlaceholder = (type) => {
        const placeholders = {
            reflection:
                "What did I learn? What went well? What could be improved?",
            todo: "- Implement user authentication\n- Add error handling\n- Write unit tests",
            idea: "Feature idea: Add dark mode toggle to improve user experience",
            bug: "Issue: Login form doesn't validate email format properly...",
            improvement:
                "Could optimize the database queries by adding proper indexing",
            question:
                "How should I handle file uploads? What's the best practice?",
            achievement:
                "Successfully deployed the application to production! 🎉",
            other: "Any other notes about this project...",
        };
        return placeholders[type] || "Enter your note content...";
    };

    return (
        <form onSubmit={handleSubmit} className="form-compact">
            {error && <div className="error-message">{error}</div>}

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
                    placeholder={getNotePlaceholder(formData.type)}
                    style={{ minHeight: "120px" }}
                />
                <div
                    className="flex-between text-xs"
                    style={{ marginTop: "0.25rem" }}
                >
                    <span className="text-muted">
                        {formData.type === "todo"
                            ? "Use bullet points (-) or checkboxes for tasks"
                            : formData.type === "bug"
                            ? "Include steps to reproduce and expected behavior"
                            : "Be specific and detailed for future reference"}
                    </span>
                    <span
                        className={
                            formData.content.length > 4500
                                ? "text-warning"
                                : "text-muted"
                        }
                    >
                        {formData.content.length}/5000
                    </span>
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
