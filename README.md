# Nuxt + Netlify Functions

## Setup
First things first, if you haven't already, install the Netlify CLI:
```bash
npm install netlify-cli -g
```

To run the netlify proxy server locally, use
```bash
ntl dev
```

This will allow you to make calls to your Netlify Functions in a production-like environment locally.


## Calling the functions

Calling a function works by making a fetch call to the serverless function via its file name. Making a `GET` request is 
simple as you only need the url. However, when passing params to use in the serverless function, you
must make it a `POST` call by adding an object after the url and including in it the method (POST) and also
the body. Here you can add your params by key-value. Make sure you `JSON.stringify()` it so that it can be
interpreted by the function.

## Redirects

The common path for calling these functions is `/.netlify/functions/:api`, however in this case I've added redirect 
rules so that making a call to `/api/:api` works just the same. The same rule is declared in two places - once in the 
`netlify.toml` file and again in a `_redirects` file found in the public folder.

The reason it's declared in two places is that the `netlify.toml` can be used locally but not on the server side and 
vice-versa for the `_redirects` rule.