const { globSource } = require('ipfs');
const Ipfs = require('ipfs');
const OrbitDB = require('orbit-db');

// window object does not exist on the command line
//var window = {};

class NewPiecePlease {
    constructor(orbitdb, node, piecesDb, user, companions) {
        this.orbitdb = orbitdb;
        this.node = node;
        this.piecesDb = piecesDb;
        this.companions = companions;
        this.user = user;
      }

    // This will create OrbitDB instance, and orbitdb folder.
    static async create(IPFS, OrbitDB) {
        const node = await IPFS.create({repo: "./ipfs"});
        const peerInfo = await node.id();
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

        const user = await orbitdb.kvstore("user", this.defaultOptions);
        await user.load();
        await user.set('pieces', piecesDb.id);

        const companions = await orbitdb.keyvalue("companions", this.defaultOptions);
        await companions.load();

        // Random user id
        const fixtureData = {
            "username": Math.floor(Math.random() * 1000000),
            "pieces": piecesDb.id,
            "nodeId": peerInfo.id
        };
        const fixtureKeys = Object.keys(fixtureData);
        for (let i in fixtureKeys) {
            let key = fixtureKeys[i];
            console.log(this);
            if(!user.get(key)) await user.set(key, fixtureData[key]);
        }

        //this.companionConnectionInterval = setInterval(this.connectToCompanions.bind(this), 10000);
        //this.connectToCompanions();
        
        return new NewPiecePlease(orbitdb, node, piecesDb, user, companions);
    }
    
    // Because create is not working because of static
    async createEvents() {
        this.node.libp2p.on('peer:discovery', (connection) => {
            console.log('Connection established to:', "nothing")	// Emitted when a new connection has been created
        })
        this.node.libp2p.on("peer:connect", this.handlePeerConnected.bind(this));
        // Pubsub
        await this.node.pubsub.subscribe(nodeInfo.id, this.handleMessageReceived.bind(this));
        console.log("Event(s) created.");
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
            // The hash is linking to data in IPFS, in this case a pdf file.

            const dbName = "counter." +  hash.substr(20,20);
            const counterDb = await this.orbitdb.counter(dbName, this.defaultOptions);


            const cid = await this.piecesDb.put({
                hash: hash,
                instrument: instrument,
                counter: counterDb.id
            });
            return cid; 

        } catch (err) {
            console.error("Error while adding new piece");
            console.error(err);
        }
    }

    async updatePieceByHash(hash, instrument = "Piano") {
        try {
            let piece = await this.getPieceByHash(hash);
            piece.instrument = instrument;
            const cid = await this.piecesDb.put(piece);
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
        const singlePiece = this.piecesDb.get(hash)[0];
        return singlePiece;
    }

    getByInstrument(instrument) {
        return this.piecesDb.query((piece) => piece.instrument === instrument);
    }

    async uploadFileToIpfs(fileName) {
        console.log("fileName is: ", fileName);
        //console.log(this.node)
        const file = await this.node.add(globSource('./NOTES.md'), {recursive: true});  
        return (file.cid).toString();
    }

    async getPracticeCount(piece) {
        const counter = await this.orbitdb.counter(piece.counter);
        await counter.load();
        return counter.value;
    }
    
    async incrementPracticeCounter(piece) {
        const counter = await this.orbitdb.counter(piece.counter);
        const cid = await counter.inc();
        return cid;
    }

    async deleteProfileField(key) {
        const cid = await this.user.del(key);
        return cid;
    }

    getAllProfileFields() {
        return this.user.all;
    }

    getProfileField(key) {
        return this.user.get(key);
    }

    async updateProfile(key, value) {
        const cid = await this.user.set(key, value);
        return cid;
    }

    // obsolate
    static async loadFixtureData(fixtureData) {
        const fixtureKeys = Object.keys(fixtureData);
        for (let i in fixtureKeys) {
            let key = fixtureKeys[i];
            console.log(this);
            if(!this.user.get(key)) await this.user.set(key, fixtureData[key]);
        }
    }

    async getIpfsPeers() {
        const peers = await this.node.swarm.peers();
        return peers;
    }

    async connectToPeer(multiaddr, protocol = "/p2p-circuit/ipfs/") {
        try {
            console.log("swarm.connect: ", protocol + multiaddr);
            await this.node.swarm.connect(protocol + multiaddr);
        } catch (e) {
            throw(e);
        }
    }

    handlePeerConnected(ipfsPeer) {
        console.log("CONNECTED! CONNECTED!")
        const ipfsId = ipfsPeer.id._idB58String;
        setTimeout(async () => {
            await this.sendMessage(ipfsId, { userDb: this.user.id });
        }, 2000);
        console.log("ipfsId: ", ipfsId);
        if (this.onpeerconnect) this.onpeerconnect(ipfsId);
    }

    async handleMessageReceived(msg) {
        const parsedMsg = JSON.parse(msg.data.toString());
        const msgKeys = Object.keys(parsedMsg);

        switch (msgKeys[0]) {
            case "userDb":
                var peerDb = await this.orbitdb.open(parsedMsg.userDb);
                peerDb.events.on("replicated", async () => {
                    if (peerDb.get("pieces")) {
                        await this.companions.set(peerDb.id, peerDb.all());
                        this.ondbdiscovered && this.ondbdiscovered(peerDb);
                    }
                });
                break;
            default:
                break;
        }

        if(this.onmessage) this.onmessage(msg);
    }

    async sendMessage(topic, message, callback) {
        try {
            const msgString = JSON.stringify(message);
            const messageBuffer = this.node.types.Buffer(msgString);
            await this.node.pubsub.publish(topic, messageBuffer);
        } catch (e) {
            
        }
    }

    async connectToCompanions() {
        const companionIds = Object.values(this.companions.all()).map(companion => companion.nodeId);
        const connectedPeerIds = await this.getIpfsPeers();
        companionIds.forEach(async (companionId) => {
            if (connectedPeerIds.indexOf(companionId) !== -1) return;
            try {
                await this.connectToPeer(companionId);
                this.oncompaniononline && this.oncompaniononline();
            } catch (e) {
                this.oncompanionnotfound && this.oncompanionnotfound();
            }
        });
    }

}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

