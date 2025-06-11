import React from "react";
import { Link } from "react-router-dom";
import {
    PROJECT_STATE_COLORS,
    PROJECT_STATE_LABELS,
} from "../utils/projectUtils";
import { getLevelForStage } from "../utils/stageUtils";

const ProjectLink = ({
    project,
    levels = [],
    stages = [],
    showDescription = false,
    showDetails = true,
    showTopics = false,
    showStageInfo = false,
    maxTopics = 3,
    className = "",
    style = {},
}) => {
    const level = getLevelForStage(levels, project.stage);
    const stageDefinition =
        stages?.find((s) => s.stageNumber === project.stage) || null;

    return (
        <div className={className} style={style}>
            <div
                className="flex"
                style={{
                    gap: "0.5rem",
                    alignItems: "center",
                    marginBottom: showDescription ? "0.25rem" : "0",
                    flexWrap: "wrap",
                }}
            >
                <Link
                    to={`/project/${project._id}`}
                    style={{
                        textDecoration: "none",
                        color: "inherit",
                        fontWeight: "500",
                    }}
                >
                    {project.name}
                </Link>
                {project.identifier && (
                    <span
                        className="text-primary"
                        style={{
                            fontSize: "0.8rem",
                            fontWeight: "600",
                        }}
                    >
                        [{project.identifier}]
                    </span>
                )}
                {showDetails && (
                    <>
                        <span
                            className="text-muted"
                            style={{ fontSize: "0.8rem" }}
                        >
                            Stage {project.stage}
                            {project.order && ` #${project.order}`}
                        </span>
                        {showStageInfo && stageDefinition?.name && (
                            <span
                                className="text-info"
                                style={{ fontSize: "0.8rem" }}
                            >
                                {stageDefinition.name}
                            </span>
                        )}
                        {level && (
                            <span
                                className="text-primary"
                                style={{ fontSize: "0.8rem" }}
                            >
                                {level.name}
                                {level.defaultIdentifier &&
                                    ` (${level.defaultIdentifier})`}
                            </span>
                        )}
                        <span
                            className={PROJECT_STATE_COLORS[project.state]}
                            style={{ fontSize: "0.8rem" }}
                        >
                            {PROJECT_STATE_LABELS[project.state]}
                        </span>
                    </>
                )}
            </div>

            {showDescription && project.description && (
                <p
                    className="text-muted"
                    style={{
                        fontSize: "0.85rem",
                        margin: "0 0 0.25rem 0",
                        lineHeight: "1.3",
                    }}
                >
                    {project.description}
                </p>
            )}

            {showTopics && project.topics && project.topics.length > 0 && (
                <div
                    className="flex"
                    style={{
                        gap: "0.25rem",
                        flexWrap: "wrap",
                        marginTop: showDescription ? "0.25rem" : "0",
                    }}
                >
                    {project.topics.slice(0, maxTopics).map((topic, index) => (
                        <span
                            key={index}
                            style={{
                                background: "var(--bg-primary)",
                                padding: "0.125rem 0.25rem",
                                borderRadius: "3px",
                                fontSize: "0.7rem",
                                color: "var(--text-secondary)",
                            }}
                        >
                            {topic}
                        </span>
                    ))}
                    {project.topics.length > maxTopics && (
                        <span
                            style={{
                                fontSize: "0.7rem",
                                color: "var(--text-muted)",
                                fontStyle: "italic",
                            }}
                        >
                            +{project.topics.length - maxTopics} more
                        </span>
                    )}
                </div>
            )}

            {showStageInfo && stageDefinition && (
                <div style={{ marginTop: "0.25rem" }}>
                    {stageDefinition.description && (
                        <p
                            className="text-muted"
                            style={{
                                fontSize: "0.75rem",
                                margin: "0 0 0.25rem 0",
                                lineHeight: "1.3",
                            }}
                        >
                            {stageDefinition.description}
                        </p>
                    )}
                    {stageDefinition.defaultGithubRepo && (
                        <p
                            className="text-info"
                            style={{
                                fontSize: "0.75rem",
                                margin: "0",
                                fontFamily: "monospace",
                            }}
                        >
                            Default repo: {stageDefinition.defaultGithubRepo}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProjectLink;
