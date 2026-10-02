module.exports = [{
  name: 'displayTimeoutsListContainer',
  description: 'Displays a container with a paginated list of active advanced timeouts.',
  code: `
    $c[Getting data on the 'page']
    $jsonLoad[listPage;$arrayAt[listPages;$math[$get[page]-1]]]

    $addContainer[
      $addTextDisplay[## Active Timeouts Panel]
      $addSeparator[Large]

      $if[$arrayLength[listPage]>0;
        $loop[$get[rows];
          $let[i;$math[$env[i] - 1]]

          $let[tid;$env[listPage;$get[i];0]]
    
          $c[DO NOT EDIT IF YOU DON'T KNOW WHAT YOU ARE DOING!]
          $addTextDisplay[### ID: $inline[$get[tid]]]
          $addTextDisplay[### Time: $parseMS[$env[listPage;$get[i];1;time];;, ;true]]
          $addTextDisplay[### Ends: $discordTimestamp[$env[listPage;$get[i];1;endTime];RelativeTime]]
          
          $addActionRow
          $addButton[$get[page]!!!$get[rows]!!!$get[tid]!!!stopTimeoutManually!!!$authorID;Stop;Danger]
          $addButton[$get[page]!!!$get[rows]!!!$get[tid]!!!executeTimeoutManually!!!$authorID;Execute;Primary]
          $addButton[$get[page]!!!$get[rows]!!!$get[tid]!!!showTimeoutCode!!!$authorID;Show code;Secondary]

          $addSeparator
          $if[$or[$sum[1;$env[i]]>$arrayLength[listPage];$env[i]==$get[rows]];
            $break
          ]
        ;i;true]
      ;
        $addTextDisplay[## No active timeouts.]
        $addSeparator[Large]
      ]

      $addTextDisplay[### Page $get[page]/$get[maxPages]]

      $if[$get[maxPages]>1;
        $addActionRow
        $addButton[$get[page]-$get[rows]-timeoutsListButtonPrev-$authorID;;Primary;◀️]
        $addButton[$get[page]-$get[rows]-timeoutsListButtonNext-$authorID;;Primary;▶️]
      ]
    ;FFFFFF]
    $addActionRow
    $addButton[$get[page]-$get[rows]-refreshTimeoutCommand-$authorID;Refresh;Success]
  `
},{
  name: 'generateTimeoutListPages',
  description: 'Generates paginated data for the list of active advanced timeouts.',
  params: [
    {
      name: '_rows',
      description: 'Rows per page',
      type: 'Number',
      required: true,
      rest: false,
    }
  ],
  code: `
    $jsonLoad[timeouts;$getGlobalVar[timeouts;{}]]
    $jsonLoad[entries;$jsonEntries[timeouts]]

    $if[$arrayLength[entries]==0;
      $return[[\\]]
    ]

    $arrayCreate[listPages]

    $loop[$arrayLength[entries];
      $if[$math[($env[i] - 1) % $env[_rows]]==0;
        $arrayPushJSON[listPages;$arraySplice[entries;0;$env[_rows]]]
      ]
    ;i;true]

    $return[$env[listPages]]
  `
}]