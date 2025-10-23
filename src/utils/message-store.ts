// Simple in-memory message store for quoting functionality
// In production, consider using a database or Redis for persistence

import { MessageReceived } from "wa-multi-session";

class MessageStore {
  private messages: Map<string, MessageReceived> = new Map();
  private maxSize = 1000; // Maximum number of messages to store

  /**
   * Store a message for later retrieval
   * @param message The message to store
   */
  storeMessage(message: MessageReceived) {
    if (!message.key.id) return;

    const key = this.getKey(message.sessionId, message.key.id);
    this.messages.set(key, message);

    // Clean up old messages if we exceed max size
    if (this.messages.size > this.maxSize) {
      const firstKey = this.messages.keys().next().value;
      if (firstKey) {
        this.messages.delete(firstKey);
      }
    }
  }

  /**
   * Retrieve a stored message
   * @param sessionId Session ID
   * @param messageId Message ID
   * @returns The stored message or undefined
   */
  getMessage(sessionId: string, messageId: string): MessageReceived | undefined {
    const key = this.getKey(sessionId, messageId);
    return this.messages.get(key);
  }

  /**
   * Generate a unique key for storing messages
   */
  private getKey(sessionId: string, messageId: string): string {
    return `${sessionId}:${messageId}`;
  }

  /**
   * Clear all stored messages
   */
  clear() {
    this.messages.clear();
  }

  /**
   * Get the number of stored messages
   */
  size(): number {
    return this.messages.size;
  }
}

// Export a singleton instance
export const messageStore = new MessageStore();
