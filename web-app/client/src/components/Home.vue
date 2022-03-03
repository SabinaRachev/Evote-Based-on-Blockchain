<template>
<div class="posts">
  <div class="myform">
   
    <h3>Login</h3>
    <!--span><b>{{ response }}</b></span><br /-->
    
    <form>
      <input type="text" v-model="loginData.voterId" placeholder="Enter user id">
      <br>
       <br> 
      
       <input type="password" v-model="loginData.password" placeholder="Enter password">
      <br>
       <br>
      <input type="button" v-on:click="logInUser" class = "btn btn-block mybtn btn-primary tx-tfm" value="Login">
      <br>
      <br>
      <span v-if="loginReponse">
        <b>{{ loginReponse.data }}</b>
      </span>
      <br>
    </form>

    <br>
    <h3>Register</h3>
    <form >
      <input type="text" v-model="registerData.voterId" placeholder="Enter user name">
      <br>
       <br>
        <input type="password" v-model="registerData.password" placeholder="Enter password">
      <br>
       <br>
        <input type="password" v-model="registerData.checkPassword" placeholder="repeat password">
      <br>
       <br>
            <b-form-select v-model="registerData.gender" :options="optionsGender" size="sm" class="mt-3" 
    style='padding: 4px;
      width: 200px;
       background: white;'  ></b-form-select>
         <br>
       <br>
            <b-form-select v-model="registerData.age" :options="optionsAge" size="sm" class="mt-3"
      style=' padding: 4px;
       width: 200px;
       background: white;' ></b-form-select>
        <br>
       <br>
      <input type="button" v-on:click="registerUser" class = "btn btn-block mybtn btn-primary tx-tfm" value="Register">
    </form>
    <br>
    <span v-if="registerReponse">
      <b>{{ registerReponse.data }}</b>
    </span>
    <br>
    <vue-instant-loading-spinner id='loader' ref="Spinner"></vue-instant-loading-spinner>
  </div>
    </div>
</template>

<script>
import PostsService from "@/services/apiService";
import VueInstantLoadingSpinner from "vue-instant-loading-spinner/src/components/VueInstantLoadingSpinner.vue";
export default {
  name: "response",
  data() {
    return {
      optionsGender: [
          { value: null, text: 'Please select gender', disabled:true},
          { value: 0, text: 'Male' },
          { value: 1, text: 'Female' },
           { value: 2, text: 'other' }
          ],
       optionsAge: [
          { value: null, text: 'Please select age', disabled:true},
          { value: 0, text: '0-20' },
          { value: 1, text: '20-40' },
          { value: 2, text: '40-60' },
          { value: 3, text: '60-80' },
          { value: 4, text: 'above 80' }
          ],
      loginData: {},
      registerData: {
        age:null,
        gender:null
      },
      registerReponse: {
        data: ""
      },
      loginReponse: {
        data: ""
      }
    };
  },
  components: {
    VueInstantLoadingSpinner
  },
  methods: {
    async registerUser() {

      await this.runSpinner();
    
      const apiResponse = await PostsService.registerVoter(
        this.registerData.voterId,
        this.registerData.password,
        this.registerData.checkPassword,
        this.registerData.gender,
        this.registerData.age
      );

      console.log(apiResponse);
      this.registerReponse = apiResponse;
  

      await this.hideSpinner();
    },

    async logInUser() {
      await this.runSpinner();

      if (!this.loginData.voterId) {
        console.log("!thislogin");
        let response = 'Please enter a user Id';
        this.loginReponse.data = response;
        await this.hideSpinner();
      } else {
        const apiResponse = await PostsService.logInUser(
          this.loginData.voterId,this.loginData.password
        );
       
        if (apiResponse.data.error) {
          // console.log(apiResponse);
          console.log(apiResponse.data.error);
          this.loginReponse = apiResponse.data.error;
        } else {
          this.$cookies.set('cookie',this.loginData.voterId);
          this.$cookies.set('sessionCookieName',apiResponse.data.accessToken);
          this.$router.push('Dashboard');
        }
        this.loginReponse = apiResponse;
        // this.$router.push('castBallot')
        await this.hideSpinner();
      }
    },
    async runSpinner() {
      this.$refs.Spinner.show();
    },
    async hideSpinner() {
      this.$refs.Spinner.hide();
    }
  },
 created: async function(){
    if(this.$cookies.isKey('cookie')){
        this.$router.push('Dashboard');
    }

  }
};
</script>

