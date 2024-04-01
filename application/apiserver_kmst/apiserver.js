var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.json());
var cors = require('cors');
// Setting for Hyperledger Fabric
const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');
// const CryptoJS = require("crypto-js");
const crypto = require("crypto");
const corsOpts = {
        origin: '*',

        methods: [
                'GET',
                'POST',
        ],

        allowedHeaders: [
                'Content-Type',
        ],
};

app.use(cors(corsOpts));

//const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
//      const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));


app.get('/api/queryAllKeys', async function (req, res) {
        try {
                const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
                const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
                // Create a new file system based wallet for managing identities.
                const walletPath = path.join(process.cwd(), 'wallet');
                const wallet = await Wallets.newFileSystemWallet(walletPath);
                console.log(`Wallet path: ${walletPath}`);

                // Check to see if we've already enrolled the user.
                const identity = await wallet.get('appUser');
                if (!identity) {
                        console.log('An identity for the user "appUser" does not exist in the wallet');
                        console.log('Run the registerUser.js application before retrying');
                        return;
                }
                // Create a new gateway for connecting to our peer node.
                const gateway = new Gateway();
                await gateway.connect(ccp, { wallet, identity: 'appUser', discovery: { enabled: true, asLocalhost: true } });

                // Get the network (channel) our contract is deployed to.
                const network = await gateway.getNetwork('mychannel');

                // Get the contract from the network.
                const contract = network.getContract('keymanagement');

                // Evaluate the specified transaction.
                // queryCar transaction - requires 1 argument, ex: ('queryCar', 'CAR4')
                // queryAllCars transaction - requires no arguments, ex: ('queryAllCars')
                const result = await contract.evaluateTransaction('queryAllKeys');
                console.log(JSON.parse(result)[0]["Record"]);
                console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
                res.status(200).json({ response: result.toString() });
        } catch (error) {
                console.error(`Failed to evaluate transaction: ${error}`);
                res.status(500).json({ error: error });
                // process.exit(1);
        }
});


app.get('/api/queryKey/:key_index', async function (req, res) {
        try {
                const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
                const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
                // Create a new file system based wallet for managing identities.
                const walletPath = path.join(process.cwd(), 'wallet');
                const wallet = await Wallets.newFileSystemWallet(walletPath);
                // console.log(`Wallet path: ${walletPath}`);

                // Check to see if we've already enrolled the user.
                const identity = await wallet.get('appUser');
                if (!identity) {
                        console.log('An identity for the user "appUser" does not exist in the wallet');
                        console.log('Run the registerUser.js application before retrying');
                        return;
                }
                // Create a new gateway for connecting to our peer node.
                const gateway = new Gateway();
                await gateway.connect(ccp, { wallet, identity: 'appUser', discovery: { enabled: true, asLocalhost: true } });

                // Get the network (channel) our contract is deployed to.
                const network = await gateway.getNetwork('mychannel');

                // Get the contract from the network.
                const contract = network.getContract('keymanagement');
                // Evaluate the specified transaction.
                // queryKey transaction - requires 1 argument, ex: ('queryKmst', 'kmst10')
                const result = await contract.evaluateTransaction('queryKmst', req.params.key_index);
                console.log('keyId queried from blockchain');
                res.status(200).json({ response: result.toString() });
        } catch (error) {
                console.error(`Failed to query keyId from blockchain: ${error}`);
                res.status(500).json({ error: `Failed to query keyId from blockchain: ${error}` });
                // process.exit(1);
        }
});


app.post('/api/addKey/', async function (req, res) {
        try {
                const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
                const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
                // Create a new file system based wallet for managing identities.
                const walletPath = path.join(process.cwd(), 'wallet');
                const wallet = await Wallets.newFileSystemWallet(walletPath);
                // console.log(`Wallet path: ${walletPath}`);

                // Check to see if we've already enrolled the user.
                const identity = await wallet.get('appUser');
                if (!identity) {
                        console.log('An identity for the user "appUser" does not exist in the wallet');
                        console.log('Run the registerUser.js application before retrying');
                        return;
                }
                // Create a new gateway for connecting to our peer node.
                const gateway = new Gateway();
                await gateway.connect(ccp, { wallet, identity: 'appUser', discovery: { enabled: true, asLocalhost: true } });

                // Get the network (channel) our contract is deployed to.
                const network = await gateway.getNetwork('mychannel');

                // Get the contract from the network.
                const contract = network.getContract('keymanagement');
                const tokenGenTime = new Date();
                // Generating expiry time of 6 months from current date.
                const currentDate = new Date();
                const expiryTime = new Date(currentDate.setMonth(currentDate.getMonth() + 6));
                // Submit the specified transaction.
                // createKey transaction - requires 5 argument, ex: ('createKey', 'kms13', 'key-temp-name', 'tempToken', 'Tue Mar 21 2023 12:11:41 GMT+0530 (India Standard Time)', 'Tue Mar 21 2023 12:16:41 GMT+0530 (India Standard Time)')
                await contract.submitTransaction('createKey', req.body.keyId, req.body.keyName, req.body.token, tokenGenTime, expiryTime);

                console.log('key has been added in the blockchain');
                console.log('keyName: '+ req.body.keyName);
                console.log('Encrypted keyId: '+ req.body.keyId);
                console.log('Encrypted token: '+ req.body.token);
                console.log('Expiry time: '+ expiryTime);
                
                res.send({ response: 'key has been added in the blockchain' });
                // Disconnect from the gateway.
                await gateway.disconnect();
        } catch (error) {
                console.error(`Failed to add key in blockchain: ${error}`);
                // process.exit(1);
        }
})


