// =============================================================================
// Chat Agent with User & Agent Bubbles (React + Vercel)
//
// This React component renders a chat interface styled as a rounded black rectangle 
// with message bubbles and animated loading indicators.
//
// Author: Modified from Thomas J McLeish's original
// =============================================================================

import chatConfig from "../config/config";
import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { v4 as uuidv4 } from "uuid";

/**
 * Retrieves or generates a session ID and stores it in sessionStorage.
 */
const getSessionId = () => {
  if (typeof window === "undefined") return ""; // Prevent SSR issues

  let sessionId = sessionStorage.getItem("sessionId");
  sessionId = sessionId && sessionId.length <= 32 ? sessionId : null;

  if (!sessionId) {
    sessionId = uuidv4().replace(/-/g, "").slice(0, 32); // Ensure max 32 chars
    sessionStorage.setItem("sessionId", sessionId);
  }
  return sessionId;
};

/**
 * Retrieves or generates a persistent user ID and stores it in localStorage.
 */
const getUserId = () => {
  if (typeof window === "undefined") return ""; // Prevent SSR issues

  let userId = localStorage.getItem("userId");
  userId = userId && userId.length <= 32 ? userId : null;

  if (!userId) {
    userId = uuidv4().replace(/-/g, "").slice(0, 32); // Ensure max 32 chars
    localStorage.setItem("userId", userId);
  }
  return userId;
};

/**
 * AgentComponent renders a chat interface with a rounded rectangle design.
 */
