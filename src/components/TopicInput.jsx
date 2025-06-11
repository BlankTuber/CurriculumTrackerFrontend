import React, { useState, useRef, useEffect } from "react";

const TopicInput = ({
    topics = [],
    onTopicsChange,
    existingProjects = [],
    disabled = false,
    placeholder = "e.g., React, Authentication",
}) => {
    const [topicInput, setTopicInput] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const inputRef = useRef(null);
    const suggestionsRef = useRef(null);

    const getAllTopics = () => {
        const allTopics = existingProjects
            .flatMap((project) => project.topics || [])
            .filter((topic) => topic && topic.trim());
        return [...new Set(allTopics)];
    };

    useEffect(() => {
        if (topicInput.length >= 3) {
            const allTopics = getAllTopics();
            const filtered = allTopics.filter(
                (topic) =>
                    topic.toLowerCase().includes(topicInput.toLowerCase()) &&
                    !topics.includes(topic)
            );
            setSuggestions(filtered.slice(0, 10));
            setShowSuggestions(filtered.length > 0);
        } else {
            setShowSuggestions(false);
            setSuggestions([]);
        }
    }, [topicInput, topics, existingProjects]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                suggestionsRef.current &&
                !suggestionsRef.current.contains(event.target) &&
                !inputRef.current.contains(event.target)
            ) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleTopicAdd = (topicToAdd = null) => {
        const topic = topicToAdd || topicInput.trim();
        if (topic && !topics.includes(topic)) {
            onTopicsChange([...topics, topic]);
            setTopicInput("");
            setShowSuggestions(false);
        }
    };

    const handleTopicRemove = (topicToRemove) => {
        onTopicsChange(topics.filter((topic) => topic !== topicToRemove));
    };

    const handleInputKeyPress = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleTopicAdd();
        } else if (e.key === "Escape") {
            setShowSuggestions(false);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        handleTopicAdd(suggestion);
        inputRef.current.focus();
    };

    return (
        <div className="form-group">
            <label className="form-label">Topics</label>
            <div className="inline-form" style={{ position: "relative" }}>
                <div
                    className="form-group"
                    style={{ flex: 2, position: "relative" }}
                >
                    <input
                        ref={inputRef}
                        type="text"
                        value={topicInput}
                        onChange={(e) => setTopicInput(e.target.value)}
                        onKeyPress={handleInputKeyPress}
                        className="form-input"
                        maxLength={50}
                        disabled={disabled}
                        placeholder={placeholder}
                    />
                    {showSuggestions && (
                        <div ref={suggestionsRef} className="topic-suggestions">
                            {suggestions.map((suggestion, index) => (
                                <div
                                    key={index}
                                    className="topic-suggestion"
                                    onClick={() =>
                                        handleSuggestionClick(suggestion)
                                    }
                                >
                                    {suggestion}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <button
                    type="button"
                    onClick={() => handleTopicAdd()}
                    className="btn btn-secondary btn-small"
                    disabled={disabled || !topicInput.trim()}
                >
                    Add
                </button>
            </div>
            {topics.length > 0 && (
                <div
                    className="flex"
                    style={{
                        gap: "0.25rem",
                        flexWrap: "wrap",
                        marginTop: "0.25rem",
                    }}
                >
                    {topics.map((topic, index) => (
                        <span
                            key={index}
                            className="tag"
                            style={{
                                background: "var(--bg-tertiary)",
                                padding: "0.25rem 0.5rem",
                                borderRadius: "4px",
                                fontSize: "0.75rem",
                                display: "flex",
                                alignItems: "center",
                                gap: "0.25rem",
                            }}
                        >
                            {topic}
                            <button
                                type="button"
                                onClick={() => handleTopicRemove(topic)}
                                disabled={disabled}
                                style={{
                                    background: "none",
                                    border: "none",
                                    color: "var(--text-muted)",
                                    cursor: "pointer",
                                    padding: "0",
                                    fontSize: "0.8rem",
                                }}
                            >
                                ×
                            </button>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TopicInput;
