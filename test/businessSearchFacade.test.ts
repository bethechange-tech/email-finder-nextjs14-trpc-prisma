import { expect, test, beforeAll, afterAll, vitest } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { BusinessSearchFactory } from '../utils/BusinessSearchFactory';
import { BusinessService } from '../utils/BusinessService';
import PromisePool from '@supercharge/promise-pool';
import { BusinessSearchFacade } from '../utils/BusinessSearchFacade';

function createMocks({
    businessSearchFacade,
    searchResults = [],
    emailResults = [],
}: {
    businessSearchFacade: any;
    searchResults: any[];
    emailResults: any[];
}) {
    let callCount = 0;

    const mockRunSearch = vitest
        .spyOn(businessSearchFacade['apifyGoogleSearch'], 'runSearch')
        .mockImplementation(async () => {
            // Return a new set of search results for each call
            const result = searchResults[callCount] || [];
            callCount++;
            return result;
        });

    const mockSearchEmails = vitest
        .spyOn(businessSearchFacade['emailSearcher'], 'searchEmailsByDomain')
        .mockImplementation(async () => {
            // Return a new set of email results for each call
            const emails = emailResults[callCount - 1] || [];
            return emails;
        });

    return {
        mockRunSearch,
        mockSearchEmails,
        restoreMocks() {
            mockRunSearch.mockRestore();
            mockSearchEmails.mockRestore();
        },
    };
}

let prisma: PrismaClient;

beforeAll(async () => {
    prisma = new PrismaClient();

});

test('BusinessSearchFacade should add businesses to the database', async () => {
    // Arrange
    const apiToken = 'fake-apify-token';
    const actorId = 'fake-actor-id';
    const emailApiKey = 'fake-email-api-key';

    const businessSearchFacade = BusinessSearchFactory.createBusinessSearchFacade({
        apiToken,
        actorId,
        emailApiKey
    });

    const searchInput = {
        searchStringsArray: ['test query'],
        locationQuery: 'Test City',
        maxCrawledPlacesPerSearch: 5,
        language: 'en',
        deeperCityScrape: false,
        searchMatching: 'exact',
        placeMinimumStars: '4',
        skipClosedPlaces: true,
        website: ''
    };

    // Mocking external services (Apify and Email searcher)
    const mockRunSearch = vitest.spyOn(businessSearchFacade['apifyGoogleSearch'], 'runSearch').mockResolvedValue([
        {
            title: 'Test Business',
            price: '£20-30',
            website: 'https://testbusiness.com',
            phoneUnformatted: '+441234567890',
            location: { lat: 51.5074, lng: -0.1278 },
            state: 'Test State',
        }
    ]);

    const mockSearchEmails = vitest.spyOn(businessSearchFacade['emailSearcher'], 'searchEmailsByDomain').mockResolvedValue([
        'test@testbusiness.com'
    ]);

    // Act
    const searchDetails = await businessSearchFacade.executeSearch(searchInput);
    const businessService = new BusinessService();
    await businessService.addBusinesses(searchDetails.businesses);
    await businessService.disconnect();

    // Assert
    const businesses = await prisma.business.findMany({
        include: { emails: true, location: true }
    });

    expect(businesses).toHaveLength(1);
    expect(businesses[0].title).toBe('Test Business');
    expect(businesses[0].emails).toHaveLength(1);
    expect(businesses[0].emails[0].address).toBe('test@testbusiness.com');

    // Cleanup mocks
    mockRunSearch.mockRestore();
    mockSearchEmails.mockRestore();
});


test.only('Simulate many concurrent searches', async () => {
    // Arrange
    const apiToken = 'fake-apify-token';
    const actorId = 'fake-actor-id';
    const emailApiKey = 'fake-email-api-key';
    const businessSearchFacade = BusinessSearchFactory.createBusinessSearchFacade({ apiToken, actorId, emailApiKey });

    const searchInputs = [
        {
            searchStringsArray: ['restaurant near London'],
            locationQuery: 'London',
            maxCrawledPlacesPerSearch: 5,
            language: 'en',
            deeperCityScrape: false,
            searchMatching: 'partial',
            placeMinimumStars: '4',
            skipClosedPlaces: true,
            website: ''
        },
        {
            searchStringsArray: ['pizza near New York'],
            locationQuery: 'New York',
            maxCrawledPlacesPerSearch: 5,
            language: 'en',
            deeperCityScrape: false,
            searchMatching: 'exact',
            placeMinimumStars: '3',
            skipClosedPlaces: true,
            website: ''
        },
        // Add more search inputs as needed
    ];

    // Define mock search results for each invocation
    const searchResults = [
        [
            {
                title: 'Test Business 1',
                price: '£20-30',
                website: 'https://testbusiness1.com',
                phoneUnformatted: '+441234567890',
                location: { lat: 51.5074, lng: -0.1278 },
                state: 'Test State 1',
            }
        ],
        [
            {
                title: 'Test Business 2',
                price: '£20-30',
                website: 'https://testbusiness2.com',
                phoneUnformatted: '+441234567891',
                location: { lat: 40.7128, lng: -74.006 },
                state: 'Test State 2',
            }
        ]
    ];

    // Define mock email results for each invocation
    const emailResults = [
        ['test1@testbusiness.com'],
        ['test2@testbusiness.com']
    ];

    // Create mocks using the dynamic data for each search
    const mocks = createMocks({
        businessSearchFacade,
        searchResults,
        emailResults
    });

    // Act - Run all searches concurrently using PromisePool for better control
    const { results } = await PromisePool
        .withConcurrency(5) // Adjust concurrency level as needed
        .for(searchInputs)
        .process(async (searchInput) => {
            return businessSearchFacade.executeSearch(searchInput);
        });

    await PromisePool
        .withConcurrency(5) // Adjust concurrency level as needed
        .for(results)
        .process(async (searchDetails) => {
            const businessService = new BusinessService();
            return businessService.addBusinesses(searchDetails.businesses);
        });

    // Assert
    const businesses = await prisma.business.findMany({
        include: { emails: true, location: true }
    });

    // Assertions for the first search result
    const businesses1 = await prisma.business.findMany({
        where: { title: 'Test Business 1' },
        include: { emails: true }
    });

    expect(businesses1).toHaveLength(1);
    expect(businesses1[0].emails[0].address).toBe('test1@testbusiness.com');

    // Assertions for the second search result
    const businesses2 = await prisma.business.findMany({
        where: { title: 'Test Business 2' },
        include: { emails: true }
    });

    expect(businesses2).toHaveLength(1);
    expect(businesses2[0].emails[0].address).toBe('test2@testbusiness.com');

    // Restore mocks after test
    mocks.restoreMocks();
});