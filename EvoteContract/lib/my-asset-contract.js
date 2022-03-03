/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');
const path = require('path');
const fs = require('fs');

// connect to the election data file
const electionDataPath = path.join(process.cwd(), './lib/data/electionData.json');
const electionDataJson = fs.readFileSync(electionDataPath, 'utf8');
const electionData = JSON.parse(electionDataJson);

// connect to the pres election file
const ballotDataPath = path.join(process.cwd(), './lib/data/presElection.json');
const ballotDataJson = fs.readFileSync(ballotDataPath, 'utf8');
const ballotData = JSON.parse(ballotDataJson);

//import our file which contains our constructors and auxiliary function
let Ballot = require('./Ballot.js');
let Election = require('./Election.js');
let Voter = require('./Voter.js');
let VotableItem = require('./VotableItem.js');

class MyAssetContract extends Contract {



    async createMyAsset(ctx, myAssetId, value) {
        const exists = await this.myAssetExists(ctx, myAssetId);
        if (exists) {
            throw new Error(`The my asset ${myAssetId} already exists`);
        }
        const asset = { value };
        const buffer = Buffer.from(JSON.stringify(asset));
        await ctx.stub.putState(myAssetId, buffer);
    }


    async updateMyAsset(ctx, myAssetId, newValue) {
        const exists = await this.myAssetExists(ctx, myAssetId);
        if (!exists) {
            throw new Error(`The my asset ${myAssetId} does not exist`);
        }
        const asset = { value: newValue };
        const buffer = Buffer.from(JSON.stringify(asset));
        await ctx.stub.putState(myAssetId, buffer);
    }

   /**
   *
   * init
   *
   * This function creates voters and gets the application ready for use by creating 
   * an election from the data files in the data directory.
   * 
   * @param ctx - the context of the transaction
   * @returns the voters which are registered and ready to vote in the election
   */
  async init(ctx) {

    console.log('instantiate was called!');

    let voters = [];
    let votableItems = [];
    let elections = [];
    let election;
    let electionId;



    //query for election first before creating one.
    let currElections = JSON.parse(await this.queryByObjectType(ctx, 'election'));

    if (currElections.length === 0) {



      //create the election
      election = await new Election(electionData.electionName,"vote for president", "", "","me");

      //update elections array
      elections.push(election);
      electionId=election.electionId;

      await ctx.stub.putState(election.electionId, Buffer.from(JSON.stringify(election)));

    } else {
      election = currElections[0];
      electionId=election.Key;

    
    }

        //create voters
        let voter1 = await new Voter('V12',"123",2,2);
        let voter2 = await new Voter('V2'  ,"123",1,1);
        
    
        //update voters array
        voters.push(voter1);
        voters.push(voter2);
    
        //add the voters to the world state, the election class checks for registered voters 
  await ctx.stub.putState(voter1.voterId, Buffer.from(JSON.stringify(voter1)));
  await ctx.stub.putState(voter2.voterId, Buffer.from(JSON.stringify(voter2)));

        

    //create votableItems for the ballots
    let repVotable = await new VotableItem(ctx, 'Republican', electionId);
    let demVotable = await new VotableItem(ctx, 'Democrat', electionId);
    let indVotable = await new VotableItem(ctx, 'Green', electionId);
    let grnVotable = await new VotableItem(ctx, 'Independent',electionId);
    let libVotable = await new VotableItem(ctx, 'Libertarian',electionId);

    //populate choices array so that the ballots can have all of these choices 
    votableItems.push(repVotable);
    votableItems.push(demVotable);
    votableItems.push(indVotable);
    votableItems.push(grnVotable);
    votableItems.push(libVotable);

    for (let i = 0; i < votableItems.length; i++) {
    
      //save votable choices in world state
      await ctx.stub.putState(votableItems[i].votableId, Buffer.from(JSON.stringify(votableItems[i])));

    }



    return voters;

  }

  /**
   *
   * generateBallot
   *
   * Creates a ballot in the world state, and updates voter ballot and castBallot properties.
   * 
   * @param ctx - the context of the transaction
   * @param votableItems - The different political parties and candidates you can vote for, which are on the ballot.
   * @param election - the election we are generating a ballot for. All ballots are the same for an election.
   * @param voter - the voter object
   * @returns - nothing - but updates the world state with a ballot for a particular voter object
   */
  async generateBallot(ctx,votableItems,election, voter) {

    //generate ballot
    let ballot = await new Ballot(ctx, votableItems, election, voter.voterId);
    
    //set reference to voters ballot
    voter.ballot = ballot.ballotId;
    voter.ballotCreated = true;

    // //update state with ballot object we just created
    await ctx.stub.putState(ballot.ballotId, Buffer.from(JSON.stringify(ballot)));

    await ctx.stub.putState(voter.voterId, Buffer.from(JSON.stringify(voter)));

  }


