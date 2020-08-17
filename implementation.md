A response comes in, it's validated against response-schema
The system checks if there's an executable set (python, node, bash etc), if so, there will be a table to track changes to source code for some transform process. 
(If you just change a line, that's reflected in the database. What key was updated, next and prev)

Before digesting a change, create a gron of the current state, (the gron can probably be held over and not recalculated all the time),
but then the new update -- you'll want to gron the change being proposed -- you can overwrite those keys, and well, maybe just write the gron of that object into the record? 
No, because the overwrite might cause a lot of new deletions, which need to be recorded too.
So you have the gron of the 'prev' state, now you merge the request or output of the routine into memory, 

There's the request-schema, routine-schema, response-schema. Then the actual routine stored as a graph. Then the working memory, a record of every response routine(request) merged into one.

The working memory, in its simplest case, is an object that is modified by the result of every run of the routine. (routine might be no-op, still validated tho)

So the minimum case, a working memory of form submissions: An object with all the form contents is posted. The shape of the input is validated. Tesseract mode is set to Append. The working memory is an array and the new object is appended to the array.

A dashboard and a state object, the form contents are posted to replace current state. Tessearct mode is set to Merge, any new keys that come in are merged with current object.
(This lets client decide to have a merged memory, but then pushed a single item array, item is added to memory)


append-only   memory ao
merge-deep    memory md
merge-shallow memory ms
blank-slate   memory bs

So there's still a hash-request-routine-response table where an equal request is answered with a pre-computed response. For only the cost of an indexed lookup, I can fetch the precomputed response from disk. 

convert a grom-pair to an expanded object that will be merged. (why not just use the key to modify directly?)



JSONSchema <=> SQLite <=> HTML
ajv, deepmerge, 