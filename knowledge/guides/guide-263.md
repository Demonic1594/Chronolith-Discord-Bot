# Function Operators

> Community guide for `None` (none) — package **ForgeScript**. Approved 2026-02-19. [View on docs.botforge.org](https://docs.botforge.org/guide/guide-263)

In this guide, you will learn about all available function operators in ForgeScript and their purposes, including how to use them. Let's dive in!

## Table of Contents
1. [Negation Operator](#negation-operator-2)
2. [Count Operator](#count-operator-5)
3. [Silent Operator](#silent-operator-8)
4. [Multiple Operators](#multiple-operators-11)

## Negation Operator
You can use the negation operator to disable any possible output of a function. This can be useful for functions that return a "status" after execution, such as booleans or numbers.

### How to?
To disable the output of a function, simply add a `!` between the "$" and the name of a function.

#### Example
```fs
$!ban[$guildID;$mentioned[0];Reason]
```
Now, after executing the `$ban[]` function with negation operator, a boolean value is no longer returned to check whether the action was successfully performed.

> [!NOTE]
> The negation operator can be applied to **any** function, regardless of whether the function actually returns output or not.

## Count Operator
You can use the count operator to directly count the values of a possible array output from a function using a delimiter (separator).

### How to?
To count the values of a function's output, simply add `@[]` between the "$" and the name of a function. Inside the brackets provide a character to delimit (split) the values by, e.g. `@[,]`.

> [!WARNING]
> The count operator only takes in **1 character**.

#### Example
```fs
$@[,]userIDs
```
This will now return the count of all users (delimited by `,`) that are cached within the bot.

> [!NOTE]
> The count operator can be applied to **any** function, regardless of whether the function actually returns countable output or not.

## Silent Operator
The silent operator will suppress any error a function might throw and stops further code execution as well.

### How to?
To silent the command in case of a function error, simply add a `#` between the "$" and the name of a function.

#### Example
```fs
$#ban[$guildID;$mentioned[0]]
```
In case of an error the command will now remain "silent", suppressing the error and stopping code execution.

> [!NOTE]
> The silent operator can be applied to **any** function, regardless of whether the function is actually able to throw errors or not.

## Multiple Operators
You can use multiple operators on a single function, but only in a specific order:
```
1. !
2. # 
3. @[]
```

#### Example
```fs
$!#ban[$guildID;$mentioned[0]]
```
Now a boolean value is no longer returned and in case of an error the command will remain "silent".
