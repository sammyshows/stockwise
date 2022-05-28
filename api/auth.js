import { NetlifyJwtVerifier, removeNamespaces, claimToArray } from '@serverless-jwt/netlify';

const verifyJwt = NetlifyJwtVerifier({
    issuer: process.env.JWT_ISSUER,
    audience: process.env.JWT_AUDIENCE,
    // USE THE BELOW TO CHECK USER ROLES

    mapClaims: (claims) => {
        const user = claims;
        user.scope = claimToArray(user.scope);
        return user;
    }
});

/**
 * Require the request to be authenticated.
 */
module.exports.requireAuth = verifyJwt;