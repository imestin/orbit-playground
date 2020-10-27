-----------------------------

Failed to compile.

./src/App.js
  Line 11:21:  Parsing error: Unexpected token, expected "{"

   9 | } catch(e) {}
  10 | 
> 11 | class NewPiecePlease() {
     |                     ^
  12 |   constructor(IPFS, OrbitDB) { }
  13 | }
  14 | 

__FIX__: remove parenthesis () after NewPiecePlease

-----------------------------

Failed to compile.

./src/App.js
  Line 16:49:  'Ipfs' is not defined  no-undef

Search for the keywords to learn more about each error.

__FIX__: Moved ipfs and orbit-db require phrases to be global.

-----------------------------

Failed to compile

./src/App.js
Module not found: Can't resolve 'ipfs' in '/home/user/orbit-playground/music-app/src'

__FIX__: Reinstalling ipfs (`npm install ipfs`) solved the problem.

-----------------------------

TypeError: IPFS is undefined

TypeError: this.node.on is not a function

The connection to ws://127.0.0.1:8081/p2p/Qmbutetcetc was interrupted while the page was loading.

??? IPFS is undefined, even if before I check if object exists with console.log


-----------------------------

TypeError: NPP.pieces is undefined





-----------------------------

I'll try to follow the no-react source code.




-----------------------------