app.put('/api/updateKey/', async function (req, res) {
        try {
                const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
                const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
                // Create a new file system based wallet for managing identities.
                const walletPath = path.join(process.cwd(), 'wallet');
                const wallet = await Wallets.newFileSystemWallet(walletPath);
                // console.log(`Wallet path: ${walletPath}`);

                // Check to see if we've already enrolled the user.
                const identity = await wallet.get('appUser');
                if (!identity) {
                        console.log('An identity for the user "appUser" does not exist in the wallet');
                        console.log('Run the registerUser.js application before retrying');
                        return;
                }
                // Create a new gateway for connecting to our peer node.
                const gateway = new Gateway();
                await gateway.connect(ccp, { wallet, identity: 'appUser', discovery: { enabled: true, asLocalhost: true } });

                console.log("Encrypted keyId: "+ req.body.keyId);
                // Get the network (channel) our contract is deployed to.
                const network = await gateway.getNetwork('mychannel');

                // Get the contract from the network.
                const contract = network.getContract('keymanagement');
                // Submit the specified transaction.
                // updateKey transaction - requires 2 args , ex: ('updateKey', 'kms16', 'newPubKey')
                await contract.submitTransaction('updateKey', req.body.keyId, req.body.pubKey);
                console.log('Encrypted public key has been updated in the blockchain: '+ req.body.pubKey);
                console.log('key has been activated now');
                res.send('Public key has been updated in the blockchain');
                // Disconnect from the gateway.
                await gateway.disconnect();
        } catch (error) {
                // res.error("Token has expired")
                console.error('Failed to update public key in the blockchain: Token has expired');
                res.status(500).json({ response: `Failed to update public key in the blockchain: ${error}` });
                res.send('Token has expired');
                // process.exit(1);
        }
})


app.post('/api/transaction/', async function (req, res) {
        try {
                const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
                const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
                // Create a new file system based wallet for managing identities.
                const walletPath = path.join(process.cwd(), 'wallet');
                const wallet = await Wallets.newFileSystemWallet(walletPath);
                // console.log(`Wallet path: ${walletPath}`);

                // Check to see if we've already enrolled the user.
                const identity = await wallet.get('appUser');
                if (!identity) {
                        console.log('An identity for the user "appUser" does not exist in the wallet');
                        console.log('Run the registerUser.js application before retrying');
                        return;
                }
                // Create a new gateway for connecting to our peer node.
                const gateway = new Gateway();
                await gateway.connect(ccp, { wallet, identity: 'appUser', discovery: { enabled: true, asLocalhost: true } });

                // Get the network (channel) our contract is deployed to.
                const network = await gateway.getNetwork('mychannel');

                // Get the contract from the network.
                const contract = network.getContract('keymanagement');
                // Submit the specified transaction.
                // updateKey transaction - requires 2 args , ex: ('updateKey', 'kms16', 'newPubKey')
                let valAsbytes = await contract.evaluateTransaction('queryKmst', req.body.keyId);
                let jsonResp = {};
                if (!valAsbytes) {
                        jsonResp.error = `Asset does not exist: ${req.body.keyId}`;
                        throw new Error(jsonResp);
                }
                let assetJSON;
                try {
                        assetJSON = JSON.parse(valAsbytes.toString());
                } catch (err) {
                        jsonResp = {};
                        jsonResp.error = `Failed to decode JSON of: ${req.body.keyId}`;
                        throw new Error(jsonResp);
                }

                const pubKey = assetJSON.pubKey;
                const data = req.body.data;
                // console.log("Encrypted data: "+ data);
                try {
                        // Decrypt data with pubKey
                        const decryptedData = crypto.publicDecrypt(
                                {
                                        key: pubKey,
                                        passphrase: "",
                                        padding: crypto.constants.RSA_PKCS1_PADDING,
                                        encoding: "",
                                },
                                Buffer.from(data)
                        )
                        console.log("Data has been decrypted successfully");
                        console.log("Decrypted data: " + decryptedData);

                        console.log('Transaction has been submitted');
                        res.status(200).json({ response: "Transaction has been submitted" });
                        // Disconnect from the gateway.
                        await gateway.disconnect();
                }
                catch (err) {
                        await contract.evaluateTransaction('updateDiscrepancyCount', req.body.keyId);
                        console.log('Unauthorized access updating discrepancy count.' )
                        console.error(`Failed to submit transaction: ${err}`);
                        res.status(500).json({ error: err });
                        // process.exit(1);
                }
        } catch (error) {
                console.error(`Failed to submit transaction: ${error}`);
                // process.exit(1);
        }
})


app.listen(8080);
