// Set up service URL
const WEB_ADDR = 'https://demo.instill.tech';
const PIPE_ADDR = '/v1alpha/pipelines/';

// Set up endpoints
const GPT2 = 'gpt2/trigger'

// Text-to-text pipeline demo
export async function TriggerTextGenerationPipeilne(input) {
  
  const query = JSON.stringify({
    "task_inputs": [
      {
        "text_generation": {
          "prompt": input,
          "output_len": 50,
          "topk": 5,
          "seed": 0
        }
      }
    ]
  })

  const response = await fetch(WEB_ADDR + PIPE_ADDR + GPT2, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json' 
    },
    body: query
  })
  try {
    const json = await response.json();
    const data = await json.model_instance_outputs[0].task_outputs[0].text_generation.text;
    return data;
  } catch (error) {
    console.log('Pipeline trigger failed.')
    console.log(response)
    return "[Error] Sorry the pipelien triggered is INACTIVE. Please try later or check the status on " + WEB_ADDR 
  }

}

// Text-to-iamge pipeline demo
// To implement. See: 
// https://discord.com/developers/docs/interactions/receiving-and-responding#responding-to-an-interaction
// https://discord.com/developers/docs/resources/webhook#execute-webhook
/*
export async function TriggerT2IPipeilne(input) {
  const img_name = "img.jpeg";
  const data = {
    content: "Text-To-Image Generated Image",
    embeds:[{
        description: "Prompt: " + input,
        image: {
          url: "attachment://" + img_name,
        }
      }
    ],
    attachments:[{
        id: 0,
        description: "Prompt: " + input,
        filename: img_name,
      }
    ]
  }

  console.log(embed);
  return embed;

  const query = JSON.stringify({
    "task_inputs": [
      {
        "text_generation": {
          "prompt": input,
          "output_len": 50,
          "topk": 5,
          "seed": 0
        }
      }
    ]
  })

  const response = await fetch(PIPE_ADDR + 'gpt2/trigger', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json' 
    },
    body: query
  })
  try {
    const json = await response.json();
    const data = await json.model_instance_outputs[0].task_outputs[0].text_generation.text;
    //const img = "https://artifacts.instill.tech/imgs/dance.jpg";
    const img_base64_split = img_base64.split(',')[1]; 
    const buf = new Buffer.from(img_base64_split, 'base64');
    const file = new Discord.MessageAttachment(buf, 'img.jpeg');
    const embed = new Discord.MessageEmbed().setImage('attachment://img.jpeg');
    console.log(embed);
    return embed;
    return data;
  } catch (error) {
    console.log('Pipeline trigger failed.')
    console.log(response)
    return "[Error] Sorry the pipelien triggered is offline. Please try later."
  }
}
*/