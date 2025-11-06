const axios = require("axios");

class NewsApiClient {
  constructor({
    apiKey,
    baseUrl,
    defaultCountry,
    defaultLanguage,
    defaultPageSize,
  }) {
    this.apiKey = apiKey;
    this.defaults = {
      country: defaultCountry,
      language: defaultLanguage,
      pageSize: defaultPageSize,
    };

    this.http = axios.create({
      baseURL: baseUrl.replace(/\/$/, ""),
    });
  }

  async request(endpoint, params) {
    try {
      const response = await this.http.get(endpoint, {
        params: {
          apiKey: this.apiKey,
          ...params,
        },
      });

      return response.data;
    } catch (error) {
      const message =
        error?.response?.data?.message || error.message || "Unknown error";
      const wrappedError = new Error(`NewsAPI request failed: ${message}`);
      wrappedError.cause = error;
      throw wrappedError;
    }
  }

  async getTopHeadlines(params = {}) {
    const { country, category, pageSize, page, ...rest } = params;

    return this.request("/top-headlines", {
      country: country ?? this.defaults.country,
      category,
      pageSize: pageSize ?? this.defaults.pageSize,
      page: page ?? 1,
      ...rest,
    });
  }

  async searchNews(query, params = {}) {
    if (!query) {
      throw new Error("A search query is required");
    }

    const { language, sortBy, pageSize, page, from, to, ...rest } = params;

    return this.request("/everything", {
      q: query,
      language: language ?? this.defaults.language,
      sortBy: sortBy ?? "publishedAt",
      pageSize: pageSize ?? this.defaults.pageSize,
      page: page ?? 1,
      from,
      to,
      ...rest,
    });
  }

  async getSources(params = {}) {
    const { category, language, country, ...rest } = params;

    return this.request("/sources", {
      category,
      language: language ?? this.defaults.language,
      country: country ?? this.defaults.country,
      ...rest,
    });
  }
}

module.exports = { NewsApiClient };
