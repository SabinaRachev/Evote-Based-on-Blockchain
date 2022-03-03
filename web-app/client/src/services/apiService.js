import Api from '@/services/api'

export default {
   castBallot(electionId, voterId, picked) {
    return Api().post('castBallot', {       
      electionId: electionId,
      voterId: voterId,
      picked: picked
    })
  },
  queryAll() {
    return Api().get('queryAll')
  },
  queryByObjectType() {
    return Api().get('queryByObjectType')
  },
  queryWithQueryString(selected) {
    return Api().post('queryWithQueryString', {
      selected: selected
    }) 
  },
   registerVoter(voterId,password,checkPassword,gender,age) {
    return Api().post('registerUser', {
      voterId: voterId,
      password:password,
      checkPassword:checkPassword,
      gender: gender,
      age: age
      
    }) 
  },
   logInUser(voterId,password) {
    return Api().post('logInUser', {
      voterId: voterId,
      password:password
    }) 
  },
  queryByKey(key) {
    return Api().post('queryByKey', {
      key: key
    }) 
  },
  getAllUsersPolls(key){
    return Api().post('getAllUsersPolls', {
      key: key
    }) 
  },
  getAllVotableItemsForElection(electionId){
    return Api().post('getAllVotableItemsForElection', {
      electionId:electionId
    }) 
  },
  getAllVotableItemsForPrivatePoll(electionId,password){
    return Api().post('getAllVotableItemsForPrivatePoll', {
      electionId:electionId,
      password:password
    }) 
  },
   
vaildateSessionId(tokenUser){
  return Api().post('validateToken' , {token : tokenUser})
},

  getPrivatePoll(electionId,password){
    return Api().post('getPrivatePoll', {
      key:electionId,
      password:password
    }) 
  },

  createPoll(title,question,startDate,endDate,createdBy,answers,isPrivate,password){
    return Api().post('createPoll', {
      name: title,
      question: question,
      startDate: startDate,
      endDate:endDate,
      createdBy:createdBy,
      votableItems:answers,
      isPrivate:isPrivate,
      password:password
      
    }) 

  },
  validateElectionId(key,electionId){
    return Api().post('validateElectionId', {
      key: key,
      electionId:electionId
    }) 
  },

validateElectionPassword(voterId,electionId,password){
  return Api().post('validateElectionPassword',{
  voterId:voterId,
  electionId:electionId,
  password:password
  })
}
}