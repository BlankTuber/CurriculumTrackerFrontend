import React, { useState, useEffect } from "react";
import { projectAPI } from "../utils/api";
import PrerequisiteSelector from "./PrerequisiteSelector";
import LoadingSpinner from "./LoadingSpinner";

const PrerequisiteManager = ({ project, onSuccess, onCancel }) => {
    const [availableProjects, setAvailableProjects] = useState([]);
    const [selectedPrerequisites, setSelectedPrerequisites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchAvailableProjects();
        setSelectedPrerequisites(
            project.prerequisites?.map((p) => p._id) || []
        );
    }, [project]);

    const fetchAvailableProjects = async () => {
        try {
            setError("");
            const data = await projectAPI.getAll();
            const filtered = data.projects.filter(
                (p) =>
                    p._id !== project._id &&
                    p.curriculum._id === project.curriculum._id
            );
            setAvailableProjects(filtered);
        } catch (error) {
            setError(`Failed to fetch projects: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setError("");

        try {
            const result = await projectAPI.update(project._id, {
                prerequisites: selectedPrerequisites,
            });

            onSuccess(result.project);
        } catch (error) {
            setError(`Failed to update prerequisites: ${error.message}`);
        } finally {
            setSaving(false);
        }
    };

    const hasChanges = () => {
        const currentPrereqs = new Set(
            project.prerequisites?.map((p) => p._id) || []
        );
        const selectedPrereqs = new Set(selectedPrerequisites);

        if (currentPrereqs.size !== selectedPrereqs.size) return true;

        for (const id of currentPrereqs) {
            if (!selectedPrereqs.has(id)) return true;
        }

        return false;
    };

    if (loading) {
        return <LoadingSpinner message="Loading available projects..." />;
    }

    return (
        <div>
            {error && <div className="error-message mb-1">{error}</div>}

            <div className="mb-1">
                <p className="text-muted">
                    Select which projects must be completed before this project
                    can be started. Prerequisites help organize your learning
                    path and ensure you have the necessary foundation before
                    tackling more advanced projects.
                </p>
            </div>

            <PrerequisiteSelector
                availableProjects={availableProjects}
                selectedPrerequisites={selectedPrerequisites}
                onSelectionChange={setSelectedPrerequisites}
                levels={project.curriculum?.levels || []}
                disabled={saving}
            />

            <div className="btn-group mt-2">
                <button
                    onClick={handleSave}
                    className="btn btn-primary"
                    disabled={saving || !hasChanges()}
                >
                    {saving ? "Saving..." : "Save Prerequisites"}
                </button>
                <button
                    onClick={onCancel}
                    className="btn btn-secondary"
                    disabled={saving}
                >
                    Cancel
                </button>
            </div>

            {!hasChanges() && selectedPrerequisites.length === 0 && (
                <p className="text-muted mt-1" style={{ fontSize: "0.9rem" }}>
                    This project currently has no prerequisites
                </p>
            )}

            {!hasChanges() && selectedPrerequisites.length > 0 && (
                <p className="text-muted mt-1" style={{ fontSize: "0.9rem" }}>
                    No changes made to prerequisites
                </p>
            )}
        </div>
    );
};

export default PrerequisiteManager;
