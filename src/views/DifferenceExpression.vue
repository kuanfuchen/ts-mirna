<template>
  <div>
    <v-card class="px-3 mt-2" width="100%" >
      <!--  -->
      <template v-slot:title>
        <p class="text-teal font-weight-bold">Difference Expression Analysis</p> 
      </template>
      <v-card-text>
        <v-row no-gutters>
          <v-col cols="3">
            <v-sheet class="pa-2 ma-2">
              <p class="font-weight-bold text-right">Compare</p>
            </v-sheet>
          </v-col>
          <v-col cols="4">
            <v-sheet>
              <v-select label="Select compare" :items="compare_de_title_group" v-model="compare_de_title" @update:modelValue="changed_miRNA_DataInfo"
                variant="outlined" density="compact"></v-select>
            </v-sheet>
          </v-col>
        </v-row>
        <!--  -->
        <v-row no-gutters>
          <v-col cols="3">
            <v-sheet class="pa-2 ma-2"> 
              <p class="text-right font-weight-bold">P-value</p>
            </v-sheet>
          </v-col>
          <v-col cols="2">
            <v-sheet>
              <v-text-field density="compact" label="Number(0 ~ 1)" variant="outlined" v-model="p_value_number"
              type="number" @update:modelValue="changed_miRNA_DataInfo"></v-text-field>
            </v-sheet>
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col cols="3">
            <v-sheet class="pa-2 ma-2">
              <p class="font-weight-bold text-right">
                Log2 Fold Change Lower bound / Upper bound
                <!-- log2FC Lower bound (-{{ log2V_model_val }}~0) / Upper bound (0~{{ log2V_model_val }}) -->
              </p>
            </v-sheet>
            
          </v-col>
          <v-col cols="2">
            <!-- :label="`Number(-${log2V_model_val} ~ 0)`"  -->
            <v-text-field type="number" variant="outlined" v-model="log2_LowerBound" density="compact"
            @update:modelValue="changed_miRNA_DataInfo"></v-text-field>
          </v-col>
          <v-col class="ml-5" cols="2">
            <!-- :label="`Number(0 ~ ${log2V_model_val})`" -->
            <v-text-field  type="number" variant="outlined" v-model="log2_UpperBound" density="compact" 
            @update:modelValue="changed_miRNA_DataInfo"></v-text-field>
          </v-col>
        </v-row>
        <!-- <hr> -->
      </v-card-text>
      <v-card-text class="py-0">
        <div class="d-flex justify-end mr-3">
          <div class="d-flex justify-end mt-2 ">
            <div class="toggle_cols " @click="changedContentSize(6, 220, 450)">
              <v-icon icon="fa:fas fa-table-columns mr-5"></v-icon>
            </div>
            <div class="toggle_cols" @click="changedContentSize(12, 0, 350)" >
              <v-icon icon="fa:far fa-square mr-5"></v-icon>
            </div>
          </div>
        </div>
        <v-row>
          <v-col :cols="contentCols">
            <div class="py-1 mb-2">
              <p class="text-h6 ml-3 text-teal" style="font-weight: 700;">Volcano Plot</p>
              <Volcano :change_volcano_plot="compare_de_Obj" @xaxisMaxValue="listenXxais_Max"></Volcano>
            </div>
          </v-col>
          <v-col :cols="contentCols">
            <div v-if="handleDataIF">
              <!-- <v-card class="px-2 py-1"> -->
              <div class="d-flex align-self-center px-2 py-1">
                <p class="text-h6 my-2 text-teal" style="font-weight: 700;">Difference Expression miRNA Table</p>   
              </div>
              <div class="d-flex justify-space-between">
                <p class="mb-2" style="font-weight: 700;font-size: 18px;">
                  {{ compare_de_title }}
                </p>
                  <!-- <div class="d-flex" style="width:500px">
                    <p class="mr-3 font-weight-bold pt-4" style="font-size:18px;">FDR</p>
                    <v-text-field  density="compact" label="FDR / Number(0 ~ 1)" variant="outlined" v-model="fdrVal" @update:modelValue="handle_table_Info"
                      type="number">
                    </v-text-field>
                  </div> -->
              </div>
              <DisplayTable :table="tableComponentInfo" :useSearch="true" :expresstablestyle="deTableSize" @select_miRNA_name="tableSelected_miRNA_name"></DisplayTable>
              <!-- </v-card> -->
            </div>
            <div class="mb-5">
              <div class="mt-3 d-flex align-center ">
                <h3 style="width:250px">Downlaod filter miRNA table</h3>
                <v-btn class="download_xlsx text-none ml-3" @click="exportFile(false)">
                  <v-icon icon="fa:fas fa-file-arrow-down" class="text-teal " style="font-size: 24px;"></v-icon>
                </v-btn>
                
              </div>
              <div class="d-flex align-center mt-8">
                <h3 style="width:250px">
                  Download <span class="text-light-blue">none filter</span> raw table
                </h3>
                <v-btn class="text-none ml-3"  @click="toggleExportRawData">
                  <v-icon icon="fa:fas fa-file-arrow-down" class=" text-light-blue mr-1" style="font-size: 24px;"></v-icon>
                  <!-- None filter raw table -->
                </v-btn>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </div>
