import mcData from "minecraft-data"
import mineflayer from "mineflayer"
import {plugin as surviver, actions} from "mineflayer-surviver"
const ANYTHINGLLM_URL = 'http://localhost:3001'; // Update with your instance URL
const API_KEY = 'YOUR_ANYTHINGLLM_API_KEY';     // Replace with your generated key
const WORKSPACE_SLUG = 'my-knowledge-base';      // Replace with your workspace slug

async function queryWorkspace(prompt) {
  const endpoint = `${ANYTHINGLLM_URL}/api/v1/workspace/${WORKSPACE_SLUG}/chat`;

  const payload = {
    message: prompt,
    mode: 'query' // Use 'query' for strict RAG (docs context only) or 'chat' for conversational context
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
``
    return data

  } catch (error) {
    console.error('Error querying AnythingLLM:', error.message);
  }
}

// Execute the function


const bot = mineflayer.createBot({
  host: "localhost",
  port: 25565,
  username: "Bot",
  version: "1.21.4"
});

// mineBlocks Log 10; tossItemsTo Log 10 Slaals

bot.once("spawn", () => {

  bot.loadPlugin(surviver)

  bot.on("chat", async (username, msg) => {
    if (username == bot.username) return

    const chat = await queryWorkspace('Summarize the main details in my uploaded onboarding document.');

    bot.chat(chat)

    await execute(msg)
  })
})

async function execute(msg) {
  const rawCommands = msg.split(";")

  for (const rawCommand of rawCommands) {
    const command = [...rawCommand.trim().matchAll(/"([^"]*)"|'([^']*)'|(\S+)/g)]
      .map((match) => match[1] ?? match[2] ?? match[3])
    const actionName = command.shift()

    if (!actionName) continue

    if (actionName == "stop") {
        bot.survival.stopTask()
        continue;
    }

    const action = actions[actionName]
    if (!action) {
      bot.chat(`Unknown command: ${actionName}`)
      continue
    }

    await action(bot, ...command)
  }
}