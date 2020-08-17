var λ = require("./mathutils");
var {elementary} = require('@lookalive/elementary')
var cache = new Map

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

    let id = query.shells + '-' + query.motif

    if(cache.has(id)) return cache.get(id) // return object stored in cache

    // motifData[query.motif].motif
    let motifData = [
        {
            "basis": [["0","sqrt(3)"],["3/2","sqrt(3)/2"]],
            "offset":["1/2", "sqrt(3)/2"],
            "polygon":[
                ["1/2", "sqrt(3)/2"],
                ["-1/2", "sqrt(3)/2"],
                ["-1","0"],
                ["-1/2", "-sqrt(3)/2"],
                ["1/2", "-sqrt(3)/2"],
                ["1","0"]
            ]
        }
    ]
    let motifIndex = 0

    // for each motifData
    let {basis, offset, polygon} = motifData[motifIndex]

    // {1, -1}.{{0, Sqrt[3]}, {3/2, Sqrt[3]/2}}
    let [[minx, miny]] = λ.M(λ.dot([["1","-1"]], basis))
    let [width, height] = [λ.run(`abs(${minx}) * 2`), λ.run(`abs(${miny}) * 2`)]

    let viewbox = [minx, miny, width, height].map(n => λ.N(λ.run(`${n} * ${query.radius}`)))
    let [_, __, nwidth, nheight] = viewbox
    // .map(λ.N).join(', ') // svg string for viewbox attribute
    console.log(viewbox)

    let ptgroup = λ.applyShift(
        λ.M(
            λ.dot(
                λ.table(
                    query.shells,
                    query.shells
                ), // returns a js array 
                basis // [["",""],["",""]] gets lambdafied by dot
            )
        ),
        offset
    )

    // this uses each point on the lattice as an offset to apply to each polygon on that lattice --
    // returns an array of lattices 'moved' into position
    let polygongroup = ptgroup.map(pt =>
        λ.applyShift(
            polygon, // polygon is a particular [[][]] 
            pt // [x,y] // gets lambdified and applied to each point of the polygon
        )
    )

    
    let shadowgroup = polygongroup.map(shiftedPolygon => 
        λ.applyShift(
            shiftedPolygon, // polygon is a particular [[][]] 
            λ.M(λ.dot([[
                λ.run(`${shadowxoffset} / 100`), // shadowxoffset,
                λ.run(`${shadowyoffset} / 100`) // shadowyoffset
            ]], basis))[0]
        )
    )


    console.log("polygongroup", polygongroup)
    console.log("shadowgroup", shadowgroup)

    // actually keep the string version of incoming -1 to 1.0 offset numbers 
    // dot product the basis vector with x and y offset to get a proportional transformation that will make sense
    // dont forget to scale the offset by radius... I think that step gets taken care of with polygon2svg

    
    Math.random().toString(16).slice(2)

    let shadowfilter = {
        //     <feGaussianBlur in="SourceGraphic" stdDeviation="5" />
        "filter": {
            "id": "shadowfilter",
            "childNodes": [{"feGaussianBlur": {"in":"SourceGraphics", "stdDeviation": shadowblur}}]
        }
    }

    let shadowPolygons =  shadowgroup.map(polygon => (
        {"polygon": {
            "stroke-width": strapwork,
            "stroke": shadowcolor,
            "stroke-linecap":"round",
            "fill": hypercolor,
            "filter": "url(#shadowfilter)",// filter="url(#blurMe)"
            "points":  λ.polygon2svg(polygon, query.radius)
        }}
    ))

    let strapworkPolygons = polygongroup.map(polygon => (
        {"polygon": {
            "stroke-width": strapwork,
            "stroke": infracolor,
            "stroke-linecap":"round",
            "fill": "transparent",
            "points":  λ.polygon2svg(polygon, query.radius)
        }}
    ))

    console.log(elementary({"svg":{
        "xmlns": "http://www.w3.org/2000/svg",
        "viewbox": viewbox.join(', '),
        "width": nwidth,
        "height": nheight,
        "childNodes": [shadowfilter].concat(shadowPolygons.concat(strapworkPolygons))
    }}),)

    return {
        svgstring: elementary({"svg":{
            "xmlns": "http://www.w3.org/2000/svg",
            "viewbox": viewbox.join(', '),
            "width": nwidth,
            "height": nheight,
            "childNodes": [shadowfilter].concat(shadowPolygons.concat(strapworkPolygons))
        }}),
    }

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



    