</template>
<script setup>
  import { ref } from 'vue';
  import {dataService} from '../service/data_service';
  import { takeUntil, debounceTime,Subject } from 'rxjs';
  import DisplayTable from '../components/DisplayTable.vue';
  import Volcano from '../components/poltly/Volcano_plot.vue';
  const comSubject$ = new Subject();
  const compare_de_title_group = ref([]);
  const compare_de_title = ref('');
  const select_P_Q_Style = ref('P-value');
  const p_value_number = ref(1);
  const log2_LowerBound = ref(-1);
  const log2_UpperBound = ref(1);
  const handleDataIF = ref(false);
  const contentCols = ref(12);
  const deTableSize= ref(0);
  const plot_height = ref(350);
  const tableComponentInfo = ref({
    headers:[],
    body:[],
  });
  const display_plotText = [];
  const compare_de_Obj = ref({
    title:'',
  });
  const log2V_model_val = ref(0);
  const fdrVal = ref(1);
  let compare_de_tables_info = [];
  dataService.DE_Folder_Info$.pipe(takeUntil(comSubject$), debounceTime(300)).subscribe((deFolderData)=>{
    sort_deFolderData(deFolderData);
  });
  const changedContentSize = (col, removeTableHeight, removePlotHeight)=>{
    if(contentCols.value === col) return;
    contentCols.value = col;
    deTableSize.value = removeTableHeight;
    plot_height.value = removePlotHeight;
    changed_miRNA_DataInfo()
  }
  const sort_deFolderData = async(de_data) => {
    if(Object.keys(de_data).length === 0)return;
    if(de_data.title_Group.length === 0){
      console.log("don't deData");
      return
    };
    compare_de_title_group.value = await de_data.title_Group;
    compare_de_title.value = await de_data.title_Group[0];
    de_data.info.forEach((item) => compare_de_tables_info.push(item));
    await handle_table_Info();
  };
  const handle_table_Info = ()=>{
    const fdrVal_Number = Number(fdrVal.value);
    if(fdrVal_Number <= 0) return;
    const p_value_number_val = Number(p_value_number.value);
    if(p_value_number_val <=0 )return;
    return new Promise((resolve, reject)=>{
      handleDataIF.value = false;
      let checkedUpDownIndex = -1; 
      const display_Table = [];
      let fdrIndex = -1;
      for(let i = 0 ; compare_de_tables_info.length > i ; i++){
        // if(compare_de_tables_info[i].title === compare_de_title.value){
        const headers = [];
        for(let j = 0 ; compare_de_tables_info[i].headers.length > j; j++){
          let header = '';
          const headerIndex = compare_de_tables_info[i].headers[j].indexOf('LSMean');
          if(headerIndex > -1){
            header = compare_de_tables_info[i].headers[j];
          }else{
            header = compare_de_tables_info[i].headers[j].split(/\(/)[0];
          };
          const headerUpper = header.toUpperCase().trim();
          if(headerUpper === 'LOG2'){
            checkedUpDownIndex = j;
            headers.push('Log2Ratio', 'Up_Down');
          }else{
            const headerTrim = header.trim();
            headers.push(headerTrim);
            // headers.push(header);
          }
          if(headerUpper === 'FDR STEP UP'){
            fdrIndex = j;
          }
        }
        // const headers_significant_index = headers.indexOf('significant');
        // if(headers_significant_index === -1) headers.push('significant');
        const headersUpper = [];
        for(let i = 0 ; headers.length > i ; i++){
          headersUpper.push(headers[i].toUpperCase())
        }
        const headers_p_value = headersUpper.indexOf('P-VALUE');
        const headers_log2_Ratio = headersUpper.indexOf('LOG2RATIO');
        const headers_ratio = headersUpper.indexOf('RATIO');
        for(let j = 0 ; compare_de_tables_info[i].body.length > j ; j++){
          // const fdrNumber = Number(compare_de_tables_info[i].body[j][fdrIndex]);
          // const significant_value = fdrVal_Number >= fdrNumber ? true : false;
          if(headers.length > compare_de_tables_info[i].body[j].length){
            compare_de_tables_info[i].body[j].forEach((item, index)=>{
              let changedStyle;
              if(index === checkedUpDownIndex) changedStyle = Number(compare_de_tables_info[i].body[j][checkedUpDownIndex]);
              if(changedStyle >= 0){
                compare_de_tables_info[i].body[j].splice(checkedUpDownIndex + 1, 0, 'UP')
              }else if(changedStyle < 0){
                compare_de_tables_info[i].body[j].splice(checkedUpDownIndex + 1, 0, 'Down')
              }
            })
          }
          // if(compare_de_tables_info[i].body[j].length <= headers.length){
          //   compare_de_tables_info[i].body[j][headers.length - 1]= significant_value;
          // }
          if(headers_p_value > -1 && compare_de_tables_info[i].title === compare_de_title.value) {
            const compare_de_tables_p_value_Number = Number(compare_de_tables_info[i].body[j][headers_p_value]);
            const compare_de_tables_log2_Number = Number(compare_de_tables_info[i].body[j][headers_log2_Ratio]);
            if(compare_de_tables_p_value_Number > p_value_number_val) continue;
            if(headers_log2_Ratio >=0 && compare_de_tables_log2_Number >=log2_UpperBound.value ||
              headers_log2_Ratio >=0 && compare_de_tables_log2_Number <= log2_LowerBound.value){
                compare_de_tables_info[i].body[j][headers_log2_Ratio] = Number(compare_de_tables_info[i].body[j][headers_log2_Ratio]);
                compare_de_tables_info[i].body[j][headers_ratio] = Number(compare_de_tables_info[i].body[j][headers_ratio]);
                // console.log(compare_de_tables_info[i].body[j][headers_ratio],'compare_de_tables_info[i].body[j]')
              display_Table.push(compare_de_tables_info[i].body[j]);
            }
          };
          // 
          compare_de_tables_info[i].headers = headers;
        }
        if(compare_de_tables_info[i].title === compare_de_title.value){
          resolve({
            // body:compare_de_tables_info[i].body,
            body: display_Table,
            headers,
            showCheckBox:true
          })
        }
    }
    }).then((response)=>{
      tableComponentInfo.value = response;
      handleDataIF.value = true;
    });
  };
  const changed_compare_de_Obj = (obj_title)=>{
    compare_de_Obj.value.title = obj_title;
    compare_de_Obj.value.selectStyle = select_P_Q_Style.value;
    compare_de_Obj.value.selectStyleNum = p_value_number.value;
    compare_de_Obj.value.log2_LowerBound = log2_LowerBound.value;
    compare_de_Obj.value.log2_UpperBound = log2_UpperBound.value;
    compare_de_Obj.value.height = plot_height.value;
    compare_de_Obj.value.displayText = display_plotText;
  }
  const changed_miRNA_DataInfo = () => {
    if(log2_UpperBound.value === '' || log2_LowerBound.value === '') return;
    for(let i = 0 ; compare_de_tables_info.length > i ; i++){
      if( compare_de_title.value === compare_de_tables_info[i].title ){
        display_plotText.length = 0;
        handle_table_Info();
        changed_compare_de_Obj(compare_de_tables_info[i].title);
      }
    }
  };
  const listenXxais_Max = (emitValue)=>{
    log2V_model_val.value = emitValue;
  }
  const tableSelected_miRNA_name = (plot_text)=>{
    compare_de_Obj.value.title = '';
    display_plotText.length = 0;
    plot_text.forEach((item) => display_plotText.push(item));
    for(let i = 0 ; compare_de_tables_info.length > i ; i++){
      if( compare_de_title.value === compare_de_tables_info[i].title ){
        changed_compare_de_Obj(compare_de_tables_info[i].title);
      }
    }
  }
  const exportFile = (rawTableBoolean) => {
    const combinationTable = [];
    const combinationTable_title = [];
    const p_value_number_val = Number(p_value_number.value);
    let excel_status = [];
    for(let i = 0 ; compare_de_tables_info.length > i ; i++){
      const headersUpper = [];
      for(let j = 0 ; compare_de_tables_info[i].headers.length > j ; j++){
        headersUpper.push(compare_de_tables_info[i].headers[j].toUpperCase())
      }
      const headers_p_value_Index = headersUpper.indexOf('P-VALUE');
      const headers_log2_Ratio_Index = headersUpper.indexOf('LOG2RATIO');
      const table = [];
      combinationTable_title.push(compare_de_tables_info[i].title)
      table.push(compare_de_tables_info[i].headers);
      for(let j = 0 ; compare_de_tables_info[i].body.length > j ; j++){
        const compare_de_tables_p_value_Number = Number(compare_de_tables_info[i].body[j][headers_p_value_Index]);
        if(headers_p_value_Index > -1 && compare_de_tables_p_value_Number <= p_value_number_val && rawTableBoolean !== true){
          const compare_de_tables_log2_Number = Number(compare_de_tables_info[i].body[j][headers_log2_Ratio_Index]);
          if(headers_log2_Ratio_Index >= 0 && compare_de_tables_log2_Number >= log2_UpperBound.value ||
            headers_log2_Ratio_Index >= 0 && compare_de_tables_log2_Number <= log2_LowerBound.value){
              table.push(compare_de_tables_info[i].body[j]);
          }
        }else if(rawTableBoolean === true){
          table.push(compare_de_tables_info[i].body[j])
        }
      }
      combinationTable.push(table)
    }
    let status_pvalue = p_value_number_val;
    let status_log2_LowerBound = log2_LowerBound.value;
    let status_log2_UpperBound = log2_UpperBound.value;
    const status_range_log2FC_Lower_bound = `log2Fold Change Lower bound`;
    const status_range__log2FC_Upper_bound = `log2Fold Change Upper bound`;
    if(rawTableBoolean){
      status_log2_LowerBound = 0;
      status_log2_UpperBound = 0;
      status_pvalue = 1;
    }
    combinationTable_title.unshift('State');
    excel_status.push(['P-value', status_pvalue], [status_range_log2FC_Lower_bound, status_log2_LowerBound ],[status_range__log2FC_Upper_bound, status_log2_UpperBound]);
    combinationTable.unshift(excel_status);
    dataService.exportXlsx(combinationTable, 'difference_expression', combinationTable_title);
  }
  dataService.export_raw_table_different_expression_XLSX$.pipe(takeUntil(comSubject$)).subscribe((rawTableBoolean)=>{
    exportFile(rawTableBoolean);
  })
  const toggleExportRawData =  () => {
    dataService.exportRawTable_different_expression();
  }
</script>
<style lang="scss">
  .toggle_cols{
    cursor: pointer,
  }
</style>
