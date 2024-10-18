import { TRPCError } from '@trpc/server';
import { ApifyClient } from 'apify-client';
import { pick } from 'lodash';

export interface ActorInput {
    searchStringsArray: string[];
    locationQuery: string;
    maxCrawledPlacesPerSearch: number;
    language: string;
    deeperCityScrape: boolean;
    searchMatching: string;
    placeMinimumStars: string;
    skipClosedPlaces: boolean;
    website: string;
}

export interface SearchResult {
    title: string;
    price: string;
    website: string;
    phoneUnformatted: string;
    location: {
        lat: number;
        lng: number;
    };
    state: string;
}

export class ApifyGoogleSearch {
    private client: ApifyClient;
    private actorId: string;

    /**
     * Create an instance of ApifyGoogleSearch.
     * @param {string} token - The API token for Apify.
     * @param {string} actorId - The ID of the Apify actor to run.
     */
    constructor(token: string, actorId: string) {
        this.client = new ApifyClient({ token });
        this.actorId = actorId;
    }

    /**
     * Perform a search using the provided input.
     * @param {ActorInput} input - The input configuration for the Apify actor.
     * @returns {Promise<SearchResult[]>} - Returns an array of search results.
     * @throws {Error} - Throws an error if something goes wrong with the request.
     */
    public async runSearch(input: ActorInput): Promise<SearchResult[]> {
        try {
            console.log('Starting actor run...');
            const run = await this.client.actor(this.actorId).call(input);

            console.log(`Actor run completed. Fetching results from dataset: ${run.defaultDatasetId}...`);
            const { items } = await this.client.dataset<SearchResult>(run.defaultDatasetId).listItems();

            if (!items.length) {
                console.warn('No items found in the dataset.');
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'No items found in the dataset.'
                });
            }

            console.log('Items successfully fetched. Processing...');
            return items.map(item => pick(item, ['title', 'price', 'website', 'phoneUnformatted', 'location', 'state']) as SearchResult);
        } catch (error) {
            if (error instanceof Error) {
                console.error('Error during actor run or data fetch:', error.message);
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: error.message,
                });
            }
            console.error('An unknown error occurred.');
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'An unknown error occurred.'
            });
        }
    }
}