  /**
   *
   * createVoter
   *
   * Creates a voter in the world state, based on the args given.
   *  
   * @param args.voterId - the Id the voter, used as the key to store the voter object
   * @param args.firstName - first name of voter
   * @param args.lastName - last name of voter
   * @returns - nothing - but updates the world state with a voter
   */
  async createVoter(ctx, args) {

    args = JSON.parse(args);
   
    //create a new voter
    let newVoter = await new Voter(args.voterId,args.password,args.gender, args.age);

    //update state with new voter
    await ctx.stub.putState(newVoter.voterId, Buffer.from(JSON.stringify(newVoter)));


    let response = `voter with voterId ${newVoter.voterId} is updated in the world state`;
    return response;
  }
/*{
  "arg0": {
    "name": "blah",
    "votableItems": [
      {
        "name": "blah",
        "description": "gjgj"
      }
    ]
  }
}*/
  async createElection(ctx, args) {

    args = JSON.parse(args);
    let newElection = await new Election(args.name,args.question,args.startDate,  args.endDate,args.createdBy,args.isPrivate,args.decrypt);
    let votableArr=[];
    let votableargs=args.votableItems;
  
    for (let i = 0; i < args.votableItems.length; i++) {
      let votable = await new VotableItem(ctx, votableargs[i].name,newElection.electionId,votableargs[i].picture);
      votableArr.push(votable);
      //save votable choices in world state
      await ctx.stub.putState(votable.votableId, Buffer.from(JSON.stringify(votable)));

    }
   // newElection.VotableItems=votableArr;


    //update state with new Election
    await ctx.stub.putState(newElection.electionId, Buffer.from(JSON.stringify(newElection)));


    let response = `election with electionId ${newElection.electionId} is updated in the world state`;
    return response;
  }


  /**
   *
   * deleteMyAsset
   *
   * Deletes a key-value pair from the world state, based on the key given.
   *  
   * @param myAssetId - the key of the asset to delete
   * @returns - nothing - but deletes the value in the world state
   */
  async deleteMyAsset(ctx, myAssetId) {

    const exists = await this.myAssetExists(ctx, myAssetId);
    if (!exists) {
      throw new Error(`The my asset ${myAssetId} does not exist`);
    }

    await ctx.stub.deleteState(myAssetId);

  }

  /**
   *
   * readMyAsset
   *
   * Reads a key-value pair from the world state, based on the key given.
   *  
   * @param myAssetId - the key of the asset to read
   * @returns - nothing - but reads the value in the world state
   */
  async readMyAsset(ctx, myAssetId) {

    const exists = await this.myAssetExists(ctx, myAssetId);

    if (!exists) {
      // throw new Error(`The my asset ${myAssetId} does not exist`);
      let response = {};
      response.error = `The my asset ${myAssetId} does not exist`;
      return response;
    }

    const buffer = await ctx.stub.getState(myAssetId);
    const asset = JSON.parse(buffer.toString());
    return asset;
  }


 
  /**
   *
   * myAssetExists
   *
   * Checks to see if a key exists in the world state. 
   * @param myAssetId - the key of the asset to read
   * @returns boolean indicating if the asset exists or not. 
   */
  async myAssetExists(ctx, myAssetId) {

    const buffer = await ctx.stub.getState(myAssetId);
    return (!!buffer && buffer.length > 0);

  }

