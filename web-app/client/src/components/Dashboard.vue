<template>

  <div class="posts">
  
    <h3>Vote For Poll</h3>
    <!--span><b>{{ response }}</b></span><br /-->
    <form v-on:submit="voteElection">
      <input type="text" v-model="electionId" placeholder="Enter election key">
      <br>
       <br>
        <span v-if="electionIsPrivate">
        <input type="password" v-model="password" placeholder="Enter election password">
        <br>
       <br>
      </span>
      <input type="submit" class = "btn btn-block mybtn btn-primary tx-tfm" value="vote">
      <br>
      <br>
    
      <span v-if="votingReponse">
        <b>{{ votingReponse.data }}</b>
      </span>
      <br>
    </form>
   <br>
    <h3>My Polls</h3>
   <b-table class="table" id="table" striped hover :items="rows"></b-table> 
    <br>
    <vue-instant-loading-spinner id='loader' ref="Spinner"></vue-instant-loading-spinner>
  </div>
 
</template>

<script>
import PostsService from "@/services/apiService";
import VueInstantLoadingSpinner from "vue-instant-loading-spinner/src/components/VueInstantLoadingSpinner.vue";

export default {
  name: "Dashboard",
  data() {
    return {
      rows:[],
     electionIsPrivate:false,
      electionId:"",
      password:"",
      votingReponse: {
        data: ""
      }
    };
  },
  components: {
    VueInstantLoadingSpinner
  },
  async updated(){
     if(!this.$cookies.isKey('cookie')){
       this.$router.push('Home');
    }
    else{
       if(!this.$cookies.isKey('ElectionCookie')){
       this.$cookies.remove('ElectionCookie');
        this.$cookies.remove('ElectionPassword');

    }
    const apiResponse = await PostsService.getAllUsersPolls(
     this.$cookies.get('cookie')
     );
     for( let i=0;i<apiResponse.length;i++){
         let record=apiResponse[i].Record;
         let row={name:record.title,start_date:record.startDate,end_date:record.endDate,number_of_votes:record.voters.length,key:apiResponse[i].Key};
         rows.push(row);
     }
    }
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
    if(!this.$cookies.isKey('cookie')){
       this.$router.push('Home');
    }
    else{
   if(!this.$cookies.isKey('ElectionCookie')){
       this.$cookies.remove('ElectionCookie');
       this.$cookies.remove('ElectionPassword');
    }
    const apiResponse = await PostsService.getAllUsersPolls(
     this.$cookies.get('cookie')
     );
     let arr=apiResponse.data;
     console.log(arr);
     for( let i=0;i<arr.length;i++){
         let record=arr[i].Record;
         console.log(Object.keys(record.voters).length);
         let row={name:record.name,startDate:record.startDate==""? '-':record.startDate
         ,endDate:record.endDate==""? '-':record.endDate,numOfVotes:Object.keys(record.voters).length,key:arr[i].Key};
         this.rows.push(row);
     } 
    }

},
  methods: {
    async voteElection() {
      if(this.electionId.length>0){
      await this.runSpinner();
      let apiResponse = await PostsService.validateElectionId(
     this.$cookies.get('cookie'),this.electionId
     );
     console.log(apiResponse);

     if (apiResponse.data.error){
        this.votingReponse.data = 'election with this id doesnt exists';
     }
    else if(apiResponse.data.data){
       this.electionIsPrivate=true;
       if(this.password.length>0){
        const apiResponse1 = await PostsService.validateElectionPassword(
     this.$cookies.get('cookie'),this.electionId,this.password
     );
    console.log(apiResponse1)

     if(apiResponse1.data.decrypt=="decrypt"){
        this.$cookies.set('ElectionCookie',this.electionId);
      this.$cookies.set('ElectionPassword',apiResponse1.data.password);
      this.$router.push("CastBallot");
     }else{
       this.votingReponse.data = 'The password is incorrect';
     }
     }else{
       this.votingReponse.data = 'The election is private please enter password';
     }
     }
     else{
         this.$cookies.set('ElectionCookie',this.electionId);
               this.$router.push("CastBallot");

     }
  
      await this.hideSpinner();
      }else{
        this.votingReponse.data = 'Please enter election id';

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
<style>

#table{
 margin: 0 auto;
 width: 750px;

}
h3 {
  margin-bottom: 30px;
}

th,
td {
  text-align: left;
  border: 1px solid black;
 
}

th:nth-child(n+2),
td:nth-child(n+2) {
  text-align: center;
}

thead tr:nth-child(2) th {
  font-weight: normal;
}

.VueTables__sort-icon {
  margin-left: 20px;
}

.VueTables__dropdown-pagination {
  margin-left: 20px;
}

.VueTables__highlight {
  background: yellow;
  font-weight: normal;
}

.VueTables__sortable {
  cursor: pointer;
}

.VueTables__date-filter {
  border: 1px solid #ccc;
  padding: 6px;
  border-radius: 4px;
  cursor: pointer;
}

.VueTables__filter-placeholder {
  color: #aaa;
}

.VueTables__list-filter {
  width: 120px;
}

</style>