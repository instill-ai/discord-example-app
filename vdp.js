import fetch from "node-fetch";

// VDP Text Generation pipeline ID
const pipelineID = 'gpt2'

// Set up vdp service endpoint
const vdpConsole = `https://demo.instill.tech/pipelines/${pipelineID}`;
const triggerPipelineEndpoint = `https://demo.instill.tech/pipelines/${pipelineID}/trigger`;

/**
 * Text Generation pipeline demo
 * @param {string} input 
 * @param {int} output_len 
 * @param {int} seed 
 * @returns 
 */
export async function TriggerTextGenerationPipeilne(input, output_len, seed) {
  
  const body = JSON.stringify({
    "task_inputs": [
      {
        "text_generation": {
          "prompt": input,
          "output_len": output_len,
          "topk": 5,
          "seed": seed
        }
      }
    ]
  })

  const response = await fetch(triggerPipelineEndpoint, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json' 
    },
    body: body
  })
  try {
    const json = await response.json();
    const data = await json.model_instance_outputs[0].task_outputs[0].text_generation.text;
    return data;
  } catch (error) {
    console.log('Pipeline trigger failed.')
    console.log(response)
    return "[Error] Sorry that the pipeline trigger failed. Please try later or check the status on " + vdpConsole 
  }

}
