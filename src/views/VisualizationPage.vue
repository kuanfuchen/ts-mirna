<template>
  <div class="px-3 py-5">
    <v-card>
      <div class="d-flex justify-space-between">
        <v-tabs v-model="useStyleTab" color="primary" >
          <v-tab v-for="(item, i) in displayStyle" color="primary" :key="i" class="text-none" >
            {{ item }}
          </v-tab>
        </v-tabs>
        <div class="d-flex justify-end mt-2" v-if="useStyleTab === 0">
          <div class="toggle_cols" @click="changed_plot_size(6, 550)">
            <v-icon icon="fa:fas fa-table-columns mr-5"></v-icon>
          </div>
          <div class="toggle_cols" @click="changed_plot_size(12, 700)" v-if="useStyleTab === 0">
            <v-icon icon="fa:far fa-square mr-5"></v-icon>
          </div>
        </div>
      </div>
    <v-card-text>
      <v-window v-model="useStyleTab">
        <v-window-item value="QC Graph">
          <v-row class="pb-1">
            <v-col :cols="plot_cols">
              <v-card class="px-2" width="100%">
                <div class="scatterPlotCompareStyle">
                  <div class="compareStyle">
                    <p class="text-center text-h6 mr-2">Sample1</p>
                    <v-select v-model="sample1Item" @update:modelValue="changeSample1" density="compact"
                    :items="selctedSampleItem" variant="outlined" class="compareSelect"></v-select>
                  </div>
                  <div class="text-h6 mx-5 gapTitle">V.S</div>
                  <div class="compareStyle">
                    <p class="text-center  text-h6 mr-2">Sample2</p>
                    <v-select v-model="sample2Item" @update:modelValue="changeSample2" density="compact"
                      :items="selctedSampleItem" variant="outlined" class="compareSelect"></v-select>
                  </div>
                </div>
                <!--  -->
                <template v-slot:title>
                  <span class="font-weight-bold">Scatter Plot</span>
                </template>
                <ScatterPlot :plot_size="plot_height"  :scatterGraphInfo="selectedSampleTitle" ></ScatterPlot>
              </v-card>
            </v-col>
          <!-- </v-row> -->
          <v-col :cols="plot_cols">
            <v-card class="px-3 plotStyle" width="100%">
              <template v-slot:title>
                <span class="font-weight-bold" >Box Plot</span>
              </template>
              <BoxPlot :plot_size="plot_height" ></BoxPlot>
            </v-card>
          </v-col>
          <v-col :cols="plot_cols">
            <v-card class="px-3" width="100%">
              <template v-slot:title>
                <p class="pr-3 font-weight-bold d-flex">PCA Plot<span style="font-size: 14px;">( Color by condition )</span></p>
              </template>
              <PCA_plot :plot_size="plot_height"></PCA_plot>
            </v-card>
          </v-col>
          <v-col :cols="plot_cols">
            <v-card class="px-3" width="100%">
              <template v-slot:title>
                <span class="font-weight-bold pr-3">Heatmap Plot</span>
              </template>
              <Dendrograms  :heatmapHeight="plot_height"></Dendrograms>
            </v-card>
          </v-col>
        </v-row>
        </v-window-item>
        <v-window-item value="Table">
          <v-card class="visual_Data_Table">
            <v-tabs v-model="condition_header" color="primary" @click="displayTableInfo">
              <v-tab v-for="(item, i) in conditionHeaders" color="primary" :key="i" class="text-none">
                {{ item }}
              </v-tab>
            </v-tabs>
            <div class="d-flex justify-end mt-1">
              <div class="d-flex align-center mb-1 mr-3" >
                <div class="download_xlsx" @click="exportXlsxFile">
                  <!-- <v-icon icon="fa:fas fa-file-excel mr-5"></v-icon> -->
                  <v-icon icon="fa:fas fa-file-arrow-down" class="text-teal mr-3" style="font-size: 24px;"></v-icon>
                </div>
                <v-icon icon="fa:fas fa-magnifying-glass mr-3"></v-icon>
                <v-text-field
                  v-model="search_RNAname" label="Search"
                  single-line
                  variant="solo-filled" hide-details
                  density="compact" style="width:250px">
                </v-text-field>
              </div>
            </div>
            <v-data-table fixed-header v-model:items-per-page="itemsPerPage" :headers="tableComponentInfo.headers"
              :items="tableComponentInfo.body" item-value="Sample name" class="elevation-1" :height="dataTable_height"
              :search="search_RNAname">
              <template v-slot:item.ReadCount="{item}">
                <div>
                  {{ item.ReadCount.toLocaleString('en-US') }}
                </div>
              </template>
              <template v-slot:item.CPM="{item}">
                <div>
                  {{ item.CPM.toLocaleString('en-US') }}
                </div>
              </template>
            </v-data-table>
          </v-card>
        </v-window-item>
      </v-window>
    </v-card-text>
    </v-card>
  </div>
