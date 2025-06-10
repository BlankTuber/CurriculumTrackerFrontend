import React, { useState, useEffect } from "react";
import { levelAPI, curriculumAPI } from "../utils/api";
import {
    validateStageRange,
    validateLevelOrder,
    getNextAvailableStageRange,
    getNextAvailableLevelOrder,
    sortLevelsByOrder,
} from "../utils/stageUtils";

const LevelForm = ({ level = null, curriculumId, onSuccess, onCancel }) => {
    const isEditing = !!level;

    const [formData, setFormData] = useState({
        name: level?.name || "",
        description: level?.description || "",
        stageStart: level?.stageStart?.toString() || "",
        stageEnd: level?.stageEnd?.toString() || "",
        order: level?.order?.toString() || "",
    });

    const [existingLevels, setExistingLevels] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchCurriculumLevels();
    }, [curriculumId]);

    useEffect(() => {
        if (!isEditing && existingLevels.length >= 0 && !formData.stageStart) {
            const defaultStageRange =
                getNextAvailableStageRange(existingLevels);
            const defaultOrder = getNextAvailableLevelOrder(existingLevels);

            setFormData((prev) => ({
                ...prev,
                stageStart: defaultStageRange.stageStart.toString(),
                stageEnd: defaultStageRange.stageEnd.toString(),
                order: defaultOrder.toString(),
            }));
        }
    }, [existingLevels, isEditing, formData.stageStart]);

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

    const handleStageStartChange = (e) => {
        const stageStart = e.target.value;
        setFormData((prev) => {
            const newData = { ...prev, stageStart };

            if (!isEditing && stageStart) {
                const startNum = parseInt(stageStart);
                if (!isNaN(startNum)) {
                    newData.stageEnd = (startNum + 4).toString();
                }
            }

            return newData;
        });
    };

    const getDynamicSuggestedOrder = () => {
        return getNextAvailableLevelOrder(
            existingLevels,
            isEditing ? level._id : null
        );
    };

    const getDynamicUsedOrders = () => {
        const filteredLevels = isEditing
            ? existingLevels.filter((l) => l._id !== level._id)
            : existingLevels;

        return filteredLevels
            .map((l) => l.order)
            .filter((order) => order != null)
            .sort((a, b) => a - b);
    };

    const getLevelNamePlaceholder = () => {
        const order = parseInt(formData.order) || getDynamicSuggestedOrder();
        const suggestions = [
            "Foundation",
            "Roots",
            "Basics",
            "Core",
            "Fundamentals",
            "Building",
            "Growth",
            "Development",
            "Expansion",
            "Structure",
            "Advanced",
            "Mastery",
            "Expertise",
            "Specialization",
            "Excellence",
        ];

        if (order <= suggestions.length) {
            return `e.g., ${suggestions[order - 1]}, Level ${order}`;
        }
        return `e.g., Level ${order}, Advanced Topics`;
    };

    const getExistingRangesInfo = () => {
        if (existingLevels.length === 0) return null;

        const sortedLevels = sortLevelsByOrder(existingLevels);
        const filteredLevels = isEditing
            ? sortedLevels.filter((l) => l._id !== level._id)
            : sortedLevels;

        return filteredLevels.map((l) => ({
            name: l.name,
            range: `${l.stageStart}-${l.stageEnd}`,
            order: l.order,
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

    const existingRanges = getExistingRangesInfo();
    const usedOrders = getDynamicUsedOrders();
    const nextRange = getNextAvailableStageRange(existingLevels);

    return (
        <form onSubmit={handleSubmit}>
            {error && <div className="error-message mb-1">{error}</div>}

            <div className="grid grid-2">
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
                        placeholder={getLevelNamePlaceholder()}
                    />
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
                        placeholder={
                            !isEditing
                                ? `Default: ${getDynamicSuggestedOrder()}`
                                : "1"
                        }
                    />
                    <div style={{ fontSize: "0.8rem", marginTop: "0.25rem" }}>
                        {usedOrders.length > 0 ? (
                            <p className="text-muted">
                                Used orders: {usedOrders.join(", ")}
                            </p>
                        ) : (
                            <p className="text-muted">
                                No existing levels - this will be the first
                            </p>
                        )}
                    </div>
                </div>
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
                    placeholder={`Describe what students will learn in this level. For stages ${
                        formData.stageStart || nextRange.stageStart
                    }-${
                        formData.stageEnd || nextRange.stageEnd
                    }, what concepts and skills will be covered?`}
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
                        onChange={handleStageStartChange}
                        className="form-input"
                        min="1"
                        required
                        disabled={loading}
                        placeholder={nextRange.stageStart.toString()}
                    />
                    {!isEditing && formData.stageStart && (
                        <p
                            className="text-muted"
                            style={{ fontSize: "0.8rem", marginTop: "0.25rem" }}
                        >
                            Stage end will auto-update to{" "}
                            {parseInt(formData.stageStart) + 4} (5-stage range)
                        </p>
                    )}
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
                        placeholder={
                            formData.stageStart
                                ? `Auto: ${parseInt(formData.stageStart) + 4}`
                                : nextRange.stageEnd.toString()
                        }
                    />
                </div>
            </div>

            {existingRanges && existingRanges.length > 0 && (
                <div className="mb-1">
                    <h4
                        className="text-muted"
                        style={{ fontSize: "0.9rem", marginBottom: "0.5rem" }}
                    >
                        Existing Level Ranges
                    </h4>
                    <div
                        style={{
                            background: "var(--bg-tertiary)",
                            padding: "0.75rem",
                            borderRadius: "6px",
                            fontSize: "0.8rem",
                        }}
                    >
                        {existingRanges.map((range, index) => (
                            <div
                                key={index}
                                className="flex-between"
                                style={{
                                    marginBottom:
                                        index < existingRanges.length - 1
                                            ? "0.25rem"
                                            : "0",
                                }}
                            >
                                <span>
                                    <strong>{range.name}</strong> (Order{" "}
                                    {range.order})
                                </span>
                                <span className="text-muted">
                                    Stages {range.range}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

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
