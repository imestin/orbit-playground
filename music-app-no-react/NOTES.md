-----------------------------

> const NPP = require('./newpieceplease')
Thrown:
/home/user/orbit-playground/music-app-no-react/newpieceplease.js:8
class NewPiecePlease() {
                    ^

SyntaxError: Unexpected token (
> 

__FIX__: delete parenthesis () after NewPiecePlease 

-----------------------------

> const NPP = require('./newpieceplease')
Thrown:
ReferenceError: window is not defined
    at Object.<anonymous> (/home/user/orbit-playground/music-app-no-react/newpieceplease.js:15:5)
    at Module._compile (internal/modules/cjs/loader.js:778:30)
    at Object.Module._extensions..js (internal/modules/cjs/loader.js:789:10)
    at Module.load (internal/modules/cjs/loader.js:653:32)
    at tryModuleLoad (internal/modules/cjs/loader.js:593:12)
    at Function.Module._load (internal/modules/cjs/loader.js:585:3)
    at Module.require (internal/modules/cjs/loader.js:692:17)
    at require (internal/modules/cjs/helpers.js:25:18)
> 

__FIX__: Commented out window.NPP, because window object does not exist in the command line. It would be possible to create window object like this: var window = {};
But instead, I commented out this line, and wrote a console.log that there was an error console.log("Thre was an error.\n", e)

-----------------------------

> const NPP = require('./newpieceplease')
Thre was an error.
 ReferenceError: Ipfs is not defined
    at Object.<anonymous> (/home/user/orbit-playground/music-app-no-react/newpieceplease.js:16:51)
    at Module._compile (internal/modules/cjs/loader.js:778:30)
    at Object.Module._extensions..js (internal/modules/cjs/loader.js:789:10)
    at Module.load (internal/modules/cjs/loader.js:653:32)
    at tryModuleLoad (internal/modules/cjs/loader.js:593:12)
    at Function.Module._load (internal/modules/cjs/loader.js:585:3)
    at Module.require (internal/modules/cjs/loader.js:692:17)
    at require (internal/modules/cjs/helpers.js:25:18)
    at repl:1:13
    at Script.runInThisContext (vm.js:122:20)
undefined

__FIX__: Ipfs and OrbitDB objects are not global. Either everything needs to be in try.. catch, or omit try catch. I will omit

-----------------------------

> const NPP = require('./newpieceplease')
Thre was an error.
 TypeError: IPFS is not a constructor
    at new NewPiecePlease (/home/user/orbit-playground/music-app-no-react/newpieceplease.js:20:21)
    at Object.<anonymous> (/home/user/orbit-playground/music-app-no-react/newpieceplease.js:42:32)
    at Module._compile (internal/modules/cjs/loader.js:778:30)
    at Object.Module._extensions..js (internal/modules/cjs/loader.js:789:10)
    at Module.load (internal/modules/cjs/loader.js:653:32)
    at tryModuleLoad (internal/modules/cjs/loader.js:593:12)
    at Function.Module._load (internal/modules/cjs/loader.js:585:3)
    at Module.require (internal/modules/cjs/loader.js:692:17)
    at require (internal/modules/cjs/helpers.js:25:18)
    at repl:1:13
undefined

__FIX__: new IPFS({}) is obsolate.
If we change this line to `this.node = await IPFS.create();`, we will need a wrapped async function.
(async () => {
    this.node = await IPFS.create();
    ...
})();

Now it works with UnhandledPromiseRejectionWarning, DeprecationWarning and ExperimentalWarning

-----------------------------

`this.node.on("error", (e) => {throw (e) });`
`this.node.on("ready", this._init.bind(this));`

These lines won't work with IPFS.create();

I changed it to this:

`this._init.bind(this);`
`this._init();`

But this way, there is no error handling...

IPFS directory I can't find, it was not created in the same directory as orbitdb.
With the help of @tabcat I could find IPFS directory, it was in my home folder (`/home/user/.jsipfs`)
I changed the IPFS.create part to this: `const node = await IPFS.create({repo: "./ipfs"});`

-----------------------------

> console.log(NPP.pieces.id)
Thrown:
TypeError: Cannot read property 'id' of undefined

(node:7519) UnhandledPromiseRejectionWarning: TypeError: this.onready is not a function

__FIX__: I removed this.onready();

-----------------------------

`...defaultOptions,`
has to be
`...this.defaultOptions,`

-----------------------------

[Chapter 2 - Managing Data]

`this.pieces` was renamed to `this.piecesDb`

-----------------------------

> const cid = NPP.addNewPiece("QmNR2n4zywCV61MeMLB6JwPueAPqheqpfiA4fLPMxouEmQ")
undefined
> (node:3641) UnhandledPromiseRejectionWarning: TypeError: Cannot read property 'get' of undefined
    at NewPiecePlease.addNewPiece (/home/user/orbit-playground/music-app-no-react/newpieceplease.js:50:43)
    at repl:1:17
    at sigintHandlersWrap (vm.js:288:15)
    at Script.runInThisContext (vm.js:120:14)
    at REPLServer.defaultEval (repl.js:332:29)
    at bound (domain.js:402:14)
    at REPLServer.runBound [as eval] (domain.js:415:12)
    at REPLServer.onLine (repl.js:642:10)
    at REPLServer.emit (events.js:203:15)
    at REPLServer.EventEmitter.emit (domain.js:448:20)

__FIX__: pieces was renamed to piecesDb
`const existingPiece = this.pieces.get(hash)` -> `const existingPiece = this.piecesDb.get(hash)`

-----------------------------

> const cid = NPP.addNewPiece("QmNR2n4zywCV61MeMLB6JwPueAPqheqpfiA4fLPMxouEmQ")
undefined
> (node:4378) UnhandledPromiseRejectionWarning: TypeError: this.updatePieceByHash is not a function
    at NewPiecePlease.addNewPiece (/home/user/orbit-playground/music-app-no-react/newpieceplease.js:52:24)

__FIX__: updatePieceByHash haven't been defined yet.
I will comment it out and write a `console.log();`


-----------------------------

 If I try `console.log(NPP.piecesDb.id);` in the .js file, not in console:
 `TypeError: Cannot read property 'id' of undefined`
 This is an async problem.

__FIX__: I rewrote the constructor as a JavaScript Factory, with the help of @Brenden [Stackoverflow issue](https://stackoverflow.com/questions/64229558/how-to-wait-for-constructor-to-finish?noredirect=1#comment113578438_64229558)


-----------------------------

(node:9157) UnhandledPromiseRejectionWarning: TypeError: string.startsWith is not a function
    at toCidAndPath (/home/user/orbit-playground/music-app-no-react/node_modules/ipfs-core-utils/src/to-cid-and-path.js:24:14)


If I do a `console.log(typeof string)` in _ipfs-core-utils/to-cid-and-path.js_ i get `object`. I don't know is this is correct or not, I don't know if it should be object or string. In newpieceplease, the line that activated the error is:

`const content = await NPP.node.dag.get(cid);`

-----------------------------

I tried inserting updatePieceByHash() function, (which is not written in the Field Manual at this point), because I think error is related to not having that function. This is the error I have now.

(node:15455) UnhandledPromiseRejectionWarning: Error: invalid character '[' in '[object Promise]'
    at Base.decode (/home/user/orbit-playground/music-app-no-react/node_modules/multibase/src/base.js:44:15)
    at Function.decode (/home/user/orbit-playground/music-app-no-react/node_modules/multibase/src/index.js:68:14)
    at Object.fromB58String (/home/user/orbit-playground/music-app-no-react/node_modules/multihashes/src/index.js:74:20)
    at new CID (/home/user/orbit-playground/music-app-no-react/node_modules/cids/src/index.js:96:29)
    at new CID (/home/user/orbit-playground/music-app-no-react/node_modules/class-is/index.js:15:17)
    at toCidAndPath (/home/user/orbit-playground/music-app-no-react/node_modules/ipfs-core-utils/src/to-cid-and-path.js:33:11)
    at get (/home/user/orbit-playground/music-app-no-react/node_modules/ipfs/src/core/components/dag/get.js:13:9)
    at Object.args [as get] (/home/user/orbit-playground/music-app-no-react/node_modules/ipfs/src/core/utils.js:153:46)
    at /home/user/orbit-playground/music-app-no-react/newpieceplease.js:97:44
(node:15455) UnhandledPromiseRejectionWarning: Unhandled promise rejection. This error originated either by throwing inside of an async function without a catch block, or by rejecting a promise which was not handled with .catch(). (rejection id: 6)


It is giving the stringified version of a [Object Promise] to the base decode function, instead of CID.

Somewhy         `const singlePiece = this.piecesDb.get(hash)[0];` is giving undefined.
orbit-db-docstore / DocumentStore.js is still getting the hash, that's correct.

In __DocumentStore.js__, 
`Object.keys(this._index._index)
      .filter(filter)
      .map(mapper)` will give empty array `[]` in the get function. In the top of the __get__ function, I can still read `key`, it will give a hash value


-----------------------------

`async addNewPiece(hash, instrument = "Piano") {
        const existingPiece = this.piecesDb.get(hash);
        console.log("existing", existingPiece)              // -> []
        console.log("existing?", existingPiece && true);    // -> true
        if (existingPiece) {
            const cid = await this.updatePieceByHash(hash, instrument);
            return cid;
        }`
I think existingPiece if statement will run even if there is no piece yet. So we will try to update a non-existing piece.
I will change it to `existingPiece[0]`, because undefined if falsy.

I added a try..catch to addNewPiece

`Error while adding new piece
ReferenceError: piecesDb is not defined`

this line: `const cid = await piecesDb.put({`
has to be: `const cid = await this.piecesDb.put({`

-----------------------------


Error: Could not append entry, key "036f751928c1b4c7e304afd080263776f17ddf9eb598550039240039cb817ed692" is not allowed to write to the log



-----------------------------