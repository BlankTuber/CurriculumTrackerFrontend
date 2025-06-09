import React, { useState, useEffect } from "react";
import { levelAPI, curriculumAPI } from "../utils/api";
import { validateStageRange, validateLevelOrder } from "../utils/stageUtils";

const LevelForm = ({ level = null, curriculumId, onSuccess, onCancel }) => {
    const isEditing = !!level;

    const [formData, setFormData] = useState({
        name: level?.name || "",
        description: level?.description || "",
        stageStart: level?.stageStart || "",
        stageEnd: level?.stageEnd || "",
        order: level?.order || "",
    });

    const [existingLevels, setExistingLevels] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchCurriculumLevels();
    }, [curriculumId]);

    const fetchCurriculumLevels = async () => {
        try {
            const data = await curriculumAPI.getById(curriculumId);
            setExistingLevels(data.curriculum.levels || []);
        } catch (error) {
            console.error("Failed to fetch curriculum levels:", error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const validateForm = () => {
        if (!formData.name.trim()) {
            setError("Level name is required");
            return false;
        }

        if (formData.name.length > 100) {
            setError("Level name must be 100 characters or less");
            return false;
        }

        if (formData.description.length > 500) {
            setError("Description must be 500 characters or less");
            return false;
        }

        if (!formData.stageStart || !formData.stageEnd || !formData.order) {
            setError("Stage start, stage end, and order are required");
            return false;
        }

        const stageStart = parseInt(formData.stageStart);
        const stageEnd = parseInt(formData.stageEnd);
        const order = parseInt(formData.order);

        const stageValidation = validateStageRange(
            stageStart,
            stageEnd,
            existingLevels,
            isEditing ? level._id : null
        );

        if (!stageValidation.valid) {
            setError(stageValidation.error);
            return false;
        }

        const orderValidation = validateLevelOrder(
            order,
            existingLevels,
            isEditing ? level._id : null
        );

        if (!orderValidation.valid) {
            setError(orderValidation.error);
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
                ...formData,
                stageStart: parseInt(formData.stageStart),
                stageEnd: parseInt(formData.stageEnd),
                order: parseInt(formData.order),
            };

            let result;
            if (isEditing) {
                result = await levelAPI.update(level._id, submitData);
            } else {
                result = await levelAPI.create(curriculumId, submitData);
            }

            onSuccess(result.level);
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
                    Level Name *
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
                    placeholder="e.g., The Roots, The Trunk, The Branches"
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
                    maxLength={500}
                    disabled={loading}
                    placeholder="Brief description of this level"
                    style={{ minHeight: "80px" }}
                />
            </div>

            <div className="grid grid-2">
                <div className="form-group">
                    <label className="form-label" htmlFor="stageStart">
                        Stage Start *
                    </label>
                    <input
                        type="number"
                        id="stageStart"
                        name="stageStart"
                        value={formData.stageStart}
                        onChange={handleChange}
                        className="form-input"
                        min="1"
                        required
                        disabled={loading}
                        placeholder="1"
                    />
                </div>

                <div className="form-group">
                    <label className="form-label" htmlFor="stageEnd">
                        Stage End *
                    </label>
                    <input
                        type="number"
                        id="stageEnd"
                        name="stageEnd"
                        value={formData.stageEnd}
                        onChange={handleChange}
                        className="form-input"
                        min={formData.stageStart || "1"}
                        required
                        disabled={loading}
                        placeholder="5"
                    />
                </div>
            </div>

            <div className="form-group">
                <label className="form-label" htmlFor="order">
                    Order *
                </label>
                <input
                    type="number"
                    id="order"
                    name="order"
                    value={formData.order}
                    onChange={handleChange}
                    className="form-input"
                    min="1"
                    required
                    disabled={loading}
                    placeholder="1"
                />
                <p
                    className="text-muted"
                    style={{ fontSize: "0.8rem", marginTop: "0.25rem" }}
                >
                    Order must be unique within the curriculum
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
                            : "Creating..."
                        : isEditing
                        ? "Update Level"
                        : "Create Level"}
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

export default LevelForm;
