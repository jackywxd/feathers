"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultOptions = void 0;
exports.defaultOptions = {
    service: 'refresh-tokens',
    entity: 'refreshToken',
    entityId: 'id',
    secret: 'supersecret',
    jwtOptions: {
        header: {
            typ: 'refresh'
        },
        audience: 'https://example.com',
        issuer: 'example',
        algorithm: 'HS256',
        expiresIn: '360d'
    }
};
//# sourceMappingURL=core.js.map