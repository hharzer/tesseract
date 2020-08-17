const http = require('http')
const url = require('url')
const turf = require('@turf/turf')
const algebrite = require('algebrite')
const {elementary} = require('@lookalive/elementary')
const { point } = require('@turf/turf')

backgroundcache = new Map

const {buildbackground} = require('./buildbackground')


function query2kv(qs = ''){
    return qs
        .split('&')
        .map(param => param.split('='))
        .map(([key, val]) => ({[decodeURIComponent(key)]: decodeURIComponent(val)}))
        .reduce((a,b) => Object.assign(a,b))
}

http.createServer((req, res) => {
    console.log(req.url)
    console.log(url.parse(req.url).query)
    let {path} = url.parse(req.url)
    console.log('PATH', path)
    switch(req.method){
        case 'GET':
            if(path.slice(-4) === '.svg'){
                res.end(backgroundcache.get(path.slice(1)))
            }
            // if req.path is a valid hash
            // serve the file representated by the hash, let '.svg' happen so the browser can guess what's happening
            else res.end(elementary([
                require('./head.json'),
                require('./body.json')
            ]) + `
            <script>
                let form = document.querySelector('form')
                form.submit()
                document.querySelectorAll('input, select').forEach(input => input.addEventListener('input', () => form.submit()))
            </script>
            `)
        break
        case 'POST':
            let body = new Array
            req.on('data', buff => body.push(buff))
            req.on('end', () => {
                let query = query2kv(Buffer.concat(body).toString())
                if(!['honeycomb', 'square','pyritohedron','p4octagon'].includes(query.motif)){
                    res.end(JSON.stringify(query)) // echo
                } else {
                    res.end(elementary(
                        {"style": {
                            "html": {
                                // should be putting in a url that matches the cache
                                // "background-image": `url('data:image/svg+xml;utf8,${
                                //     encodeURIComponent(buildbackground(query))
                                // }')`,
                                // buildbackground should return a url that the svg will be available at.
                                "background-image": `url('/${buildbackground(query)}')`,
                                "background-position": "center",
                            }
                        }}
                    ))
                }
            })
        break
        default:
            res.end('goodbye')
    }
}).listen(3030).on('listening', function(){console.log("Is listening on 3030")})