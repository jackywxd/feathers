import { Params } from '@feathersjs/feathers';
import { NotAuthenticated, BadRequest } from '@feathersjs/errors';
import Debug from 'debug';
// import { IncomingMessage, ServerResponse } from 'http';
import {
  AuthenticationService,
  AuthenticationRequest
} from '../../authentication';
import defaultOptions from './options';
import { RefreshTokenData, RefreshTokenOptions } from './core';

// import { queryRefreshToken } from './hooks/common';

const debug = Debug('@feathersjs/authentication/refresh-token');

export class RefreshTokenAuthenticationService extends AuthenticationService {
  /**
   * Return the current configuration from the application
   */
  get configuration() {
    // Always returns a copy of the authentication configuration
    return Object.assign(
      {},
      { 'refresh-token': defaultOptions },
      super.configuration
    );
  }

  // Internal method to query refresh-token from refreshToken entity service
  // used by create/remove/patch
  // params: query params
  async queryRefreshToken(params: Params) {
    const {
      'refresh-token': { service }
    }: { 'refresh-token': RefreshTokenOptions } = this.configuration;
    const entityService = this.app.service(service);

    if (!entityService) {
      throw new Error(`No refresh token entity service is configured!`);
    }

    // TODO: figure out how to handle the situation when query returns multiple results
    // now simply return the first record
    const existingToken = await entityService.find(params);

    if (Array.isArray(existingToken)) {
      if (existingToken.length > 0) return existingToken[0] as RefreshTokenData;
      else return null;
    }

    // if refresh token already exists, simply return
    if (existingToken && existingToken.total > 0 && existingToken.data) {
      return existingToken.data[0] as RefreshTokenData;
    }
    return null;
  }

  /**
   * Create and return a new JWT along with refreshToken for a given authentication request.
   * Will trigger the `login` event.
   * @param data The authentication request (should include `strategy` key)
   * @param params Service call parameters
   */
  async create(data: AuthenticationRequest, params: Params) {
    const authResult = await super.create(data, params);

    const {
      entity: userEntity,
      entityId: userEntityId,
      'refresh-token': { service, secret, jwtOptions }
    } = this.configuration;

    let userId;
    const user = authResult[userEntity];
    if (user) {
      userId = userEntityId ? user[userEntityId] : user['id'];
    } else {
      // userEntityId must be presented in result
      debug(`${userEntityId} doesn't exist in auth result`, authResult);
      throw new Error(`Could not find user ID`);
    }

    const entityService = this.app.service(service);

    if (!entityService) {
      throw new Error(`No refresh token entity service is configured!`);
    }

    const existingToken = await this.queryRefreshToken({
      query: { userId, isValid: true }
    });

    debug(`existing token`, existingToken);

    // if refresh token already exists, simply return
    if (existingToken) {
      Object.assign(authResult, {
        refreshToken: existingToken.refreshToken
      });
      return authResult;
    }
    // Generate the refresh token with sub set to user ID
    const refreshToken = await this.createAccessToken(
      {
        sub: userId // refresh token subject is the user ID
      },
      jwtOptions, // refresh token options
      secret // refresh token secret, should be different than access token
    );

    // save the refresh token
    await entityService.create({
      refreshToken, // could be hashed like password prior saving to DB to make it more secure
      userId,
      isValid: true
    });

    debug(`Token ID and refresh token`, refreshToken);
    return Object.assign({}, { refreshToken }, authResult);
  }

