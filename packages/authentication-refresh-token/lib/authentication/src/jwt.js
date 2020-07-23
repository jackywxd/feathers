"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWTStrategy = void 0;
const debug_1 = __importDefault(require("debug"));
const omit_1 = __importDefault(require("lodash/omit"));
const errors_1 = require("@feathersjs/errors");
// @ts-ignore
const long_timeout_1 = __importDefault(require("long-timeout"));
const strategy_1 = require("./strategy");
const debug = debug_1.default('@feathersjs/authentication/jwt');
const SPLIT_HEADER = /(\S+)\s+(\S+)/;
class JWTStrategy extends strategy_1.AuthenticationBaseStrategy {
    constructor() {
        super(...arguments);
        this.expirationTimers = new WeakMap();
    }
    get configuration() {
        const authConfig = this.authentication.configuration;
        const config = super.configuration;
        return Object.assign({ entity: authConfig.entity, service: authConfig.service, header: 'Authorization', schemes: ['Bearer', 'JWT'] }, config);
    }
    handleConnection(event, connection, authResult) {
        return __awaiter(this, void 0, void 0, function* () {
            const isValidLogout = event === 'logout' && connection.authentication && authResult &&
                connection.authentication.accessToken === authResult.accessToken;
            const { accessToken } = authResult || {};
            if (accessToken && event === 'login') {
                debug('Adding authentication information to connection');
                const { exp } = yield this.authentication.verifyAccessToken(accessToken);
                // The time (in ms) until the token expires
                const duration = (exp * 1000) - Date.now();
                // This may have to be a `logout` event but right now we don't want
                // the whole context object lingering around until the timer is gone
                const timer = long_timeout_1.default.setTimeout(() => this.app.emit('disconnect', connection), duration);
                debug(`Registering connection expiration timer for ${duration}ms`);
                long_timeout_1.default.clearTimeout(this.expirationTimers.get(connection));
                this.expirationTimers.set(connection, timer);
                debug('Adding authentication information to connection');
                connection.authentication = {
                    strategy: this.name,
                    accessToken
                };
            }
            else if (event === 'disconnect' || isValidLogout) {
                debug('Removing authentication information and expiration timer from connection');
                const { entity } = this.configuration;
                delete connection[entity];
                delete connection.authentication;
                long_timeout_1.default.clearTimeout(this.expirationTimers.get(connection));
                this.expirationTimers.delete(connection);
            }
        });
    }
    verifyConfiguration() {
        const allowedKeys = ['entity', 'service', 'header', 'schemes'];
        for (const key of Object.keys(this.configuration)) {
            if (!allowedKeys.includes(key)) {
                throw new Error(`Invalid JwtStrategy option 'authentication.${this.name}.${key}'. Did you mean to set it in 'authentication.jwtOptions'?`);
            }
        }
        if (typeof this.configuration.header !== 'string') {
            throw new Error(`The 'header' option for the ${this.name} strategy must be a string`);
        }
    }
    /**
     * Return the entity for a given id
     * @param id The id to use
     * @param params Service call parameters
     */
    getEntity(id, params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { entity } = this.configuration;
            const entityService = this.entityService;
            debug('Getting entity', id);
            if (entityService === null) {
                throw new errors_1.NotAuthenticated(`Could not find entity service`);
            }
            const result = yield entityService.get(id, omit_1.default(params, 'provider', 'query'));
            if (!params.provider) {
                return result;
            }
            return entityService.get(id, Object.assign(Object.assign({}, params), { [entity]: result }));
        });
    }
    getEntityId(authResult, _params) {
        return __awaiter(this, void 0, void 0, function* () {
            return authResult.authentication.payload.sub;
        });
    }
    authenticate(authentication, params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { accessToken } = authentication;
            const { entity } = this.configuration;
            if (!accessToken) {
                throw new errors_1.NotAuthenticated('No access token');
            }
            const payload = yield this.authentication.verifyAccessToken(accessToken, params.jwt);
            const result = {
                accessToken,
                authentication: {
                    strategy: 'jwt',
                    accessToken,
                    payload
                }
            };
            if (entity === null) {
                return result;
            }
            const entityId = yield this.getEntityId(result, params);
            const value = yield this.getEntity(entityId, params);
            return Object.assign(Object.assign({}, result), { [entity]: value });
        });
    }
    parse(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { header, schemes } = this.configuration;
            const headerValue = req.headers && req.headers[header.toLowerCase()];
            if (!headerValue || typeof headerValue !== 'string') {
                return null;
            }
            debug('Found parsed header value');
            const [, scheme, schemeValue] = headerValue.match(SPLIT_HEADER) || [];
            const hasScheme = scheme && schemes.some(current => new RegExp(current, 'i').test(scheme));
            if (scheme && !hasScheme) {
                return null;
            }
            return {
                strategy: this.name,
                accessToken: hasScheme ? schemeValue : headerValue
            };
        });
    }
}
exports.JWTStrategy = JWTStrategy;
//# sourceMappingURL=jwt.js.map