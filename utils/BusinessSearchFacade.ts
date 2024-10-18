import { PromisePool } from '@supercharge/promise-pool';
import { ApifyGoogleSearch } from './ApifyGoogleSearch'; // Assuming this is where the ApifyGoogleSearch class is located
import { EmailSearcher } from './EmailSearcher'; // Assuming this is where the EmailSearcher class is located

interface SearchInput {
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

/**
 * The Facade class that provides a unified interface to search for businesses, retrieve emails, and store the data.
 */
export class BusinessSearchFacade {
    private apifyGoogleSearch: ApifyGoogleSearch;
    private emailSearcher: EmailSearcher;

    constructor(apifyGoogleSearch: ApifyGoogleSearch, emailSearcher: EmailSearcher) {
        this.apifyGoogleSearch = apifyGoogleSearch;
        this.emailSearcher = emailSearcher;
    }

    /**
     * Executes the entire business search process.
     * @param {SearchInput} searchInput - The search parameters for ApifyGoogleSearch.
     */
    public async executeSearch(searchInput: SearchInput) {
        console.log('Starting business search process...');
        const searchDetails = await this.apifyGoogleSearch.runSearch(searchInput);

        console.log('----77----');
        console.log(searchDetails);
        console.log('====77====');
        // Process restaurants concurrently and retrieve emails
        const {
            results: businesses,
            errors
        } = await PromisePool
            .withConcurrency(10)
            .for(searchDetails)
            .process(async (data) => {
                try {
                    if (!data.website) return { ...data, emails: [], hasEmails: false };
                    const emails = await this.emailSearcher.searchEmailsByDomain(data.website);
                    return { ...data, emails, hasEmails: emails.length > 0 };
                } catch (error) {
                    return { ...data, emails: [], hasEmails: false };
                }
            });

        return { businesses, errors }
    }
}
