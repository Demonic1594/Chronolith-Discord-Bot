# Getting an API Key

> Community guide for `None` (none) — package **BotForge Developer API**. Approved 2026-07-23. [View on docs.botforge.org](https://docs.botforge.org/guide/guide-293)

To make requests to the BotForge Developer API, you need a public developer API key. This key authorizes your application, determines your access tier, and ensures you have proper rate limits enabled for standard integration tasks.

### Manage Your API Key

Use the interactive manager below to view or generate your personal Developer API key. 

<div class="api-key-manager-embed"></div>

> [!NOTE]
> Keep your API key secret and do not share it or check it into version control repositories. If you suspect your key has been compromised, click **Regenerate Key** immediately to revoke the old one.

---

### Authorization Methods

You can provide your API key to the gateway in one of two ways:

1. **HTTP Header (Recommended)**
   Send your key in the `X-API-Key` request header. This is the most secure method because headers are typically not logged by proxies or intermediate caches.
   ```http
   X-API-Key: your_api_key_here
   ```

2. **Query Parameter (Fallback)**
   For quick testing or environments where headers cannot be easily set, you can pass the key in the `key` query parameter of the request URL:
   ```http
   GET /v1/extensions?key=your_api_key_here HTTP/1.1
   Host: api.botforge.org
   ```

---

### Access Tiers

The API evaluates your key to determine your access tier, rate limit thresholds, and endpoints permission scope:

| Tier | Trigger / Requirement | Rate Limit | Scope & Permissions |
| :--- | :--- | :--- | :--- |
| **Anonymous** | No API key provided | 5 requests/min | Read-only access to standard public endpoints (`/v1/extensions`, `/v1/discord`, `/v1/guides`) |
| **Public** | Valid public API key (`bf_pub_...`) | 60 requests/min | Standard developer query permissions on public endpoints |
| **Private** | Valid private API key | Unlimited | Bypasses restrictions. Required for accessing unverified extensions (`verified=0`) and analytics metrics (`/v1/analytics/*`) |

---

### Key Requirements

* **Format**: All generated developer keys start with the prefix `bf_pub_` followed by a unique random hex string.
* **Storage**: Store the key securely in your environment variables (e.g. `BOTFORGE_API_KEY`) and load it dynamically in your application configuration.
