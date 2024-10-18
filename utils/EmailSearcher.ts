import axios, { AxiosError } from 'axios';

interface APIErrorResponse {
    error_explained?: string;
}

export class EmailSearcher {
    private API_KEY: string;

    /**
     * Create an instance of EmailSearcher.
     * @param {string} apiKey - The API key for authenticating requests.
     */
    constructor(apiKey: string) {
        this.API_KEY = apiKey;
    }

    /**
     * Search for emails by domain using the AnyMailFinder API.
     * @param {string} domain - The domain to search emails for.
     * @returns {Promise<string[]>} - Returns a list of emails found.
     * @throws {Error} - Throws an error if the request fails or no emails are found.
     */
    public async searchEmailsByDomain(domain: string): Promise<string[]> {
        try {
            console.log(`Searching for emails associated with domain: ${domain}`);
            const response = await axios.post('https://api.anymailfinder.com/v5.0/search/company.json',
                { domain },
                {
                    headers: {
                        'Authorization': `Bearer ${this.API_KEY}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            // Check if there are results and return the list of emails
            const emails = response.data.results?.emails;
            if (!emails || emails.length === 0) {
                console.warn('No emails found for the specified domain.');
                throw new Error('No emails found for the specified domain.');
            }

            console.log('Emails successfully retrieved.');
            return emails;
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                const axiosError = error as AxiosError<APIErrorResponse>;

                if (axiosError.response) {
                    const errorData = axiosError.response.data;
                    const errorMessage = errorData?.error_explained || 'An error occurred while fetching emails';
                    console.error(`API Error: ${errorMessage}`);
                    throw new Error(`API Error: ${errorMessage}`);
                } else if (axiosError.request) {
                    console.error('Network Error: No response received from the server.');
                    throw new Error('Network Error: No response received from the server');
                } else {
                    console.error(`Request Error: ${axiosError.message}`);
                    throw new Error(`Error: ${axiosError.message}`);
                }
            } else {
                console.error('An unknown error occurred.');
                throw new Error('An unknown error occurred');
            }
        }
    }
}

// // Example usage
// const apiKey: string = 'Me5acp2Nwnx16HKEFHLf476s'; // Replace with your actual API key
// const emailSearcher = new EmailSearcher(apiKey);

// async function runEmailSearch() {
//   try {
//     const emails = await emailSearcher.searchEmailsByDomain('example.com');
//     console.log('Emails:', emails);
//   } catch (error) {
//     console.error('Error:', error.message);
//   }
// }

// runEmailSearch();
