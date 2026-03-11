# Binance Proxy API

This project provides a **serverless proxy** to Binance APIs, hosted on Vercel. It allows you to bypass regional restrictions, standardize requests, and sign private endpoints without exposing your API key directly to the client.

---

## Features

- Supports **all Binance REST API endpoints** (spot, futures, delivery).
- Automatically signs requests for private endpoints.
- Supports **GET and POST** requests.
- Allows choosing **exchange domain** (`binance.us` or `binance.com`).
- Can handle additional query parameters for any Binance endpoint.
- Deployable as a Vercel serverless function.

---

## API Endpoint
```bash
https://YOUR_PROJECT.vercel.app/api/binance
```

### Query Parameters

| Parameter        | Description |
|-----------------|------------|
| `method`        | Binance API path (e.g., `/api/v3/account`) |
| `key`           | Your Binance API key (for private endpoints) |
| `secret`        | Your Binance secret key (for signing requests) |
| `http_method`   | Optional, defaults to the HTTP method of the request (`GET` or `POST`) |
| `exchange_domain` | Optional, defaults to `binance.us`; can be `binance.com` |
| `...params`     | Any additional query or body parameters required by the Binance API |

> Example: For `/api/v3/depth` endpoint, you can pass `symbol` and `limit` as query parameters.

---

## Examples

### 1. Public endpoint (GET)

```bash
curl "https://YOUR_PROJECT.vercel.app/api/binance?method=/api/v3/ticker/price&symbol=BTCUSDT"
```
```bash
curl "https://YOUR_PROJECT.vercel.app/api/binance?method=/api/v3/account&key=YOUR_API_KEY&secret=YOUR_SECRET"
```
```bash
curl -X POST "https://YOUR_PROJECT.vercel.app/api/binance" \
     -H "Content-Type: application/json" \
     -d '{
           "method": "/api/v3/order",
           "symbol": "BTCUSDT",
           "side": "BUY",
           "type": "MARKET",
           "quantity": "0.001",
           "key": "YOUR_API_KEY",
           "secret": "YOUR_SECRET"
         }'
```
##Notes

The proxy automatically signs private requests with your secret key.

Use exchange_domain to choose between binance.us or binance.com.

##Deployment

Clone this repository.

Vercel.json (optional):
```bash
{
  "buildCommand": null,
  "functions": {
    "api/binance.js": {
      "regions": ["fra1"]
    }
  }
}
```
regions is for choosing what vercel region should serve the request e.g fra1 for frankfurt

Deploy to vercel
```bash
vercel --prod
```

The serverless function will be available at:
```bash
https://YOUR_PROJECT.vercel.app/api/binance
```

##Security

Do not expose your API secret key in frontend code. All private requests should go through this proxy.

If using on Vercel, note that serverless functions have dynamic IPs. For stricter IP-bound API keys, consider running the proxy on a VPS with a static IP.
