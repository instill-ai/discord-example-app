import { response } from 'express';
import { getRPSChoices } from './archive/game.js';
import { capitalize, DiscordRequest } from './utils.js';

export async function HasGuildCommands(appId, guildId, commands) {
  if (guildId === '' || appId === '') return;
  // Refresh guild command
  ResetGuildCommand(appId, guildId)
  commands.forEach((c) => HasGuildCommand(appId, guildId, c));
}

// Checks for a command
async function HasGuildCommand(appId, guildId, command) {
  // API endpoint to get and post guild commands
  const endpoint = `applications/${appId}/guilds/${guildId}/commands`;
  try {
    const res = await DiscordRequest(endpoint, { method: 'GET' });
    const data = await res.json();
    
    // Install commands (need updates to remove redundencies)
    if (data) {
      const installedNames = data.map((c) => c['name']);
      // This is just matching on the name, so it's not good for updates
      if (!installedNames.includes(command['name'])) {
        console.log(`Installing... "${command['name']}"`);
        InstallGuildCommand(appId, guildId, command);
      } else {
        InstallGuildCommand(appId, guildId, command);
        console.log(`"${command['name']}" command already installed`);
        console.log(`Updating... "${command['name']}"`);
      }
    }
    
  } catch (err) {
    console.error(err);
  }
}

// Installs a command
export async function InstallGuildCommand(appId, guildId, command) {
  // API endpoint to get and post guild commands
  const endpoint = `applications/${appId}/guilds/${guildId}/commands`;
  // install command
  try {
    await DiscordRequest(endpoint, { method: 'POST', body: command });
  } catch (err) {
    console.error(err);
  }
}

// Installs a command
export async function UpdateGuildCommand(appId, guildId, command) {
  // API endpoint to get and post guild commands
  const endpoint = `applications/${appId}/guilds/${guildId}/commands`;
  // install command
  try {
    await DiscordRequest(endpoint, { method: 'PATCH', body: command });
  } catch (err) {
    console.error(err);
  }
}

// Installs a command
export async function ResetGuildCommand(appId, guildId) {
  // API endpoint to get and post guild commands
  const endpoint = `applications/${appId}/guilds/${guildId}/commands`;
  console.log(`Resetting commands......`);
  // install command
  try {
    await DiscordRequest(endpoint, { method: 'PUT', body: [] });
  } catch (err) {
    console.error(err);
  }
}

// Installs a command
export async function DeleteGuildCommand(appId, guildId, command) {
  // API endpoint to get and post guild commands
  const endpoint = `applications/${appId}/guilds/${guildId}/commands`;
  // install command
  try {
    await DiscordRequest(endpoint, { method: 'DELETE', body: command });
  } catch (err) {
    console.error(err);
  }
}

/******************************/
/* /Slash command definitions */
/******************************/

// Define text-to-text command 
export const TG_COMMAND = {
  name: 'tg',
  description: 'This demos the text generation model.',
  options: [
    {
      type: 3, // String
      name: 'prompt',
      description: 'Enter text for generation (max: 200 words)',
      required: true,
      max_length: 200,
    },
    {
      type: 4, // Integer
      name: 'output_len',
      description: 'Enter length of text to generate (default: 100 words, max: 200 words)',
      //required: true,
    },
    {
      type: 4, // Integer
      name: 'seed',
      description: 'Randon seed for genration (value=[0, 65535], default: random())',
      //required: true,
    },
  ],
  type: 1,
};