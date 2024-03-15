<template>
  <v-card >
    <div class="d-flex align-center">
      <v-tabs v-model="miRNATab" color="primary">
        <v-tab class="text-none" :value="tab" v-for="(tab, index) in miRNATabs" :key="index" @click="selectedTable(index)">{{ tab }}</v-tab>
      </v-tabs>
      <div class="download_xlsx ml-auto" @click="exportFile">
        <v-icon icon="fa:fas fa-file-arrow-down" class="mr-5 text-teal" style="font-size: 24px;"></v-icon>
      </div>
    </div>
    <v-card-text>
      <v-window v-model="miRNATab">
        <v-window-item v-for="(tab, index) in miRNATabs" :key="index" :value="tab">
          <DisplayTable :table="tableComponentInfo" :useSearch="false"></DisplayTable>
          <!-- :exportName="props.export_miRNA_Name" -->
        </v-window-item>
      </v-window>
    </v-card-text>
  </v-card>
</template>
<script setup>
  import { ref } from 'vue';
  import { Subject, takeUntil } from 'rxjs';
  const miRNATabs = ref([]);
  const comSubject$ = new Subject();
  const miRNATab = ref('');
  const miRNATables = ref([]);
  const props = defineProps(['export_miRNA_Name']);
  import { dataService } from '../service/data_service';
  import DisplayTable from '../components/DisplayTable.vue';
  const tableComponentInfo = ref({});
  dataService.transferMeg$.pipe(takeUntil(comSubject$)).subscribe((miRNAInfo) => {
    miRNATabs.value = miRNAInfo.tabs;
    miRNATab.value = miRNAInfo.tabs[0];
    miRNATables.value = miRNAInfo.tabsTable;
    handleTableComponent(miRNAInfo.tabsTable[0]);
  });
  const selectedTable = (index)=>{
    if(index > miRNATables.value.length || index < 0) return;
    handleTableComponent(miRNATables.value[index])
  };
  const handleTableComponent = (tableInfo) => {
    tableComponentInfo.value =  tableInfo;
  };
  const exportFile = ()=>{
    const combinationTable = [];
    const miRNATablesVal = JSON.parse(JSON.stringify(miRNATables.value));
    for(let i = 0 ; miRNATablesVal.length > i ; i++){
      const table = [];
      table.push(miRNATablesVal[i].headers);
      for(let j = 0; miRNATablesVal[i].body.length > j ; j++){
        table.push(miRNATablesVal[i].body[j])
      }
      combinationTable.push(table);
    }
    dataService.exportXlsx(combinationTable, 'readAndAlignment');
  }
</script>
<style lang="scss">
  .download_xlsx{
    cursor: pointer;
  }
</style>