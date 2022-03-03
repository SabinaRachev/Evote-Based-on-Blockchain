<template>
  <div class="posts">
    <h1>Get the Current Poll Standings</h1>
    <form v-on:submit="getResults">
      <input type="text" v-model="electionId" placeholder="Enter election id">
      <br>
       <br>
        <span v-if="electionIsPrivate">
        <input type="password" v-model="password" placeholder="Enter election password">
        <br>
       <br>
      </span>
      <input type="submit" class = "btn btn-block mybtn btn-primary tx-tfm" value="Check poll">
      <br>
      <br>   
             

</form>
    <br>
    <span v-if="response">
      <b>{{ response }}</b>
    </span>
    <br>
    <vue-instant-loading-spinner id='loader' ref="Spinner"></vue-instant-loading-spinner>
  <span v-if="show">
  <div style="display: flex;">
      <column-chart  empty="No data" title= 'general' xtitle="answers" ytitle="number of votes" download="true" width="800px" height="500px":data="currentStanding"></column-chart>
  <pie-chart empty="No data" title= 'general%' suffix= "%" width="800px" height="500px" download="true" :data="currentStandingPercentages"></pie-chart>
      <pie-chart empty="No data" title= 'total voter by gender%' suffix= "%" width="800px" height="500px" download="true" :data="byGender"></pie-chart>
        <column-chart  empty="No data" title= 'answers by gender%' suffix= "%" download="true" width="800px" height="500px":data="allDataGender"></column-chart>
        <pie-chart empty="No data" title= 'total voter by age%' suffix= "%" width="800px" height="500px" download="true" :data="byAge"></pie-chart>
        <column-chart  empty="No data" title= 'answers by age%' suffix= "%"  download="true" width="800px" height="500px":data="allDataAge"></column-chart>

   </div>
    </span>
    
  </div>
</template>

<script>
import PostsService from "@/services/apiService";

import VueInstantLoadingSpinner from "vue-instant-loading-spinner/src/components/VueInstantLoadingSpinner.vue";
import { Bar,Pie } from "vue-chartjs";

export default {
  name: "response",
  data() {
    return {
      electionId:"",
      password:"",
      show:false,
      electionIsPrivate:false,
      response: null,
      allDataGender : [
   {name: 'Male', data: {}},
  {name: 'Female', data: {}},
  {name: 'other', data: {}}
    ],
       allDataAge : [
   {name: '0-20', data: {}},
  {name: '20-40', data: {}},
  {name: '40-60', data: {}},
   {name: '60-80', data: {}},
    {name: 'above 80', data: {}}
    ],
      chartOptionsBar: {},
      currentStanding : [],
      currentStandingPercentages : [],
      byGender : [['Male',0],['Female',0],['other',0]],
      byAge: [["0-20",0],["20-40",0],["40-60",0],["60-80",0],["above 80",0]]
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
       this.$cookies.remove('ElectionCookie');
         this.$cookies.remove('ElectionPassword');
    }
    if(this.$cookies.isKey('ElectionCookie')){
        this.electionId=this.$cookies.get('ElectionCookie');
        await this.getCurrentStanding();
         this.$cookies.remove('ElectionCookie');
         this.$cookies.remove('ElectionPassword');
    }
    },
  methods: {
       async getResults() {
         if(this.electionId.length>0){

      await this.runSpinner();
      let apiResponse = await PostsService.validateElectionId(
     this.$cookies.get('cookie'),this.electionId
     );

     if (apiResponse.data.error){
        this.response = 'election with this id doesnt exists';
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
        await this.getCurrentStanding();
           this.$cookies.remove('ElectionCookie');
         this.$cookies.remove('ElectionPassword');
     }else{
       this.response = 'The password is incorrect';
     }
     }else{
       this.response = 'The election is private please enter password';
     }
     }
     else{
         this.$cookies.set('ElectionCookie',this.electionId);
         await this.getCurrentStanding();
           this.$cookies.remove('ElectionCookie');
     }
  
      await this.hideSpinner();
     } else{
        this.response = 'Please enter election id';

      }
    },
    async getCurrentStanding() {
      this.response = null;
      
      this.runSpinner();
     var apiResponse;
      let arr;
      // console.log(`this.selected ${this.selected}`);
        if(this.$cookies.isKey('ElectionPassword')){
     apiResponse = await PostsService.getAllVotableItemsForPrivatePoll(
     this.$cookies.get('ElectionCookie'),this.$cookies.get('ElectionPassword')
     );
     arr=apiResponse.data.decrypted;
   }
     else{
      const apiResponse = await PostsService.getAllVotableItemsForElection(this.electionId);
      arr=apiResponse.data;

     }
      let totalCount=0;
      for (let i = 0; i < arr.length; i++) {
        let currCount=arr[i].Record.count;
        this.currentStanding[i] = [arr[i].Record.name,currCount];
        totalCount+=currCount;
        for(let j=0;j<3;j++)
        this.byGender[j][1] +=arr[i].Record.countGender[j];
          for(let j=0;j<arr[i].Record.countAge.length;j++)
        this.byAge[j][1] +=arr[i].Record.countAge[j];
      }
         for (let i = 0; i < arr.length; i++) {
        let name=arr[i].Record.name;
        for(let j=0;j<3;j++)
        this.allDataGender[j].data[name] = arr[i].Record.countGender[j]/this.byGender[j][1]*100;
          for(let j=0;j<arr[i].Record.countAge.length;j++)
        this.allDataAge[j].data[name] = arr[i].Record.countAge[j]/this.byAge[j][1]*100;

         }
        for(let j=0;j<3;j++){
        this.byGender[j][1] = this.byGender[j][1]/totalCount*100;
          }
       for(let j=0;j<this.byAge.length;j++)
        this.byAge[j][1] =this.byAge[j][1]/totalCount*100;
      for (let i = 0; i <   this.currentStanding.length; i++) {
        this.currentStandingPercentages[i] = [ this.currentStanding[i][0],this.currentStanding[i][1]/totalCount*100];
      }
    
      this.show=true;
      // this.response = apiResponse.data;
      // this.renderChart(this.datacollection, this.options)
      
      this.hideSpinner();
     
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
