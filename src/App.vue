<template>
  <div class="allContainer mx-auto">
    <router-view/>
  </div>
</template>

<script setup lang="ts">
  import { onMounted } from 'vue';
  import { dataService } from '@/service/data_service';
onMounted(async() => {
  await dataService.handleProject();
  await dataService.handleQCReadAlignmentfolder();
  await dataService.handleRawReadsFolder();
  await dataService.handle_CPM_PCA();
  await dataService.handleDE_Folder();
});
</script>
