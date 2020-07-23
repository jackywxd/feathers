import Debug from 'debug';
import { Params } from '@feathersjs/feathers';

import { JWTStrategy } from '../../authentication/src/jwt';

const debug = Debug('@feathersjs/authentication/refresh-token-jwt');

export class RefreshTokenJWTStrategy extends JWTStrategy {
  /**
   * Return the entity for a given id
   * @param id The id to use
   * @param params Service call parameters
   */
  async getEntity(id: string, params: Params) {
    // For refresh-token query, we need to reset the query or it will be set as
    // entity query
    if (params?.query?.refreshToken) {
      debug(`Resetting query for refresh token`);
      params.query = {};
    }

    return super.getEntity(id, params);
  }
}
