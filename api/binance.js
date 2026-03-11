import crypto from "crypto";

let auth = {
    key: null,
    secret: null
};

function signed ( method )
{
    return !(
        method.includes( "ticker/price" ) ||
        method.includes( "/exchangeInfo" ) ||
        method.includes( "/depth" )
    );
}
const input = req.method === "POST" ? req.body : req.query;
export default async function handler ( req, res )
{
    try
    {
        const {
            method,
            exchange_domain = "binance.us",
            key,
            secret,
            http_method = "GET",
            ...params
        } = req.query;

        auth.key = key || null;
        auth.secret = secret || null;

        let host = "api";
        if ( method.startsWith( "/dapi" ) ) host = "dapi";
        if ( method.startsWith( "/fapi" ) ) host = "fapi";

        let url = `https://${host}.${exchange_domain}${method}`;

        let query = new URLSearchParams( params );

        if ( signed( method ) )
        {
            const timestamp = Date.now();
            query.append( "timestamp", timestamp );

            const signature = crypto
                .createHmac( "sha256", auth.secret )
                .update( query.toString() )
                .digest( "hex" );

            query.append( "signature", signature );
        }

        if ( [...query].length > 0 )
        {
            url += `?${query.toString()}`;
        }

        const response = await fetch( url, {
            method: http_method,
            headers: {
                "X-MBX-APIKEY": auth.key || ""
            }
        } );

        const data = await response.json();
        res.status( 200 ).json( data );
    } catch ( err )
    {
        res.status( 500 ).json( { error: err.message } );
    }
}