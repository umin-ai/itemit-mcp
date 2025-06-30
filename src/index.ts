import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { AlertFeature } from "./types/index.js";
import "dotenv";

const ITEMIT_API_BASE = "https://api.itemit.com/v1";
const ITEMIT_API_KEY = process.env.ITEMIT_API_KEY;
const ITEMIT_USER_ID = process.env.ITEMIT_USER_ID;
const ITEMIT_USER_TOKEN = process.env.ITEMIT_USER_TOKEN;
const ITEMIT_WORKSPACE_ID = process.env.ITEMIT_WORKSPACE_ID;

if (!ITEMIT_API_KEY || !ITEMIT_USER_ID || !ITEMIT_USER_TOKEN || !ITEMIT_WORKSPACE_ID) {
  console.error("Missing required environment variables: ITEMIT_API_KEY, ITEMIT_USER_ID, ITEMIT_USER_TOKEN, ITEMIT_WORKSPACE_ID");
  process.exit(1);
}

// Create server instance
const server = new McpServer({
  name: "itemit-mcp",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {},
  },
});

// Get location by name tool
server.tool(
  "get-location-by-name",
  "Get locations by item name in Itemit. Optionally specify the number of locations (limit, default 25) and skip (default 0).",
  {
    name: z.string().describe("Name of the location to search for"),
    limit: z.number().int().min(1).max(100).optional().describe("Number of locations to retrieve (default 25, max 100)"),
    skip: z.number().int().min(0).optional().describe("Number of locations to skip (default 0)"),
  },
  async ({ name, limit, skip }) => {
    const lim = limit ?? 25;
    const sk = skip ?? 0;
    const encodedName = encodeURIComponent(name);
    const url = `${ITEMIT_API_BASE}/location-profiles?limit=${lim}&skip=${sk}&search=${encodedName}`;
    const response = await makeItemitRequest(url, "GET");

    if (!response) {
      return {
        content: [
          {
            type: "text",
            text: "Failed to search for locations (no response from API).",
          },
        ],
      };
    }

    if (response.error) {
      return {
        content: [
          {
            type: "text",
            text: `Failed to search for locations. Error: ${response.error}`,
          },
        ],
      };
    }

    const results = response.results || [];
    if (results.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: `No locations found for "${name}".`,
          },
        ],
      };
    }

    const _locationsData = `Search results for "${name}" (limit=${lim}):\n${results.map((loc: any, idx: number) => {
      return `${idx + 1}. ${loc.name || loc.id || "Unnamed location"} (ID: ${loc.id})\n${JSON.stringify(loc, null, 2)}`
    }).join("\n\n")}`;

    return {
      content: [
        {
          type: "text",
          text: _locationsData,
        },
      ],
    };
  }
);

// Search item by name tool
server.tool(
  "search-item-by-name",
  "Search for items by name in Itemit. Optionally specify the number of items (size, default 15) and page (default 1).",
  {
    name: z.string().describe("Name of the item to search for"),
    size: z.number().int().min(1).max(100).optional().describe("Number of items to retrieve (default 15, max 100)"),
    page: z.number().int().min(1).optional().describe("Page number (default 1)"),
  },
  async ({ name, size, page }) => {
    const pageSize = size ?? 15;
    const pageNum = page ?? 1;
    const encodedName = encodeURIComponent(name);
    const url = `${ITEMIT_API_BASE}/item-profiles/_search?size=${pageSize}&page=${pageNum}&search=${encodedName}`;
    const response = await makeItemitRequest(url, "POST");

    if (!response) {
      return {
        content: [
          {
            type: "text",
            text: "Failed to search for items (no response from API).",
          },
        ],
      };
    }

    if (response.error) {
      return {
        content: [
          {
            type: "text",
            text: `Failed to search for items. Error: ${response.error}`,
          },
        ],
      };
    }

    const results = response.results || [];
    if (results.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: `No items found for "${name}".`,
          },
        ],
      };
    }

    const _itemsData = `Search results for "${name}" (size=${pageSize}):\n${results.map((item: any, idx: number) => {
      return `${idx + 1}. ${item.name || item.id || "Unnamed item"} (ID: ${item.id})\n${JSON.stringify(item, null, 2)}`
    }).join("\n\n")}`;

    return {
      content: [
        {
          type: "text",
          text: _itemsData,
        },
      ],
    };
  }
);

