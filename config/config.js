// config.js
// =============================================================================
// Chat Application Configuration
// =============================================================================

const chatConfig = {
  flowURL:
    "https://api.zerowidth.ai/v1/process/xqu2zft7pfneFQOP4CCM/mKV0yXaD2mPJuHn8dqzv",
  header: {
    title: "Chat with Jun",
    description:
      "Hello! I'm Jun's assistant. Ask me about Jun's work, interests, or anything else you'd like to know.",
  },
  chatInputPlaceholder: "Ask me anything...",
  maxChatHeight: 200,
  // System font stack as fallback
  styling: {
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif",
    primaryColor: "#000000",
    secondaryColor: "#FFFFFF",
    borderRadius: "24px",
    userBubbleColor: "#FFFFFF",
    userBubbleTextColor: "#000000",
    agentBubbleColor: "#000000",
    agentBubbleTextColor: "#FFFFFF"
  },
  // Suggestions for quick prompts
  suggestedPrompts: [
    "Tell me about your design work",
    "What projects are you proud of?",
    "How can I collaborate with you?",
    "What's your design philosophy?"
  ]
};

export default chatConfig;