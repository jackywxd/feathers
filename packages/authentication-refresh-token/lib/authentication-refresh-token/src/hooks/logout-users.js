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
exports.logoutUser = void 0;
const errors_1 = require("@feathersjs/errors");
const common_1 = require("./common");
const debug_1 = __importDefault(require("debug"));
const debug = debug_1.default('@feathers-refresh-token');
exports.logoutUser = () => {
    return (context) => __awaiter(void 0, void 0, void 0, function* () {
        const { app, params } = context;
        const { service, entity, entityId, userEntityId } = common_1.loadConfig(app);
        const { query } = params;
        debug('Logout hook id and params', params);
        if (!query) {
            throw new Error(`Invalid query strings!`);
        }
        if (!query[entity] || !query[userEntityId])
            throw new errors_1.BadRequest(`Bad request`);
        const existingToken = yield common_1.lookupRefreshToken(context, {
            userId: query[userEntityId],
            refreshToken: query[entity]
        });
        debug('Find existing refresh token result', existingToken);
        if (existingToken) {
            const tokenId = existingToken[entityId];
            if (!tokenId) {
                throw new Error('Invalid refresh token!');
            }
            debug('Deleting token id', tokenId);
            const result = yield app.service(service).remove(tokenId);
            debug('Delete result', result);
            return context;
        }
        throw new errors_1.NotAuthenticated();
    });
};
//# sourceMappingURL=logout-users.js.map