// Create item tool
server.tool(
  "create-item",
  "Create an item in Itemit. Requires name, description, and serial.",
  {
    name: z.string().describe("Name of the item"),
    description: z.string().describe("Description of the item"),
    serial: z.string().describe("Serial number of the item"),
  },
  async ({ name, description, serial }) => {
    const itemId = uuidv4();
    const url = `${ITEMIT_API_BASE}/items/${itemId}`;
    const payload = { name, description, serial };
    const response = await makeItemitRequest(url, "PUT", payload);

    if (!response) {
      return {
        content: [
          {
            type: "text",
            text: "Failed to create item (no response from API).",
          },
        ],
      };
    }

    if (response.error) {
      return {
        content: [
          {
            type: "text",
            text: `Failed to create item. Error: ${response.error}`,
          },
        ],
      };
    }

    return {
      content: [
        {
          type: "text",
          text: `Item created/updated successfully (id: ${itemId}): ${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  }
);

// Helper function for making NWS API requests
async function makeItemitRequest(
  url: string,
  method: "GET" | "POST" | "PUT" = "GET",
  body?: any
) {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
    'X-Api-Key': ITEMIT_API_KEY ?? "",
    'X-User-Id': ITEMIT_USER_ID ?? "",
    'X-User-Token': ITEMIT_USER_TOKEN ?? "",
    'X-Workspace-Id': ITEMIT_WORKSPACE_ID ?? "",
  };

  try {
    const fetchOptions: any = { method, headers };
    if ((method === "POST" || method === "PUT") && body) {
      fetchOptions.body = JSON.stringify(body);
    }
    const response = await fetch(url, fetchOptions);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error making itemit request:", error);
    return null;
  }
}



// Format alert data
function formatAlert(feature: AlertFeature): string {
  const props = feature.properties;
  return [
    `Event: ${props.event || "Unknown"}`,
    `Area: ${props.areaDesc || "Unknown"}`,
    `Severity: ${props.severity || "Unknown"}`,
    `Status: ${props.status || "Unknown"}`,
    `Headline: ${props.headline || "No headline"}`,
    "---",
  ].join("\n");
}


// Register weather tools
server.tool(
  "get-reminders",
  "Get reminders from Itemit",
  async () => {
    const remindersUrl = `${ITEMIT_API_BASE}/reminders`;
    const remindersData = await makeItemitRequest(remindersUrl);

    console.log("remindersData", remindersData);
    if (!remindersData) {
      return {
        content: [
          {
            type: "text",
            text: "Failed to retrieve alerts data",
          },
        ],
      };
    }

    const results = remindersData.results || [];
    if (results.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: `No reminders found. Raw API response: ${JSON.stringify(remindersData, null, 2)}`,
          },
        ],
      };
    }

    const _remindersData = `List of reminders: ${JSON.stringify(results, null, 2)}`;

    return {
      content: [
        {
          type: "text",
          text: _remindersData,
        },
      ],
    };
  },
);

// Get items tool
server.tool(
  "get-items",
  "Get items from Itemit. Optionally specify the number of items (size), default is 15.",
  {
    size: z.number().int().min(1).max(100).optional().describe("Number of items to retrieve (default 15, max 100)"),
  },
  async ({ size }) => {
    const page = 1;
    const pageSize = size ?? 15;
    const itemsUrl = `${ITEMIT_API_BASE}/item-profiles/_search?size=${pageSize}&page=${page}`;
    const body = {
      filters: [
        {
          allOf: []
        }
      ],
      sorts: [
        {
          sort: "ITEM",
          by: {
            latestActivity: "DESC"
          }
        }
      ]
    };
    const itemsData = await makeItemitRequest(itemsUrl, "POST", body);

    if (!itemsData) {
      return {
        content: [
          {
            type: "text",
            text: "Failed to retrieve items data",
          },
        ],
      };
    }

    const results = itemsData.results || [];
    if (results.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: `No items found. Raw API response: ${JSON.stringify(itemsData, null, 2)}`,
          },
        ],
      };
    }

    const _itemsData = `List of items (size=${pageSize}):\n${results.map((item: any, idx: number) => `${idx + 1}. ${item.name || item.id || "Unnamed item"}`).join("\n")}`;

    return {
      content: [
        {
          type: "text",
          text: _itemsData,
        },
      ],
    };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("itemit MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
