# $githubSearchRepo guide

> Community guide for `$githubSearchRepo` (function) — package **ForgeSocial**. Approved 2025-08-27. [View on docs.botforge.org](https://docs.botforge.org/guide/guide-208)

## Overview

`$githubSearchRepo` is a function that integrates with the GitHub API to search for repositories.
It allows you to query repositories, sort them by different criteria, choose the sort order, and paginate results.

The function wraps the GitHub REST API endpoint:
[`GET /search/repositories`](https://docs.github.com/en/rest/search/search?apiVersion=2022-11-28#search-repositories)

---

## Function Signature

```fs
$githubSearchRepo[query; sort; order; page; per_page]
```

* **query** (`string`)
  The GitHub search query. Supports all GitHub search qualifiers (e.g. `user:`, `language:`, `topic:`).
  Example: `forgescript`, `user:octocat`, `react language:TypeScript`.

* **sort** (`enum`)
  How results should be sorted. Supported values:

  * `Stars` → most starred repos
  * `Forks` → most forked repos
  * `HelpWantedIssues` → most issues marked with `help wanted`
  * `Updated` → recently updated repos

* **order** (`enum`)
  Sort direction:

  * `Asc` → ascending
  * `Desc` → descending

* **page** (`number`)
  Which results page to fetch.

* **per\_page** (`number`)
  How many results per page (max 100).

---

## Output

* Returns a JSON string with the GitHub API response.
* On error, returns a handled error message.

---

## Example Usage

### 1. Search repositories by keyword

```fs
$githubSearchRepo[forgescript;Stars;Desc;1;5]
```

Fetches the first 5 repositories matching `forgescript`, sorted by stars descending.

---

### 2. Search repositories owned by a user

```fs
$githubSearchRepo[user:Zack-911;Updated;Desc;1;10]
```

Fetches up to 10 repositories from user `Zack-911`, sorted by most recently updated.

---

### 3. Search by multiple filters

```fs
$githubSearchRepo[language:TypeScript topic:discord-bot;Stars;Desc;1;5]
```

Fetches 5 TypeScript repositories tagged with `discord-bot`, sorted by stars descending.

---

## Notes

* The `query` must be a valid GitHub search string.
* Pagination is important if you expect many results. For example, 25 repos per page means `page=2` gives results 26–50.
* If no results are found, the response JSON will include `"total_count": 0` and `"items": []`.
