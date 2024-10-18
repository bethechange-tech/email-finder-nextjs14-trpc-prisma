interface Location {
    lat: number;
    lng: number;
}

interface AdditionalInfo {
    'Service options': Array<{ [key: string]: any }>;
    Highlights: Array<{ [key: string]: any }>;
    'Popular for': Array<{ [key: string]: any }>;
    Offerings: Array<{ [key: string]: any }>;
    'Dining options': Array<{ [key: string]: any }>;
    Amenities: Array<{ [key: string]: any }>;
    Atmosphere: Array<{ [key: string]: any }>;
    Crowd: Array<{ [key: string]: any }>;
    Payments: Array<{ [key: string]: any }>;
    Parking: Array<{ [key: string]: any }>;
}

export interface Restaurant {
    searchString: string;
    rank: number;
    searchPageUrl: string;
    isAdvertisement: boolean;
    title: string;
    price: string;
    categoryName: string;
    address: string;
    neighborhood: string;
    street: string;
    city: string;
    postalCode: string;
    state: string;
    countryCode: string;
    website: string;
    phone: string;
    phoneUnformatted: string;
    claimThisBusiness: boolean;
    location: Location;
    totalScore: number;
    permanentlyClosed: boolean;
    temporarilyClosed: boolean;
    placeId: string;
    categories: string[];
    fid: string;
    cid: string;
    reviewsCount: number;
    imagesCount: number;
    imageCategories: string[];
    scrapedAt: string;
    googleFoodUrl: string | null;
    hotelAds: string[];
    openingHours: string[];
    peopleAlsoSearch: string[];
    placesTags: string[];
    reviewsTags: string[];
    additionalInfo: AdditionalInfo;
    gasPrices: string[];
    url: string;
    imageUrl: string;
}
