import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import prisma from '@/prisma/prisma-client';
import PromisePool from '@supercharge/promise-pool';
import { BusinessSearchFactory } from '@/utils/BusinessSearchFactory';
import { BusinessService } from '@/utils/BusinessService';

const apiToken = 'apify_api_YwxRzG3WbPAnJ9gsQFyPWskrUW3AJq0U25Mo'; // Replace with your actual API token
const actorId = '2Mdma1N6Fd0y3QEjR'; // Replace with the actual actor ID
const emailApiKey: string = 'UJhafBTZJegoeE5hGjmnWxNQ'; // Replace with your actual API key
// const emailApiKey: string = 'Me5acp2Nwnx16HKEFHLf476s'; // Replace with your actual API key

const t = initTRPC.create();

const businessSearchRouter = t.router({
    // Procedure to execute a single business search
    searchBusiness: t.procedure
        .input(
            z.object({
                searchStringsArray: z.array(z.string()),
                locationQuery: z.string(),
                maxCrawledPlacesPerSearch: z.number(),
                language: z.string(),
                deeperCityScrape: z.boolean(),
                searchMatching: z.string(),
                placeMinimumStars: z.string(),
                skipClosedPlaces: z.boolean(),
                website: z.string(), // Make website required
            })
        )
        .mutation(async ({ input }) => {
            const businessSearchFacade = BusinessSearchFactory.createBusinessSearchFacade({
                apiToken,
                actorId,
                emailApiKey,
            });

            // Perform the search
            const searchResults = await businessSearchFacade.executeSearch(input);

            // Add results to database using BusinessService
            const businessService = new BusinessService();
            await businessService.addBusinesses(searchResults.businesses);
            await businessService.disconnect();

            return searchResults.businesses;
        }),

    // Procedure to run multiple concurrent searches
    concurrentSearches: t.procedure
        .input(
            z.array(
                z.object({
                    searchStringsArray: z.array(z.string()),
                    locationQuery: z.string(),
                    maxCrawledPlacesPerSearch: z.number(),
                    language: z.string(),
                    deeperCityScrape: z.boolean(),
                    searchMatching: z.string(),
                    placeMinimumStars: z.string(),
                    skipClosedPlaces: z.boolean(),
                    website: z.string(), // Make website required
                })
            )
        )
        .mutation(async ({ input }) => {
            const businessSearchFacade = BusinessSearchFactory.createBusinessSearchFacade({
                apiToken,
                actorId,
                emailApiKey,
            });

            // Run all searches concurrently using PromisePool
            const { results } = await PromisePool.withConcurrency(5)
                .for(input)
                .process(async (searchInput) => {
                    return businessSearchFacade.executeSearch(searchInput);
                });

            const businessService = new BusinessService();
            // Add all the results to the database
            await PromisePool.withConcurrency(5)
                .for(results)
                .process(async (searchDetails) => {
                    return businessService.addBusinesses(searchDetails.businesses);
                });

            return results.map((r) => r.businesses);
        }),

    getBusinesses: t.procedure
        .input(z.object({
            limit: z.number().default(1),
            page: z.number().default(1),
        }))
        .query(async ({ input: filterQuery }) => {
            const { limit, page } = filterQuery;
            const take = limit || 10;
            const skip = (page - 1) * limit;

            return prisma.business.findMany({
                include: { emails: true, location: true },
                skip,
                take,
            });
        }),
});

export type BusinessSearchRouter = typeof businessSearchRouter;
export default businessSearchRouter