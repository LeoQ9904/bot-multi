import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class SearchService {
    private readonly logger = new Logger(SearchService.name);
    private readonly apiKey = process.env.TAVILY_API_KEY;
    private readonly baseUrl = 'https://api.tavily.com/search';

    async search(query: string): Promise<string> {
        if (!this.apiKey) {
            this.logger.warn('TAVILY_API_KEY is not set. Skipping search.');
            return 'Search functionality is not configured.';
        }

        try {
            this.logger.log(`Searching web for: ${query}`);
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    api_key: this.apiKey,
                    query: query,
                    search_depth: 'basic',
                    include_answer: true,
                    max_results: 3
                })
            });

            if (!response.ok) {
                throw new Error(`Tavily API error: ${response.statusText}`);
            }

            const data = await response.json();

            // Format results for the LLM
            let resultText = `Search Results for "${query}":\n\n`;

            if (data.answer) {
                resultText += `Summary: ${data.answer}\n\n`;
            }

            if (data.results && Array.isArray(data.results)) {
                data.results.forEach((res: any, index: number) => {
                    resultText += `[${index + 1}] ${res.title}\n${res.content}\nSource: ${res.url}\n\n`;
                });
            }

            return resultText;
        } catch (error) {
            this.logger.error('Error performing web search:', error);
            return `Failed to perform search for "${query}".`;
        }
    }
}
