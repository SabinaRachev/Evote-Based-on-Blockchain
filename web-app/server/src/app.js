'use strict';

const bcrypt = require("bcrypt");
const express = require('express');
//const jwt=require("jsonwebtoken");
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const util = require('util');
const path = require('path');
const fs = require('fs');

var CryptoJS = require("crypto-js");
let network = require('./fabric/network.js');

const app = express();
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(cors());
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', "*");
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});
const configPath = path.join(process.cwd(), './config.json');
const configJSON = fs.readFileSync(configPath, 'utf8');
const config = JSON.parse(configJSON);

//use this identity to query
const appAdmin = config.appAdmin;


//get all assets in world state
app.get('/queryAll', async (req, res) => {

  let networkObj = await network.connectToNetwork(appAdmin);
  let response = await network.invoke(networkObj, true, 'queryAll', '');
  let parsedResponse = await JSON.parse(response);
  res.send(parsedResponse);

});

app.post('/getAllUsersPolls', async (req, res) => {

  let networkObj = await network.connectToNetwork(req.body.key);
  
  var hash = CryptoJS.SHA256(req.body.key);

  req.body.key = hash.toString(CryptoJS.enc.Base64);

  let response = await network.invoke(networkObj, true, 'getAllUsersPolls', req.body.key);
  let parsedResponse = await JSON.parse(response);
  console.log(parsedResponse);
  res.send(parsedResponse);

});


app.post('/getAllVotableItemsForElection', async (req, res) => {
  let networkObj = await network.connectToNetwork(appAdmin);
  let response = await network.invoke(networkObj, true, 'getAllvotablesForElection',req.body.electionId);
  let parsedResponse = await JSON.parse(response);
  console.log(parsedResponse);
  res.send(parsedResponse);

});

app.post('/getAllVotableItemsForPrivatePoll', async (req, res) => {
  let networkObj = await network.connectToNetwork(appAdmin);
  let response = await network.invoke(networkObj, true, 'getAllvotablesForElection',req.body.electionId);
  let parsedResponse = await JSON.parse(response);
  let returnResponse={hashed:{}};
  console.log("Private");
  console.log(parsedResponse);
  for( let i=0;i<parsedResponse.length;i++){
    let dec=CryptoJS.AES.decrypt( parsedResponse[i].Record.name,req.body.password).toString(CryptoJS.enc.Utf8);
    returnResponse.hashed[dec]=parsedResponse[i].Record.name;
    parsedResponse[i].Record.name=CryptoJS.AES.decrypt( parsedResponse[i].Record.name,req.body.password).toString(CryptoJS.enc.Utf8);

  } 
  returnResponse.decrypted=parsedResponse;
  console.log(returnResponse);
  res.send(returnResponse);

});
app.post('/validateElectionId', async (req, res) => {
  let networkObj = await network.connectToNetwork(req.body.key);
  let response = await network.invoke(networkObj, true, 'validateElection', req.body.electionId);
  let parsedResponse = await JSON.parse(response);
  res.send(parsedResponse);

});
app.post('/validateElectionPassword', async (req, res) => {

  let networkObj = await network.connectToNetwork(appAdmin);
  let response = await network.invoke(networkObj, true, 'readMyAsset', req.body.electionId);
  let parsedResponse = await JSON.parse(response);
  console.log('decrypt dd');
  console.log(parsedResponse);
 let returnedResponce={};
  const hash = CryptoJS.SHA256(req.body.password);
     var key= hash.toString(CryptoJS.enc.Base64);
    returnedResponce.password=key;
  var dec=CryptoJS.AES.decrypt(parsedResponse.decrypt,key).toString(CryptoJS.enc.Utf8);
  if(dec.toString().length>0){
  console.log(dec);
  returnedResponce.decrypt=dec;
  }
  else 
  returnedResponce.decrypt='the password is incorrect';
  res.send(returnedResponce);

});
app.post('/createPoll',async (req,res)=>{;
  let networkObj = await network.connectToNetwork(req.body.createdBy);
  var hash = CryptoJS.SHA256(req.body.createdBy);
    req.body.createdBy = hash.toString(CryptoJS.enc.Base64);
    if(req.body.isPrivate){
       hash = CryptoJS.SHA256(req.body.password);
      var key= hash.toString(CryptoJS.enc.Base64);
      req.body.question=CryptoJS.AES.encrypt(req.body.question,key).toString();
      req.body.decrypt=CryptoJS.AES.encrypt("decrypt",key).toString();
 
      for(let i=0;i<req.body.votableItems.length;i++){
        req.body.votableItems[i].name=CryptoJS.AES.encrypt(req.body.votableItems[i].name,key).toString();
      }

    }
    console.log(req.body.question);

  req.body = JSON.stringify(req.body);
  console.log('req.body');
  

  console.log(req.body);
  let args = [req.body];
  let response = await network.invoke(networkObj, false, 'createElection', args);
  if (response.error) {
    res.send(response.error);
  } else {
    console.log('response: ');
    console.log(response);
    res.send(response);
}
});
//vote for some option . This will increase the vote count for the votable objects
app.post('/castBallot', async (req, res) => {

  let networkObj = await network.connectToNetwork(req.body.voterId);
  console.log('util inspecting');
  console.log(util.inspect(networkObj));

  var hash = CryptoJS.SHA256(req.body.voterId);

    req.body.voterId = hash.toString(CryptoJS.enc.Base64);
  req.body = JSON.stringify(req.body);
  console.log('req.body');
  console.log(req.body);
  let args = [req.body];

  let response = await network.invoke(networkObj, false, 'castVote', args);
  if (response.error) {
    res.send(response.error);
  } else {
    console.log('response: ');
    console.log(response);
    // let parsedResponse = await JSON.parse(response);
    res.send(response);
  }
});




