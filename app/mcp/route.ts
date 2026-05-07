import { getErratasByCardId } from '@/lib/data/erratas';
import { getAllPolicies } from '@/lib/data/policies';
import db from '@/lib/mongodb';
import { TextContent } from '@modelcontextprotocol/sdk/types.js';
import { createMcpHandler } from 'mcp-handler';
import { z } from 'zod/v3';
import cr from "@/data/riftbound/cr.json"
import tr from "@/data/riftbound/tr.json"
import { Content } from 'next/font/google';

async function handleSearchCard(params: {
    gameName?: string;
    cardName: string;
}): Promise<{ content: TextContent[]; isError?: boolean }> {
    let game;
    if (params.gameName) {
        game = await db.collection("games").findOne({ $or: [{ name: params.gameName }, { slug: params.gameName }] });

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
    }

    const card = await db.collection("cards").findOne({ name: params.cardName, gameId: game?._id });

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
            text: `You searched for card "${params.cardName}" in game "${params.gameName ?? "N/A"}".${card.image ? `\n\n![${card.name}](${card.image})` : ""}\n\nThis card has ${erratas.length} erratas.\n\nErratas details:\n${erratas.map((e, index) => `\n${index + 1}. Type: ${e.type}, Details: ${e.details}, Source: ${e.source}, Errata ID: ${e.id}`).join("\n")}`
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

async function handleSearchRules(params: {
    gameName: string;
    query: string;
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

    const results = await getAllPolicies({
        gameId: game._id.toString(),
        offset: 0,
        limit: 3,
        search: params.query,
    });

    return {
        content: [
            {
                type: "text",
                text: `You searched for rules in game "${params.gameName ?? "N/A"}" with query "${params.query}".\n\nFound ${results.length} policies.\n\nPolicies details:\n${results.map((p, index) => `\n${index + 1}. Title: ${p.title}, Content: ${p.content}, Source: ${p.source}, Policy ID: ${p.id}`).join("\n")}`
            },
        ],
        isError: false,
    };
}

async function handleGetRule(params: {
    gameName: string;
    id: string;
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

    let rule: string | undefined;
    if (params.id.startsWith("TR")) {
        rule = tr.find(r => r.id === params.id.replace("TR", ""))?.content;
    } else {
        rule = cr.find(r => r.id === params.id.replace("CR", ""))?.content;
    }

    if (!rule) {
        return {
            content: [
                {
                    type: "text",
                    text: `No rule found with ID "${params.id}" in game "${params.gameName ?? "N/A"}".`
                }
            ],
            isError: false,
        };
    }

    return {
        content: [
            {
                type: "text",
                text: `You searched for rule with ID "${params.id}" in game "${params.gameName ?? "N/A"}".\n\nRule details:\n${rule}`,
            },
        ],
        isError: false,
    };
}

async function handleSearchRule(params: {
    gameName: string;
    query: string;
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

    let rules: { id: string; content: string }[] = [];
    // search for matching rules in CR
    const crRule = cr.find(r => r.content.toLowerCase() === params.query.toLowerCase());
    if (crRule) {
        // get sub items for this rule
        const crSubRules = cr.filter(r => r.id.startsWith(crRule.id + "."));
        rules.push({ id: `CR${crRule.id}`, content: crRule.content });
        rules.push(...crSubRules.map(r => ({ id: `CR${r.id}`, content: r.content })));

    }
    // search for matching rules in TR
    const trRule = tr.find(r => r.content.toLowerCase() === params.query.toLowerCase());
    if (trRule) {
        // get sub items for this rule
        const trSubRules = tr.filter(r => r.id.startsWith(trRule.id + "."));
        rules.push({ id: `TR${trRule.id}`, content: trRule.content });
        rules.push(...trSubRules.map(r => ({ id: `TR${r.id}`, content: r.content })));
    }

    if (rules.length === 0) {
        return {
            content: [
                {
                    type: "text",
                    text: `No rule found with query "${params.query}" in game "${params.gameName ?? "N/A"}".`
                }
            ],
            isError: false,
        };
    }

    return {
        content: [
            {
                type: "text",
                text: `You searched for rule with query "${params.query}" in game "${params.gameName ?? "N/A"}".\n\nRule details:\n${rules.map(r => `${r.id}: ${r.content}`).join("\n")}`,
            },
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
    server.registerTool("search_rules", {
        title: "Search rules and policies",
        description: "Search for rules, policies, tournament regulation, keywords...",
        inputSchema: {
            gameName: z.string(),
            query: z.string(),
        },
    }, handleSearchRules);
    server.registerTool("vote_errata", {
        title: "Vote on errata",
        description: "Vote on the correctness of card erratas or rulings.",
        inputSchema: {
            errataId: z.string(),
            vote: z.enum(["upvote", "downvote"]),
        },
    }, handleVoteErrata);
    server.registerTool("get_rule", {
        title: "Get rule by ID",
        description: "Get the content of a tournament rule (TR) or core rule (CR) by its ID.",
        inputSchema: {
            gameName: z.string().describe("Name of the game"),
            id: z.string().describe("ID of the rule. Prefix by type. Example: TR509.4.c.1"),
        },
    }, handleGetRule);
    server.registerTool("search_rule", {
        title: "Search rules by query",
        description: "Search for rules, policies, tournament regulation, keywords...",
        inputSchema: {
            gameName: z.string().describe("Name of the game"),
            query: z.string().describe("Query to search for rules or keywords."),
        },
    }, handleSearchRule);
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