</template>
<script setup >
  /* eslint-disable */
  import { ref, reactive } from 'vue';
  import { dataService } from '../service/data_service';
  import { Subject, takeUntil, debounceTime } from 'rxjs';
  import BoxPlot from '../components/poltly/BoxPlot.vue';
  import ScatterPlot from '../components/poltly/ScatterPlot.vue';
  import PCA_plot from '../components/poltly/PCAPlot.vue';
  import Dendrograms from '../components/poltly/Dendrogram.vue';
  const comSubject$ = new Subject();
  const tableComponentInfo = ref({});
  const miRNATabs = ref([]);
  const itemsPerPage = ref(25)
  let miRNATables = {};
  const headers = [];
  const conditionHeaders = ref([]);
  const condition_header = ref(0);
  const selctedSampleItem = ref([]);
  const sample1Item = ref('');
  const sample2Item = ref('');
  const selectedSampleTitle = reactive([]);
  const displayStyle = ref(['QC Graph', 'Table']);
  const useStyleTab = ref(0);
  const dataTable_height = ref('');
  const search_RNAname = ref('');
  const plot_height = reactive({
    height:550
  })
  const plot_cols = ref(6);
  const tableHeader = [
    {title: 'Gene Symbol', align: 'center', sortable: true, key: 'title'},
    // {title: 'log10(CPM+1)', align: 'center', sortable: true, key: 'log10(CPM+1)'},
    {title: 'CPM', align: 'center', sortable: true, key: 'CPM'},
    {title: 'Read Count', align: 'center', sortable: true, key: 'ReadCount'}];
  // 

  // 
  dataService.visualization_Plot$.pipe(takeUntil(comSubject$),debounceTime(300)).subscribe((visualization_info)=>{
    const tempSampleList = [];
    for(let i = 0 ; visualization_info.headers.length > i ; i++){
      tempSampleList.push(visualization_info.headers[i])
    };
    selctedSampleItem.value = tempSampleList.sort();
    // selctedSampleItem.value =  visualization_info.headers;

    if(visualization_info.headers.length > 1){
      sample1Item.value = visualization_info.headers[0];
      sample2Item.value = visualization_info.headers[1];
      selectedSampleTitle.length = 0;
      selectedSampleTitle.push(visualization_info.headers[0], visualization_info.headers[1])
      // selectedSampleTitle = [visualization_info.headers[0], visualization_info.headers[1]];
    }
  });
  dataService.handleRawReadsFolder$.pipe(takeUntil(comSubject$), debounceTime(300)).subscribe((microRNAraw)=>{
    if(Object.keys(miRNATables).length === 0) computed_miRNA_Info(microRNAraw);
    // miRNATab.value = microRNAraw.tabs[0];
    // miRNATables.value = microRNAraw.tabsTable;
    // handleTableComponent(microRNAraw.tabsTable[0]);
    //tabs模板速度太快，資料還沒處理好就畫出介面，導致介面無資料，之後要延遲tabs時間
    // dataService.transferHandleFinishMeg(microRNAraw);
  });
  const changed_plot_size = (colNum, plotSize)=>{
    plot_cols.value = colNum; 
    plot_height.height = plotSize;
  }
  const computed_miRNA_Info = (microRNAraw)=>{
    conditionHeaders.value.length = 0;
    const tempSort_conditionHeaders = [];
    for(let j = 0 ; microRNAraw.tabsTable[0].headers.length > j ; j++){
      if( j > 4 ) headers.push(microRNAraw.tabsTable[0].headers[j]);
      if( j > 5 ) tempSort_conditionHeaders.push(microRNAraw.tabsTable[0].headers[j]);
    }
    conditionHeaders.value = tempSort_conditionHeaders.sort();
    const tableObj = {};
    for(let i = 0 ; microRNAraw.tabsTable.length > i ; i++){
      const tableHeaders = headers.filter((item , index)=>{ if(index> 0) return item } );
      for(let j = 0 ; tableHeaders.length > j ; j++){
        if(!tableObj[tableHeaders[j]]) tableObj[tableHeaders[j]] = {};
      }
      const readCount_Group = [];
      const CPM_group = [];
      if( i === 0){
        for(let j = 0 ; microRNAraw.tabsTable[0].body.length > j ; j++){
        const filter_read_group = microRNAraw.tabsTable[0].body[j].filter((item , index)=>{
          if(index > 5){ 
            return item 
          }});
          readCount_Group.push(filter_read_group);
        }
      }
      for(let j = 0 ; microRNAraw.tabsTable[1].body.length > j ; j++){
        const filter_CPM_group = [];
        microRNAraw.tabsTable[1].body[j].forEach((item, index)=>{
          if(index > 5){
            const numberItem = Math.round(Number(item)*100) / 100;
            filter_CPM_group.push(numberItem)
          }
        })
        CPM_group.push(filter_CPM_group);
      }
      const miRNA_name_Group = [];
      for(let j = 0 ; microRNAraw.tabsTable[i].body.length > j ; j++){
        const filter_miRNA_name = microRNAraw.tabsTable[i].body[j].filter((item, index) => {if(index === 5) return item })[0];
        miRNA_name_Group.push(filter_miRNA_name);
      }
      for(let j = 0 ; tableHeaders.length > j ; j++){
        for(let k = 0; miRNA_name_Group.length > k ; k++){
          if(!tableObj[tableHeaders[j]][miRNA_name_Group[k]]){ 
            tableObj[tableHeaders[j]][miRNA_name_Group[k]] = {
              'ReadCount': calNumInteger(readCount_Group[k][j]),
              // 'log10(CPM+1)': calNumInteger(microRNAraw.log[k][j]),
              'CPM': calNumInteger(CPM_group[k][j]),
            }
          }
        }
      }
    }
    miRNATables = tableObj;
    miRNATabs.value = microRNAraw.tabs;
    const windowInnerheight = window.innerHeight;
    dataTable_height.value =  Math.ceil((windowInnerheight - 330)/ windowInnerheight * 100) + 'vh';
    displayTableInfo();
  };
  const calNumInteger = (val) =>{
    const numberItem = Math.round(Number(val)*100) / 100;
    return numberItem
    // const numTo_en_US = numberItem.toLocaleString('en-US');
    // return numTo_en_US
  };
  const displayTableInfo = () => {  
    const selectHeaderName = conditionHeaders.value[condition_header.value];
    const displayTableArr = [];
    const selected_miRNA_names = Object.keys(miRNATables[selectHeaderName]);
    for(let i = 0 ; selected_miRNA_names.length > i ;i++){
      const obj = miRNATables[selectHeaderName][selected_miRNA_names[i]];
      obj['title'] = selected_miRNA_names[i];
      displayTableArr.push(obj)
    }
    tableComponentInfo.value.headers = tableHeader;
    tableComponentInfo.value.body = displayTableArr;
  };
  const changeSample1 = (ev)=> {
    sample1Item.value = ev;
    selectedSampleTitle.length = 0;
    selectedSampleTitle.push(sample1Item.value, sample2Item.value)
  };
  const changeSample2 = (ev)=> {
    sample2Item.value = ev;
    selectedSampleTitle.length = 0;
    selectedSampleTitle.push(sample1Item.value, sample2Item.value)
  };
  const exportXlsxFile = ()=>{
    const miRNATables_Obj_Keys = Object.keys(miRNATables);
    const visual_table = [];
    for(let i = 0 ; miRNATables_Obj_Keys.length > i ; i++){
      visual_table[i] = [];
      const miRNATables_Obj_Keys_num_key = Object.keys(miRNATables[miRNATables_Obj_Keys[i]]);
      let headers_title_Index = -1;
      let headers = [];
      for(let j = 0 ; miRNATables_Obj_Keys_num_key.length > j ; j++){
        visual_table[i][j]=[];
        const miRNA_val = miRNATables[miRNATables_Obj_Keys[i]][miRNATables_Obj_Keys_num_key[j]];
        if( j===0){
          headers = Object.keys(miRNA_val);
          headers.unshift('microRNA ID');
          headers_title_Index = headers.indexOf('title');
          if(headers_title_Index > -1) headers.splice(headers_title_Index, 1);
        }
        const miRNA_Table_values = Object.values(miRNA_val);
        miRNA_Table_values.unshift(miRNATables_Obj_Keys_num_key[j]);
        if(headers_title_Index > -1) miRNA_Table_values.splice(headers_title_Index, 1);
        visual_table[i][j] = miRNA_Table_values;
      }
      visual_table[i].unshift(headers);
    }
    dataService.exportXlsx(visual_table, 'visualization', miRNATables_Obj_Keys);

  }
</script>
<style lang="scss">
  .v-table .v-data-table__th,  .v-table .v-data-table__td{
    font-weight: 600 !important;
  }
  .download_xlsx, .toggle_cols{
    cursor: pointer;
  }
  .scatterPlotCompareStyle{
    height:100px;
    display: flex;
    justify-content: center;
    .gapTitle{
      display:block
    }
    .compareStyle{
      display: block;
    }
  }
  @media(max-width: 1200px){
    .scatterPlotCompareStyle{
      display: block;
      height:100px;
      .compareSelect{
        width:100%;
        margin-right: 50px;
      }
      .gapTitle{
        display:none
      }
      .compareStyle{
        display: flex;
        
      }
    }
  }
</style>