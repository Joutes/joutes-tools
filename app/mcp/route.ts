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
            text: `You searched for card "${params.cardName}" in game "${params.gameName ?? "N/A"}".\n\nThis card has no erratas.`
        }
      ],
      isError: false,
    };
}

async function handleVoteErrata(params: {
    errataId: string;
    vote: "upvote" | "downvote";
}): Promise<{ content: TextContent[]; isError?: boolean }> {
    return {
      content: [
        {
            type: "text",
            text: `You voted "${params.vote}" on errata with ID "${params.errataId}".`
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
    server.registerTool("vote_errata", {
        title: "Vote on errata",
        description: "Vote on the correctness of card erratas or rulings.",
        inputSchema: {
            errataId: z.string(),
            vote: z.enum(["upvote", "downvote"]),
        },
    }, handleVoteErrata);
}, {
    serverInfo: {
        name: "Joutes Tools",
        version: "1.0.0",
    }
}, {
    basePath: '',
    verboseLogs: true,
    maxDuration: 60,
});

export { handler as GET, handler as POST, handler as DELETE };