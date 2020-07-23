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
exports.queryRefreshToken = exports.lookupRefreshToken = exports.loadConfig = void 0;
const debug_1 = __importDefault(require("debug"));
const core_1 = require("../core");
const debug = debug_1.default('feathers-refresh-token');
exports.loadConfig = (app) => {
    // get default authentication config key
    const defaultAuthKey = app.get('defaultAuthentication');
    // get authentication configs
    const { entity: userEntity, entityId: userEntityId, 'refresh-token': config } = app.get(defaultAuthKey);
    if (!userEntity || !defaultAuthKey) {
        throw new Error(`Missing default Authentication and user entity config!`);
    }
    debug(`Refresh token config from config file`, config);
    // merge default options and options loaded from config
    const finalOptions = Object.assign(Object.assign(Object.assign({}, core_1.defaultOptions), { authService: defaultAuthKey, userEntityId: userEntityId ? userEntityId : 'id', userEntity }), config);
    debug(`Returning final options for refresh token`, finalOptions);
    return finalOptions;
};
// used this hook with authentication service
exports.lookupRefreshToken = (hook, params) => __awaiter(void 0, void 0, void 0, function* () {
    const { app } = hook;
    const { userId, deviceId, isValid, refreshToken } = params;
    const config = exports.loadConfig(app);
    const entityService = app.service(config.service);
    if (!entityService) {
        return null;
    }
    let query = {
        userId: `${userId}`,
        isValid: isValid ? isValid : true
    };
    if (refreshToken) {
        query = Object.assign(Object.assign({}, query), { refreshToken });
    }
    if (deviceId) {
        query = Object.assign(Object.assign({}, query), { deviceId });
    }
    const existingToken = yield entityService.find({
        query
    });
    debug(`Refresh token lookup result %O`, existingToken);
    if (existingToken.total > 0) {
        const data = existingToken.data[0];
        return data;
    }
    return null;
});
// used this hook with authentication service
exports.queryRefreshToken = (app, params) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, deviceId, isValid, refreshToken } = params;
    const config = exports.loadConfig(app);
    const entityService = app.service(config.service);
    if (!entityService) {
        return null;
    }
    let query = {
        userId: `${userId}`,
        isValid: isValid ? isValid : true
    };
    if (refreshToken) {
        query = Object.assign(Object.assign({}, query), { refreshToken });
    }
    if (deviceId) {
        query = Object.assign(Object.assign({}, query), { deviceId });
    }
    const existingToken = yield entityService.find({
        query
    });
    debug(`Refresh token lookup result %O`, existingToken);
    if (existingToken.total > 0) {
        const data = existingToken.data[0];
        return data;
    }
    return null;
});
//# sourceMappingURL=common.js.map