try {
    module.exports = exports = new NewPiecePlease(Ipfs, OrbitDB);
    // Application code
    (async () => {
        const NPP = await NewPiecePlease.create(Ipfs, OrbitDB);
        console.log(NPP.piecesDb.id);
        console.log("database ID: ", NPP.piecesDb.id);
        NPP.createEvents();
        const cid = await NPP.addNewPiece("QmNR2n4zywCV61MeMLB6JwPueAPqheqpfiA4fLPMxouEmQ");
        console.log("cid: ", cid);
        const content = await NPP.node.dag.get(cid);
        console.log("content.value.payload", content.value.payload);
        
        const all = await NPP.getAllPiece();
        console.log("all: ", all);
        const piano = await NPP.getByInstrument("Piano");
        console.log("Piano: ", piano);
        // Random piano piece
        const randomPiece = piano[piano.length * Math.random() | 0];
        console.log("Random", randomPiece);
        
        // Update
        const updateCid = await NPP.updatePieceByHash("QmNR2n4zywCV61MeMLB6JwPueAPqheqpfiA4fLPMxouEmQ", "Harpsichord");
        console.log("Updated: ", NPP.getPieceByHash("QmNR2n4zywCV61MeMLB6JwPueAPqheqpfiA4fLPMxouEmQ"));
        
        // Delete
        /*const deleteCid = await NPP.deletePieceByHash("123");
        const deleteContent = await NPP.node.dag.get(deleteCid);
        console.log("Deleted: ", deleteContent);*/
        
        // Upload file to IPFS
        const uploadDataCid = await NPP.uploadFileToIpfs("./NOTES.md");
        const uploadOrbitCid = await NPP.addNewPiece(uploadDataCid, "Note");
        console.log("uploadOrbitCid: ", uploadOrbitCid);

        // Counter
        const counterCid = await NPP.addNewPiece("QmdzDacgJ9EQF9Z8G3L1fzFwiEu255Nm5WiCey9ntrDPSL", "Piano");
        const counterContent = await NPP.node.dag.get(counterCid);
        console.log(counterContent.value.payload.value);

        // Increment counter
        const piece = NPP.getPieceByHash("QmdzDacgJ9EQF9Z8G3L1fzFwiEu255Nm5WiCey9ntrDPSL");
        const incCid = await NPP.incrementPracticeCounter(piece);
        const incContent = await NPP.node.dag.get(incCid);
        console.log(incContent.value.payload);

        // User profile
        await NPP.updateProfile("username", "aphelionz");
        var profileFields = NPP.getAllProfileFields();
        console.log("All profile fields: ", profileFields);
        // { "username": "aphelionz", "pieces": "/orbitdb/zdpu...../pieces" }
        await NPP.deleteProfileField("username");
        
        // Bootstrap list
        const bootstrapList = await NPP.node.bootstrap.list();
        console.log("Bootstrap list: ", bootstrapList);

        // Addresses
        const id = await NPP.node.id();
        console.log("Addresses: ", id.addresses);
        
        
        // Peers
        for (let i = 0; i < 4; i++) {
            let peers = await NPP.getIpfsPeers();
            console.log("IPFS peers: ", peers);
            await sleep(1000);
        }

        // onPeerConnect
        //NPP.onpeerconnect = console.log;
        //await NPP.connectToPeer("QmWxWkrCcgNBG2uf1HSVAwb9RzcSYYC2d6CRsfJcqrz2FX");

        // Skipped
        console.log("We are skipping connectToPeer...");

        // Pubsub
        let data = { some: "example", someNumber: 8 }
        const hash = "QmXG8yk8UJjMT6qtE2zSxzz3U7z5jSYRgVWLCUFqAVnByM";
        const callback = console.error;
        await NPP.sendMessage(hash, data, callback);

        NPP.onmessage = console.log;

        // Connect to peer
        //await NPP.connectToPeer("QmWxWkrCcgNBG2uf1HSVAwb9RzcSYYC2d6CRsfJcqrz2FX");
        //NPP.ondbdiscovered = (db) => console.log(db.all());

        NPP.oncompaniononline = console.log
        NPP.oncompanionnotfound = () => { throw(e) }

        // Shutting down IPFS node
        //await NPP.node.stop();
    })();
} catch (e) {
    console.log("Thre was an error.\n", e)
    //window.NPP = new NewPiecePlease(window.Ipfs, window.OrbitDB);
}

