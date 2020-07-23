import { Params } from '@feathersjs/feathers';
import { AuthenticationService, AuthenticationRequest } from '../../authentication';
export declare class RefreshTokenAuthenticationService extends AuthenticationService {
    /**
     * Return the current configuration from the application
     */
    get configuration(): any;
    /**
     * Create and return a new JWT for a given authentication request.
     * Will trigger the `login` event.
     * @param data The authentication request (should include `strategy` key)
     * @param params Service call parameters
     */
    create(data: AuthenticationRequest, params: Params): Promise<import("../../authentication/lib").AuthenticationResult>;
    /**
     * Mark a JWT as removed. By default only verifies the JWT and returns the result.
     * Triggers the `logout` event.
     * @param id The JWT to remove or null
     * @param params Service call parameters
     */
    remove(id: string | null, params: Params): Promise<import("../../authentication/lib").AuthenticationResult>;
    /**
     * Refresh access-token with valid refresh-token. Returns new access-token
     * @param id  Not used
     * @param data The userId and refresh-token
     * @param params not used
     */
    patch(id: string | null, data: any, params: Params): Promise<{
        accessToken: string;
    }>;
    validateRefreshTokenOptions(): void;
    /**
     * Validates the refresh token service configuration.
     */
    setup(): void;
}
