// =============================================================================
// Chat Agent with User & Agent Bubbles (React + Vercel)
//
// This React component renders a chat interface where users can type messages
// and receive responses from an agent via a serverless API endpoint on Vercel.
// Messages are displayed in styled chat bubbles to clearly differentiate between
// user messages (right-aligned) and agent messages (left-aligned).
//
// Key Features:
// - Maintains a conversation history.
// - Displays each message in a styled bubble.
// - Sends user messages to the API and appends the agent's response (rendered as Markdown) to the chat.
// - Automatically scrolls to the latest message in a scrollable parent container.
// - Animates the submit button while the agent is "thinking".
// - Provides detailed comments for ease of understanding.
//
// Author: Thomas J McLeish
// Date: March 2, 2025
// =============================================================================

// Import the chat configuration settings.
// includes the header title, description, and suggested prompts.
import chatConfig from "../config/config";
// Import React hooks for managing state and side effects.
import { useState, useEffect, useRef } from "react";
// Import react-markdown to render markdown content.
import ReactMarkdown from "react-markdown";
// Import UUID to generate session ID
import { v4 as uuidv4 } from "uuid";

/**
 * Retrieves or generates a session ID and stores it in sessionStorage.
 * Ensures it only runs on the client side and limits it to 32 characters.
 * @returns {string} The session ID.
 */
const getSessionId = () => {
  if (typeof window === "undefined") return ""; // Prevent SSR issues

  let sessionId = sessionStorage.getItem("sessionId");
  //if the id is greater than 32 characters, we need to generate a new one.
  sessionId = sessionId && sessionId.length <= 32 ? sessionId : null;

  if (!sessionId) {
    //the generated id is 36 characters long, so we need to remove the dashes and limit it to 32 characters.
    sessionId = uuidv4().replace(/-/g, "").slice(0, 32); // Ensure max 32 chars
    sessionStorage.setItem("sessionId", sessionId);
  }
  return sessionId;
};

/**
 * Retrieves or generates a persistent user ID and stores it in localStorage.
 * Ensures it only runs on the client side and limits it to 32 characters.
 * @returns {string} The user ID.
 */
const getUserId = () => {
  if (typeof window === "undefined") return ""; // Prevent SSR issues

  let userId = localStorage.getItem("userId");
  //if the id is greater than 32 characters, we need to generate a new one.
  userId = userId && userId.length <= 32 ? userId : null;

  if (!userId) {
    //the generated id is 36 characters long, so we need to remove the dashes and limit it to 32 characters.
    userId = uuidv4().replace(/-/g, "").slice(0, 32); // Ensure max 32 chars
    localStorage.setItem("userId", userId);
  }
  return userId;
};

/**
 * AgentComponent renders a chat interface with user and agent bubbles.
 * It manages the conversation state, handles user input and API requests,
 * and renders responses as Markdown.
 *
 * @returns {JSX.Element} The rendered chat interface.
 */
