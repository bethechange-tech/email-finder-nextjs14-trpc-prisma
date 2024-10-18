const { ApifyClient } = require('apify-client');

// Initialize the ApifyClient with API token
const client = new ApifyClient({
    token: 'apify_api_YwxRzG3WbPAnJ9gsQFyPWskrUW3AJq0U25Mo',
});

// Prepare Actor input
const input = {
    "startUrls": [
        {
            "url": "https://www.airbnb.com/s/Europe/homes?tab_id=home_tab&refinement_paths%5B%5D=%2Fhomes&flexible_trip_lengths%5B%5D=one_week&monthly_start_date=2024-07-01&monthly_length=3&monthly_end_date=2024-10-01&price_filter_input_type=0&channel=EXPLORE&price_min=27&search_type=filter_change&price_max=266&min_beds=2&min_bedrooms=2&min_bathrooms=2&price_filter_num_nights=34&place_id=ChIJhdqtz4aI7UYRefD8s-aZ73I&date_picker_type=calendar&checkin=2024-06-13&checkout=2024-07-17&adults=1&children=1&infants=1&pets=1&source=structured_search_input_header&query=Europe&search_mode=regular_search&room_types%5B%5D=Entire%20home%2Fapt"
        }
    ],
    "locationQueries": []
};

(async () => {
    // Run the Actor and wait for it to finish
    const run = await client.actor("GsNzxEKzE2vQ5d9HN").call(input);

    // Fetch and print Actor results from the run's dataset (if any)
    console.log('Results from dataset');
    const { items } = await client.dataset(run.defaultDatasetId).listItems();
   console.log('----99----');
   console.log( items[0]);
   console.log('====99====');
    // items.forEach((item) => {
    //     console.dir(item);
    // });
})();