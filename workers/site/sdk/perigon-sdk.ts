export interface AdvancedSearchParams {
  mainQuery?: string;
  titleQuery?: string;
  descriptionQuery?: string;
  contentQuery?: string;
  mustInclude?: string[];
  mustNotInclude?: string[];
  exactPhrases?: string[];
  urlContains?: string;
}

export class PerigonSearchBuilder {
  private buildExactPhraseQuery(phrases: string[]): string {
    return phrases.map((phrase) => `"${phrase}"`).join(" AND ");
  }

  private buildMustIncludeQuery(terms: string[]): string {
    return terms.join(" AND ");
  }

  private buildMustNotIncludeQuery(terms: string[]): string {
    return terms.map((term) => `NOT ${term}`).join(" AND ");
  }

  buildSearchParams(params: AdvancedSearchParams): SearchParams {
    const searchParts: string[] = [];
    const searchParams: SearchParams = {};

    if (params.mainQuery) {
      searchParams.q = params.mainQuery;
    }

    if (params.titleQuery) {
      searchParams.title = params.titleQuery;
    }

    if (params.descriptionQuery) {
      searchParams.desc = params.descriptionQuery;
    }

    if (params.contentQuery) {
      searchParams.content = params.contentQuery;
    }

    if (params.exactPhrases?.length) {
      searchParts.push(this.buildExactPhraseQuery(params.exactPhrases));
    }

    if (params.mustInclude?.length) {
      searchParts.push(this.buildMustIncludeQuery(params.mustInclude));
    }

    if (params.mustNotInclude?.length) {
      searchParts.push(this.buildMustNotIncludeQuery(params.mustNotInclude));
    }

    if (searchParts.length) {
      searchParams.q = searchParams.q
        ? `(${searchParams.q}) AND (${searchParts.join(" AND ")})`
        : searchParts.join(" AND ");
    }

    if (params.urlContains) {
      searchParams.url = `"${params.urlContains}"`;
    }

    return searchParams;
  }
}

export interface SearchParams {
  /** Main search query parameter that searches across title, description and content */
  q?: string;
  /** Search only in article titles */
  title?: string;
  /** Search only in article descriptions */
  desc?: string;
  /** Search only in article content */
  content?: string;
  /** Search in article URLs */
  url?: string;
  /** Additional search parameters can be added here as needed */
  [key: string]: string | undefined;
}

export interface Article {
  translation: {
    title: string;
    description: string;
    content: string;
    url: string;
  };
}

export interface SearchResponse {
  articles?: Article[];
}
