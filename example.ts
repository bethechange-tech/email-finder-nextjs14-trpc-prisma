import { ApifyGoogleSearch, ActorInput } from "./utils/ApifyGoogleSearch";
import { PromisePool } from '@supercharge/promise-pool'
import { EmailSearcher } from "./utils/EmailSearcher";
import { BusinessData, BusinessService } from "./utils/BusinessService";
import { BusinessSearchFactory } from "./utils/BusinessSearchFactory";

const apiToken = 'apify_api_YwxRzG3WbPAnJ9gsQFyPWskrUW3AJq0U25Mo'; // Replace with your actual API token
const actorId = '2Mdma1N6Fd0y3QEjR'; // Replace with the actual actor ID

const searchInput: ActorInput = {
    searchStringsArray: ['restaurant'],
    locationQuery: 'Grays',
    maxCrawledPlacesPerSearch: 50,
    language: 'en',
    deeperCityScrape: false,
    searchMatching: 'all',
    placeMinimumStars: '',
    skipClosedPlaces: true,
    website: 'allPlaces',
};

// Create an instance of ApifyGoogleSearch and run the search
const apifyGoogleSearch = new ApifyGoogleSearch(apiToken, actorId);
const emailApiKey: string = 'Me5acp2Nwnx16HKEFHLf476s'; // Replace with your actual API key
const emailSearcher = new EmailSearcher(emailApiKey);

(async () => {
    console.log('----99----');
    console.log('====99====');
    try {
        const restaurantDetails = await apifyGoogleSearch.runSearch(searchInput);
        const { results: businesses } = await PromisePool
            .withConcurrency(10)
            .for(restaurantDetails)
            .process(async (data) => {
                const emails = await emailSearcher.searchEmailsByDomain(data.website);

                return { ...data, emails, hasEmails: emails.length > 0 }
            })
        const businessService = new BusinessService();
        await businessService.addBusinesses(businesses);
        await businessService.disconnect();
    } catch (err) {
        const error = err as Error;
        // Handle errors returned from the class
        console.error('Error in search:', error.message);
    }
})();


// Example usage:
const businesses: BusinessData[] = [
    {
        title: 'Bella Italia - Lakeside',
        price: '£20–30',
        website: 'https://www.bellaitalia.co.uk/restaurants/lakeside/lakeside/?utm_source=google&utm_medium=organic&utm_campaign=google_lpm_bellaitalia_lakeside',
        phoneUnformatted: '+441708987338',
        location: { lat: 51.4867006, lng: 0.2815008 },
        state: null,
        emails: [
            'ferneste@bellaitalia.co.uk',
            'bellone@bellaitalia.co.uk',
            'brusati@bellaitalia.co.uk',
            'mom@bellaitalia.co.uk',
            'forte@bellaitalia.co.uk',
            'wlodarczyk@bellaitalia.co.uk',
            'wreford@bellaitalia.co.uk',
            'sturgeon@bellaitalia.co.uk',
            'moosa@bellaitalia.co.uk',
            'gill@bellaitalia.co.uk',
            'mccartanhulme@bellaitalia.co.uk',
            'sanders@bellaitalia.co.uk',
            'francesco@bellaitalia.co.uk',
            'elsayed@bellaitalia.co.uk',
            'velo@bellaitalia.co.uk',
            'fermey@bellaitalia.co.uk',
            'sheldon@bellaitalia.co.uk',
            'shannon@bellaitalia.co.uk',
            'botteon@bellaitalia.co.uk',
            'deal@bellaitalia.co.uk'
        ],
        hasEmails: true,
    },
];


(async () => {
    const businessSearchFacade = BusinessSearchFactory.createBusinessSearchFacade({
        apiToken,
        actorId,
        emailApiKey
    });

    const { businesses } = await businessSearchFacade.executeSearch(searchInput);

    const businessService = new BusinessService();
    await businessService.addBusinesses(businesses);
    await businessService.disconnect();
})();
