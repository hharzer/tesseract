# tesseract
Time-Series Key-Value Store    

Runs a server with unlimited subscribers, or a proxy object with getters and setters

Provides a back-end for computationally expensive functions to store values on disk, so you don't compute them twice

the input can be a {0:,1:,2:,kwargs} general arg object that represents the 'key' to the lookup table, will be sorted and hashed? Or once I sort it and stringify it can I just use that as my primary key?



And if the key doesn't exist yet the answer is computed -- next time someone asks, the answer will exist
(first consideration for concurrency, someone asks twice -- you'll have to mark in the database that an answer is pending, maybe NULL signifies that no answer exists... yet? or a queued column, basically this will have to grow into being a job scheduler)

Verbose logging can be turned on to capture memory/cpu-time/hardware stats
Oh yeah how to capture memory usage of subprocess? It's all in the pid and vfs, npm i pidusage-tree


It's a wrapper around a particular executable, idempotent or not -- if idempotent, allow retrieving old calculations. if not, there's nothing really cacheable so just record the time of the request and what the response was. 

So maybe first thing is create a sqlite table that logs requests and responses?
Maybe with node I describe some template to convert the raw request into a structure I can match against my own schemas. 
I can define a schema and only accept requests that match it. So if my purpose is to answer a particular question, I make sure that the questions are "well formed"

Records changes to schemas, records changes to templates
Maybe from my schema, I define what I want to capture, maybe just "method" and "remote ip"

keyvalue vs scenegraph

time-series key-value templating and cache (record the results of computations)
time-series scene-graph templating and cache (record the changes to templates)

Maybe the top level values in my schema are the keys that I want to log, and if a request doesn't include everything I need I return with a 500 "we're not on speaking terms"

get post put delete, use the url as path? /www/sometest.tess/path/to/subgraph?key=val&key=val
and you could subscribe to this path to, don't have to be notified of every change -- just changes to small graph.

A request may be to change the template. (put/delete)
A request may be to run the template.  (post, with json body)
A regust may be just to read the template (get)

A proof of concept:
- read the .tess file and have an object I can print out
- be able to overwrite a key in the object (nested proxys) 
- be able to produce a form from a schema which lets you edit the object (includes colors and dates, limited to standard HTML) 

The tesseract file contains:
A scene schema to constrain the shape of the scene
An argument schema to validate input is a particular shape (required parameters, not bigger than 4k bytes etc)
Ensures every call to the function is made with a specific, declared-ahead-of-time shape. (This is very close to py-validate, form-type-to-datatype-validating-and-coercing)
The scene schema describes the shape of a template, but a further response schema can also validate the result of running the program to be a particular shape before returning it.

This is a big deal -- you have JSON schema as this way to declare what you want (even if your rule implementation is lacking, at least you make the bugs more obvious by stating expectations)
So this is declaring the interface of this function/server -- what to send it and what it retuns.

scene-graph schema (a history thereof), response schema (a history thereof), request schema (a history thereof).
The scene-graph itself, (aht) The history of self-transformation of a running scene-graph, reducing itself to a single branch of possibility space.  
a {hash:cache} can keep tracking of hashing of arguments and skip straigt to returning the result. 

probably will include a 'praise' column tracking IP address at first but later resolve to public key identifiers (sign the transaction into the tesseract, confirms the change was really made by x person)

