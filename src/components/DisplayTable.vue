<template>
  <div>
    <div class="d-flex justify-space-between mb-2">
      <div class="mt-1 d-flex align-center">
        <div class="mr-2" v-if="toggleShowSelect">
          <v-btn color="teal" density="comfortable" @click="selected_display_plot_text" >
            <v-icon icon="fa:fas fa-image" style="font-size: 16px;"></v-icon>
          </v-btn>
        </div>
        <!-- reseted_display_plot_text -->
        <div class="" v-if="toggleShowSelect">
          <v-btn color="primary" class="text-none" density="comfortable" @click="reseted_display_plot_text" :disabled="selectedShow_miRNA.length === 0">
            Reset
          </v-btn>
        </div>
      </div>
      <div class="d-flex align-center" v-if="definedprops.useSearch">
        <!-- <div class="download_xlsx" @click="exportFile">
          <v-icon icon="fa:fas fa-file-excel mr-5"></v-icon>
        </div> -->
        <v-icon icon="fa:fas fa-magnifying-glass mr-3"></v-icon>
        <v-text-field v-if="definedprops.closeSearch !==true"
          v-model="search_RNAname" variant="solo-filled"
          label="MicroRNA ID search" hide-details style="width:300px"
          single-line density="compact">
        </v-text-field>
      </div>
    </div>
    <v-data-table
      v-model:items-per-page="itemsPerPage" fixed-header :items="tableBody"
      :headers="headers" v-model:search="search_RNAname" item-value="Sample name"
      :height="dataTable_height" :show-select="toggleShowSelect"
      return-object class="elevation-1"
      :custom-filter="filterMiRNA"
      v-model="selectedShow_miRNA">
      <template v-slot:item.Ratio="{item}">
        <div>
          <p :style="{ 'color': Number(item.Log2Ratio) >=0 ? '#D32F2F' : '#2962FF' }">{{ Math.abs(item.Ratio) > 0.001? item.Ratio.toLocaleString('en-US'):item.Ratio }}</p>
        </div>
      </template>
      <template v-slot:item.Log2Ratio="{item}">
        <div>
          <p :style="{ 'color': Number(item.Log2Ratio) >=0 ? '#D32F2F' : '#2962FF' }">{{ Math.abs(item.Log2Ratio) > 0.01? item.Log2Ratio.toLocaleString('en-US'):item.Log2Ratio }}</p>
        </div>
      </template>
      <template v-slot:item.Totalreads="{item}">
        <div>
          {{ item.Totalreads.toLocaleString('en-US') }}
      </div>
      </template>
      <template v-slot:item.Totalalignmentsreads="{item}">
        <div>
          {{ item.Totalalignmentsreads.toLocaleString('en-US') }}
        </div>
      </template>
      <template v-slot:item.Totalunalignedreads="{item}">
        <div>
          {{ item.Totalunalignedreads.toLocaleString('en-US') }}
        </div>
      </template>
      <template v-slot:item.Totalunique="{ item }">
        <div>
          {{  item.Totalunique.toLocaleString('en-US')  }}
        </div>
      </template>
      <template v-slot:item.Foldchange="{ item }">
        <div>
          {{  item.Foldchange.toLocaleString('en-US')  }}
        </div>
      </template>
      <template v-slot:item.lsmean0="{ item }">
        <div>
          {{  item.lsmean0.toLocaleString('en-US')  }}
        </div>
      </template>
      <template v-slot:item.lsmean1="{ item }">
        <div>
          {{  item.lsmean1.toLocaleString('en-US')  }}
        </div>
      </template>
        <!-- <template v-slot:item.Up_Down = "{item}">
          <div>
            <p :style="{ 'color':item.Up_Down === 'UP'? '#2962FF':'#D32F2F' }">{{ item.Up_Down }}</p>
          </div>
        </template> -->
    </v-data-table>
  </div>
