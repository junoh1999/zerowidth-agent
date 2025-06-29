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
    "https://api.zerowidth.ai/v1/process/xqu2zft7pfneFQOP4CCM/DESE4SA2IeBVMw0zCaUa",
  header: {
    title: "Let's chat",
    description:
      "Hello! I'm Jun's assistant. Ask me about Jun's work, interests, or anything else you'd like to know.",
  },
  suggestedPromptsTitle: "Try asking:",
  suggestedPrompts: [
    "Favorite project?",
    "Tell me about yourself",
    "Mother's maiden name?",
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
