<template>
  <v-app-bar color="teal-darken-4" >
    <template v-slot:image>
      <v-img  gradient="to top right, rgba(19,84,122,.8), rgba(128,208,199,.8)"></v-img>
    </template>
    <template v-slot:prepend>
      <v-icon icon="fa:fas fa-list" @click="toggleDrawer()" class="ml-2"></v-icon>
      <!-- <v-icon icon="md:event"></v-icon> -->
      <!-- <v-app-bar-nav-icon @click="toggleDrawer()"></v-app-bar-nav-icon> -->
    </template>
    <v-app-bar-title style="cursor: default;">
      <!-- <router-link to="/" style="color: white;text-decoration: none;"> -->
        <v-icon icon="fa:fas fa-dna" class="mx-2 rotateIcon">
      </v-icon>
      <span class="mr-3">CGMMRC</span><span>miRNA</span><span class="ml-3">report</span>
      <!-- </router-link> -->
    </v-app-bar-title>
    <v-spacer></v-spacer>
    <!-- <v-btn icon><v-icon>mdi-wrench</v-icon></v-btn> -->
    <!-- <v-btn icon><v-icon>mdi-heart</v-icon></v-btn>
    <v-btn icon><v-icon>mdi-dots-vertical</v-icon></v-btn> -->
  </v-app-bar>
</template>
<script setup>
  import { ref } from 'vue';
  const leftDrawer = ref(true);
  const emits = defineEmits(['handleLeftDrawers']);
  const toggleDrawer = ()=>{
    leftDrawer.value = !leftDrawer.value;
    emits('handleLeftDrawers', leftDrawer.value)
  }

</script>
<style lang="scss">
  .rotateIcon{
    transform: rotate(90deg);
    color:#BBDEFB;
    font-size: 20px;
  }
</style>