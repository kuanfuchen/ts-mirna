<template>
  <div class="">
    <v-navigation-drawer v-model="definedProp.leftDrawer" location="left">
      <v-list>
        <v-list-item to="/" :active="activeItem === 'projectInfo'" @click="activeItem = 'projectInfo'">
          <v-list-item-title v-text="'Project Information'" class="titleStyle"></v-list-item-title>
        </v-list-item>
      </v-list>
      <v-list>
        <v-list-item to="workflowInfo" :active="activeItem === 'workflowInfo'" @click="activeItem = 'workflowInfo'">
          <v-list-item-title v-text="'Workflow & Materials'"  class="titleStyle"></v-list-item-title>
        </v-list-item>
      </v-list>
      <v-list>
        <v-list-subheader class="titleStyle">QC Reports <v-icon icon="fa:fas fa-caret-down"></v-icon></v-list-subheader>
        <v-list-item v-for="(item, i) in sideBarGroupA" :key="i" :to="item.to"
          @click="activeItem = item.value"  :active="activeItem === item.value" >
            <v-list-item-title v-text="item.title" class="subTitleStyle pl-3">
            </v-list-item-title>
        </v-list-item>
      </v-list>
      <v-list>
        <v-list-subheader class="titleStyle">Analysis <v-icon icon="fa:fas fa-caret-down"></v-icon></v-list-subheader>
        <v-list-item v-for="(item, i) in sideBarGroupB" :key="i" :to="item.to"
          @click="activeItem = item.value"  :active="activeItem === item.value">
          <v-list-item-title v-text="item.title" class="subTitleStyle pl-3"></v-list-item-title>       
        </v-list-item>
        <v-list-item   class="subTitleStyle"></v-list-item>
      </v-list>
      <div class="footerAbout">
        <div class="d-flex justify-center mb-2" >
          <img src="../assets/img/logo.png" style="width:200px">
        </div>
        <div class="d-flex justify-center">
          <div class="mb-5" style="text-align: center;">
            <p>Bioinformatics Team</p>
            <p>連絡人：張益峯博士</p>
            <p>分機：03-2118800 #3941</p>
            <a href = "mailto: ianyfchang@mail.cgu.edu.tw">ianyfchang@mail.cgu.edu.tw</a>
            <!-- <p>ianyfchang@mail.cgu.edu.tw</p> -->
          </div>
        </div>
      </div>
    </v-navigation-drawer>
  </div>
</template>
<style lang="scss">
  .titleStyle{
    font-size: 18px;
    font-weight: 700;
    color: #00000099;
  }
  .subTitleStyle{
      font-size: 16px;
      color: #546E7A;
  }
  .footerAbout{
    font-size: 18px;
    color: #546E7A;
    position: fixed;
    bottom: 0;
    width:100%;
    // text-align:center;
  }
</style>
<script setup>
  import { defineProps } from 'vue';
  // import { dataService } from '../service/data_service.js';
  const definedProp = defineProps({
    'leftDrawer':{
      type:Boolean,
    }
  });
  import { ref } from 'vue';
  const activeItem = ref('projectInfo');
  const sideBarGroupA = [
  {
    value:"readAlignment",
    title:'Read & Alignment',
    to:'/readAlignment'
  },{
    value:'visualization',
    title:'Visualization',
    to:'/visualization'
  }];
  const sideBarGroupB = [
  {
    value:'differenceExpression',
    title:'Difference Expression',
    to:'differenceExpression'
  }];
</script>