  /**
   * Mark a JWT as removed and delete the refreshToken (revoked). By default only verifies the JWT and returns the result.
   * // TODO: soft delete instead of hard delete? Is there any use-case that may need to query revoked refresh-token?
   * Triggers the `logout` event.
   * @param id The JWT to remove or null
   * @param params Service call parameters
   */
  async remove(id: string | null, params: Params) {
    // must reset query or it will be used to query user entity
    let query;
    if (params.query) {
      query = { ...params.query };
      params.query = {};
    }

    const authResult = await super.remove(id, params);

    const {
      entity: userEntity,
      entityId: userEntityId,
      'refresh-token': { entity, entityId, service }
    } = this.configuration;

    let userId;
    const user = authResult[userEntity];
    if (user) {
      userId = userEntityId ? user[userEntityId] : user['id'];
    } else {
      // userEntityId must be presented in result
      debug(`${userEntityId} doesn't exist in auth result`, authResult);
      throw new Error(`Could not find user ID`);
    }
    const entityService = this.app.service(service);

    debug('Logout hook id and params', params);

    // TODO: decide expected behavior in case query string missing: throw error or simply return authResult
    if (!query) {
      return authResult;
      throw new BadRequest(`Invalid query strings!`);
    }
    if (!query[entity]) throw new BadRequest(`Bad request`);

    if (!entityService) {
      throw new Error(`No refresh token entity service is configured!`);
    }

    const existingToken = await this.queryRefreshToken({
      query: { userId, isValid: true, refreshToken: query[entity] }
    });

    if (existingToken) {
      // get the refresh-token ID
      const tokenId = existingToken[entityId as 'id' | '_id'];

      if (tokenId === null || tokenId === undefined) {
        throw new Error('Invalid refresh token!');
      }
      debug('Deleting token id', tokenId);

      await this.app.service(service).remove(tokenId);

      return authResult;
    }
    throw new NotAuthenticated();
  }

  /**
   * Refresh access-token with valid refresh-token. Returns new access-token
   * @param id  Not used
   * @param data The userId and refresh-token
   * @param params not used
   */
  async patch(id: string | null, data: any, params: Params) {
    debug('Refreshing access-token in patch', data, params, id);

    const {
      entityId: userEntityId,
      'refresh-token': { entity, jwtOptions, secret }
    } = this.configuration;

    const { [userEntityId]: userId, [entity]: refreshToken } = data;

    if (!userId || !refreshToken) {
      throw new BadRequest(`Bad request`);
    }

    const existingToken = await this.queryRefreshToken({
      query: { userId, isValid: true, refreshToken: data[entity] }
    });

    if (existingToken) {
      // Use refresh-token jwtOptions and secret verify refresh-token
      const tokenVerifyResult = await this.verifyAccessToken(
        existingToken.refreshToken,
        jwtOptions,
        secret
      );

      // userId must match the sub in Refresh Token
      if (`${tokenVerifyResult.sub}` !== `${userId}`) {
        throw new Error(`Invalid token`);
      }
      debug('Creating new access token');
      // create new access-token, use authentication default jwtOptions and secret
      const accessToken = await this.createAccessToken({
        sub: userId // set JWT subject to userId
      });

      debug('Issued new access token', accessToken);

      const result = {
        accessToken
      };
      return result;
    }
    throw new NotAuthenticated();
  }

  // Validate refresh-token options, pretty much the same checking as authentication service
  // Used by setup()
  validateRefreshTokenOptions() {
    const {
      'refresh-token': { secret, service, entity, entityId }
    } = this.configuration;

    if (typeof secret !== 'string') {
      throw new Error(
        `A 'secret' must be provided in your refresh-token authentication configuration`
      );
    }

    if (entity !== null) {
      if (service === undefined) {
        throw new Error(
          `The 'service' option is not set in the refresh-token authentication configuration`
        );
      }

      if (this.app.service(service) === undefined) {
        throw new Error(`The 'refresh-token' entity service does not exist`);
      }

      if (
        this.app.service(service).id === undefined &&
        entityId === undefined
      ) {
        throw new Error(
          `The '${service}' service does not have an 'id' property and no 'entityId' option is set.`
        );
      }
    }
  }

  /**
   * Validates the refresh token service configuration.
   */
  setup() {
    super.setup();
    this.validateRefreshTokenOptions();
  }
}
