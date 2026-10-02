# Rate Limits

> Community guide for `None` (none) — package **BotForge Developer API**. Approved 2026-07-24. [View on docs.botforge.org](https://docs.botforge.org/guide/guide-289)

Rate limiting is applied to all requests to prevent abuse, protect server resources, and ensure high availability for all developers. Limits are enforced based on the client's IP address and their resolved authentication tier.

### Limits Table

The following rate limits are enforced per rolling 60-second window:

| Access Tier | Requests per Minute | Enforcement Scope | Key Requirement |
| :--- | :--- | :--- | :--- |
| **Anonymous** | 5 | Per IP address | None |
| **Public** | 60 | Per API Key / IP | Valid Public API Key |
| **Private** | Unlimited | None (Bypassed) | Valid Private API Key |

---

### Rate Limit Headers

Every response from the BotForge Developer API (except for the private tier) includes the following standard HTTP headers to help you track your usage programmatically:

* `X-RateLimit-Limit`: The maximum number of allowed requests in the current window (e.g. `60`).
* `X-RateLimit-Remaining`: The number of requests you have remaining in the current window.
* `X-RateLimit-Reset`: The Unix epoch timestamp indicating when the current rate limit window resets.

**Example Headers in Response:**
```http
HTTP/1.1 200 OK
Content-Type: application/json
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 57
X-RateLimit-Reset: 1784904471
```

---

### Exceeding Rate Limits

If you exceed the allowed request limit for your tier, the API will reject your request with an HTTP error.

**Status Code:**
* `429 Too Many Requests`

**JSON Error Payload:**
```json
{
  "success": false,
  "error": "Too Many Requests: Rate limit is 60 requests per minute for this tier."
}
```

**Example Exceeded Response with Headers:**
```http
HTTP/1.1 429 Too Many Requests
Content-Type: application/json
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1784904471

{
  "success": false,
  "error": "Too Many Requests: Rate limit is 60 requests per minute for this tier."
}
```

### Best Practices

To handle rate limits effectively in your application:
1. **Cache Responses**: Store static resource data (like Discord permissions lists or extension metadata) in a local cache rather than querying the API on every event.
2. **Monitor Headers**: Programmatically parse the `X-RateLimit-Remaining` and `X-RateLimit-Reset` headers to self-regulate request frequency.
3. **Implement Backoff**: When receiving a `429` status code, wait for the window to reset (referencing the `X-RateLimit-Reset` timestamp) before retrying requests.
