const { ApifyClient } = require('apify-client');
const axios = require('axios');
const { pick } = require('lodash')

// Define your API key
const API_KEY = 'Me5acp2Nwnx16HKEFHLf476s';

// Perform an email search by domain
async function searchEmailsByDomain(domain) {
    try {
        const response = await axios.post('https://api.anymailfinder.com/v5.0/search/company.json', {
            domain
        }, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        // Display the response
        console.log('Emails found:', response.data.results.emails);

        return response.data.results.emails
    } catch (error) {
        if (error.response) {
            // Handle the error response
            console.error('Error:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
}

// Example usage
// const domain = 'example.com'; // Replace with the actual domain
// searchEmailsByDomain(domain);


// Initialize the ApifyClient with API token
const client = new ApifyClient({
    token: 'apify_api_YwxRzG3WbPAnJ9gsQFyPWskrUW3AJq0U25Mo',
});

// Prepare Actor input
const input = {
    "searchStringsArray": [
        "restaurant"
    ],
    "locationQuery": "New York, USA",
    "maxCrawledPlacesPerSearch": 50,
    "language": "en",
    "deeperCityScrape": false,
    "searchMatching": "all",
    "placeMinimumStars": "",
    "skipClosedPlaces": true,
    "website": "allPlaces"
};

(async () => {

    console.log('----88----');
    console.log('====88====');


    try {
        //     // Run the Actor and wait for it to finish
        const run = await client.actor("2Mdma1N6Fd0y3QEjR").call(input);

        // // Fetch and print Actor results from the run's dataset (if any)
        // console.log('Results from dataset');
        const { items } = await client.dataset(run.defaultDatasetId).listItems();


        // title: "Corrado's Cucina",
        // price: '$50–100',
        // categoryName: 'Italian restaurant',
        // address: '831 Arthur Kill Rd, Staten Island, NY 10312',
        // neighborhood: null,
        // street: '831 Arthur Kill Rd',
        // city: 'Staten Island',
        // postalCode: '10312',
        // state: 'New York',
        // countryCode: 'US',
        // website: 'http://www.corradoscucina.com/',
        // phone: '(347) 562-4102',
        // phoneUnformatted: '+13475624102',
        // claimThisBusiness: false,
        // location: { lat: 40.5610658, lng: -74.1686486 },

        items.forEach((item) => {
            console.dir(pick(item, ['title', 'price', 'website', 'phoneUnformatted', 'location', 'state']));
        }); 

    } catch (error) {
        console.log('----99----');
        console.log(error);
        console.log('====99====');
    }
})();