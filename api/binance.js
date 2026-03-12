import crypto from "crypto";

function signed ( method )
{
    return !(
        method.includes( "ticker/price" ) ||
        method.includes( "/exchangeInfo" ) ||
        method.includes( "/depth" )
    );
}

export default async function handler ( req, res )
{
    try
    {
        const input = req.method === "POST" ? req.body : req.query;

        const {
            method,
            key = null,
            secret = null,
            http_method = req.method,
            exchange_domain = "binance.us",
            ...params
        } = input;

        if ( !method )
        {
            return res.status( 400 ).json( { error: "method parameter required" } );
        }

        let host = "api";
        if ( method.startsWith( "/dapi" ) ) host = "dapi";
        if ( method.startsWith( "/fapi" ) ) host = "fapi";

        let url = `https://${host}.${exchange_domain}${method}`;

        const query = new URLSearchParams( params );

        query.delete( "method" );
        query.delete( "key" );
        query.delete( "secret" );
        query.delete( "http_method" );
        query.delete( "exchange_domain" );

        if ( signed( method ) )
        {
            const timestamp = Date.now();
            query.append( "timestamp", timestamp );

            const signature = crypto
                .createHmac( "sha256", secret || "" )
                .update( query.toString() )
                .digest( "hex" );

            query.append( "signature", signature );
        }

        if ( query.toString() )
        {
            url += `?${query.toString()}`;
        }

        const response = await fetch( url, {
            method: http_method,
            headers: {
                "X-MBX-APIKEY": key || ""
            }
        } );

        const data = await response.json();

        res.status( 200 ).json( data );
    } catch ( err )
    {
        res.status( 500 ).json( { error: err.message } );
    }
}