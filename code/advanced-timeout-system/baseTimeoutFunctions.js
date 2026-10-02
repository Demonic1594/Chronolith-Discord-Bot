module.exports = [{
  name: 'advancedTimeout',
  description: 'Sets an advanced timeout that persists when the bot is restarted.',
  params: [
    {
      name: '_code',
      description: 'The code to execute. Must be inside the $escapeCode function.',
      type: 'String',
      required: true,
      rest: false,
    },
    {
      name: '_time',
      description: 'How long to wait for before running this code.',
      type: 'String',
      required: true,
      rest: false,
    },
    {
      name: '_id',
      description: 'A unique ID for this timeout.',
      type: 'String',
      required: true,
      rest: false,
    },
    {
      name: '_data',
      description: 'The data to include in the code.',
      type: 'Json',
      required: false,
      rest: false,
    },
  ],
  code: `
    $fn[throwError;
      $logger[Error;Failed to set timeout '$get[id]': $env[reason]]
    ;reason]

    $c[Data preparation and time parsing]
    $let[rawTime;$trim[$trimLines[$replace[$env[_time]; ;;-1]]]]
    $let[time;$function[
      $if[$isNumber[$get[rawTime]];
        $return[$get[rawTime]]
      ;
        $return[$parseString[$get[rawTime]]]
      ]
    ]]
    $let[id;$trim[$trimLines[$env[_id]]]]
    $let[code;$env[_code]]

    $c[Validates if parsed time is a positive value]
    $if[$get[time]<=0;
      $callFn[throwError;invalid time '$get[rawTime]' received.]
      $return[false]
    ]

    $c[Calculating the exact end time point]
    $c[Uses forceEndTime from data if it exists (recursion), otherwise calculate a new one]
    $let[fEnd;$replace[$env[_data;forceEndTime];null;]]
    $let[endTime;$default[$get[fEnd];$math[$getTimestamp + $get[time]]]]

    $c[Determines the total time remaining until the end point]
    $let[totalLeft;$math[$get[endTime] - $getTimestamp]]

    $c[Node.js 32-bit limit]
    $let[maxms;2147483647]
    
    $c[Calculates how long the current step should wait]
    $let[stepWait;$function[
      $if[$get[totalLeft]>$get[maxms];
        $return[$get[maxms]]
      ]
      $if[$get[totalLeft]<=0;
        $return[$get[time]]
      ]
      $return[$get[totalLeft]]
    ]]

    $c[Placeholder replacement]
    $if[$env[_data]!=;
      $if[$isValidJSON[$env[_data]]==false;
        $callFn[throwError;invalid JSON data received]
        $return[false]
      ]

      $jsonLoad[keys;$jsonKeys[_data]]

      $c[Iterates through JSON keys and replace {keyName} in the code with values]
      $loop[$arrayLength[keys];
        $let[key;$env[keys;$math[$env[i] - 1]]]
        $let[val;$env[_data;$get[key]]]
        $let[code;$replace[$get[code];{$get[key]};$get[val];-1]]
      ;i;true]
    ]
    
    $c[Encodes newlines to prevent database storage issues]
    $let[cleanCode;$replace[$get[code];\n;{N};-1]]

    $c[Database persistence]
    $jsonLoad[timeouts;$getGlobalVar[timeouts;{}]]
    
    $c[Checks for ID duplicates only on initial run (not during recursion)]
    $if[$and[$get[fEnd]==;$env[timeouts;$get[id]]!=];
      $callFn[throwError;timeout with ID '$get[id]' already exists.]
      $return[false]
    ]

    $jsonLoad[timeout_data;{
      "time": "$get[time]",
      "endTime": "$get[endTime]",
      "code": "$get[cleanCode]"
    }]
    $jsonSet[timeouts;$get[id];$env[timeout_data]]
    $setGlobalVar[timeouts;$env[timeouts]]

    $c[Starts the native timer]
    $setTimeout[
      $jsonLoad[timeouts;$getGlobalVar[timeouts;{}]]
      $jsonLoad[info;$env[timeouts;$get[id]]]

      $if[$env[info]!=;
        $let[currentTotalLeft;$math[$env[info;endTime] - $getTimestamp]]
        $let[savedCode;$env[info;code]]

        $if[$get[currentTotalLeft]>0;
          $c[Triggers recursion]
          $!advancedTimeout[$get[savedCode];1;$get[id];{"forceEndTime": "$env[info;endTime]"}]
        ;
          $c[Cleans up timeout and executes the code]
          $!jsonDelete[timeouts;$get[id]]
          $setGlobalVar[timeouts;$env[timeouts]]
          $executeTimeoutCode[$get[savedCode]]
        ]
      ]
    ;$get[stepWait];$get[id]]

    $return[true]
  `
},{
  name: 'stopAdvancedTimeout',
  description: 'Stops an active advanced timeout, preventing its code from executing.',
  params: [
    {
      name: '_id',
      description: 'Timeout ID.',
      type: 'String',
      required: true,
      rest: false,
    }
  ],
  code: `
    $jsonLoad[timeouts;$getGlobalVar[timeouts;{}]]
    $if[$env[timeouts;$env[_id]]!=;
      $!jsonDelete[timeouts;$env[_id]]
      $setGlobalVar[timeouts;$env[timeouts]]
    ]
    $return[$stopTimeout[$env[_id]]]
  `
},{
  name: 'advancedTimeoutExists',
  description: 'Checks if an advanced timeout with the given ID exists.',
  params: [
    {
      name: '_id',
      description: 'Timeout ID.',
      type: 'String',
      required: true,
      rest: false,
    }
  ],
  code: `
    $jsonLoad[timeouts;$getGlobalVar[timeouts;{}]]
    $return[$jsonHas[timeouts;$trimLines[$env[_id]]]]
  `
},{
  name: "executeTimeoutCode",
  description: "Executes given timeout code. SYSTEM FUNCTION!",
  params: [
    {
      name: '_code',
      type: 'String',
      required: true,
      rest: false,
    }
  ],
  code: `
    $try[$eval[$resolveTimeoutCode[$env[_code]];false]]
  `
},{
  name: "resolveTimeoutCode",
  description: "Resolves given timeout code and returns it. SYSTEM FUNCTION!",
  params: [
    {
      name: '_code',
      type: 'String',
      required: true,
      rest: false,
    }
  ],
  code: `
    $return[$replace[$env[_code];{N};\n;-1]]
  `
},{
  name: 'timeoutRawData',
  description: "Returns timeout's JSON data",
  params: [
    {
      name: "_timeoutId",
      description: "Timeout ID for data retrieval.",
      type: 'String',
      required: true,
      rest: false,
    }
  ],
  output: "Json",
  code: `
    $jsonLoad[timeouts;$getGlobalVar[timeouts;{}]]
    $return[$default[$env[timeouts;$env[_timeoutId]];{}]]
  `
}]