export default function AgentComponent() {
  // State to store the user's current input from the text field.
  const [message, setMessage] = useState("");
  // State to store the conversation as an array of message objects.
  const [conversation, setConversation] = useState([]);
  // State to capture any errors during the API request.
  const [error, setError] = useState(null);
  // State to track if the agent is processing (loading state).
  const [isLoading, setIsLoading] = useState(false);
  // State to track the loading animation step (1-5)
  const [loadingStep, setLoadingStep] = useState(1);
  // State to track current prompt suggestion index
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  // State to control the visibility of the prompt (for fade effect)
  const [promptVisible, setPromptVisible] = useState(true);
  // Create a ref to track the end of the messages container.
  const messagesEndRef = useRef(null);
  // Initialize session ID and user ID states.
  const [sessionId, setSessionId] = useState("");
  const [userId, setUserId] = useState("");

  // Initialize session ID and user ID on the client side
  useEffect(() => {
    setSessionId(getSessionId());
    setUserId(getUserId());
  }, []);

  // Rotate through prompt suggestions
  useEffect(() => {
    if (conversation.length === 0) { // Only rotate when no conversation has started
      const rotationInterval = setInterval(() => {
        setPromptVisible(false); // Start fade out
        
        setTimeout(() => {
          setCurrentPromptIndex((prevIndex) => 
            (prevIndex + 1) % chatConfig.suggestedPrompts.length
          );
          setPromptVisible(true); // Start fade in after changing the prompt
        }, 500); // Wait for fade out to complete
        
      }, 5000); // Change every 5 seconds
      
      return () => clearInterval(rotationInterval);
    }
  }, [conversation.length]);

  // Animation for loading circles
  useEffect(() => {
    let animationTimer;
    if (isLoading) {
      animationTimer = setInterval(() => {
        setLoadingStep((prevStep) => {
          // Cycle through steps 1-5
          return prevStep >= 5 ? 1 : prevStep + 1;
        });
      }, 300); // Change animation step every 300ms
    } else {
      setLoadingStep(1); // Reset to initial state when not loading
    }

    return () => {
      if (animationTimer) clearInterval(animationTimer);
    };
  }, [isLoading]);

  /**
   * Scrolls the chat container to the bottom to ensure the latest message is visible.
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll to the latest message whenever the conversation updates.
  useEffect(() => {
    if (document.querySelector(".chat-messages")) {
      scrollToBottom();
    }
  }, [conversation]);

  /**
   * Handles the form submission event.
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    submitMessage(message);
  };

  /**
   * Handles the submission of the chat input form.
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

      // Extract the agent's reply.
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
   * Handles clicking on a suggestion prompt.
   */
  const handlePromptClick = (prompt) => {
    submitMessage(prompt);
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "400px", // Adjust width to match your design
        margin: "0 auto",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif",
      }}
    >
      <div
        style={{
          backgroundColor: "#000000",
          borderRadius: "24px", // Rounded corners like in your images
          padding: "16px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          minHeight: "150px", // Minimum height to match design
        }}
      >
        {/* Chat messages */}
        <div
          className="chat-messages"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            marginTop: "10px",
            marginBottom: "10px",
            flexGrow: 1,
            overflowY: "auto",
            maxHeight: "200px",
          }}
        >
          {conversation.map((msg, index) => (
            <div
              key={index}
              style={{
                alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                backgroundColor: msg.role === "user" ? "#FFFFFF" : "#000000",
                color: msg.role === "user" ? "#000000" : "#FFFFFF",
                border: msg.role === "user" ? "none" : "1px solid #FFFFFF",
                borderRadius: "999px",
                padding: "8px 16px",
                maxWidth: "80%",
                wordBreak: "break-word",
                fontSize: "14px",
              }}
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

        {/* Input for "Ask me anything" */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            position: "relative",
            zIndex: 5,
          }}
        >
          <form onSubmit={handleSubmit} style={{ width: "100%" }}>
            <input
              type="text"
              placeholder="Ask me anything..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 16px",
                borderRadius: "999px",
                border: "none",
                outline: "none",
                fontSize: "14px",
                backgroundColor: "#FFFFFF",
                boxSizing: "border-box",
              }}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleSubmit(e);
                }
              }}
            />
            <button type="submit" style={{ display: "none" }}>Send</button>
          </form>
        </div>
      </div>

      {/* Rotating Prompt suggestion - only shown if no conversation has started */}
      {conversation.length === 0 && (
        <div style={{ 
          display: "flex", 
          justifyContent: "flex-start", 
          marginTop: "10px",
          height: "40px", // Fixed height to prevent layout shift
          alignItems: "center"
        }}>
          <div style={{ fontSize: "14px", marginRight: "10px" }}>
            Try asking:
          </div>
          <div style={{ position: "relative", height: "30px" }}>
            <button
              onClick={() => handlePromptClick(chatConfig.suggestedPrompts[currentPromptIndex])}
              style={{
                backgroundColor: "#FFFFFF",
                border: "none",
                borderRadius: "999px",
                padding: "6px 12px",
                fontSize: "14px",
                cursor: "pointer",
                opacity: promptVisible ? 1 : 0,
                transition: "opacity 0.5s ease",
                position: "absolute",
                whiteSpace: "nowrap",
              }}
            >
              {chatConfig.suggestedPrompts[currentPromptIndex]}
            </button>
          </div>
        </div>
      )}

      {/* Loading animation circles */}
      <div
        style={{
          position: "relative",
          height: "80px",
          marginTop: "10px",
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "flex-start",
        }}
      >
        {/* Large circle */}
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            backgroundColor: "#000",
            opacity: [1, 2].includes(loadingStep) || !isLoading ? 1 : 0,
            transition: "opacity 0.2s ease-in-out",
            marginRight: "10px",
          }}
        ></div>

        {/* Medium circle */}
        <div
          style={{
            width: "25px",
            height: "25px",
            borderRadius: "50%",
            backgroundColor: "#000",
            opacity: [2, 3].includes(loadingStep) && isLoading ? 1 : 0,
            transition: "opacity 0.2s ease-in-out",
            marginRight: "5px",
            marginTop: "5px",
          }}
        ></div>

        {/* Small circle */}
        <div
          style={{
            width: "15px",
            height: "15px",
            borderRadius: "50%",
            backgroundColor: "#000",
            opacity: [3, 4, 5].includes(loadingStep) && isLoading ? 1 : 0,
            transition: "opacity 0.2s ease-in-out",
            marginRight: "0",
            marginTop: "10px",
          }}
        ></div>
      </div>

      {/* Error display */}
      {error && (
        <div style={{ color: "red", marginTop: "16px", fontSize: "12px" }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* CSS styles */}
      <style jsx>{`
        .chat-messages::-webkit-scrollbar {
          width: 4px;
        }
        .chat-messages::-webkit-scrollbar-track {
          background: transparent;
        }
        .chat-messages::-webkit-scrollbar-thumb {
          background-color: #555;
        }
        .chat-messages {
          scrollbar-width: thin;
          scrollbar-color: #555 transparent;
        }
        
        @font-face {
          font-family: 'Orkney';
          src: url('/fonts/orkney-regular.woff') format('woff');
          font-weight: normal;
          font-style: normal;
          font-display: swap;
        }
        
        @font-face {
          font-family: 'Orkney';
          src: url('/fonts/orkney-bold.woff') format('woff');
          font-weight: bold;
          font-style: normal;
          font-display: swap;
        }
      `}</style>
    </div>
  );
}