import { ApifyGoogleSearch } from './ApifyGoogleSearch';
import { EmailSearcher } from './EmailSearcher';
import { BusinessSearchFacade } from './BusinessSearchFacade';

/**
 * Factory to create an instance of the BusinessSearchFacade.
 */
export class BusinessSearchFactory {
    public static createBusinessSearchFacade({ apiToken, actorId, emailApiKey }: { apiToken: string, actorId: string, emailApiKey: string }): BusinessSearchFacade {
        const apifyGoogleSearch = new ApifyGoogleSearch(apiToken, actorId);
        const emailSearcher = new EmailSearcher(emailApiKey);
        return new BusinessSearchFacade(apifyGoogleSearch, emailSearcher);
    }
}
