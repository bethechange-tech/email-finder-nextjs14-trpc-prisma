import { PrismaClient } from '@prisma/client';
import { PromisePool } from '@supercharge/promise-pool';

export interface BusinessData {
    title: string;
    price: string;
    website: string;
    phoneUnformatted: string;
    location: {
        lat: number;
        lng: number;
    };
    state: string | null;
    emails: string[];
    hasEmails: boolean;
}

export class BusinessService {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    /**
     * Adds multiple businesses to the database concurrently.
     * @param {BusinessData[]} businesses - The array of businesses to add.
     */
    public async addBusinesses(businesses: BusinessData[]) {
        const { results, errors } = await PromisePool
            .withConcurrency(5) // Adjust concurrency as needed
            .for(businesses)
            .process(async (business) => {
                const location = await this.createLocation(business.location.lat, business.location.lng);
                return this.createBusiness(business, location.id);
            });

        console.log(`Successfully added ${results.length} businesses.`);
        if (errors.length > 0) {
            console.error(`Failed to add ${errors.length} businesses.`);
        }


        return results
    }

    /**
     * Creates a location record in the database.
     * @param {number} lat - Latitude of the location.
     * @param {number} lng - Longitude of the location.
     * @returns {Promise<{ id: number }>} - The created location ID.
     */
    private async createLocation(lat: number, lng: number): Promise<{ id: number }> {
        return this.prisma.location.create({
            data: { lat, lng },
        });
    }

    /**
     * Creates a business record in the database and associates it with a location.
     * @param {BusinessData} business - The business data to create.
     * @param {number} locationId - The ID of the location to associate with.
     * @returns {Promise<void>}
     */
    private async createBusiness(business: BusinessData, locationId: number) {
        return this.prisma.business.create({
            data: {
                title: business.title,
                price: business.price,
                website: business.website,
                phoneUnformatted: business.phoneUnformatted,
                state: business.state,
                hasEmails: business.hasEmails,
                location: {
                    connect: { id: locationId },
                },
                emails: {
                    create: business.emails.map(email => ({ address: email })),
                },
            },
        });
    }

    /**
     * Disconnects the Prisma client.
     */
    public async disconnect(): Promise<void> {
        await this.prisma.$disconnect();
    }
}

