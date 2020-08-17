var λ = require("./mathutils");
var {elementary} = require('@lookalive/elementary')
const zlib = require('zlib')
const fs = require('fs')

var cache = new Object

const motifs = {
    honeycomb: require('./motifs/honeycomb'),
    square: require('./motifs/square'),
    pyritohedron: require('./motifs/pyritohedron'),
    p4octagon: require('./motifs/p4octagon'),
    alternatetriangles: require('./motifs/alternatetriangles'),
    doublesquares: require('./motifs/doublesquares')
}

exports.buildbackground = function(query){
    // have to add a 'unitshells' parameter that tells me how large my base lattice has to be to produce a background lattice
    // our html - point - space
    let {
        strapwork,
        infracolor,
        hypercolor,
        shadowcolor,
        shadowxoffset,
        shadowyoffset,
        shadowblur
    } = query

    let id = [query.motif, query.shells, shadowxoffset, shadowyoffset].join('-')
    let svgname = [query.motif, query.shells, strapwork, hypercolor.slice(1), infracolor.slice(1), query.radius, shadowxoffset, shadowyoffset].join('-') + '.svg'

    let viewbox = new Array
    let shadowPolygons = new Array
    let strapworkPolygons = new Array


    // if cache doesn't have the id, create it.
    if(cache[id]){
        [
            viewbox,
            shadowPolygons,
            strapworkPolygons
        ] = cache[id]
    } else {
        // later, the result of calculating these points will go into an array of 'orbitals'
        // so you could count off how many orbitals you care about for backgrounds... just until the norm is greater than the basis
        // this pushes <polygons>, you might want to keep the algebrite numbers available to merge the polygon
        motifs[query.motif].motif.forEach((shape, shapeIndex) => {
            // else we have to build it from scratch
            // {1, -1}.{{0, Sqrt[3]}, {3/2, Sqrt[3]/2}}

            let ptgroup = λ.applyShift(
                λ.M(
                    λ.dot(
                        λ.table(
                            query.shells,
                            query.shells // for backgroundbuilder this might just be 
                        ), // returns a js array 
                        shape.basis // [["",""],["",""]] gets lambdafied by dot
                    )
                ),
                shape.offset
            )
            // this uses each point on the lattice as an offset to apply to each polygon on that lattice --
            // returns an array of lattices 'moved' into position
            let polygongroup = ptgroup.map(pt =>
                λ.applyShift(
                    shape.polygon, // polygon is a particular [[][]] 
                    pt // [x,y] // gets lambdified and applied to each point of the polygon
                )
            )
            let shadowgroup = polygongroup.map(shiftedPolygon => 
                λ.applyShift(
                    shiftedPolygon, // polygon is a particular [[][]] moved into position
                    λ.M(λ.dot([[ // taking shadow parameter as a whole number fraction out of 100 (b/c floating point broke my regex lol)
                        λ.run(`${query.shadowxoffset} / 100`), // shadowxoffset
                        λ.run(`${query.shadowyoffset} / 100`) // shadowyoffset
                    ]], shape.basis))[0] // further shifted to be in position for blur/shadow effect
                )
            )
            // I think this is what I would want to cache by some name.
            // console.log("polygongroup", polygongroup)
            // console.log("shadowgroup", shadowgroup)
            
            shadowPolygons.push(...shadowgroup)
            // shadowPolygons.push(...shadowgroup.map(polygon => (
            //     {"polygon": {
            //         "type": "shadow",
            //         "points":  λ.polygon2svg(polygon, query.radius)
            //     }}
            // )))
            strapworkPolygons.push(...polygongroup)
            // strapworkPolygons.push(...polygongroup.map(polygon => (
            //     {"polygon": {
            //         "type":"strapwork",
            //         "points":  λ.polygon2svg(polygon, query.radius)
            //     }}
            // )))
        })
        // let [[minx, miny]] = λ.M(λ.dot([["1","-1"]], motifs[query.motif].motif[0].basis)) // basis from first polygon
        let [minx, miny] = motifs[query.motif].meta.unitvector
        let [width, height] = [λ.run(`abs(${minx}) * 2`), λ.run(`abs(${miny}) * 2`)]
        viewbox = ["-" + minx, miny, width, height]
        console.log(viewbox)
        // the shadowPolygons and strapworkPolygons are now built and can be added to the cache.
        // this exits this else branch and continues on, next time same request is made this else branch doesn't have to happen
        cache[id] = [viewbox, shadowPolygons, strapworkPolygons]
    }
    // now the values exist in the cache


    // scale up everything in viewbox and convert to floats
    viewbox = viewbox.map(n => λ.N(λ.run(`${n} * ${query.radius}`)))
    console.log(viewbox)

    // return 
    fs.writeFile('./cache/' + svgname, zlib.gzipSync(elementary({"svg":{
            "xmlns": "http://www.w3.org/2000/svg",
            "viewbox": viewbox.join(', '),
            "width": viewbox[2], // 3rd element of viewbox is width
            "height": viewbox[3], // 4th element of viewbox is height
            "childNodes": [{
                "filter": {
                    "id": "shadowfilter",
                    "childNodes": [
                        {"feGaussianBlur": {"in":"SourceGraphics", "stdDeviation": shadowblur}}
                    ]
                }},{
                "style": {
                    'polygon[type="strapwork"]': {
                        "stroke-width": strapwork,
                        "stroke": infracolor,
                        "stroke-linecap":"round",
                        "fill": "transparent"
                    },
                    'polygon[type="shadow"]': {
                        "stroke-width": strapwork,
                        "stroke": shadowcolor,
                        "stroke-linecap":"round",
                        "fill": hypercolor,
                        "filter": "url(#shadowfilter)",// filter="url(#blurMe)"
                    }
                }
                },
                ...shadowPolygons.map(polygon => ({"polygon": {
                    "type": "shadow",
                    "points":  λ.polygon2svg(polygon, query.radius)
                }})),
                ...strapworkPolygons.map(polygon => ({"polygon": {
                    "type": "strapwork",
                    "points":  λ.polygon2svg(polygon, query.radius)
                }})),
            ]
        }}))
    , (err) => {
        console.log("finished writing", err)
    })

    return svgname

    // return JSON.stringify({
    //     polygon,
    //     ptgroup,
    //     polygongroup
    // }, null, 2)
}

        // later: take a x and y offset from the form
        // get the dot product of that offset to get it into this geodesic space
        // local-coordinates can then be added to the base offset to get new offset for polygon-group
        // each motif (polygon set) has its own offset to fit with the rest of the pattern
        // also defines where the center is to calculate rotations
        // So leave room to sum offset vectors to calculate positions of polygons



    