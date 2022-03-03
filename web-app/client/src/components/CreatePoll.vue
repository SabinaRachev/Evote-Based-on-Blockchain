<template>
  <div class="posts">
    <div class="poll-view" style="padding-top: 50px">
        <div class="poll-view__title">
           <h1> Create Poll</h1>
        </div>
        <div class="poll-view__inner">
           <div class="poll-view__title" >
                <input v-model="poll.title" type="text" placeholder="Your Title..." class="form-control form-control-sm">   
            </div>
            <div class="poll-view__title">
                <input v-model="poll.question" type="text" placeholder="Your Question..." class="form-control form-control-sm">
                 <br>
                 <br>
            </div>
            <div class="poll-view__answers" :key="componentKey">
                <div v-for="(name, index) in poll.answers" :key="index" class="card mt-3" :style="{zIndex: poll.answers.length - index}">
                    <input :placeholder="'Answer ' + (index + 1)" @focus="createNewInput(index)" v-model="poll.answers[index].name" type="text">
                    <b> <span class="delete" @click="deleteInput(index)"> Delete</span> </b>
                     <br>
                     <br>
    <div class="row" >
      <div class="col-8">
        <label class="btn btn-default p-0">
          <input
            type="file"
            accept="image/*"
            ref="file"
            @change="selectImage($event.target.files, index);"
          />
        </label>
      </div>
      <div v-if="hasCurrent(index)" class ="col-4">
        <button
          class="btn btn-success btn-sm float-right"
          @click="upload(index)">
          Upload
        </button>
      </div>

    </div>
    <div v-if="hasCurrent(index)" class="progress">
      <div
        class="progress-bar progress-bar-info"
        role="progressbar"
        :aria-valuenow="progress[index]"
        aria-valuemin="0"
        aria-valuemax="100"
        :style="{ width: progress[index] + '%' }"
      >
        {{ progress[index] }}%
      </div>
    </div>
    <div v-if="hasPreview(index)">
      <div>
        <img class="preview my-3" :src="previewImage[index]" alt="" />
      </div>
    </div>
    <div v-if="message[index]" class="alert alert-secondary" role="alert">
      {{ message[index] }}
    </div>
    <div class="card mt-3">
      <div class="card-header">Choose an image if you want</div> 
    </div>
    </div> 
    </div>
           <div>
          </div>
          <div class="poll-view__options">
                <label class="form-check form-check-inline">Limit Dates 
                    <input v-model="poll.chooseDates" type="checkbox"  v-on:click="checkbox">
                    <span class="checkmark"></span>
                </label>
            </div>
               <div class="poll-view__options">
                <label class="form-check form-check-inline">Make private 
                    <input v-model="poll.isPrivate" type="checkbox"  v-on:click="checkboxIsPrivate">
                    <span class="checkmark"></span>
                </label>
            </div>
            <span v-if="chooseDates">
            <div class="pick_date">Start date: <date-pick v-model="start_date"></date-pick>
               </div>
                <br>
                 <div class="pick_date">End   date   :  <date-pick v-model="end_date"></date-pick>
               </div>
            </span>
         <span v-if="isPrivate">
               <br>
               <br>
                <input type="password" v-model="password" placeholder="Enter password">
            </span>
            <br>
            <br>
              <button class="btn btn-success btn-sm float-right" @click="createPoll">Create</button>
            <div class="poll-view__info" :class="{'success' : success === true, 'error' : success === false}" v-if="success !== null">
                <div v-if="success === true">Created</div>
                <div v-if="success === false">Error</div>
            </div>
        </div>
        <br>
      <span v-if="response">
         <br>
        <b>{{ response.data }}</b>
      </span>
       <br>
         <vue-instant-loading-spinner id='loader' ref="Spinner"></vue-instant-loading-spinner>
    </div>
    </div>
</template>

<script>
import PostsService from "@/services/apiService";
import VueInstantLoadingSpinner from "vue-instant-loading-spinner/src/components/VueInstantLoadingSpinner.vue";
import DatePick from 'vue-date-pick';
import 'vue-date-pick/dist/vueDatePick.css';
import UploadService from "@/services/uploadFile";

