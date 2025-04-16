### An example of using MCP with LangChain

## Super Simple example

Copy .env.example to .env and fill in the values.

```bash
npm install
node simple.js
```


```js
const { MultiServerMCPClient } = require("@langchain/mcp-adapters");
const dotenv = require("dotenv");
const { ChatOpenAI } = require("@langchain/openai");
const { createReactAgent } = require("@langchain/langgraph/prebuilt");
const run = async () => {
  dotenv.config();
  const client = new MultiServerMCPClient({
    math: {
      transport: "sse",
      url: process.env.MCP_ENDPOINT,
      headers: {
        "x-api-key": process.env.X_API_KEY,
      },
    },
  });

  try {
    const tools = await client.getTools();
    console.log(tools.length);
    const model = new ChatOpenAI({ modelName: process.env.OPENAI_MODEL });
    console.log("Model loaded");
    const prompt = process.env.AI_PROMPT;
    console.log("Prompt loaded");
    const agent = createReactAgent({ llm: model, tools });
    console.log("Agent created");
    const response = await agent.invoke({
      messages: [{ role: "user", content: prompt }],
    });
    console.log(response.messages[response.messages.length - 1]?.content || "No response");
  } finally {
    // Ensure the client connection is closed to allow the process to terminate
    await client.close();
  }
};

run();
```


## Web API

```bash
npm install
npm run start:dev
```
Browse to http://localhost:5000/run-ai ( or what ever your server / port is)


