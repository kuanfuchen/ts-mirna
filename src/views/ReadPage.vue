<template>
  <div>
    <MiRNATabs class="px-2 mt-3" :export_miRNA_Name="tableName"></MiRNATabs>
  </div>
  
</template>
<script setup>
/* eslint-disable */
  import { Subject, takeUntil, debounceTime } from 'rxjs';
  import { dataService } from '@/service/data_service';
  import MiRNATabs from '../components/MiRNATabs.vue';
  import { ref } from 'vue';
  const tableName = ref('readAndAlignment')
  const comSubject$ = new Subject();
  dataService.ReadAlignmentSubject$.pipe(takeUntil(comSubject$),debounceTime(100)).subscribe((readAlignmentTableInfo) => {
    dataService.transferHandleFinishMeg(readAlignmentTableInfo);
  });
</script>