import * as fs from 'fs';
import * as path from 'path';
import { whatsappAgenixAgentMap, whatsappAgenixSessionMap } from '../webhooks/message';

const DATA_DIR = path.join(__dirname, '../../data');
const MAPPINGS_FILE = path.join(DATA_DIR, 'agenix_mappings.json');

interface Mappings {
  agentMap: [string, string][];
  sessionMap: [string, string][];
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
    sessionMap.forEach(([key, value]) => whatsappAgenixSessionMap.set(key, value));

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