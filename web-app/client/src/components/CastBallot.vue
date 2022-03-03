<template>
  <div class="CastBallot">
  <section >
    <h1>Cast ballot for {{this.title}}</h1>
     <div class="poll-view__title">
     <h2>{{this.question}}</h2></div>
      <li  v-for="(votable,index) in votableItems" :key="votable"  :class="{ selected: picked === votable }" @click="choose(votable)" >{{votable}}   <img v-if ="votablePics[index]" :src="require('../../../server/uploads/' + votablePics[index]+'.png')" height="75px" width ="75px">  </li>
    <br>
    <span v-if="picked">
       <div class="mt-3">Selected: <strong>{{ picked }}</strong></div>
       <br>
    <br>
    </span>
    <br>
    <br> 
    <!--span><b>{{ response }}</b></span><br /-->
    <form v-on:submit="castBallot">
      <input type="submit" class = "btn btn-block mybtn btn-primary tx-tfm"  value="Cast Vote">
      <br>
    </form>
    <br>
    <span v-if="response">
     <br>
      <b>{{ response }}</b>
    </span>
    <br>
    <vue-instant-loading-spinner id="loader" ref="Spinner"></vue-instant-loading-spinner>
   </section>
  </div>
</template>

<script>
import PostsService from "@/services/apiService";
import VueInstantLoadingSpinner from "vue-instant-loading-spinner/src/components/VueInstantLoadingSpinner.vue";

export default {
  name: "response",
  data() {
    return {
      votableItemsHashed:{},
      votableItems:[],
      votablePics :[],
      title:"",
      question:"",
      picked: null,
      response: null
    };
  },
  components: {
    VueInstantLoadingSpinner
  }, 
  created: async function(){
    const apiResponseValidate = await PostsService.vaildateSessionId(this.$cookies.get('sessionCookieName'));
    let res = apiResponseValidate.data;
    console.log("Vaildate Token Res : "+res);
    if(res != 'Authorized'){
      this.$router.push('Home');
      this.$cookies.remove('cookie');
      this.$cookies.remove('sessionCookieName');
    }
    if(!this.$cookies.isKey('cookie')||!this.$cookies.isKey('ElectionCookie')){
       this.$router.push('Home');
    }
    else{
      var apiResponse;
      var apiResponseElection;
      let arr;
      if(this.$cookies.isKey('ElectionPassword')){
     apiResponse = await PostsService.getAllVotableItemsForPrivatePoll(
     this.$cookies.get('ElectionCookie'),this.$cookies.get('ElectionPassword')
     );
       apiResponseElection = await PostsService.getPrivatePoll(
     this.$cookies.get('ElectionCookie'),this.$cookies.get('ElectionPassword')
     );
     this.votableItemsHashed=apiResponse.data.hashed;
     arr=apiResponse.data.decrypted;
      }
      else{
     apiResponse = await PostsService.getAllVotableItemsForElection(
     this.$cookies.get('ElectionCookie')
     );
       apiResponseElection = await PostsService.queryByKey(
     this.$cookies.get('ElectionCookie')
     );
     arr=apiResponse.data;
      }
     this.title=apiResponseElection.data.name;
     this.question=apiResponseElection.data.question;

     for( let i=0;i<arr.length;i++){
         let record=arr[i].Record;
         this.votableItems.push(record.name);
         this.votablePics.push(record.hashPicture);
     } 
    }
  },
  methods: {
    async choose(votable){ 
      this.picked=votable
    } ,
    async castBallot() {
      await this.runSpinner();

      let electionId = this.$cookies.get('ElectionCookie')
      let  voterId=this.$cookies.get('cookie')
      console.log("picked: ");
      console.log(this.picked);
      console.log("voterId: ");
      console.log(voterId);
      this.response = null;

      //error checking for making sure to vote for a valid party
      if (this.picked === null ) {
        console.log('this.picked === null')

        let response = "You have to pick a option to vote for!";
        this.response = response;
        await this.hideSpinner();
      
      } else if (voterId === undefined) {
        console.log('this.voterId === undefined')
        let response = "please log in to vote";
        this.response = response;
        await this.hideSpinner();

      } 
      else { 
        var apiResponse;
        if(this.$cookies.isKey('ElectionPassword')){
             apiResponse = await PostsService.castBallot(
          electionId,
          voterId,
          this.votableItemsHashed[this.picked]
        );  
        }
        else{ 
           apiResponse = await PostsService.castBallot(
          electionId,
          voterId,
          this.picked
        );  
        }   
        console.log('apiResponse: &&&&&&&&&&&&&&&&&&&&&&&');
        console.log(apiResponse);

        if (apiResponse.data.error) {
          this.response= apiResponse.data.error;
          await this.hideSpinner();
        } else if (apiResponse.data.message) {
          this.response= `Could not find voter with voterId ${voterId}
            in the state. Make sure you are entering a valid voterId`;
          await this.hideSpinner();
        } 
        else {
          let response = `Successfully recorded vote for ${this.picked} party 
            for voter with voterId ${apiResponse.data.voterId}. Thanks for 
            doing your part and voting!`;

          this.response = response;
          this.$router.push('GetCurrentStanding');
          console.log("cast ballot");
          await this.hideSpinner();
        }
      }
    },
    async runSpinner() {
      this.$refs.Spinner.show();
    },
    async hideSpinner() {
      this.$refs.Spinner.hide();
    }
  }
};
</script>

<style scoped>
.CastBallot{
  position:relative;
  padding-top:50px;
  display: flex;
  justify-content: center;
}

section {
position:relative;
padding: 10px 25px;
padding-bottom:50px;
border-radius: 6px;

box-shadow: 0 10px 24px rgba(0, 0, 0, 0.2);

width: 40%;

display: flex;

flex-direction: column;

justify-content: center;

border-top: 5px solid blue;

}

ul {

list-style: none;

padding-left: 0;

}

li {
text-align: left;

padding: 22px 17px;

border: 1px solid rgba(0, 0, 0, 0.1);

margin-bottom: 15px;

border-radius: 6px;

cursor: pointer;

}

li.selected {

border-left: 5px solid blue;

}
b{
  color:red;
}

</style>