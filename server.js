const http = require('http')
const url = require('url')
const turf = require('@turf/turf')
const algebrite = require('algebrite')
const {elementary} = require('@lookalive/elementary')
const { point } = require('@turf/turf')
const {buildbackground} = require('./buildbackground')
const honeycomb = require('./honeycomb.json')

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
    let {query} = url.parse(req.url)
    switch(req.method){
        case 'GET':
            res.end(elementary([
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
                if(query.motif != 'honeycomb'){
                    res.end(JSON.stringify(query)) // echo
                } else {
                    let {svgstring, width, height} = buildbackground(query)
                    res.end(elementary(
                        {"style": {
                            "html": {
                                "background-image": `url('data:image/svg+xml;utf8,${encodeURIComponent(svgstring)}')`,
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