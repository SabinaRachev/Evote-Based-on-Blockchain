/* eslint-disable indent */
'use strict';

class VotableItem {

    /**
   *
   * VotableItem
   *
   * Constructor for a VotableItem object. These will eventually be placed on the 
   * ballot. 
   *  
   * @param votableId - the Id of the votableItem
   * @param description - the description of the votableItem
   * @param voterId - the unique Id which corresponds to a registered voter
   * @returns - registrar object
   */
  constructor(ctx, votableId,electionId,hashPicture) {

    this.votableId = votableId+electionId;
    this.name=votableId;
    this.electionId=electionId;
    this.count = 0;
    this.countGender = [0,0,0];
    this.countAge = [0,0,0,0,0];
    this.hashPicture = hashPicture;
    this.type = 'votableItem';
    if (this.__isContract) {
      delete this.__isContract;
    }
    return this;

  }
}
module.exports = VotableItem;