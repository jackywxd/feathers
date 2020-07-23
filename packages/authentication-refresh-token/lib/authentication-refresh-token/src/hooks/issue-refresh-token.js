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
exports.issueRefreshToken = void 0;
const common_1 = require("./common");
const debug_1 = __importDefault(require("debug"));
const debug = debug_1.default('feathers-refresh-token');
// After hook with authentication service
// result - authResult which will return to user, contains access token, sub and strategy
/*
 service - refresh token service
 entity - entity name of refresh token service
 options - refresh token JWT options
 userIdField - user ID filed in database, i.e. subject field in JWT, used to look up refresh token
*/
exports.issueRefreshToken = () => {
    return (context) => __awaiter(void 0, void 0, void 0, function* () {
        const { app, result } = context;
        debug(`Issue Refresh token with auth result`, result);
        const { entity: refreshTokenEntity, entityId: refreshTokenEntityId, service: refreshTokenEntityService, userEntity, userEntityId, authService, secret, jwtOptions } = common_1.loadConfig(app);
        let userId;
        const user = result[userEntity];
        if (user) {
            userId = user[userEntityId];
        }
        else {
            // userEntityId must be presented in result
            debug(`${userEntityId} doesn't exist in auth result`, result);
            return context;
        }
        const entityService = app.service(refreshTokenEntityService);
        const existingToken = yield common_1.lookupRefreshToken(context, { userId });
        debug(`existing token`, existingToken);
        // if refresh token already exists, simply return
        if (existingToken) {
            Object.assign(result, {
                [refreshTokenEntity]: existingToken[refreshTokenEntityId]
            });
            return context;
        }
        // Use authentication service to generate the refresh token with user ID
        const refreshToken = yield app.service(authService).createAccessToken({
            sub: userId // refresh token subject is the user ID
        }, jwtOptions, // refresh token options
        secret // refresh token secret, should be different than access token
        );
        // save the refresh token
        const token = yield entityService.create({
            refreshToken,
            userId,
            isValid: true
        });
        debug(`Token ID and refresh token`, token, refreshToken);
        // return refresh token in result
        Object.assign(result, { [refreshTokenEntity]: refreshToken });
        return context;
    });
};
//# sourceMappingURL=issue-refresh-token.js.map