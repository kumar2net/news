# Branch: newsdata-io-integration

## Summary

This branch adds **NewsData.io** integration to provide significantly better non-English news coverage (68+ languages vs ~15).

## What's Changed

### New Files
- `api/newsdata-io.js` - NewsData.io API client wrapper
- `api/index-newsdata.js` - Enhanced server with dual API support
- `test-newsdata.js` - Test script for the integration
- `NEWSDATA_INTEGRATION.md` - Comprehensive integration guide
- `BRANCH_SUMMARY.md` - This file

### Modified Files
- `env.example` - Added NewsData.io configuration options

## Quick Start

### 1. Get API Key
```bash
# Sign up at: https://newsdata.io/register
```

### 2. Configure Environment
```bash
# Add to .env file
NEWSDATA_API_KEY=your_key_here
DEFAULT_NEWS_PROVIDER=newsdata
```

### 3. Test the Integration
```bash
# Run test script
node test-newsdata.js
```

### 4. Start Server with New API
```bash
# Option A: Test without changing package.json
node api/index-newsdata.js

# Option B: Update package.json "start" script to use index-newsdata.js
npm start
```

## Key Features

✅ **Dual API Support** - Use NewsAPI or NewsData.io seamlessly  
✅ **Auto-fallback** - Falls back to NewsAPI if NewsData.io unavailable  
✅ **Language-first** - 68+ languages with better non-English coverage  
✅ **Backward Compatible** - Existing endpoints still work  
✅ **Provider Selection** - Choose provider per request or globally  

## Testing Different Languages

```bash
# Arabic
curl "http://localhost:3000/api/news?language=ar&provider=newsdata"

# Hindi
curl "http://localhost:3000/api/news?language=hi&provider=newsdata"

# Japanese
curl "http://localhost:3000/api/news?language=ja&provider=newsdata"

# Chinese
curl "http://localhost:3000/api/news?language=zh&provider=newsdata"
```

## Provider Selection

### Global Default
Set in `.env`:
```bash
DEFAULT_NEWS_PROVIDER=newsdata
```

### Per-request Override
Add `?provider=newsdata` or `?provider=newsapi` to any request:
```bash
curl "http://localhost:3000/api/news?provider=newsdata&language=ar"
```

## API Comparison

| Feature | NewsAPI | NewsData.io |
|---------|---------|-------------|
| **Languages** | ~15 | **68+** |
| **Free Tier** | 100 req/day | **200 req/day** |
| **Non-English** | Limited | **Excellent** |
| **Sentiment** | ❌ | **✅** |
| **Keywords** | ❌ | **✅** |

## Next Steps

1. **Test**: Run `node test-newsdata.js` to verify setup
2. **Compare**: Try same queries with both providers
3. **Evaluate**: Check quality of non-English results
4. **Decide**: Keep both APIs or migrate fully to NewsData.io
5. **Deploy**: Update Vercel env vars if satisfied

## Documentation

- Full integration guide: `NEWSDATA_INTEGRATION.md`
- API wrapper: `api/newsdata-io.js`
- Dual server: `api/index-newsdata.js`

## Questions?

**Q: Do I need both API keys?**  
A: No, but having both provides fallback. NewsData.io is recommended for non-English.

**Q: Will this break my existing app?**  
A: No, it's backward compatible. Old endpoints work as before.

**Q: How do I switch between providers?**  
A: Use `?provider=newsdata` or `?provider=newsapi` in requests, or set `DEFAULT_NEWS_PROVIDER` in `.env`.

**Q: What's the best provider for English news?**  
A: Both work well. NewsAPI is mature; NewsData.io has more sources and better metadata.

**Q: What's the best provider for non-English news?**  
A: NewsData.io hands down - it's built for multilingual from the ground up.

---

**Ready to test?** Run `node test-newsdata.js`
