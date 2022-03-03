'use strict';

const { FileSystemWallet, Gateway, X509WalletMixin } = require('fabric-network');
const fs = require('fs');
const path = require('path');

// capture network variables from config.json
// const configPath = path.join(process.cwd(), './www/blockchain/config.json');
const configPath = path.join(process.cwd(), './config.json');
const configJSON = fs.readFileSync(configPath, 'utf8');
const config = JSON.parse(configJSON);
// let connection_file = config.connection_file;
let appAdmin = config.appAdmin;
let orgMSPID = config.orgMSPID;
// let userName = config.userName;
let gatewayDiscovery = config.gatewayDiscovery;

// const ccpPath = path.join(process.cwd(), './www/blockchain/ibpConnection.json');
const ccpPath = path.join(process.cwd(), './ibpConnection.json');
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);

async function main(userName) {
  try {

    // Create a new file system based wallet for managing identities.
    const walletPath = path.join(process.cwd(), 'wallet');
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);
    console.log(wallet);


    // Check to see if we've already enrolled the user.
    const userExists = await wallet.get(userName);
    if (userExists) {
      let response = {};
      console.log(`An identity for the user ${userName} already exists in the wallet`);
      response.error = `Error! An identity for the user ${userName} already exists in the wallet. Please enter
        a different license number.`;
      return response;
    }

    // Check to see if we've already enrolled the admin user.
    const adminIdentity = await wallet.get(appAdmin);
    if (!adminIdentity) {
      console.log(`An identity for the admin user ${appAdmin} does not exist in the wallet`);
      console.log('Run the enrollAdmin.js application before retrying');
      let response = {};
      response.error = `An identity for the admin user ${appAdmin} does not exist in the wallet. 
        Run the enrollAdmin.js application before retrying`;
      return response;
    }
    console.log("admin is:");
    console.log(adminIdentity);

    // Create a new gateway for connecting to our peer node.
   // const gateway = new Gateway();
   // await gateway.connect(ccp, { wallet, identity: appAdmin, discovery: gatewayDiscovery });

    // Get the CA client object from the gateway for interacting with the CA.
    const caURL = ccp.certificateAuthorities[config.caName].url;
    const ca = new FabricCAServices(caURL);
    const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
    const adminUser = await provider.getUserContext(adminIdentity,appAdmin);

    // Register the user, enroll the user, and import the new identity into the wallet.
    const secret = await ca.register({ affiliation: 'org1', enrollmentID: userName, role: 'client' }, adminIdentity);

    const enrollment = await ca.enroll({ enrollmentID: userName, enrollmentSecret: secret });
    const userIdentity = {
      credentials:{
        certificate:enrollment.certificate,
        privateKey:enrollment.key.toBytes(),
      },
      mspId:orgMSPID,
      type:'X.509',
    };
    await wallet.put(userName, userIdentity);
    console.log('Successfully registered and enrolled admin user ' + userName + ' and imported it into the wallet');
    return;
  } catch (error) {
    console.error(`Failed to register user + ${userName} + : ${error}`);
    process.exit(1);
  }
}

main();