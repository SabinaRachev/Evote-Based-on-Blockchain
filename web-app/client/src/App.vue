
<template>
  <div id="app">
    <b-navbar toggleable="lg" type="dark" variant="info" style="background-color: rgb(0,216,250) !important;">
    <b-navbar-brand href="/">
      <img src="./assets/logo.png" class="d-inline-block align-text-botton" alt="Evote logo" contain    
    height="70px"
    width="80px"> <span v-if="isLoggedIn">
       <span class="nav-item.nav-item.nav-item"> Hello {{name}}
    </span>
         </span>  </b-navbar-brand>
    <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>
    <b-collapse id="nav-collapse" is-nav>
      <b-navbar-nav>
        <b-nav-item to="/" >Home</b-nav-item>
        <b-nav-item to="/getCurrentStanding">Get Poll Standings</b-nav-item>
        <span v-if="isLoggedIn">
          <b-nav-item to="/createPoll">Create poll</b-nav-item>
         </span> 
        <span v-if="name=='user'">
        <b-collapse id="nav-collapse" is-nav>
      <b-navbar-nav>
        <b-nav-item to="/QueryAll">QueryAll</b-nav-item>
        <b-nav-item to="/queryWithQueryString" >Query by Type</b-nav-item>
        <b-nav-item to="/queryByKey">Query by Key</b-nav-item>
        </b-navbar-nav>
         </b-collapse>
        </span>
         </b-navbar-nav>
         </b-collapse>
           <span v-if="isLoggedIn">
          <b-navbar-nav ml-auto>
           <b-button size="sm" @click="logout" class="my-2 my-sm-0" type="logout">Logout</b-button>
          </b-navbar-nav ml-auto>
         </span>  
       </b-navbar>
      <router-view></router-view>
      <vue-instant-loading-spinner id='loader' ref="Spinner"></vue-instant-loading-spinner>
    </div>
</template>

<script>
import VueInstantLoadingSpinner from "vue-instant-loading-spinner/src/components/VueInstantLoadingSpinner.vue";

export default {
  name: 'app'  ,
  data(){
    return {
      isLoggedIn:false,
      name:""
    }

  },
  components: {
    VueInstantLoadingSpinner
  },
  methods:{
    async logout(){
      this.$cookies.remove('cookie');
      this.$cookies.remove('ElectionCookie');
      this.$cookies.remove('ElectionPassword'); 
      this.$cookies.remove('sessionCookieName');
      this.isLoggedIn=false;
      this.name="";
      this.$router.push('Home');
    }
  
  },
  updated(){
    this.$nextTick(function(){
       if(this.$cookies.isKey('cookie')){
        this.isLoggedIn=true;
        this.name=this.$cookies.get('cookie');
    }
    })
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
.chart-wrapper {
  width: 100%;
  height: 700px;
}
.echarts {
  width: 100%;
  height: 100%;
}

#loader {
  position:fixed;
  padding-top: 250px;
}

.chart-wrapper {
  position:fixed;
  padding-left:32%;
}
</style>
