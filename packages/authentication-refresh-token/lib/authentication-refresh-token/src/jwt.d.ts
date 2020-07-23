import { Params } from '@feathersjs/feathers';
import { JWTStrategy } from '../../authentication/src/jwt';
export declare class RefreshTokenJWTStrategy extends JWTStrategy {
    /**
     * Return the entity for a given id
     * @param id The id to use
     * @param params Service call parameters
     */
    getEntity(id: string, params: Params): Promise<any>;
}
