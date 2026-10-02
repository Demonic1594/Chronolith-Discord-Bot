module.exports = {
  type: 'clientReady',
  code: `
    $jsonLoad[timeouts;$getGlobalVar[timeouts;{}]]
    $jsonLoad[keys;$jsonKeys[timeouts]]

    $arrayForEach[keys;id;
      $jsonLoad[info;$env[timeouts;$env[id]]]
      $if[$env[info]!=;
        $let[code;$env[info;code]]
        $let[endTime;$env[info;endTime]]
        
        $let[totalLeft;$math[$get[endTime] - $getTimestamp]]
        
        $if[$get[totalLeft]>0;
          $!advancedTimeout[$get[code];$get[totalLeft];$env[id];{"forceEndTime": "$get[endTime]"}]
        ;
          $!jsonDelete[timeouts;$env[id]]
          $setGlobalVar[timeouts;$env[timeouts]]
          $executeTimeoutCode[$get[code]]
        ]
      ]
    ]
  `
}