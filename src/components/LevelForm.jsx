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
    const [levelsLoaded, setLevelsLoaded] = useState(false);
    const [defaultsSet, setDefaultsSet] = useState(isEditing);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchCurriculumLevels();
    }, [curriculumId]);

    useEffect(() => {
        if (!isEditing && !defaultsSet && levelsLoaded) {
            const defaultStageRange =
                getNextAvailableStageRange(existingLevels);
            const defaultOrder = getNextAvailableLevelOrder(existingLevels);

            setFormData((prev) => ({
                ...prev,
                stageStart: defaultStageRange.stageStart.toString(),
                stageEnd: defaultStageRange.stageEnd.toString(),
                order: defaultOrder.toString(),
            }));
            setDefaultsSet(true);
        }
    }, [existingLevels, isEditing, defaultsSet, levelsLoaded]);

    const fetchCurriculumLevels = async () => {
        try {
            const data = await curriculumAPI.getById(curriculumId);
            setExistingLevels(data.curriculum.levels || []);
        } catch (error) {
            console.error("Failed to fetch curriculum levels:", error);
        } finally {
            setLevelsLoaded(true);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "order") {
            if (value && isOrderInUse(value)) {
                return;
            }
        }

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
                    const newStageEnd = startNum + 4;
                    if (
                        !isStageRangeInUse(stageStart, newStageEnd.toString())
                    ) {
                        newData.stageEnd = newStageEnd.toString();
                    }
                }
            }

            return newData;
        });
    };

    const handleStageEndChange = (e) => {
        const stageEnd = e.target.value;

        if (
            stageEnd &&
            formData.stageStart &&
            isStageRangeInUse(formData.stageStart, stageEnd)
        ) {
            return;
        }

        setFormData((prev) => ({
            ...prev,
            stageEnd: stageEnd,
        }));
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

    const formatOrderRanges = (orders) => {
        if (orders.length === 0) return "";

        const ranges = [];
        let start = orders[0];
        let end = orders[0];

        for (let i = 1; i < orders.length; i++) {
            if (orders[i] === end + 1) {
                end = orders[i];
            } else {
                if (start === end) {
                    ranges.push(start.toString());
                } else {
                    ranges.push(`${start}-${end}`);
                }
                start = orders[i];
                end = orders[i];
            }
        }

        if (start === end) {
            ranges.push(start.toString());
        } else {
            ranges.push(`${start}-${end}`);
        }

        return ranges.join(", ");
    };

    const isOrderInUse = (order) => {
        const usedOrders = getDynamicUsedOrders();
        return usedOrders.includes(parseInt(order));
    };

    const isStageRangeInUse = (stageStart, stageEnd) => {
        if (!stageStart || !stageEnd) return false;

        const start = parseInt(stageStart);
        const end = parseInt(stageEnd);

        if (isNaN(start) || isNaN(end)) return false;

        const filteredLevels = isEditing
            ? existingLevels.filter((l) => l._id !== level._id)
            : existingLevels;

        for (const level of filteredLevels) {
            const hasOverlap = !(
                end < level.stageStart || start > level.stageEnd
            );
            if (hasOverlap) {
                return true;
            }
        }
        return false;
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
    const nextRange = getNextAvailableStageRange(existingLevels, 5);
    const suggestedOrder = getDynamicSuggestedOrder();

    return (
        <form onSubmit={handleSubmit} className="form-compact">
            {error && <div className="error-message">{error}</div>}

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
                        className={`form-input ${
                            formData.order && isOrderInUse(formData.order)
                                ? "error-input"
                                : ""
                        }`}
                        min="1"
                        required
                        disabled={loading}
                        placeholder={suggestedOrder.toString()}
                    />
                    <div className="text-xs" style={{ marginTop: "0.25rem" }}>
                        {formData.order && isOrderInUse(formData.order) && (
                            <p className="text-error">
                                Order {formData.order} is already in use
                            </p>
                        )}
                        {usedOrders.length > 0 ? (
                            <p className="text-muted">
                                Used orders: {formatOrderRanges(usedOrders)}
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
                    placeholder={`Describe what students will learn in stages ${
                        formData.stageStart || nextRange.stageStart
                    }-${formData.stageEnd || nextRange.stageEnd}...`}
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
                        className={`form-input ${
                            formData.stageStart &&
                            formData.stageEnd &&
                            isStageRangeInUse(
                                formData.stageStart,
                                formData.stageEnd
                            )
                                ? "error-input"
                                : ""
                        }`}
                        min="1"
                        required
                        disabled={loading}
                        placeholder={nextRange.stageStart.toString()}
                    />
                    {!isEditing && formData.stageStart && (
                        <p
                            className="text-muted text-xs"
                            style={{ marginTop: "0.25rem" }}
                        >
                            Stage end will auto-update to{" "}
                            {parseInt(formData.stageStart) + 4} (5-stage range)
                        </p>
                    )}
                    {formData.stageStart &&
                        formData.stageEnd &&
                        isStageRangeInUse(
                            formData.stageStart,
                            formData.stageEnd
                        ) && (
                            <p
                                className="text-error text-xs"
                                style={{ marginTop: "0.25rem" }}
                            >
                                Stage range {formData.stageStart}-
                                {formData.stageEnd} overlaps with existing
                                levels
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
                        onChange={handleStageEndChange}
                        className={`form-input ${
                            formData.stageStart &&
                            formData.stageEnd &&
                            isStageRangeInUse(
                                formData.stageStart,
                                formData.stageEnd
                            )
                                ? "error-input"
                                : ""
                        }`}
                        min={formData.stageStart || "1"}
                        required
                        disabled={loading}
                        placeholder={nextRange.stageEnd.toString()}
                    />
                </div>
            </div>

            {existingRanges && existingRanges.length > 0 && (
                <div className="mb-1">
                    <h4
                        className="text-muted"
                        style={{ fontSize: "0.85rem", marginBottom: "0.5rem" }}
                    >
                        Existing Level Ranges
                    </h4>
                    <div
                        className="scrollable-list"
                        style={{ maxHeight: "150px" }}
                    >
                        {existingRanges.map((range, index) => (
                            <div key={index} className="compact-item">
                                <span>
                                    <strong>{range.name}</strong> (Order{" "}
                                    {range.order})
                                </span>
                                <span className="text-muted text-xs">
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
