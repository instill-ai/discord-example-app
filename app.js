import 'dotenv/config';
import express from 'express';
import {
  InteractionType,
  InteractionResponseType,
  InteractionResponseFlags,
} from 'discord-interactions';
import { VerifyDiscordRequest, getRandomEmoji} from './utils.js';
import {
  HELLO_COMMAND,
  TG_COMMAND,
  HasGuildCommands,
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

    // "\hello" guild command
    if (name === 'hello') {
      return handleHello(req, res);
    }

  }

  /**
   * Handle requests from interactive components
   * See https://discord.com/developers/docs/interactions/message-components#responding-to-a-component-interaction
   */
  if (type === InteractionType.MESSAGE_COMPONENT) {
    
  }
});

/**
 * Start listening to command
 */
app.listen(PORT, () => {
  console.log('Listening on port', PORT);

  // Check if guild commands from commands.js are installed (if not, install them)
  
  HasGuildCommands(process.env.APP_ID, process.env.GUILD_ID, [
    HELLO_COMMAND,
    TG_COMMAND,
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
    },z
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
  let output_len = 100;
  let seed = Math.floor(Math.random() * 65536);

  // read optional parameters
  for(let i = 1; i < req.body.data.options.length ; i++){
    if (req.body.data.options[i].name == 'output_len') {
      output_len = req.body.data.options[i].value;
    } else if (req.body.data.options[i].name == 'seed') {
      seed = req.body.data.options[i].value;
    }
  }

  // Print arguments to console
  console.log("TG [prompt]: " + input + "  [output_len]: " + output_len + " [seed]:" + seed);

  // Check arguments integrity
  if (output_len > MAX_LENGTH) {
    console.log("output_len exceeds the limit (max: 200)")
    return res.send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: `Error: Sorry our pipeline is too young to process such complex task at thte moment. Please make sure the "output_len" stays within its capacity (max: 200).`
      },
    });
  } else if (seed < 0 || seed > 65535) {
    console.log("seed our of the range [0, 65535]")
    return res.send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: `Error: Sorry our pipeline is too young to process such complex task at thte moment. Please make sure the "seed" stays within range [0, 65535].`
      },
    });
  }

  // Triger VDP Text Generation Pipeline
  TriggerTextGenerationPipeilne(input, output_len, seed).then((output) => {
    console.log("TG output len: ", output.length, "   content: ")
    console.log(output)
    if (output.length > 2000) {
      output = output.slice(0,1800)
    }
    // Send a message into the channel where command was triggered from
    return res.send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: "INPUTS\n[ prompt ]: " + input + "    [ output_len ]: " + output_len + "    [ seed ]: " + seed + "\nOUTPUTS\n" + output,
      },
    });
  })
}