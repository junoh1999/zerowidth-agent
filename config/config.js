// config.js
// =============================================================================
// Chat Application Configuration
// =============================================================================
// This configuration file stores metadata and descriptions related to the Chat Agent component.
// The goal is to keep the main component clean and maintainable.
//
// Key Features:
// - Stores the descriptive header for the chat component.
// - Provides metadata such as the author and version.
// - Can be extended for additional configuration settings in the future.
// =============================================================================

const chatConfig = {
  flowURL:
    "https://api.zerowidth.ai/v1/process/xqu2zft7pfneFQOP4CCM/mKV0yXaD2mPJuHn8dqzv",
  header: {
    title: "Explore my thoughts...",
    description:
      "Hello! I'm Jun's assistant. Ask me about Jun's work, interests, or anything else you'd like to know.",
  },
  suggestedPromptsTitle: "Try asking:",
  suggestedPrompts: [
    "Tell me about your design work",
    "What projects are you working on?",
    "How can I collaborate with you?",
  ],
  chatInputPlaceholder: "Type your message here...",
  maxChatHeight: 300,
  // Added styling configurations to match website
  styling: {
    fontFamily: "Orkney, sans-serif",
    primaryColor: "#000000",
    secondaryColor: "#FFFFFF",
    accentColor: "#000000",
    userBubbleColor: "#EFEFEF",
    userBubbleBorder: "#000000",
    agentBubbleColor: "#000000",
    agentBubbleTextColor: "#FFFFFF"
  }
};

export default chatConfig;
