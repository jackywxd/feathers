"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
config options for refresh-token
secret: The JWT signing secret.
service: The path of the entity service
entity: The name of the field that will contain the entity after successful authentication. Will also be used to set params[entity] (usually params.user) when using the authenticate hook. Can be null if no entity is used (see stateless tokens).
entityId: The id property of an entity object. Only necessary if the entity service does not have an id property (e.g. when using a custom entity service).
jwtOptions: All options available for the node-jsonwebtoken package
*/
exports.default = {
    secret: 'super secret',
    service: 'refresh-tokens',
    entity: 'refreshToken',
    entityId: 'id',
    jwtOptions: {
        header: { typ: 'refresh' },
        audience: 'https://yourdomain.com',
        issuer: 'feathers',
        algorithm: 'HS256',
        expiresIn: '360d' //default expiration settings after 360 days
    }
};
//# sourceMappingURL=options.js.map