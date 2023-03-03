import 'dotenv/config';
import express from 'express';
import {
  InteractionType,
  InteractionResponseType,
  InteractionResponseFlags,
  MessageComponentTypes,
  ButtonStyleTypes,
} from 'discord-interactions';
import { VerifyDiscordRequest, getRandomEmoji, DiscordRequest } from './utils.js';
import { getShuffledOptions, getResult } from './game.js';
import {
  CHALLENGE_COMMAND,
  HELLO_COMMAND,
  TG_COMMAND,
  //T2I_COMMAND,
  HasGuildCommands,
  ResetGuildCommand,
} from './commands.js';
import { 
  TriggerTextGenerationPipeilne,
} from './vdp.js';

// Create an express app
const app = express();
// Get port, or default to 3000
const PORT = process.env.PORT || 3069;
// Parse request body and verifies incoming requests using discord-interactions package
app.use(express.json({ verify: VerifyDiscordRequest(process.env.PUBLIC_KEY) }));

// Store for in-progress games. In production, you'd want to use a DB
const activeGames = {};

/**
 * Interactions endpoint URL where Discord will send HTTP requests
 */
app.post('/interactions', async function (req, res) {
  // Interaction type and data
  const { type, id, data } = req.body;

  /**
   * Handle verification requests
   */
  if (type === InteractionType.PING) {
    return res.send({ type: InteractionResponseType.PONG });
  }

  /**
   * Handle slash command requests
   * See https://discord.com/developers/docs/interactions/application-commands#slash-commands
   */
  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name } = data;
    
    // "\t2t" guild command
    if (name === 'tg') {
      return handleTextGeneration(req, res);
    }

    /*
    // "t2i" guild command
    if (name === 't2i') {
      return handleTextToImage(req, res);
    }
    */

    // "\hello" guild command
    if (name === 'hello') {
      return handleHello(req, res);
    }

    // "\rps" guild command
    if (name === 'challenge' && id) {
      return handleChallenge(req, res, id)
    }
  }

  /**
   * Handle requests from interactive components
   * See https://discord.com/developers/docs/interactions/message-components#responding-to-a-component-interaction
   */
  if (type === InteractionType.MESSAGE_COMPONENT) {
    return handleChallengeInteractions(req, res, data);
  }
});

/**
 * Start listening to command
 */
app.listen(PORT, () => {
  console.log('Listening on port', PORT);

  // Reset guild commands
  //ResetGuildCommand(process.env.APP_ID, process.env.GUILD_ID);

  // Check if guild commands from commands.js are installed (if not, install them)
  
  HasGuildCommands(process.env.APP_ID, process.env.GUILD_ID, [
    HELLO_COMMAND,
    CHALLENGE_COMMAND,
    TG_COMMAND,
    //T2I_COMMAND,
  ]);
  
});


/****************************************************/
/* Helper functions handling slash command requests */
/****************************************************/

/**
 * helper function for command "/hello"
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
function handleHello(req, res) {
  // Send a message into the channel where command was triggered from
  return res.send({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      // Fetches a random emoji to send from a helper function
      content: 'hello world ' + getRandomEmoji(),
    },
  });
}


/**
 * helper function for command "/tg"
 * @param {*} req 
 * @param {*} res 
 */
function handleTextGeneration(req, res) {
  const MAX_LENGTH = 200; // this is a hard threshold assigned by the service.
  const input = req.body.data.options[0].value;
  const output_len = req.body.data.options[1].value;
  console.log("TG [prompt]: " + input + "  [len]: " + output_len);

  if (output_len > MAX_LENGTH) {
    console.log("Length exceeds the limit (max: 200)")
    return res.send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: `VDP-DEMO: Sorry our pipeline is too young to process such complex work at thte moment. Please make sure the "output_length" stays within its capacity (max: 200).`
      },
    });
  }

  TriggerTextGenerationPipeilne(input, output_len).then((output) => {
    console.log("TG outputs:")
    console.log(output)
    // Send a message into the channel where command was triggered from
    return res.send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: "↓↓↓ INPUTS ↓↓↓\n[Prompt]: " + input + "    [Output Length]: " + output_len + "\n↓↓↓ OUTPUTS ↓↓↓\n" + output,
      },
    });
  })
}


