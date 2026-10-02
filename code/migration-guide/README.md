# Migration fundamentals (forum post, as submitted)

You may have migrated from another tool or library with a similar syntax, such as Aoi.js, BDFD, or DBscript. However, we are unrelated to these libraries and we have our unique approach to achieving tasks. In this post, you can share fundamental concepts that are essential to understanding ForgeScript, as well as highlight differences between ForgeScript and other libraries, such as in functions, arguments, or ways to do things. This will be helpful for users who are considering or in the process of migrating to ForgeScript.

Below this message you can see essential things you must know when starting on ForgeScript.

## Action Rows
> If you will add a button or a select menu to your command, you must start a row, add $addActionRow before your $addButton or before your $addStringSelectMenu, for $addButton you must put an $addActionRow for each 5 buttons, since an action row can have a maximum of 5 buttons in it, __or__ 1 select menu, you can't put buttons and a select menu in the same action row.

For example, this is right (one $addActionRow each 5 buttons):
```
$addActionRow
$addButton...
$addButton...
$addButton...
$addButton...
$addButton...

$addActionRow
$addButton...
$addButton...
$addButton...
$addButton...
$addButton...

$addActionRow
$addStringSelectMenu...
```

And this is wrong (6 addButtons in a same action row):

```
$addActionRow
$addButton...
$addButton...
$addButton...
$addButton...
$addButton...
$addButton...
```

This is also wrong (select menus takes 5 slots in an action row, so, it must not share the same action row with any other interaction such as buttons):
```
$addActionRow
$addButton...
$addButton...
$addButton...
$addButton...
$addStringSelectMenu...
```


## Indexes
In the libraries and tools I mentioned before, indexes starts from 1, such as "``$mentioned[1;yes]``", however, in traditional programming indexes always starts from 0, we used to start indexes with "1" as well, but functions are being updated to start indexes from "0", such as "``$mentioned[0;yes]``", to keep consistency with traditional programming.

In this trigger example:
```
!user <@551786741296791562> <@1147478356657446982>
```
To get my ID, you should use $mentioned[0], $mentioned[1] would get the <@1147478356657446982> ID.
This same logic applies (or will apply) to all other functions that has indexes on it.

## Function Responses
Functions that has response arguments, such as ``$sendMessage[$channelID;Response text here]`` or ``$onlyIf[2==3;Response here (since 2 doesn't equal 3)]`` allows the use of functions inside them, such as embed functions, without needing to use weird parsing or another syntax.

Basically, we allow you to do the following:
```
$sendMessage[$channelID; $title[Hello!]
$description[This is an embed message!] ]
```
and same thing with other functions that gives you a response:
```
$onlyIf[1==2;
$title[Hello!]
$description[How are you?]
$footer[This is quite awesome]
$color[Random]]
```

**DEPRECATED**, now both solutions works, this means that you can either use $textSplit and $splitText, or use arrays (which is still recommended)

## "Text Splitting" Functions in ForgeScript
In other tools and libraries, like the ones we mentioned earlier, you might have used functions like "$splitText", "$textSplit", and so on to split text. However, in ForgeScript, we have a different approach. We don't use functions like "$textSplit" or "$splitText". Instead, we use array functions to achieve the same result.

**In Other Libraries/Tools:**
```
$let[to_split;1, 2, 3, 4, 5]
$textSplit[$get[to_split];,]
$splitText[1] $c[This will return "1"]
```

**In ForgeScript:**
```
$let[to_split;1, 2, 3, 4, 5]
$arrayLoad[data;,;$get[to_split]]
$arrayAt[data;0] $c[This will return "1" since indexes start from 0]
```
> In ForgeScript, we use the variable field (in this case I called it "data") to store values, allowing for more complex operations. Here's an example of why this is useful:

## In Other Tools/Libraries:
```
$textSplit[1,2,3,4,5;,]
$textSplit[hi, bye, hi again;,]
$splitText[1] $c[This would return "bye"]
$splitText[1] $c[This would return "bye" too]
```
> As you can see, in other tools, you can't get "1" (from the first $textSplit) and "hi" (from the second $textSplit) at the same time.
> However, in ForgeScript, we have the "variable" field. You can use it to assign a key to each loaded array. This means that unlike the example above, it's possible to get a value per key, like the following example:

**In ForgeScript**:
```
$arrayLoad[cool_numbers;,;1,2,3,4,5]
$arrayLoad[texts;,;hi, bye, hi again]
$arrayAt[cool_numbers;0] $c[This will return "1"]
$arrayAt[texts;0] $c[This will return "hi"]
$arrayAt[cool_numbers;2] $c[This will return "3"]
```
With ForgeScript's approach, you can access specific values by using keys, making it more flexible for various operations.
Refer to our documentation about arrays to see more array functions and know how to use the current ones:
<https://docs.botforge.org/?search=array#function-list-$arrayLoad>
