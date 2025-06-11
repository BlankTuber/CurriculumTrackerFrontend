import React, { useState, useEffect } from "react";
import { stageAPI, curriculumAPI } from "../utils/api";
import { validateGithubRepo } from "../utils/projectUtils";

const StageForm = ({ stage = null, curriculumId, onSuccess, onCancel }) => {
    const isEditing = !!stage;

    const [formData, setFormData] = useState({
        stageNumber: stage?.stageNumber?.toString() || "",
        name: stage?.name || "",
        description: stage?.description || "",
        defaultGithubRepo: stage?.defaultGithubRepo || "",
    });

    const [existingStages, setExistingStages] = useState([]);
    const [stagesLoaded, setStagesLoaded] = useState(false);
    const [defaultsSet, setDefaultsSet] = useState(isEditing);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchCurriculumStages();
    }, [curriculumId]);

    useEffect(() => {
        if (!isEditing && !defaultsSet && stagesLoaded) {
            const defaultStageNumber = getNextAvailableStageNumber();
            setFormData((prev) => ({
                ...prev,
                stageNumber: defaultStageNumber.toString(),
            }));
            setDefaultsSet(true);
        }
    }, [existingStages, isEditing, defaultsSet, stagesLoaded]);

    const fetchCurriculumStages = async () => {
        try {
            const data = await curriculumAPI.getById(curriculumId);
            setExistingStages(data.curriculum.stages || []);
        } catch (error) {
            console.error("Failed to fetch curriculum stages:", error);
        } finally {
            setStagesLoaded(true);
        }
    };

    const getNextAvailableStageNumber = () => {
        if (existingStages.length === 0) return 1;

        const usedNumbers = existingStages
            .map((s) => s.stageNumber)
            .filter((num) => num != null)
            .sort((a, b) => a - b);

        for (let i = 1; i <= usedNumbers.length + 1; i++) {
            if (!usedNumbers.includes(i)) return i;
        }
        return usedNumbers.length + 1;
    };

    const getUsedStageNumbers = () => {
        const filteredStages = isEditing
            ? existingStages.filter((s) => s._id !== stage._id)
            : existingStages;

        return filteredStages
            .map((s) => s.stageNumber)
            .filter((num) => num != null)
            .sort((a, b) => a - b);
    };

    const isStageNumberInUse = (stageNumber) => {
        const usedNumbers = getUsedStageNumbers();
        return usedNumbers.includes(parseInt(stageNumber));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "stageNumber") {
            if (value && isStageNumberInUse(value)) {
                return;
            }
        }

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const getStageNamePlaceholder = () => {
        const stageNum =
            parseInt(formData.stageNumber) || getNextAvailableStageNumber();
        const suggestions = [
            "Setup & Installation",
            "Basic Structure",
            "Core Features",
            "Advanced Features",
            "Testing & Validation",
            "Optimization",
            "Deployment",
            "Documentation",
            "Maintenance",
            "Extensions",
        ];

        if (stageNum <= suggestions.length) {
            return `e.g., ${suggestions[stageNum - 1]}`;
        }
        return `e.g., Stage ${stageNum} Content`;
    };

    const validateForm = () => {
        if (!formData.stageNumber) {
            setError("Stage number is required");
            return false;
        }

        const stageNumber = parseInt(formData.stageNumber);
        if (isNaN(stageNumber) || stageNumber < 1) {
            setError("Stage number must be a positive number");
            return false;
        }

        if (isStageNumberInUse(formData.stageNumber)) {
            setError(`Stage number ${formData.stageNumber} is already in use`);
            return false;
        }

        if (formData.name.length > 100) {
            setError("Name must be 100 characters or less");
            return false;
        }

        if (formData.description.length > 500) {
            setError("Description must be 500 characters or less");
            return false;
        }

        if (
            formData.defaultGithubRepo &&
            !validateGithubRepo(formData.defaultGithubRepo)
        ) {
            setError(
                "Default GitHub repository name can only contain letters, numbers, dots, underscores, and hyphens (max 100 characters)"
            );
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
                stageNumber: parseInt(formData.stageNumber),
                name: formData.name.trim() || undefined,
                description: formData.description.trim() || undefined,
                defaultGithubRepo:
                    formData.defaultGithubRepo.trim() || undefined,
            };

            let result;
            if (isEditing) {
                result = await stageAPI.update(stage._id, submitData);
            } else {
                result = await stageAPI.create(curriculumId, submitData);
            }

            onSuccess(result.stage);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const usedNumbers = getUsedStageNumbers();
    const suggestedNumber = getNextAvailableStageNumber();

    return (
        <form onSubmit={handleSubmit} className="form-compact">
            {error && <div className="error-message">{error}</div>}

            <div className="grid grid-2">
                <div className="form-group">
                    <label className="form-label" htmlFor="stageNumber">
                        Stage Number *
                    </label>
                    <input
                        type="number"
                        id="stageNumber"
                        name="stageNumber"
                        value={formData.stageNumber}
                        onChange={handleChange}
                        className={`form-input ${
                            formData.stageNumber &&
                            isStageNumberInUse(formData.stageNumber)
                                ? "error-input"
                                : ""
                        }`}
                        min="1"
                        required
                        disabled={loading}
                        placeholder={suggestedNumber.toString()}
                    />
                    <div className="text-xs" style={{ marginTop: "0.25rem" }}>
                        {formData.stageNumber &&
                            isStageNumberInUse(formData.stageNumber) && (
                                <p className="text-error">
                                    Stage number {formData.stageNumber} is
                                    already in use
                                </p>
                            )}
                        {usedNumbers.length > 0 ? (
                            <p className="text-muted">
                                Used numbers: {usedNumbers.join(", ")}
                            </p>
                        ) : (
                            <p className="text-muted">
                                No existing stages - this will be the first
                            </p>
                        )}
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label" htmlFor="name">
                        Stage Name
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="form-input"
                        maxLength={100}
                        disabled={loading}
                        placeholder={getStageNamePlaceholder()}
                    />
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
                    placeholder={`Describe what students will do in stage ${
                        formData.stageNumber || suggestedNumber
                    }...`}
                />
            </div>

            <div className="form-group">
                <label className="form-label" htmlFor="defaultGithubRepo">
                    Default GitHub Repository
                </label>
                <input
                    type="text"
                    id="defaultGithubRepo"
                    name="defaultGithubRepo"
                    value={formData.defaultGithubRepo}
                    onChange={handleChange}
                    className="form-input"
                    maxLength={100}
                    disabled={loading}
                    placeholder="e.g., project-starter, stage-1-template"
                />
                <p
                    className="text-muted text-xs"
                    style={{ marginTop: "0.25rem" }}
                >
                    Optional default repository name for projects in this stage.
                    Projects will inherit this if no specific repository is set.
                </p>
            </div>

            {existingStages.length > 0 && (
                <div className="mb-1">
                    <h4
                        className="text-muted"
                        style={{ fontSize: "0.85rem", marginBottom: "0.5rem" }}
                    >
                        Existing Stages
                    </h4>
                    <div
                        className="scrollable-list"
                        style={{ maxHeight: "150px" }}
                    >
                        {existingStages
                            .sort((a, b) => a.stageNumber - b.stageNumber)
                            .map((existingStage) => (
                                <div
                                    key={existingStage._id}
                                    className="compact-item"
                                >
                                    <div style={{ flex: 1 }}>
                                        <div
                                            className="flex"
                                            style={{
                                                gap: "0.5rem",
                                                alignItems: "center",
                                                marginBottom: "0.25rem",
                                                flexWrap: "wrap",
                                            }}
                                        >
                                            <span>
                                                <strong>
                                                    Stage{" "}
                                                    {existingStage.stageNumber}
                                                </strong>
                                                {existingStage.name &&
                                                    `: ${existingStage.name}`}
                                            </span>
                                            {existingStage.defaultGithubRepo && (
                                                <span className="text-primary text-xs">
                                                    Repo:{" "}
                                                    {
                                                        existingStage.defaultGithubRepo
                                                    }
                                                </span>
                                            )}
                                        </div>
                                        {existingStage.description && (
                                            <p
                                                className="text-muted text-xs"
                                                style={{
                                                    margin: 0,
                                                    lineHeight: "1.3",
                                                }}
                                            >
                                                {existingStage.description}
                                            </p>
                                        )}
                                    </div>
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
                        ? "Update Stage"
                        : "Create Stage"}
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

export default StageForm;
