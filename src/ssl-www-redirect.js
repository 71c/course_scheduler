function sslwwwRedirect(useWWW) {
    var checkWWW = useWWW ?
        req => req.subdomains.length === 0 : // no www
        req => req.subdomains.length === 1 && req.subdomains[0] === 'www'; // there is www
    var changeWWW = useWWW ? 
        req => 'https://www.' + req.headers.host + req.originalUrl : // add www back
        req => 'https://' + req.headers.host.slice(4) + req.originalUrl; // remove www
    return function(req, res, next) {
        if (req.hostname === 'localhost' || process.env.NODE_ENV === 'development')
            // don't redirect if http://localhost or development
            next();
        else if (checkWWW(req))
            res.redirect(301, changeWWW(req));
        else if ((req.headers['x-forwarded-proto'] || req.protocol) === 'https')
            // uses https and there is no www; don't redirect
            next();
        else
            // using http; redirect to use https
            res.redirect(301, 'https://' + req.headers.host + req.originalUrl);
    };
}

module.exports = sslwwwRedirect;
