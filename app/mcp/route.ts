import { TextContent } from '@modelcontextprotocol/sdk/types.js';
import { createMcpHandler } from 'mcp-handler';
import { z } from 'zod/v3';

async function handleSearchCard(params: {
    gameName?: string;
    cardName: string;
}): Promise<{ content: TextContent[]; isError?: boolean }> {
    return {
      content: [
        {
            type: "text",
            text: `You searched for card "${params.cardName}" in game "${params.gameName ?? "N/A"}".`
        }
      ],
      isError: false,
    };
}

const handler = createMcpHandler(server => {
    server.registerTool("search_card", {
        title: "Search cards",
        description: "Search for cards and their details, erratas and rulings.",
        inputSchema: {
            gameName: z.string().optional(),
            cardName: z.string(),
        },
    }, handleSearchCard);
}, {
    serverInfo: {
        name: "Joutes Tools",
        version: "1.0.0",
    }
}, {
    basePath: '/',
    verboseLogs: true,
    maxDuration: 60,
});

export { handler as GET, handler as POST, handler as DELETE };