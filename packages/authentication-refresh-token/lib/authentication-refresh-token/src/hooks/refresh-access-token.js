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
exports.refreshAccessToken = void 0;
const errors_1 = require("@feathersjs/errors");
const debug_1 = __importDefault(require("debug"));
const common_1 = require("./common");
const debug = debug_1.default('@feathers-refresh-token');
// Before create hook refresh token service to refresh access token
// data: post data with sub and refresh token
exports.refreshAccessToken = () => {
    return (context) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        const { data, app, params } = context;
        // for internal call, simply return context
        if (!params.provider) {
            debug('Internal call for refresh token, simply return context');
            return context;
        }
        const { entity, userEntityId, authService, jwtOptions, secret } = common_1.loadConfig(app);
        [entity, userEntityId].forEach((p) => {
            if (p in data)
                return;
            throw new errors_1.BadRequest(`${p} is missing from request`);
        });
        const existingToken = yield yield common_1.lookupRefreshToken(context, {
            userId: data[userEntityId],
            refreshToken: data[entity]
        });
        debug('Find existing refresh token result', existingToken);
        // Refresh token exists
        if (existingToken) {
            debug('Validating refresh token');
            // validate refresh token
            const tokenVerifyResult = yield ((_a = app
                .service(authService)) === null || _a === void 0 ? void 0 : _a.verifyAccessToken(existingToken.refreshToken, jwtOptions, secret));
            debug('Verify Refresh Token result', tokenVerifyResult);
            // Input data[userIdFiled] must match the sub in Refresh Token
            if (`${tokenVerifyResult.sub}` !== data[userEntityId]) {
                throw new Error(`Invalid token`);
            }
            debug('Creating new access token');
            const accessToken = yield ((_b = app.service(authService)) === null || _b === void 0 ? void 0 : _b.createAccessToken({
                [userEntityId]: data[userEntityId]
            }));
            debug('Issued new access token', accessToken);
            context.result = {
                [entity]: data[entity],
                [userEntityId]: data[userEntityId],
                accessToken
            };
            return context;
        }
        throw new errors_1.NotAuthenticated();
    });
};
//# sourceMappingURL=refresh-access-token.js.map