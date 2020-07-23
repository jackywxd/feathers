import { HookContext, Application } from '@feathersjs/feathers';
import { RefreshTokenOptions, RefreshTokenData } from '../core';
export declare const loadConfig: (app: Application) => RefreshTokenOptions;
export declare const lookupRefreshToken: (hook: HookContext, params: Partial<RefreshTokenData>) => Promise<RefreshTokenData | null>;
export declare const queryRefreshToken: (app: Application, params: Partial<RefreshTokenData>) => Promise<RefreshTokenData | null>;
