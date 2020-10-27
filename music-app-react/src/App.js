import React from 'react';
import logo from './logo.svg';
import './App.css';
const { globSource } = require('ipfs');
const Ipfs = require('ipfs');
const OrbitDB = require('orbit-db');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// This will create an IPFS node and an OrbitDB database when new instance is created
class NewPiecePlease {
  constructor(orbitdb, node, piecesDb, user) {
      this.orbitdb = orbitdb;
      this.node = node;
      this.piecesDb = piecesDb;
      this.user = user;
      this.ready = false;
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

    console.log("End of create function.")
    return new NewPiecePlease(orbitdb, node, piecesDb, user);
  }
  
  // Because create is not working because of static
  createEvents() {
    this.node.libp2p.on("peer:connect", this.handlePeerConnected.bind(this));
    this.ready = true;
    console.log("Event(s) created.");
  }

  async addNewPiece(hash, instrument = "Piano") {
    try {
        const existingPiece = this.piecesDb.get(hash);
        if (existingPiece[0]) {
            const cid = await this.updatePieceByHash(hash, instrument);
            return cid;
        }

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

  async getIpfsPeers() {
    const peers = await this.node.swarm.peers();
    return peers;
  }

  async connectToPeer(multiaddr, protocol ="/p2p-circuit/ipfs/") {
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
    console.log("ipfsId: ", ipfsId);
    if (this.onpeerconnect) this.onpeerconnect(ipfsId);
  }
}

// This is exporting the class
try {
  module.exports = exports = new NewPiecePlease(Ipfs, OrbitDB);
} catch (e) {
  window.NPP = new NewPiecePlease(window.IPFS, window.OrbitDB);
}


class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      NPP: undefined,
      DB_ID: null,
    }
  }
  componentDidMount() {
    // Creating database instance
    (async () => {
      this.setState({
        NPP: await NewPiecePlease.create(Ipfs, OrbitDB),
      })
    })();
      

    
    // Object is undefined until constructor finishes (factory function)
    // We can not test is-ready this way, because parameter does not exist yet.
    //console.log(this.state.NPP.ready)
  }
  
  componentDidUpdate() {
    /*this.setState((state, props) => {
      return {
        DB_ID: this.state.NPP.pieces.id,
      }
    });*/
    (async () => {
      console.log(this.state.NPP)
      try {
        console.log("Database instance:", this.state.NPP);
        console.log("orbitdb: ", this.state.NPP.orbitdb);
        console.log("id: ", this.state.NPP.piecesDb.id);
        this.state.NPP.createEvents();

        /** Examples and tests */

        // Create a new piece
        const newCID = await this.state.NPP.addNewPiece("QmNR2n4zywCV61MeMLB6JwPueAPqheqpfiA4fLPMxouEmQ");
        console.log("CID of new piece: ", newCID);
        
        // Get back the new piece
        const newContent = await this.state.NPP.node.dag.get(newCID);
        console.log("newContent.value.payload: ", newContent.value.payload);

        // Get all
        const allGet = await this.state.NPP.getAllPiece();
        console.log("All pieces: ", allGet);

        // Get by instrument
        const pianoGet = await this.state.NPP.getByInstrument("Piano");
        console.log("Piano", pianoGet);

        // Random piano piece
        const randomPiano = pianoGet[pianoGet.length * Math.random() | 0];
        console.log("Random", randomPiano);

        // Update
        const updateCID = await this.state.NPP.updatePieceByHash("QmNR2n4zywCV61MeMLB6JwPueAPqheqpfiA4fLPMxouEmQ", "Harpsichord");
        console.log("Updated: ", this.state.NPP.getPieceByHash("QmNR2n4zywCV61MeMLB6JwPueAPqheqpfiA4fLPMxouEmQ"));

        // Delete
        /*const deleteCID = await NPP.deletePieceByHash("123");
        const deleteContent = await NPP.node.dag.get(deleteCID);
        console.log("Deleted: ", deleteContent);*/

        // Upload file to IPFS
        //const uploadDataCID = await this.state.NPP.uploadFileToIpfs("../NOTES.md");
        //const uploadOrbitCID = await this.state.NPP.addNewPiece(uploadDataCID, "Note");
        //console.log("uploadOrbitCID: ", uploadOrbitCID);

        // Counter
        const counterCID = await this.state.NPP.addNewPiece("QmdzDacgJ9EQF9Z8G3L1fzFwiEu255Nm5WiCey9ntrDPSL", "Piano");
        const counterContent = await this.state.NPP.node.dag.get(counterCID);
        console.log("Counter: ", counterContent.value.payload.value);

        // Increment counter
        const piece = this.state.NPP.getPieceByHash("QmdzDacgJ9EQF9Z8G3L1fzFwiEu255Nm5WiCey9ntrDPSL");
        const incCID = this.state.NPP.incrementPracticeCounter(piece);
        const incContent = await this.state.NPP.node.dag.get(incCID);
        console.log("Counter: ", incContent.value.payload);

        // User profile
        await this.state.NPP.updateProfile("username", "aphelionz");
        let profileFields = this.state.NPP.getAllProfileFields();
        console.log("All profile fields: ", profileFields);
        await this.state.NPP.deleteProfileField("username");

        // Bootstrap list
        const bootstrapList = await this.state.NPP.node.bootstrap.list();
        console.log("Bootstrap list: ", bootstrapList);

        // Addresses
        const id = await this.state.NPP.node.id();
        console.log("Addresses: ", id.addresses);

        // Peers
        for (let i = 0; i < 4; i++) {
          let peers = await this.state.NPP.getIpfsPeers();
          console.log("IPFS peers: ", peers);
          await sleep(1000);
        }
        
        // onPeerConnect
        this.state.NPP.onpeerconnect = console.log;
        await this.state.NPP.connectToPeer("QmWxWkrCcgNBG2uf1HSVAwb9RzcSYYC2d6CRsfJcqrz2FX");

        console.log("This is the end of the examples and tests block");
      } catch (err) {
        console.log("There was an error.");
        console.error(err);
      }
    })();
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            This is an OrbitDB test.
          </p>
          <p>{this.state.DB_ID}</p>
        </header>
      </div>
    );
  }
}

export default App;
;