/**
 * helper function for command "/t2i"
 * @param {*} req 
 * @param {*} res 
 */
/*
function handleTextToImage(req, res) {
  const input = req.body.data.options[0].value;
  console.log("T2I prompt: " + input);

  TriggerT2IPipeilne(input).then((output) => {
    console.log("T2I outputs:")
    console.log(output)
    // Send a message into the channel where command was triggered from
    return res.send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: output,
    });
  })
}
*/

/**
 * helper function for command "/rps"
 * @param {*} req 
 * @param {*} res 
 * @param {*} id 
 * @returns 
 */
function handleChallenge(req, res, id) {
  const userId = req.body.member.user.id;
  // User's object choice
  const objectName = req.body.data.options[0].value;
  // Create active game using message ID as the game ID
  activeGames[id] = {
    id: userId,
    objectName,
  };
  return res.send({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      // Fetches a random emoji to send from a helper function
      content: `Rock papers scissors challenge from <@${userId}>`,
      components: [
        {
          type: MessageComponentTypes.ACTION_ROW,
          components: [
            {
              type: MessageComponentTypes.BUTTON,
              // Append the game ID to use later on
              custom_id: `accept_button_${req.body.id}`,
              label: 'Accept',
              style: ButtonStyleTypes.PRIMARY,
            },
          ],
        },
      ],
    },
  });
}


/*******************************************************************/
/* Helper functions handleing requests from interactive components */
/*******************************************************************/

/**
 * handle "/rps" interactive components
 * @param {*} req 
 * @param {*} res 
 * @param {*} data 
 */
async function handleChallengeInteractions(req, res, data) {
  // custom_id set in payload when sending message component
  const componentId = data.custom_id;

  if (componentId.startsWith('accept_button_')) {
    // get the associated game ID
    const gameId = componentId.replace('accept_button_', '');
    // Delete message with token in request body
    const endpoint = `webhooks/${process.env.APP_ID}/${req.body.token}/messages/${req.body.message.id}`;
    try {
      await res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          // Fetches a random emoji to send from a helper function
          content: 'What is your object of choice?',
          // Indicates it'll be an ephemeral message
          flags: InteractionResponseFlags.EPHEMERAL,
          components: [
            {
              type: MessageComponentTypes.ACTION_ROW,
              components: [
                {
                  type: MessageComponentTypes.STRING_SELECT,
                  // Append game ID
                  custom_id: `select_choice_${gameId}`,
                  options: getShuffledOptions(),
                },
              ],
            },
          ],
        },
      });
      // Delete previous message
      await DiscordRequest(endpoint, { method: 'DELETE' });
    } catch (err) {
      console.error('Error sending message:', err);
    }
  } else if (componentId.startsWith('select_choice_')) {
    // get the associated game ID
    const gameId = componentId.replace('select_choice_', '');

    if (activeGames[gameId]) {
      // Get user ID and object choice for responding user
      const userId = req.body.member.user.id;
      const objectName = data.values[0];
      // Calculate result from helper function
      const resultStr = getResult(activeGames[gameId], {
        id: userId,
        objectName,
      });

      // Remove game from storage
      delete activeGames[gameId];
      // Update message with token in request body
      const endpoint = `webhooks/${process.env.APP_ID}/${req.body.token}/messages/${req.body.message.id}`;

      try {
        // Send results
        await res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: { content: resultStr },
        });
        // Update ephemeral message
        await DiscordRequest(endpoint, {
          method: 'PATCH',
          body: {
            content: 'Nice choice ' + getRandomEmoji(),
            components: [],
          },
        });
      } catch (err) {
        console.error('Error sending message:', err);
      }
    }
  }
}