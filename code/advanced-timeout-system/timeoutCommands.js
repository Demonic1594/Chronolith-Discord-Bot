module.exports = [{
  name: 'timeoutslist',
  aliases: ['tlist'],
  type: 'messageCreate',
  code: `
    $onlyForUsers[;$botOwnerID]

    $reply
    $defer

    $c[
      Maximal displayable rows in one message.
      DO NOT EDIT IF YOU DON'T KNOW WHAT YOU ARE DOING!
      MORE THAN 4 ROWS CAN CAUSE ISSUES WITH DISCORD INTERACTIONS!
    ]
    $let[maxRows;4]

    $let[pageArg;$default[$option[page];$message[0]]] $c['page' argument written by a user (optional)]
    $let[rowsArg;$default[$option[rows];$message[1]]] $c['rows' argument written by a user (optional)]

    $c[Processing the 'rows' argument for errors. If an error occurs, the value of the 'maxRows' variable is returned]
    $let[rows;$function[
      $if[$and[$get[rowsArg]!=;$isNumber[$get[rowsArg]];$get[rowsArg]<=$get[maxRows];$get[rowsArg]>=1];
        $return[$get[rowsArg]]
      ]
      $return[$get[maxRows]]
    ]]

    $c[CREATING TIMEOUTS LIST]
    $jsonLoad[listPages;$generateTimeoutListPages[$get[rows]]]

    $let[maxPages;$max[$arrayLength[listPages];1]]

    $c[Processing the 'page' argument for errors. If an error occurs, '1' is returned]
    $let[page;$function[
      $if[$and[$get[pageArg]!=;$isNumber[$get[pageArg]];$get[pageArg]<=$get[maxPages];$get[pageArg]>=1];
        $return[$get[pageArg]]
      ]
      $return[1]
    ]]

    $displayTimeoutsListContainer
  `
},{
  type: 'interactionCreate',
  description: "Page buttons",
  allowedInteractionTypes: ['button'],
  code: `
    $arrayLoad[IID;-;$customID]
    $arrayLoad[allowedIds; ;timeoutsListButtonPrev timeoutsListButtonNext]

    $onlyIf[$arraySome[allowedIds;id;$arrayIncludes[IID;$env[id]]]]
    $onlyIf[$arrayIncludes[IID;$authorID]]

    $let[page;$env[IID;0]]
    $let[rows;$env[IID;1]]

    $jsonLoad[listPages;$generateTimeoutListPages[$get[rows]]]
    $let[maxPages;$max[$arrayLength[listPages];1]]

    $switch[$env[IID;2];
      $case[timeoutsListButtonPrev;
        $letSub[page;1]
      ]

      $case[timeoutsListButtonNext;
        $letSum[page;1]
      ]
    ]

    $let[page;$if[$get[page]<=0;$get[maxPages];$if[$get[page]>$get[maxPages];1;$get[page]]]]

    $displayTimeoutsListContainer
    $interactionUpdate
  `
},{
  type: 'interactionCreate',
  description: "Refresh buttons",
  allowedInteractionTypes: ['button'],
  code: `
    $arrayLoad[IID;-;$customID]
    $arrayLoad[allowedIds; ;refreshTimeoutCommand]

    $onlyIf[$arraySome[allowedIds;id;$arrayIncludes[IID;$env[id]]]]
    $onlyIf[$arrayIncludes[IID;$authorID]]

    $let[page;$env[IID;0]]
    $let[rows;$env[IID;1]]

    $jsonLoad[listPages;$generateTimeoutListPages[$get[rows]]]
    $let[maxPages;$max[$arrayLength[listPages];1]]

    $let[page;$if[$get[page]<=0;$get[maxPages];$if[$get[page]>$get[maxPages];1;$get[page]]]]

    $displayTimeoutsListContainer
    $interactionUpdate
  `
},{
  type: 'interactionCreate',
  description: "Stop, Execute and Show code buttons",
  allowedInteractionTypes: ['button'],
  code: `
    $arrayLoad[IID;!!!;$customID]
    $arrayLoad[allowedIds; ;stopTimeoutManually executeTimeoutManually showTimeoutCode]

    $onlyIf[$arraySome[allowedIds;id;$arrayIncludes[IID;$env[id]]]]
    $onlyIf[$arrayIncludes[IID;$authorID]]

    $let[page;$env[IID;0]]
    $let[rows;$env[IID;1]]
    $let[timeoutId;$env[IID;2]]

    $jsonLoad[timeouts;$getGlobalVar[timeouts;{}]]

    $switch[$env[IID;3];
      
      $case[stopTimeoutManually;
        $let[success;$stopAdvancedTimeout[$get[timeoutId]]]

        $jsonLoad[listPages;$generateTimeoutListPages[$get[rows]]]
        $let[maxPages;$max[$arrayLength[listPages];1]]

        $let[page;$if[$get[page]<=0;$get[maxPages];$if[$get[page]>$get[maxPages];1;$get[page]]]]
        

        $interactionUpdate[
          $displayTimeoutsListContainer
        ]

        $interactionFollowUp[
          $ephemeral
          
          $if[$get[success];
            $addTextDisplay[## _Successfully stopped timeout $inline[$get[timeoutId]]_]
          ;
            $addTextDisplay[## _Failed to stop timeout $inline[$get[timeoutId]]_]
          ]
        ]
      ]

      $case[executeTimeoutManually;
        $if[$env[timeouts;$get[timeoutId]]!=;
          $let[code;$env[timeouts;$get[timeoutId];code]]
          $executeTimeoutCode[$get[code]]
        ]
        $let[success;$stopAdvancedTimeout[$get[timeoutId]]]

        $jsonLoad[listPages;$generateTimeoutListPages[$get[rows]]]
        $let[maxPages;$max[$arrayLength[listPages];1]]

        $let[page;$if[$get[page]<=0;$get[maxPages];$if[$get[page]>$get[maxPages];1;$get[page]]]]

        $interactionUpdate[
          $displayTimeoutsListContainer
        ]

        $interactionFollowUp[
          $ephemeral

          $if[$get[success];
            $addTextDisplay[## _Successfully executed timeout $inline[$get[timeoutId]]_]
          ;
            $addTextDisplay[## _Failed to execute timeout $inline[$get[timeoutId]]_]
          ]
        ]
      ]

      $case[showTimeoutCode;
        $jsonLoad[listPages;$generateTimeoutListPages[$get[rows]]]
        $let[maxPages;$max[$arrayLength[listPages];1]]

        $let[page;$if[$get[page]<=0;$get[maxPages];$if[$get[page]>$get[maxPages];1;$get[page]]]]

        $interactionUpdate[
          $displayTimeoutsListContainer
        ]

        $let[code;$resolveTimeoutCode[$env[timeouts;$get[timeoutId];code]]]

        $onlyIf[$get[code]!=;
          $interactionFollowUp[
            $ephemeral
            $addTextDisplay[## _Failed to get the code from timeout $inline[$get[timeoutId]]_]
          ]
        ]

        $arrayLoad[code;\n;$get[code]]
        $arrayMap[code;elem;
          $let[elem;$trim[$env[elem]]]
          $if[$get[elem]!=;
            $return[$get[elem]]
          ]
        ;newCode]

        $interactionFollowUp[
          $ephemeral
          $attachment[$arrayJoin[newCode;\n];Code.bash;true]
        ]
      ]
    ]
  `
},{
  name: 'stopalltimeouts',
  aliases: ['sat'],
  type: 'messageCreate',
  code: `
    $onlyForUsers[;$botOwnerID]

    $reply

    $jsonLoad[timeouts;$getGlobalVar[timeouts;{}]]
    $jsonLoad[keys;$jsonKeys[timeouts]]

    $onlyIf[$arrayLength[keys]>0;
      $addTextDisplay[## _There are no active timeouts!_]
    ]

    $arrayForEach[keys;id;$!stopAdvancedTimeout[$env[id]]]

    $addTextDisplay[## _Successfully stopped all timeouts!_]
  `
}]