</template>
<script setup>
  import { ref, onMounted, watch, defineEmits } from 'vue';
  const itemsPerPage = ref(25);
  const definedprops = defineProps (['table','useSearch', 'expresstablestyle']);
  // 'exportName',
  const emits = defineEmits(['select_miRNA_name']);
  // import { dataService } from '../service/data_service.js'; 
  const toggleShowSelect = ref(false);
  const selectedShow_miRNA = ref([]);
  const headers = ref([]);
  const tableBody = ref([]);
  const dataTable_height = ref('');
  const search_RNAname = ref('');
  const listenTable = async() => {
    const tableInfo = definedprops.table;
    if(tableInfo.headers.length === 0) return;
    selectedShow_miRNA.value.length = 0;
    let bodyInfo = [];
    if(tableInfo.showCheckBox) toggleShowSelect.value = true;
    for(let j = 0 ; tableInfo.body.length > j ; j++){
      let setLSMeanKeyNumber = -1;
      bodyInfo[j] = [];
      for(let k = 0 ; tableInfo.headers.length > k ; k++){
      // header
      let checkLSMean = -1;
      checkLSMean = tableInfo.headers[k].indexOf('LSMean');
      let headerSplitWord;
      if(checkLSMean > -1) {
        setLSMeanKeyNumber ++;
        headerSplitWord = 'lsmean' + setLSMeanKeyNumber;
      }else{
        headerSplitWord = tableInfo.headers[k].split(/\s/).join('').trim();
      }
      // setLSMeanKeyNumber = checkLSMean > -1 ?setLSMeanKeyNumber++ : setLSMeanKeyNumber ;
      // const headerSplitWord = tableInfo.headers[k].split(/\s/).join('').trim();
      if(j === 0){
          // headers.value.push({
          //   title: tableInfo.headers[k],
          //   align:'center',
          //   sortable:true,
          //   key:tableInfo.headers[k],
          // })
        const uppercaseFirst = tableInfo.headers[k].split('');
        const getFirst = uppercaseFirst.splice(0,1);
        const firstcase=getFirst[0].toUpperCase();
        const combinedTitle = firstcase+ uppercaseFirst.join('');
        headers.value.push({
          // title: tableInfo.headers[k],
          title:combinedTitle,
          align: 'center',
          sortable: true,
          key: checkLSMean === -1 ? headerSplitWord : 'lsmean' + setLSMeanKeyNumber, 
          // key: headerSplitWord
        })
      }
      if(!bodyInfo[j][headerSplitWord]){
        bodyInfo[j][headerSplitWord] = tableInfo.body[j][k];
      }
      }
    }
    for(let i = 0; headers.value.length > i ; i++){
      if(headers.value[i].key === 'condition'){
        bodyInfo =  bodyInfo.sort((a, b)=>{
          const conditionA = a['condition'].toLowerCase();
          const conditionB = b['condition'].toLowerCase();
          if(conditionA < conditionB){ return -1 }
        });
      }
    }
    for(let i = 0 ; bodyInfo.length > i ; i++){
      const bodyInfoKeys = Object.keys(bodyInfo[i]);
      for( let j = 0 ; bodyInfoKeys.length > j ; j++ ){
        if(bodyInfoKeys[j] !== 'Samplename' && bodyInfoKeys[j] !== 'condition' && bodyInfoKeys[j] !== 'microRNAID' && bodyInfoKeys[j]!== 'Up_Down' && bodyInfoKeys[j] !== 'significant'
          && bodyInfoKeys[j] !== 'Log2Ratio' && bodyInfoKeys[j] !== "Ratio"){
          const [ base, exponent ] = bodyInfo[i][bodyInfoKeys[j]].split('E').map(Number);
          if(exponent !== undefined && exponent !== 0){
            bodyInfo[i][bodyInfoKeys[j]] = Number(bodyInfo[i][bodyInfoKeys[j]]).toExponential(2);
            // bodyInfo[i][bodyInfoKeys[j]] = Number(bodyInfo[i][bodyInfoKeys[j]])
          //   bodyInfo[i][bodyInfoKeys[j]] = Number(`${tempVal}E${exponent}`);
          }else{
            const val = Math.round(Number(base)*100)/100;
            if(val > 0){
              bodyInfo[i][bodyInfoKeys[j]] = val;
            }else{
              const numToExponential= Number(bodyInfo[i][bodyInfoKeys[j]]).toExponential(2);
              // const numToExponential= Number(bodyInfo[i][bodyInfoKeys[j]]);
              if(Number(numToExponential)=== 0){
                bodyInfo[i][bodyInfoKeys[j]] =  0;
              }else{
                bodyInfo[i][bodyInfoKeys[j]] = numToExponential;
              }
              
            }
          };
        }
      }
    }
    if(bodyInfo.length >= 20){
      const windowInnerheight = window.innerHeight;
      const redundant_remove_table_height = typeof definedprops.expresstablestyle === 'number' ? definedprops.expresstablestyle : 0;
      dataTable_height.value =  Math.ceil((windowInnerheight - 330 - redundant_remove_table_height)/ windowInnerheight * 100) + 'vh';
    }
    tableBody.value = bodyInfo;
    
  };
  const selected_display_plot_text = ()=>{
    const miRNANames = [];
    selectedShow_miRNA.value.forEach((item)=>{
      miRNANames.push(item.microRNAID)
    })
    emits('select_miRNA_name', miRNANames);
  }
  const reseted_display_plot_text = ()=>{
    selectedShow_miRNA.value.length = 0;
    emits('select_miRNA_name', []);;
  }
  const filterMiRNA = (val, query, item)=>{
    return val != null && query != null && typeof val === 'string'&& item.columns.microRNAID.indexOf(query) !==-1&& val.toString().toLocaleUpperCase().indexOf(query) !== -1
  }
  watch(definedprops.table,(/*newTble*/)=>{
    headers.value.length = 0;
    tableBody.value.length = 0;
    listenTable();
  })
  onMounted(()=>{
    if(tableBody.value.length > 0)return;
    listenTable()
  })
</script>
<style lang="scss">
  .v-table .v-data-table__th,  .v-table .v-data-table__td{
    font-weight: 600 !important;
  }
  // .download_xlsx{
  //   cursor: pointer;
  // }
</style>