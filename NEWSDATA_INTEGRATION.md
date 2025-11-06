# NewsData.io Integration

This branch adds support for [NewsData.io](https://newsdata.io) as an alternative news provider with significantly better non-English coverage.

## Why NewsData.io?

NewsData.io provides:
- **Better non-English coverage**: 68+ languages supported
- **More diverse sources**: Stronger coverage in Asia, Africa, Latin America, Middle East
- **Language-first approach**: Built for multilingual news from the ground up
- **Category metadata**: Better structured data including sentiment analysis
- **Keyword extraction**: Automatic keyword tagging for articles

## Comparison: NewsAPI vs NewsData.io

| Feature | NewsAPI | NewsData.io |
|---------|---------|-------------|
| Languages | ~15 | 68+ |
| Non-English sources | Limited | Extensive |
| Arabic news | Basic | Excellent |
| Asian languages | Limited | Strong (Chinese, Japanese, Korean, Hindi, etc.) |
| African sources | Minimal | Good |
| Free tier | 100 req/day | 200 req/day |
| Sentiment analysis | ❌ | ✅ |
| Keyword extraction | ❌ | ✅ |

## Setup

### 1. Get a NewsData.io API Key

1. Visit [https://newsdata.io/register](https://newsdata.io/register)
2. Sign up for a free account
3. Get your API key from the dashboard

### 2. Configure Environment Variables

Add to your `.env` file:

```bash
# NewsData.io API Key
NEWSDATA_API_KEY=your_newsdata_api_key_here

# Set default provider: 'newsapi' or 'newsdata'
DEFAULT_NEWS_PROVIDER=newsdata
```

Keep your existing `NEWS_API_KEY` for fallback support.

### 3. Testing the Integration

Start the new server:

```bash
# Use the new index file with dual API support
node api/index-newsdata.js
```

Or update your package.json to use the new file.

## Usage

### Automatic Provider Selection

The API will automatically use the provider specified in `DEFAULT_NEWS_PROVIDER`:

```bash
# Uses default provider (newsdata if configured)
curl "http://localhost:3000/api/news?country=in&language=hi"
```

### Manual Provider Selection

Override the provider per request:

```bash
# Force use of NewsData.io
curl "http://localhost:3000/api/news?provider=newsdata&language=ar"

# Force use of NewsAPI
curl "http://localhost:3000/api/news?provider=newsapi&country=us"
```

### Language Support Examples

```bash
# Arabic news
curl "http://localhost:3000/api/news?language=ar&provider=newsdata"

# Hindi news
curl "http://localhost:3000/api/news?language=hi&country=in&provider=newsdata"

# Japanese news
curl "http://localhost:3000/api/news?language=ja&country=jp&provider=newsdata"

# Spanish news from multiple countries
curl "http://localhost:3000/api/news?language=es&provider=newsdata"

# Chinese news
curl "http://localhost:3000/api/news?language=zh&provider=newsdata"
```

### Search with Language Filter

```bash
# Search for technology news in Arabic
curl "http://localhost:3000/api/search-news?q=technology&language=ar&provider=newsdata"

# Search for sports news in Hindi
curl "http://localhost:3000/api/search-news?q=cricket&language=hi&provider=newsdata"
```

## Language Codes

NewsData.io supports these language codes (non-exhaustive list):

- `ar` - Arabic
- `zh` - Chinese
- `hi` - Hindi
- `ja` - Japanese
- `ko` - Korean
- `es` - Spanish
- `pt` - Portuguese
- `ru` - Russian
- `de` - German
- `fr` - French
- `it` - Italian
- `tr` - Turkish
- `fa` - Persian
- `id` - Indonesian
- `th` - Thai
- `vi` - Vietnamese
- `bn` - Bengali
- `ur` - Urdu

See [full language list](https://newsdata.io/documentation/#language_list)

## Response Format

The response is normalized to match NewsAPI format, with additional fields:

```json
{
  "title": "Article title",
  "description": "Article description",
  "url": "https://...",
  "urlToImage": "https://...",
  "publishedAt": "2025-01-06T...",
  "source": { "name": "Source name" },
  "country": ["us"],
  "language": "en",
  "category": ["technology"],
  "keywords": ["AI", "tech"],
  "author": "Author name",
  "sentiment": "positive",
  "sentimentStats": { "positive": 0.8, "neutral": 0.2, "negative": 0.0 }
}
```

## Response Headers

Check which provider was used:

```
X-News-Provider: newsdata
X-Total-Results: 142
X-Next-Page: 1234567890
```

## Health Check

Check API status:

```bash
curl "http://localhost:3000/api/health"
```

Response:
```json
{
  "status": "ok",
  "apis": {
    "newsapi": true,
    "newsdata": true
  },
  "defaultProvider": "newsdata"
}
```

## Frontend Integration

Update your frontend to support the new provider parameter:

```javascript
// Default to newsdata for non-English content
const fetchNews = async (language = 'en') => {
  const provider = language !== 'en' ? 'newsdata' : 'newsapi';
  const response = await fetch(
    `/api/news?language=${language}&provider=${provider}`
  );
  return response.json();
};
```

## Migration Strategy

1. **Test Phase**: Keep `DEFAULT_NEWS_PROVIDER=newsapi` and test newsdata explicitly
2. **Soft Launch**: Set `DEFAULT_NEWS_PROVIDER=newsdata` for new users
3. **Full Migration**: Remove NewsAPI dependency once satisfied

## Limitations

### Free Tier Limits
- NewsData.io: 200 requests/day, max 50 results per request
- NewsAPI: 100 requests/day, 100 results per request

### Premium Features
Some NewsData.io features require paid plan:
- Archive search (older than 2 weeks)
- Sources endpoint
- Full-text search

## Troubleshooting

### Error: "No news API key configured"
- Make sure `NEWSDATA_API_KEY` is set in `.env`
- Restart the server after adding the key

### Empty results
- Check if the language code is correct
- Not all countries have sources in all languages
- Try removing country filter for broader results

### Rate limiting
- Free tier has daily limits
- Consider caching responses
- Implement request queuing for high-traffic apps

## Next Steps

- [ ] Add caching layer for frequently requested content
- [ ] Implement language detection for automatic provider selection
- [ ] Add UI toggle for users to switch providers
- [ ] Create comparison dashboard showing both APIs
- [ ] Add metrics tracking for provider performance
