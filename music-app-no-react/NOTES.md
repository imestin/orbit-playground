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

-----------------------------

> console.log(NPP.pieces.id)
Thrown:
TypeError: Cannot read property 'id' of undefined

(node:7519) UnhandledPromiseRejectionWarning: TypeError: this.onready is not a function

__FIX__: I removed this.onready();

-----------------------------