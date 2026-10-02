# ForgeScript Autocomplete — tutorial (as submitted)

Autocomplete commands allow your Discord bot to suggest dynamic options to users as they type in slash command. In ForgeScript, implementing this requires two main components:

1. **The Slash Command Definition**: Setting up the command and enabling `autocomplete` on a specific option.
2. **The `interactionCreate` Event**: Handling the typing event and sending the choices back to Discord.
—————————————————————————
## Step 1: Create the Slash Command
First, you need to define your application command. In the option where you want the autocomplete dropdown to appear, you must set `autocomplete: true`.

Create a file for your slash command (e.g., `choose.js`) and add the following code:
```js
{
    code: `
        You chose: $option[choice]
    `,
    data: {
        type: 1,
        name: 'choose',
        description: '...',
        options: [
            {
                name: "choice",
                type: 3,
                description: "...",
                required: false,
                autocomplete: true // This triggers the autocomplete event as the user types
            }
        ]
    }
}
```
—————————————————————————
## Step 2: Handle the Autocomplete Interaction
Next, you need to listen for the autocomplete interaction when a user starts typing in that specific command option. This is done using the `interactionCreate` event.

Create an event file (e.g., `autocomplete.js`) and add this code:
```js
{
    type: "interactionCreate",
    allowedInteractionTypes: ['autocomplete'], // Strictly filters for autocomplete events
    code: `
        $onlyIf[$and[$applicationCommandName==choose;$focusedOptionName==choice]]

        $arrayLoad[options; ;One Two Three]
        $arrayForEach[options;option;
          $addChoice[$env[option];$env[option]]
        ]
        $autocomplete
    `
}
```
—————————————————————————
## How to Create Advanced Autocomplete with Dynamic Filtering
To make your autocomplete smart and reactive, you can capture the user's current input using `$focusedOptionValue` and filter your options array dynamically using  `$arrayMap`.

```js
{
    code: `
        $onlyIf[$and[$applicationCommandName==choose;$focusedOptionName==choice]]

        $let[focusedValue;$focusedOptionValue]
        $arrayLoad[options; ;One Two Three]

        $if[$get[focusedValue]!=;
            $arrayMap[options;option;
                $if[$includes[$toLowerCase[$env[option]];$toLowerCase[$get[focusedValue]]];
                    $return[$env[option]]
                ]
            ;options]
        ]

        $c[Loop through the filtered array (up to Discord's maximum limit of 25 choices)]
        $loop[25;
            $let[i;$math[$env[i] - 1]]
            $let[currentChoice;$arrayAt[options;$get[i]]]

            $c[If we run out of items in the array, stop the loop safely]
            $if[$get[currentChoice]==;
                $break
            ]

            $addChoice[$get[currentChoice];$get[currentChoice]]
        ;i;true]

        true
    `
}
```
—————————————————————————
## Breakdown of the Event Code:
- `allowedInteractionTypes: ['autocomplete']`: Ensures this event listener only runs when Discord asks for autocomplete suggestions.
- `$onlyIf[$applicationCommandName==choose]`: Prevents the script from executing unless the user is interacting with your specific `/choose` command.
- `$addChoice[Name;Value]`: Adds an option to the autocomplete dropdown menu.
 - 1. `Name` is what the user sees in Discord.
 - 2. `Value` is what your bot actually receives in `$option[choice]` when the command is sent.
- `$autocomplete`: Finalizes the interaction and sends the added choices back to Discord's UI (optional)