export default {
    name: "CreatePoll",
    data() {
       return {   
       componentKey : 0,
       currentImage: [100],
       previewImage: [100],
       progress    : [100],
       message     : [100],
       imageInfos  : [100],

        response: {
            data: ""
          },
          password:"",
            createdBy:"",
            start_date:"",
            end_date:"",
            isPrivate:false,
            poll: {
                title:"",
                question: "",
                answers: [
                    { name: "" , picture :"" },
                    { name: "" , picture :"" },
                    { name: "" , picture :""},
                    { name: "" , picture :"" }
                ],
            },
            chooseDates: false,
            isValid: false,
            success: null
        };
    },
    components: {
    VueInstantLoadingSpinner,
   DatePick
  },
    mounted () {
      if (this.poll.answers.length == 0) {
            this.poll.answers.push({answer: "", picture :""})
        }
   },
   created: async function(){
          for (var index = 0; index < 100 ; index++) {
        this.message[index] = "";
        this.progress[index] = 0;
        this.currentImage[index] = undefined;
        this.previewImage[index] = undefined;
   }
       const apiResponseValidate = await PostsService.vaildateSessionId(this.$cookies.get('sessionCookieName'));
    let res = apiResponseValidate.data;
    console.log("Vaildate Token Res : "+res);
    if(res != 'Authorized'){
      this.$router.push('Home');
      this.$cookies.remove('cookie');
      this.$cookies.remove('sessionCookieName');
    }
 
   if(this.$cookies.isKey('cookie')){
        this.createdBy=this.$cookies.get('cookie');
    }
    else{
         this.$router.push('Home');
    }
   },
    methods: {
      selectImage(file,index) { 
      this.currentImage[index] = file[0];
      this.previewImage[index] = URL.createObjectURL(file[0]);
      this.progress[index] = 0;
      this.message[index] = "";
      this.componentKey +=1;
    },
    hasPreview(index){
      return this.previewImage[index] != undefined;
    }
    ,hasCurrent(index){
      console.log("test, index : " + index + " | " + this.currentImage[index] + " |" + this.currentImage[index] != undefined);
      return this.currentImage[index] != undefined;
    },
     upload(index) {
      this.componentKey +=1;
      this.progress[index] = 0;
      UploadService.upload(this.currentImage[index], (event) => {
        this.progress[index] = Math.round((100 * event.loaded) / event.total);
        this.componentKey +=1;

      })
        .then((response) => {
          this.message[index] = response.data;
          this.componentKey +=1;
          this.poll.answers[index].picture = response.data;
          return this.message[index];
        })
        .then((images) => {
          this.imageInfos[index] = images.data;
        })
        .catch((err) => {
          this.progress[index] = 0;
          this.message[index] = "Could not upload the image! " + err;
          this.currentImage[index] = undefined;
               this.componentKey +=1;

        });
    },
    async checkboxIsPrivate(){
       this.isPrivate=!this.isPrivate;
    },
        async checkbox(){
            this.chooseDates=!this.chooseDates;
        },
       async createNewInput(index) {
            if (this.poll.answers.length - 1 == index) {
                this.poll.answers.push({ answer: ""  , picture :""});
            }
        },
       async deleteInput(index) {
            if (index > 0 || this.poll.answers.length > 1) {
                this.poll.answers.splice(index, 1);
                this.message.splice(index, 1);
                this.currentImage.splice(index, 1);
                this.progress.splice(index, 1);
                this.previewImage.splice(index, 1);
           }
        },
        async createPoll() {
         this.validate();
          if (this.isValid) {
            await this.runSpinner();

            const apiResponse = await PostsService.createPoll(
            this.poll.title,
            this.poll.question,
            this.start_date,
            this.end_date,
            this.createdBy,
            this.poll.answers ,this.isPrivate,this.password);
        if (apiResponse.data.error) {
          this.loginReponse = apiResponse.data.error;
        } else{
          console.log(apiResponse);
           this.response = apiResponse;
        }
           await this.hideSpinner();
          } else {
           let response = 'You need to fill all the fields';
           this.response.data = response1;
           }
        },
       async resetPoll() {
            this.poll.chooseDates = false;
            this.poll.answers = [];
            this.poll.answers.push({answer: "" , picture : ""})
            this.poll.answers.push({answer: "", picture : ""})
            this.poll.answers.push({answer: "", picture : ""})
            this.poll.answers.push({answer: "", picture : ""})
            this.poll.question = ""
            this.isValid = false
        },
       async validate () {
            this.poll.answers = this.poll.answers.filter((answer) => {
                if (answer.name.length > 0) {
                    return answer;
                }
            });
            var count = this.poll.answers.length
            if (count > 1) {
                this.isValid = true;
            } else  {
                this.isValid = false;
            }
            if(this.isPrivate){
               this.isValid=this.password.length>0;
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

