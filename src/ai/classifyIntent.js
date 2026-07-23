const { GoogleGenAI } =
    require("@google/genai");

const {
    getCommandMetadata
} = require("../router/commandRegistry");

const ai =
    new GoogleGenAI({

        apiKey:
            process.env.GEMINI_API_KEY

    });

module.exports = async function classifyIntent(
    context
) {

    /*
    --------------------------------
    Build Dynamic Command List
    --------------------------------
    */

    const commandList =
        getCommandMetadata()
            .map(command => {

                const aliases =
                    command.aliases.length
                        ? command.aliases.join(", ")
                        : "None";

                const triggers =
                    command.triggers.length
                        ? command.triggers.join(", ")
                        : "None";

                return `Command:
${command.name}

Description:
${command.description || "No description"}

Aliases:
${aliases}

Triggers:
${triggers}`;

            })
            .join("\n\n------------------------------\n\n");

    /*
    --------------------------------
    Prompt
    --------------------------------
    */

    const prompt =
`You are an intent classifier for a Discord bot.

Your ONLY job is deciding whether the user wants to execute a command.

Return ONLY valid JSON.

Conversation:

{
  "type":"conversation"
}

Command:

{
  "type":"command",
  "command":"<command name>",
  "args":[]
}

Rules:

- args must always exist.
- args is an array.
- If no arguments exist, return [].
- If the user mentions a person, put the person's name in args.
- If the user gives extra information, include it in args.
- Never invent arguments.
- If the user is just chatting, always return {"type":"conversation"}.

Available Commands

${commandList}

Examples

User:
server info

Output:
{
  "type":"command",
  "command":"serverinfo",
  "args":[]
}

User:
who owns this server

Output:
{
  "type":"command",
  "command":"serverinfo",
  "args":[]
}

User:
show Prince avatar

Output:
{
  "type":"command",
  "command":"avatar",
  "args":["Prince"]
}

User:
show Alice banner

Output:
{
  "type":"command",
  "command":"banner",
  "args":["Alice"]
}

User:
ping

Output:
{
  "type":"command",
  "command":"ping",
  "args":[]
}

User:
hello

Output:
{
  "type":"conversation"
}

User:

${context.message}`;

    try {

        const response =
            await ai.models.generateContent({

                model:
                    "gemini-2.5-flash",

                contents: [

                    {

                        role: "user",

                        parts: [

                            {

                                text: prompt

                            }

                        ]

                    }

                ]

            });

        const text =
            response.text?.trim();

        console.log(
            "\n========== RAW INTENT RESPONSE =========="
        );
        console.log(text);
        console.log(
            "=========================================\n"
        );

        if (!text) {

            return {

                type:
                    "conversation"

            };

        }

        const result =
            JSON.parse(text);

        if (
            result.type === "command" &&
            !Array.isArray(result.args)
        ) {

            result.args = [];

        }

        console.log(
            "[Intent]",
            JSON.stringify(
                result,
                null,
                2
            )
        );

        return result;

    } catch (err) {

        console.error(
            "[Intent Classifier]",
            err
        );

        return {

            type:
                "conversation"

        };

    }

};