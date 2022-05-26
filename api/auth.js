import { NetlifyJwtVerifier, removeNamespaces, claimToArray } from '@serverless-jwt/netlify';

const verifyJwt = NetlifyJwtVerifier({
    issuer: process.env.JWT_ISSUER,
    audience: process.env.JWT_AUDIENCE
});

/**
 * Require the request to be authenticated.
 */
module.exports.requireAuth = verifyJwt;