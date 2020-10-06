const Ipfs = require('ipfs');
const OrbitDB = require('orbit-db');

// window object does not exist on the command line
//var window = {};

/*
try {
    const Ipfs = require('ipfs');
    const OrbitDB = require('orbit-db');
} catch(e) { 
    console.log("Error loading modules!", e)
}
*/

class NewPiecePlease {
    constructor(IPFS, OrbitDB) { 
        this.OrbitDB = OrbitDB;

        (async () => {
            this.node = await IPFS.create();
    
            // Initalizing OrbitDB
            this._init.bind(this);
            this._init();
            //this.node.on("error", (e) => {throw (e) });
            //this.node.on("ready", this._init.bind(this));
        })();
    }

    // This will create OrbitDB instance, and orbitdb folder.
    async _init() {
        this.orbitdb = await this.OrbitDB.createInstance(this.node);
        //this.onready();
        console.log("OrbitDB instance created!");

        this.defaultOptions = { accessController: { write: [this.orbitdb.identity.publicKey] }}

        const docStoreOptions = {
            ...this.defaultOptions,
            indexBy: 'hash',
        }
        this.piecesDb = await this.orbitdb.docstore('pieces', docStoreOptions);
        //console.log("this: ", this);
        console.log("this.pieces: ", this.pieces);
        await this.piecesDb.load();
    }

    async addNewPiece(hash, instrument = "Piano") {
        const existingPiece = this.pieces.get(hash)
        if (existingPiece) {
            await this.updatePieceByHash(hash, instrument);
            return;
        }

        const cid = await piecesDb.put({
            hash: hash,
            instrument: instrument
        });

        return cid; 
    }
}

try {
    module.exports = exports = new NewPiecePlease(Ipfs, OrbitDB);
    // Application code
    //const NPP = new NewPiecePlease;
    //NPP.onready = () => { console.log(NPP.orbitdb.id) }
} catch (e) {
    console.log("Thre was an error.\n", e)
    //window.NPP = new NewPiecePlease(window.Ipfs, window.OrbitDB);
}

