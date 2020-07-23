interface AuthOptions {
    authService: string;
    userEntity: string;
    userEntityId: string;
    entityId: IdField;
}
declare type IdField = 'id' | '_id';
declare type DBIdField = {
    [K in IdField]: string;
};
export declare const defaultOptions: {
    service: string;
    entity: string;
    entityId: string;
    secret: string;
    jwtOptions: {
        header: {
            typ: string;
        };
        audience: string;
        issuer: string;
        algorithm: string;
        expiresIn: string;
    };
};
export declare type RefreshTokenData = {
    id: string;
    _id: string;
    userId: string;
    refreshToken: string;
    isValid: boolean;
    deviceId: string;
    location: string;
    loginTime: string;
};
export declare type RefreshTokenOptions = typeof defaultOptions & AuthOptions & DBIdField;
export {};
