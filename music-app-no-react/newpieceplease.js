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
    constructor(orbitdb, node, piecesDb) {
        this.orbitdb = orbitdb;
        this.node = node;
        this.piecesDb = piecesDb;
      }
    
    // This will create OrbitDB instance, and orbitdb folder.
    static async create(IPFS, OrbitDB) {
        const node = await IPFS.create({repo: "./ipfs"});
        const orbitdb = await OrbitDB.createInstance(node);
        console.log("OrbitDB instance created!");
    
        const defaultOptions = {
          accessController: {
            write: [orbitdb.identity.publicKey]
          }
        }
    
        const docStoreOptions = { ...defaultOptions, indexBy: 'hash' };
        const piecesDb = await orbitdb.docstore('pieces', docStoreOptions);
        
        await piecesDb.load();
        
        return new NewPiecePlease(orbitdb, node, piecesDb);
      }
    
    async addNewPiece(hash, instrument = "Piano") {
        const existingPiece = this.piecesDb.get(hash);
        if (existingPiece) {
            const cid = await this.updatePieceByHash(hash, instrument);
            //console.log("updatePieceByHash would run if it would exist.");
            //console.log("THIS IS THE CID (in addNewPiece-existing): ", cid);
            return cid;
        }
        
        const cid = await piecesDb.put({
            hash: hash,
            instrument: instrument,
        });
        //console.log("THIS IS THE CID (in addNewPiece-new): ", cid);
        return cid; 
    }

    async updatePieceByHash(hash, instrument = "Piano") {
        console.log("HASH: ", hash)
        const piece = await this.getPieceByHash(hash);
        piece.instrument = instrument;
        const cid = await this.piecesDb.put(piece);
        console.log("THIS IS THE CID (in updatePieceByHash): ", cid);
        return cid;
    }

    async deletePieceByHash(hash) {
        const cid = await this.piecesDb.del(hash);
        return cid;
    }

    getAllPiece() {
        const pieces = this.piecesDb.get('');
        return pieces;
    }

    getPieceByHash(hash) {
        console.log("HASSH: ", hash)
        console.log(typeof hash)
        const singlePiece = this.piecesDb.get(hash)[0];
        console.log("singlePiece", singlePiece)
        return singlePiece;
    }

    getByInstrument(instrument) {
        return this.piecesDb.query((piece) => piece.instrument === instrument);
    }


    
}

try {
    module.exports = exports = new NewPiecePlease(Ipfs, OrbitDB);
    // Application code
    (async () => {
        const NPP = await NewPiecePlease.create(Ipfs, OrbitDB);
        console.log(NPP.piecesDb.id);
        console.log("database ID: ", NPP.piecesDb.id);
        const cid = NPP.addNewPiece("QmNR2n4zywCV61MeMLB6JwPueAPqheqpfiA4fLPMxouEmQ");
        const content = await NPP.node.dag.get(cid);
        console.log(acontent.value.payload)
        //NPP.onready = () => { console.log(NPP.orbitdb.id) }
        
        // Shutting down IPFS node
        await NPP.node.stop();
    })();
} catch (e) {
    console.log("Thre was an error.\n", e)
    //window.NPP = new NewPiecePlease(window.Ipfs, window.OrbitDB);
}

