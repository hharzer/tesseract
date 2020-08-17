const http = require('http')
const url = require('url')
const fs = require('fs')

const turf = require('@turf/turf')
const algebrite = require('algebrite')
const {elementary} = require('@lookalive/elementary')
const { point } = require('@turf/turf')

backgroundcache = {}

const {buildbackground} = require('./buildbackground')
const { fstat } = require('fs')


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
                res.writeHead(200, {'Content-Encoding':'gzip'})
                fs.createReadStream('./cache' + path).pipe(res)
            } else res.end(elementary([
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
                res.end(elementary([
                    // {"object": {
                    //     "data": buildbackground(query),
                    //     "type":"image/svg+xml"
                    // }},
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
                ]))
            })
        break
        default:
            res.end('goodbye')
    }
}).listen(3030).on('listening', function(){console.log("Is listening on 3030")})