//query for certain objects within the world state
app.post('/queryWithQueryString', async (req, res) => {

  let networkObj = await network.connectToNetwork(appAdmin);
  let response = await network.invoke(networkObj, true, 'queryByObjectType', req.body.selected);
  let parsedResponse = await JSON.parse(response);
  res.send(parsedResponse);

});



//get voter info, create voter object, and update state with their voterId
app.post('/registerUser', async (req, res) => {
  console.log('req.body: ');
  console.log(req.body);
  let voterId = req.body.voterId;
  const salt= await bcrypt.genSalt(10);

 let password = await bcrypt.hash(req.body.password,salt);


  //first create the identity for the voter and add to wallet
  let response = await network.registerVoter(voterId, req.body.gender, req.body.age,req.body.password,req.body.checkPassword);
  req.body.password=password;
  console.log('response from registerVoter: ');
  console.log(response);
  if (response.error) {
    res.send(response.error);
  } else {
    console.log('req.body.voterId');
    console.log(req.body.voterId);
    let networkObj = await network.connectToNetwork(voterId);
    console.log('networkobj: ');
    console.log(networkObj);

    if (networkObj.error) {
      res.send(networkObj.error);
    }
    console.log('network obj');
    console.log(util.inspect(networkObj));
    var hash = CryptoJS.SHA256(req.body.voterId);

    req.body.voterId = hash.toString(CryptoJS.enc.Base64);
    req.body = JSON.stringify(req.body);
    let args = [req.body];
    //connect to network and update the state with voterId  

    let invokeResponse = await network.invoke(networkObj, false, 'createVoter', args);
    
    if (invokeResponse.error) {
      res.send(invokeResponse.error);
    } else {

      console.log('after network.invoke ');
      let parsedResponse = voterId;
      parsedResponse += '. Use voterId to login above.';
      res.send(parsedResponse);

    }

  }



});