export default function AgentComponent() {
  // State to store the user's current input from the text field.
  const [message, setMessage] = useState("");

  // State to store the conversation as an array of message objects.
  // Each message object has a role ("user" or "agent") and the message content.
  const [conversation, setConversation] = useState([]);

  // State to capture any errors during the API request.
  const [error, setError] = useState(null);

  // State to track if the agent is processing (loading state).
  const [isLoading, setIsLoading] = useState(false);

  // Create a ref to track the end of the messages container.
  const messagesEndRef = useRef(null);

  // Initialize session ID and user ID states.
  const [sessionId, setSessionId] = useState("");
  const [userId, setUserId] = useState("");

  // Initialize the hovered index state for suggested prompts.
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // State to track if the submit button is hovered.
  const [isSubmitHovered, setIsSubmitHovered] = useState(false);

  // Initialize session ID and user ID on the client side
  useEffect(() => {
    setSessionId(getSessionId());
    setUserId(getUserId());
  }, []);

  /**
   * Scrolls the chat container to the bottom to ensure the latest message is visible.
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll to the latest message whenever the conversation updates.
  useEffect(() => {
    if (document.querySelector(".chat-container")) {
      scrollToBottom();
    }
  }, [conversation]);

  /**
   * Handles the form submission event.
   * @param {Event} e - The form submission event.
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    submitMessage(message);
  };

  /**
   * Handles the submission of the chat input form.
   *
   * Prevents the default form submission behavior, updates the conversation
   * with the user's message, sends the message to the API, and appends the agent's
   * response to the conversation.
   *
   * @param {Event} e - The form submission event.
   * @returns {Promise<void>} A promise that resolves when the submission is complete.
   */
  const submitMessage = async (userInput) => {
    // If the message is empty, do nothing.
    if (!userInput.trim()) return;

    // Clear the input immediately after user submits
    setMessage("");

    // Clear any previous errors.
    setError(null);

    // Create a new conversation entry for the user's message.
    const userMessage = {
      role: "user",
      content: userInput.trim(),
    };

    // Update the conversation state by adding the user's message.
    setConversation((prev) => [...prev, userMessage]);

    // Prepare the payload for the API call.
    // Note: In production, user_id and session_id should be uniquely generated.
    const payload = {
      data: {
        message: userMessage,
      },
      stateful: true,
      stream: false,
      user_id: userId,
      session_id: sessionId,
      verbose: false,
    };

    try {
      // Set loading state to true to trigger the animation.
      setIsLoading(true);

      // Send a POST request to the serverless API endpoint on Vercel.
      const res = await fetch("/api/proxy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      // If the server response is not OK, throw an error.
      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      // Parse the JSON response from the API.
      const data = await res.json();

      // Extract the agent's reply from output_data.content.
      // If output_data or content is missing, fall back to a default message.
      const agentReply =
        data.output_data && data.output_data.content
          ? data.output_data.content
          : "No valid response received from agent.";

      // Create a new conversation entry for the agent's response.
      const agentMessage = {
        role: "agent",
        content: agentReply,
      };

      // Update the conversation state by adding the agent's message.
      setConversation((prev) => [...prev, agentMessage]);

      // Clear the user input field.
      setMessage("");
    } catch (err) {
      // Log the error to the console for debugging.
      console.error("Error fetching agent response:", err);
      // Update the error state so that the user is informed.
      setError(err.message);
    } finally {
      // Reset the loading state regardless of success or error.
      setIsLoading(false);
    }
  };

  /**
   * Inline styles for chat bubbles based on the message role.
   * Updated to match website styling
   */
  const bubbleStyles = {
    user: {
      alignSelf: "flex-end",
      backgroundColor: chatConfig.styling.userBubbleColor,
      color: chatConfig.styling.primaryColor,
      padding: "12px 16px",
      borderRadius: "4px",
      border: `1px solid ${chatConfig.styling.userBubbleBorder}`,
      margin: "4px 0",
      maxWidth: "80%",
      fontSize: "14px",
      fontFamily: chatConfig.styling.fontFamily,
    },
    agent: {
      alignSelf: "flex-start",
      backgroundColor: chatConfig.styling.agentBubbleColor,
      color: chatConfig.styling.agentBubbleTextColor,
      padding: "12px 16px",
      borderRadius: "4px",
      margin: "4px 0",
      maxWidth: "80%",
      fontSize: "14px",
      fontFamily: chatConfig.styling.fontFamily,
    },
  };

  /**
   * Handles the click event on a suggested prompt.
   *
   * Sets the chat input to the prompt text when clicked.
   * Submit the prompt to the chat
   *
   * @param {Object} prompt - The prompt object containing text and autoSubmit flag.
   */
  const handlePromptClick = async (prompt) => {
    // Set the chat input to the prompt text.
    setMessage(prompt);
    // Submit the prompt to the chat.
    setTimeout(() => {
      submitMessage(prompt);
    }, 0); // Ensures the state has been updated before calling submitMessage
  };

  /**
   * Handles the mouseover event on a suggested prompt.
   * @param {*} index
   */
  const handlePromptMouseOver = (index) => {
    if (!isLoading) {
      setHoveredIndex(index);
    }
  };

  /**
   * Handles the mouseout event on a suggested prompt.
   */
  const handlePromptMouseOut = () => {
    setHoveredIndex(null);
  };

  return (
    <div
      style={{
        padding: "0",
        width: "100%",
        maxWidth: "800px", // Wider to match your site's content width
        margin: "0 auto",
        fontFamily: chatConfig.styling.fontFamily,
        borderRadius: "0",
        border: "none",
      }}
    >
      {/* Descriptive header for the chat application */}
      <div
        className="chat-header"
        style={{
          marginBottom: "16px",
          userSelect: "none",
        }}
      >
        <div
          className="chat-title"
          style={{
            backgroundColor: chatConfig.styling.primaryColor,
            color: chatConfig.styling.secondaryColor,
            padding: "16px",
            borderRadius: "0",
            fontSize: "18px",
            fontWeight: "bold",
            letterSpacing: "0.5px",
          }}
        >
          {chatConfig.header.title}
        </div>
        <div
          className="chat-description"
          style={{
            padding: "12px 16px",
            fontSize: "14px",
            fontWeight: "normal",
            borderLeft: `1px solid ${chatConfig.styling.primaryColor}`,
            borderRight: `1px solid ${chatConfig.styling.primaryColor}`,
            borderBottom: `1px solid ${chatConfig.styling.primaryColor}`,
          }}
        >
          {chatConfig.header.description}
        </div>
      </div>

      {/* Chat conversation container displaying messages in bubbles */}
      <div
        className="chat-container"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          marginBottom: "16px",
          height: chatConfig.maxChatHeight,
          overflowY: "auto",
          border: `1px solid ${chatConfig.styling.primaryColor}`,
          padding: "16px",
          borderRadius: "0",
          backgroundColor: chatConfig.styling.secondaryColor,
          width: "100%",
        }}
      >
        {conversation.map((msg, index) => (
          <div
            key={index}
            style={msg.role === "user" ? bubbleStyles.user : bubbleStyles.agent}
          >
            {msg.role === "agent" ? (
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            ) : (
              msg.content
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts Section - updated with minimal styling */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          border: `1px solid ${chatConfig.styling.primaryColor}`,
          marginBottom: "16px",
          padding: "12px 16px",
        }}
      >
        <div style={{ margin: "0 0 8px 0", fontSize: "14px", fontWeight: "bold" }}>
          {chatConfig.suggestedPromptsTitle}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {chatConfig.suggestedPrompts.map((prompt, index) => (
            <button
              key={index}
              onClick={() => handlePromptClick(prompt)}
              onMouseOver={() => handlePromptMouseOver(index)}
              onMouseOut={handlePromptMouseOut}
              disabled={isLoading}
              style={{
                padding: "8px 12px",
                border: `1px solid ${chatConfig.styling.primaryColor}`,
                backgroundColor: hoveredIndex === index 
                  ? chatConfig.styling.primaryColor 
                  : chatConfig.styling.secondaryColor,
                color: hoveredIndex === index 
                  ? chatConfig.styling.secondaryColor 
                  : chatConfig.styling.primaryColor,
                fontSize: "14px",
                cursor: "pointer",
                borderRadius: "0",
                transition: "all 0.2s ease",
              }}
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Chat input form - updated with minimal styling */}
      <form onSubmit={handleSubmit} style={{ display: "flex", gap: "0" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            border: `1px solid ${chatConfig.styling.primaryColor}`,
            overflow: "hidden",
            backgroundColor: chatConfig.styling.secondaryColor,
          }}
        >
          <input
            type="text"
            id="message"
            placeholder={chatConfig.chatInputPlaceholder}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            style={{
              flexGrow: 1,
              padding: "12px 16px",
              border: "none",
              outline: "none",
              backgroundColor: chatConfig.styling.secondaryColor,
              fontFamily: chatConfig.styling.fontFamily,
              fontSize: "14px",
            }}
          />
          <button
            type="submit"
            aria-label="Send prompt"
            data-testid="send-button"
            disabled={isLoading}
            onMouseOver={() => setIsSubmitHovered(true)}
            onMouseOut={() => setIsSubmitHovered(false)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: isSubmitHovered ? "#333" : chatConfig.styling.primaryColor,
              color: chatConfig.styling.secondaryColor,
              height: "48px",
              width: "48px",
              border: "none",
              borderLeft: `1px solid ${chatConfig.styling.primaryColor}`,
              cursor: isLoading ? "default" : "pointer",
              transition: "background-color 0.2s ease",
            }}
          >
            {!isLoading ? (
              <svg
                width="24px"
                height="24px"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"
                  fill="currentColor"
                ></path>
              </svg>
            ) : (
              <svg
                width="24px"
                height="24px"
                viewBox="0 0 24 24"
                style={{ animation: "spin 1s linear infinite" }}
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  strokeDasharray="40 60"
                />
              </svg>
            )}
          </button>
        </div>
      </form>

      {/* Tiny display of user ID and session ID */}
      <div
        style={{
          marginTop: "8px",
          fontSize: "10px",
          color: "#777",
          textAlign: "right",
          fontFamily: chatConfig.styling.fontFamily,
        }}
      >
        ID: {userId.substring(0, 8)}...
      </div>

      {/* Error display */}
      {error && (
        <div style={{ color: "red", marginTop: "16px", fontFamily: chatConfig.styling.fontFamily }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* CSS styles */}
      <style jsx>{`
        .chat-container::-webkit-scrollbar {
          width: 4px;
        }
        .chat-container::-webkit-scrollbar-track {
          background: transparent;
        }
        .chat-container::-webkit-scrollbar-thumb {
          background-color: #888;
        }
        .chat-container {
          scrollbar-width: thin;
          scrollbar-color: #888 transparent;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        /* Add Orkney font if needed */
        @font-face {
          font-family: 'Orkney';
          src: url('/fonts/Orkney-Regular.woff2') format('woff2');
          font-weight: normal;
          font-style: normal;
          font-display: swap;
        }
      `}</style>
    </div>
  );
}