  async validateElection(ctx, myAssetId) {

    const exists = await this.myAssetExists(ctx, myAssetId);
    let response = {};
    if (!exists) {
      // throw new Error(`The my asset ${myAssetId} does not exist`);
      response.error = `The my asset ${myAssetId} does not exist`;
    }
    else{
    const buffer = await ctx.stub.getState(myAssetId);
    const election = JSON.parse(buffer.toString());
    if (election.isPrivate){
       response.data=true;
    } else {
      response.data=false;
    }
  }
    return response;
  }
  /**
   *
   * castVote
   * 
   * First to checks that a particular voterId has not voted before, and then 
   * checks if it is a valid election time, and if it is, we increment the 
   * count of the political party that was picked by the voter and update 
   * the world state. 
   * 
   * @param electionId - the electionId of the election we want to vote in
   * @param voterId - the voterId of the voter that wants to vote
   * @param votableId - the Id of the candidate the voter has selected.
   * @returns an array which has the winning briefs of the ballot. 
   */
  async castVote(ctx, args) {
    args = JSON.parse(args);

    //get the political party the voter voted for, also the key
    let votableId = args.picked;

    //check to make sure the election exists
    let electionExists = await this.myAssetExists(ctx, args.electionId);

    if (electionExists) {

      //make sure we have an election
      let electionAsBytes = await ctx.stub.getState(args.electionId);
      let election = await JSON.parse(electionAsBytes);
      let voterAsBytes = await ctx.stub.getState(args.voterId);
      let voter = await JSON.parse(voterAsBytes);

      if (election.voters[voter.voterId]) {
        let response = {};
        response.error = 'this voter has already cast this ballot!';
        return response;
      }
     
      let canVote=false;
      //check the date of the election, to make sure the election is still open
      if(election.startDate==""&&election.endDate=="")
         canVote=true;
     else{

      var currentDate = new Date();
     var day = currentDate.getDate();
      var month = currentDate.getMonth();
      var year = currentDate.getFullYear();
      let currentTime = await new Date(year ,month,day);
      //parse date objects
      let parsedCurrentTime = await Date.parse(currentTime);
      let electionStart = await Date.parse(election.startDate);
      let electionEnd = await Date.parse(election.endDate);
      canVote=parsedCurrentTime >= electionStart && parsedCurrentTime < electionEnd;
     }//only allow vote if the election has started 
      if (canVote) {

        let votableExists = await this.myAssetExists(ctx, votableId+args.electionId);
        if (!votableExists) {
          let response = {};
          response.error = 'VotableId does not exist!';
          return response;
        }

        //get the votable object from the state - with the votableId the user picked
        let votableAsBytes = await ctx.stub.getState(votableId+args.electionId);
  
        let votable = await JSON.parse(votableAsBytes);

        //increase the vote of the political party that was picked by the voter
         votable.count++;
         votable.countGender[voter.gender]+=1;
         votable.countAge[voter.age]+=1;

        //update the state with the new vote count
        let result = await ctx.stub.putState(votableId+args.electionId, Buffer.from(JSON.stringify(votable)));
        console.log(result);

        //make sure this voter cannot vote again! 
        election.voters[voter.voterId]=args.picked;;

        //update state to say that this voter has voted, and who they picked
        let response = await ctx.stub.putState(election.electionId, Buffer.from(JSON.stringify(election)));
        console.log(response);
        return voter;

      } else {
        let response = {};
        response.error = 'the election is not open now!';
        return response;
      }

    } else {
      let response = {};
      response.error = 'the election or the voter does not exist!';
      return response;
    }
  }

  /**
   * Query and return all key value pairs in the world state.
   *
   * @param {Context} ctx the transaction context
   * @returns - all key-value pairs in the world state
  */
  async queryAll(ctx) {

    let queryString = {
      selector: {}
    };

    let queryResults = await this.queryWithQueryString(ctx, JSON.stringify(queryString));
    return queryResults;

  }

  /**
     * Evaluate a queryString
     *
     * @param {Context} ctx the transaction context
     * @param {String} queryString the query string to be evaluated
    */
  async queryWithQueryString(ctx, queryString) {

    console.log('query String');
    console.log(JSON.stringify(queryString));

    let resultsIterator = await ctx.stub.getQueryResult(queryString);

    let allResults = [];

    // eslint-disable-next-line no-constant-condition
    while (true) {
      let res = await resultsIterator.next();

      if (res.value && res.value.value.toString()) {
        let jsonRes = {};

        console.log(res.value.value.toString('utf8'));

        jsonRes.Key = res.value.key;

        try {
          jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
        } catch (err) {
          console.log(err);
          jsonRes.Record = res.value.value.toString('utf8');
        }

        allResults.push(jsonRes);
      }
      if (res.done) {
        console.log('end of data');
        await resultsIterator.close();
        console.info(allResults);
        console.log(JSON.stringify(allResults));
        return JSON.stringify(allResults);
      }
    }
  }

  /**
  * Query by the main objects in this app: ballot, election, votableItem, and Voter. 
  * Return all key-value pairs of a given type. 
  *
  * @param {Context} ctx the transaction context
  * @param {String} objectType the type of the object - should be either ballot, election, votableItem, or Voter
  */
  async queryByObjectType(ctx, objectType) {

    let queryString = {
      selector: {
        type: objectType
      }
    };

    let queryResults = await this.queryWithQueryString(ctx, JSON.stringify(queryString));
    return queryResults;

  }
  async getAllvotablesForElection(ctx, electionId) {

    let queryString = {
      selector: {
        type: 'votableItem',
        electionId:electionId
      }
    };

    let queryResults = await this.queryWithQueryString(ctx, JSON.stringify(queryString));
    return queryResults;
  }
  async getAllUsersPolls(ctx,key) {

    let queryString = {
      selector: {
        type: 'election',
        createdBy:key
      }
    };

    let queryResults = await this.queryWithQueryString(ctx, JSON.stringify(queryString));
    return queryResults;
  }

}

module.exports = MyAssetContract;
