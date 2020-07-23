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
exports.RefreshTokenJWTStrategy = void 0;
const debug_1 = __importDefault(require("debug"));
const jwt_1 = require("../../authentication/src/jwt");
const debug = debug_1.default('@feathersjs/authentication/refresh-token-jwt');
class RefreshTokenJWTStrategy extends jwt_1.JWTStrategy {
    /**
     * Return the entity for a given id
     * @param id The id to use
     * @param params Service call parameters
     */
    getEntity(id, params) {
        const _super = Object.create(null, {
            getEntity: { get: () => super.getEntity }
        });
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            // For refresh-token query, we need to reset the query or it will be set as
            // entity query
            if ((_a = params === null || params === void 0 ? void 0 : params.query) === null || _a === void 0 ? void 0 : _a.refreshToken) {
                debug(`Resetting query for refresh token`);
                params.query = {};
            }
            return _super.getEntity.call(this, id, params);
        });
    }
}
exports.RefreshTokenJWTStrategy = RefreshTokenJWTStrategy;
//# sourceMappingURL=jwt.js.map