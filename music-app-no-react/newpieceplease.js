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
        
        //orbitdb.identity.publicKey
        const defaultOptions = {
          accessController: {
            write: [orbitdb.identity.id]
          }
        }
    
        console.log("orbitdb.identity.publicKey: ", orbitdb.identity.publicKey);
        const docStoreOptions = { ...defaultOptions, indexBy: 'hash' };
        console.log("docStoreOptions", docStoreOptions);
        const piecesDb = await orbitdb.docstore('pieces', docStoreOptions);
        
        await piecesDb.load();
        
        return new NewPiecePlease(orbitdb, node, piecesDb);
      }
    
    async addNewPiece(hash, instrument = "Piano") {
        try {
            const existingPiece = this.piecesDb.get(hash);
            console.log("existing[0]", existingPiece[0])
            console.log("existing?", existingPiece[0] && true);
            if (existingPiece[0]) {
                console.log("updatePieceByHash will run: ");
                const cid = await this.updatePieceByHash(hash, instrument);
                console.log("THIS IS THE CID (in addNewPiece-existing): ", cid);
                return cid;
            }
            //console.log("accessController: ", this.piecesDb.options.accessController);
            const cid = await this.piecesDb.put({
                hash: hash,
                instrument: instrument,
            });
            console.log("THIS IS THE CID (in addNewPiece-new): ", cid);
            return cid; 

        } catch (err) {
            console.error("Error while adding new piece");
            console.error(err);
        }
    }

    async updatePieceByHash(hash, instrument = "Piano") {
        try {
            console.log("HASH: ", hash)
            const all = await this.getAllPiece();
            console.log("all: ", all);
            let piece = await this.getPieceByHash(hash);
            // piece will be undefined. this.pieceDb.get(hash)[0] is not working.
            piece.instrument = instrument;
            const cid = await this.piecesDb.put(piece);
            console.log("THIS IS THE CID (in updatePieceByHash): ", cid);
            return cid;

        } catch (err) {
            console.error("Error in updatePieceByHash");
            console.error(err);
        }
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
        console.log("HASH: ", hash)                 // will give hash
        console.log(typeof hash)                    // will give string
        const singlePiece = this.piecesDb.get(hash)[0];
        console.log("singlePiece", singlePiece)     // undefined
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
        console.log(content.value.payload)
        //NPP.onready = () => { console.log(NPP.orbitdb.id) }
        
        // Shutting down IPFS node
        await NPP.node.stop();
    })();
} catch (e) {
    console.log("Thre was an error.\n", e)
    //window.NPP = new NewPiecePlease(window.Ipfs, window.OrbitDB);
}

