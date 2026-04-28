import { getErratasByCardId } from '@/lib/data/erratas';
import db from '@/lib/mongodb';
import { TextContent } from '@modelcontextprotocol/sdk/types.js';
import { createMcpHandler } from 'mcp-handler';
import { ObjectId } from 'mongodb';
import { z } from 'zod/v3';

async function handleSearchCard(params: {
    gameName?: string;
    cardName: string;
}): Promise<{ content: TextContent[]; isError?: boolean }> {
    const game = await db.collection("games").findOne({ $or: [{ name: params.gameName }, { slug: params.gameName }] });

    if (!game) {
        return {
            content: [
                {
                    type: "text",
                    text: `No game found with name "${params.gameName ?? "N/A"}".`
                }
            ],
            isError: false,
        };
    }

    const card = await db.collection("cards").findOne({ name: params.cardName, game: game?._id });

    if (!card) {
        return {
            content: [
                {
                    type: "text",
                    text: `No card found with name "${params.cardName}" in game "${params.gameName ?? "N/A"}".`
                }
            ],
            isError: false,
        };
    }

    const erratas = await getErratasByCardId(card.id);

    return {
      content: [
        {
            type: "text",
            text: `You searched for card "${params.cardName}" in game "${params.gameName ?? "N/A"}".\n\nThis card has ${erratas.length} erratas.\n\nErratas details:\n${erratas.map((e, index) => `\n${index + 1}. Type: ${e.type}, Details: ${e.details}, Source: ${e.source}, Errata ID: ${e.id}`).join("\n")}`
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