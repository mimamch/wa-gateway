import dotenv from "dotenv";

// Load .env variables
dotenv.config();

const AGENIX_API_BASE_URL = process.env.AGENIX_API_BASE_URL as string;

export const createAgenixAgent = async (chatAgentName: string, systemPrompt: string) => {
  try {
    const response = await fetch(`${AGENIX_API_BASE_URL}/agents`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Origin": "https://hayatix-ai.vercel.app",   // ✅ spoof allowed origin
    "Referer": "https://hayatix-ai.vercel.app/", // ✅ spoof allowed referer
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/117 Safari/537.36" // ✅ spoof browser UA
  },
  body: JSON.stringify({ chatAgentName, systemPrompt }),
});


    if (!response.ok) {
      const errorData = await response.json();
      console.log(response.body)
      throw new Error(errorData.error || "Failed to create agent");
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error creating agenix agent:", error);
    throw error;
  }
};

export const getAgenixSessionMessages = async (sessionId: string) => {
  try {
    const response = await fetch(`${AGENIX_API_BASE_URL}/sessions/${sessionId}/messages`, {
      method: "GET",
      headers: {
    "Content-Type": "application/json",
    "Origin": "https://hayatix-ai.vercel.app",   // ✅ spoof allowed origin
    "Referer": "https://hayatix-ai.vercel.app/", // ✅ spoof allowed referer
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/117 Safari/537.36" // ✅ spoof browser UA
  },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to get session messages");
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error getting agenix session messages:", error);
    throw error;
  }
};

export const createAgenixSession = async (agentId: string) => {
  try {
    const response = await fetch(`${AGENIX_API_BASE_URL}/sessions/${agentId}`, {
      method: "POST",
      headers: {
    "Content-Type": "application/json",
    "Origin": "https://hayatix-ai.vercel.app",   // ✅ spoof allowed origin
    "Referer": "https://hayatix-ai.vercel.app/", // ✅ spoof allowed referer
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/117 Safari/537.36" // ✅ spoof browser UA
  },
      body: JSON.stringify({ agent: agentId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to create session");
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error creating agenix session:", error);
    throw error;
  }
};

export const sendAgenixMessage = async (sessionId: string, role: string, content: string) => {
  try {
    const response = await fetch(`${AGENIX_API_BASE_URL}/sessions/${sessionId}/messages`, {
      method: "POST",
      headers: {
    "Content-Type": "application/json",
    "Origin": "https://hayatix-ai.vercel.app",   // ✅ spoof allowed origin
    "Referer": "https://hayatix-ai.vercel.app/", // ✅ spoof allowed referer
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/117 Safari/537.36" // ✅ spoof browser UA
  },
      body: JSON.stringify({ role, content }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to send message to agenix session");
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error sending message to agenix session:", error);
    throw error;
  }
};