//used as a way to login the voter to the app and make sure they haven't voted before 
app.post('/logInUser', async (req, res) => {
  console.log('req.body: ');
  console.log(req.body);
  let networkObj = await network.connectToNetwork(req.body.voterId);
  console.log('networkobj: ');
  console.log(util.inspect(networkObj));

  if (networkObj.error) {
    res.send(networkObj);
  }
  var hash = CryptoJS.SHA256(req.body.voterId);

    req.body.voterId = hash.toString(CryptoJS.enc.Base64);

  let invokeResponse = await network.invoke(networkObj, true, 'readMyAsset', req.body.voterId);
  if (invokeResponse.error) {
    res.send(invokeResponse);
  } else {
      let parsedResponse = await JSON.parse(invokeResponse);
      const validPassword= await bcrypt.compare(req.body.password,parsedResponse.password);
      if(!validPassword){
        let response = {};
        response.error = 'The password is incorrect';
        res.send(response);
  
      }

    // let response = `Voter with voterId ${parsedResponse.voterId} is ready to cast a ballot.`  
    
//User is valid let's create session cookie JWT   
const accessToken = createToken({ id: req.body.voterId })
//res.cookie('sessionCookieName', accessToken, {httpOnly: true})
// let response = `Voter with voterId ${parsedResponse.voterId} is ready to cast a ballot. 
res.send({voterId: parsedResponse.voterId , accessToken:accessToken});


  
}

});
app.post('/queryByKey', async (req, res) => {
  console.log('req.body: ');
  console.log(req.body);

  let networkObj = await network.connectToNetwork(appAdmin);
  console.log('after network OBj');
  let response = await network.invoke(networkObj, true, 'readMyAsset', req.body.key);
  response = JSON.parse(response);
  if (response.error) {
    console.log('inside eRRRRR');
    res.send(response.error);
  } else {
    console.log('inside ELSE');
    res.send(response);
  }
});
app.post('/getPrivatePoll', async (req, res) => {
  console.log('req.body: ');
  console.log(req.body);

  let networkObj = await network.connectToNetwork(appAdmin);
  console.log('after network OBj');
  let response = await network.invoke(networkObj, true, 'readMyAsset', req.body.key);
  response = JSON.parse(response);
  if (response.error) {
    console.log('inside eRRRRR');
    res.send(response.error);
  } else {
    console.log(response);

    response.question=CryptoJS.AES.decrypt(response.question,req.body.password).toString(CryptoJS.enc.Utf8);
    res.send(response);
  }
});

const crypto     = require('crypto');
const fileUpload = require('express-fileupload');
// default options
app.use(fileUpload());

app.post('/upload', function(req, res) {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.');
  }
  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  let fileToUpload = req.files.file;


  // Use the mv() method to place the file somewhere on your server
  fileToUpload.mv('./uploads/temp.png', function(err) {
    if (err)
      return res.status(500).send(err);
      const fileBuffer = fs.readFileSync('./uploads/temp.png');
      const hashSum = crypto.createHash('sha256');
      hashSum.update(fileBuffer);
      const hex = hashSum.digest('hex');
      
      fs.rename('./uploads/temp.png', './uploads/'+hex+'.png', function(err) {
    });
      res.send(hex);
  });
});


const SECRET_KEY = 'RON_SABINA_RACHEV'
const expiresIn = '30min'
var jwt = require("jsonwebtoken");

// Create a token from a payload
function createToken(payload)
{
  return jwt.sign(payload, SECRET_KEY, { expiresIn })
}

// Verify the token
function verifyToken(token)
{
  return jwt.verify(token, SECRET_KEY)
}

app.post("/validateToken" , async(req, res) => {
  console.log("Called Validate Token");
  var cookie = req.body.token;
  try
  { 
    if(verifyToken(cookie))
     res.status(200).json("Authorized"); 
  }
  catch (err)
  {
    const status = 401
    const message = 'Unauthorized'
    res.status(status).json( message );
  } 
});

app.listen(process.env.PORT || 8081);