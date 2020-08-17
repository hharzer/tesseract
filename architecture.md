Access to a server is traded by permitting and revoking secret keys

(basically I give you a password that I associate with your identity -- so you don't have to have a username. basically tripcodes like 4chan. Guess the number I'm thinking of with 48 digits and I'll know its you.)

As the owner of the server, I can fill out a form that generates a key and a new encrypted user on the system. This lets each user keep a /tmp/ directory of files they're torrenting and deleting, 

Looking into Derivative Key Functions (salting and hashing in a deliberately slow manner to prevent brute force -- or building in a required brute force every time) so that people's networks of key creation they invite -- a domain can have the rule -- if any of your keys are banned, all of your keys are banned (although this might explicitally go against the claim that Derivative keys reveal nothing about )

Really when talking about access tokens you're talking about a string of some length with the properties:
Hard to guess
Not that hard to copy paste or dictate so you can tell someone what the token is -- put the QR code in an email or whatever.
(Scanning a QR from someone else's server is a good way to authorize new device -- tell it what key to use to get in)
Highly unlikely to ever need to change the schema -- large keyspace, make as many keys as you want.

So schema could be: higher key : lower key. The key of the person who invited you... compressed to 53 bits. Plus a key unique to you.

So, present the key, and the connection is put through.

So I'm looking at 26 digit hexadecimal keys for 106 bit identifiers. Password managers should make it easy.




