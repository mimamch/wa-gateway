import * as fs from 'fs';
import * as path from 'path';
import { whatsappAgenixAgentMap, whatsappAgenixSessionMap } from '../webhooks/message';

const DATA_DIR = path.join(__dirname, '../../data');
const MAPPINGS_FILE = path.join(DATA_DIR, 'agenix_mappings.json');

interface Mappings {
  agentMap: [string, string][];
  sessionMap: [string, { agenixSessionId: string, agenixAgentId: string }][];
}

export const loadMaps = async () => {
  if (!fs.existsSync(MAPPINGS_FILE)) {
    console.log('Mappings file not found, starting with empty maps.');
    return;
  }

  try {
    const data = await fs.promises.readFile(MAPPINGS_FILE, 'utf8');
    const { agentMap, sessionMap }: Mappings = JSON.parse(data);

    whatsappAgenixAgentMap.clear();
    agentMap.forEach(([key, value]) => whatsappAgenixAgentMap.set(key, value));

    whatsappAgenixSessionMap.clear();
    sessionMap.forEach(([key, value]) => {
      if (typeof value === 'object' && value !== null && 'agenixSessionId' in value && 'agenixAgentId' in value) {
        whatsappAgenixSessionMap.set(key, value);
      } else {
        console.warn(`Skipping malformed session map entry for key: ${key}. Expected object with agenixSessionId and agenixAgentId, but got: ${JSON.stringify(value)}`);
      }
    });

    console.log('Loaded Agenix mappings from file.');
  } catch (error) {
    console.error('Error loading Agenix mappings:', error);
  }
};

export const saveMaps = async () => {
  if (!fs.existsSync(DATA_DIR)) {
    await fs.promises.mkdir(DATA_DIR, { recursive: true });
  }

  try {
    const mappings: Mappings = {
      agentMap: Array.from(whatsappAgenixAgentMap.entries()),
      sessionMap: Array.from(whatsappAgenixSessionMap.entries()),
    };
    await fs.promises.writeFile(MAPPINGS_FILE, JSON.stringify(mappings, null, 2), 'utf8');
    console.log('Saved Agenix mappings to file.');
  } catch (error) {
    console.error('Error saving Agenix mappings:', error);
  }
};

export const removeAgenixMappingsForWhatsappSession = async (whatsappSessionId: string) => {
  try {
    const agenixAgentId = whatsappAgenixAgentMap.get(whatsappSessionId);
    if (!agenixAgentId) {
      console.log(`No Agenix agent found for WhatsApp session: ${whatsappSessionId}. Nothing to remove.`);
      return;
    }

    // Remove the agent mapping
    whatsappAgenixAgentMap.delete(whatsappSessionId);
    console.log(`Removed Agenix agent mapping for WhatsApp session: ${whatsappSessionId}`);

    // Remove all session mappings associated with this agent
    const remoteJidsToRemove: string[] = [];
    for (const [remoteJid, sessionData] of whatsappAgenixSessionMap.entries()) {
      if (sessionData.agenixAgentId === agenixAgentId) {
        remoteJidsToRemove.push(remoteJid);
      }
    }

    remoteJidsToRemove.forEach(remoteJid => {
      whatsappAgenixSessionMap.delete(remoteJid);
      console.log(`Removed Agenix session mapping for remoteJid: ${remoteJid}`);
    });

    await saveMaps();
    console.log(`Successfully removed all related Agenix mappings for WhatsApp session: ${whatsappSessionId}`);
  } catch (error) {
    console.error(`Error removing Agenix mappings for WhatsApp session ${whatsappSessionId}:`, error);
  }
};