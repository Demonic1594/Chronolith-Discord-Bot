# Searching & Pagination

> Community guide for `None` (none) — package **BotForge Developer API**. Approved 2026-07-24. [View on docs.botforge.org](https://docs.botforge.org/guide/guide-292)

The `/v1/guides` endpoint supports querying, full-text searching, and pagination over all approved user-submitted guides in the BotForge system.

### 1. Listing and Searching Guides
Retrieve a paginated list of guides. You can search the title and content or filter by a specific package name.

**Endpoint:**
```http
GET /v1/guides HTTP/1.1
Host: api.botforge.org
```

**Query Parameters:**
* `search` (Optional, String): Search query matching against the guide's title or markdown content.
* `package_name` (Optional, String): Filter guides that belong to a specific package name (e.g. `ForgeScript`, or `all` for general guides).
* `page` (Optional, Integer): The page index to fetch (defaults to `1`).
* `limit` (Optional, Integer): The number of guides to return per page (defaults to `20`, maximum `100`).

**Example Request:**
```http
GET /v1/guides?search=database&page=1&limit=10 HTTP/1.1
Host: api.botforge.org
```

<div class="response-preview-embed my-6" data-200='{"success":true,"guides":[{"id":290,"referenceId":290,"memberId":1,"guideType":"dedicated","packageName":"BotForge Developer API","targetType":"none","targetName":null,"title":"Working with Extensions","category":"Developer Guides","subCategory":"","createdAt":"2026-07-24 14:39:40","approvedAt":"2026-07-24 00:00:00"},{"id":292,"referenceId":292,"memberId":1,"guideType":"dedicated","packageName":"BotForge Developer API","targetType":"none","targetName":null,"title":"Searching & Pagination","category":"Developer Guides","subCategory":"","createdAt":"2026-07-24 14:39:40","approvedAt":"2026-07-24 00:00:00"},{"id":286,"referenceId":282,"memberId":32,"guideType":"dedicated","packageName":"ForgeDB","targetType":"none","targetName":null,"title":"Setup","category":"Getting Started","subCategory":null,"createdAt":"2026-06-21 20:09:03","approvedAt":"2026-06-28 08:26:37"},{"id":282,"referenceId":282,"memberId":32,"guideType":"dedicated","packageName":"ForgeDB","targetType":"none","targetName":null,"title":"Setup","category":"Getting Started","subCategory":null,"createdAt":"2026-06-07 08:19:17","approvedAt":"2026-06-16 15:08:18"},{"id":149,"referenceId":149,"memberId":7,"guideType":"specific","packageName":"ForgeScript","targetType":"function","targetName":"$randomUUID","title":null,"category":null,"subCategory":null,"createdAt":"2025-06-22 14:13:42","approvedAt":"2025-06-22 15:06:50"}],"pagination":{"total_records":5,"total_pages":1,"current_page":1,"limit":10}}' data-400='{"success":false,"error":"Pagination limit exceeds maximum of 100."}' data-401='{"success":false,"error":"Invalid or missing API key."}' data-404='{"success":false,"error":"Guide not found."}'></div>

---

### 2. Fetching Single Guide Details
To retrieve the full markdown content of a specific guide, provide its unique `id` as a query parameter.

**Endpoint:**
```http
GET /v1/guides?id={guideId} HTTP/1.1
Host: api.botforge.org
```

**Example Request:**
```http
GET /v1/guides?id=288 HTTP/1.1
Host: api.botforge.org
```

<div class="response-preview-embed my-6" data-200='{"success":true,"guides":[{"id":290,"referenceId":290,"memberId":1,"guideType":"dedicated","packageName":"BotForge Developer API","targetType":"none","targetName":null,"title":"Working with Extensions","category":"Developer Guides","subCategory":"","createdAt":"2026-07-24 14:39:40","approvedAt":"2026-07-24 00:00:00"},{"id":292,"referenceId":292,"memberId":1,"guideType":"dedicated","packageName":"BotForge Developer API","targetType":"none","targetName":null,"title":"Searching & Pagination","category":"Developer Guides","subCategory":"","createdAt":"2026-07-24 14:39:40","approvedAt":"2026-07-24 00:00:00"},{"id":286,"referenceId":282,"memberId":32,"guideType":"dedicated","packageName":"ForgeDB","targetType":"none","targetName":null,"title":"Setup","category":"Getting Started","subCategory":null,"createdAt":"2026-06-21 20:09:03","approvedAt":"2026-06-28 08:26:37"},{"id":282,"referenceId":282,"memberId":32,"guideType":"dedicated","packageName":"ForgeDB","targetType":"none","targetName":null,"title":"Setup","category":"Getting Started","subCategory":null,"createdAt":"2026-06-07 08:19:17","approvedAt":"2026-06-16 15:08:18"},{"id":149,"referenceId":149,"memberId":7,"guideType":"specific","packageName":"ForgeScript","targetType":"function","targetName":"$randomUUID","title":null,"category":null,"subCategory":null,"createdAt":"2025-06-22 14:13:42","approvedAt":"2025-06-22 15:06:50"}],"pagination":{"total_records":5,"total_pages":1,"current_page":1,"limit":10}}' data-400='{"success":false,"error":"Missing guide id."}' data-401='{"success":false,"error":"Invalid or missing API key."}' data-404='{"success":false,"error":"Guide not found or is pending approval."}'></div>
