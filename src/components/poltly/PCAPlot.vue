<template>
  <div>
    <div class="d-flex justify-end">
      <div class="download_xlsx" @click="toogle_Plot_Screen = true">
        <v-icon icon="fa:fas fa-expand mr-5"></v-icon>
      </div>
    </div>
    <div id="PCA_plot"></div>
    <!--  -->
    <v-dialog v-model="toogle_Plot_Screen"  width="90vw" >
      <v-card class="bg-white" style="overflow-y: hidden;">
        <v-card-text>
          <h5 class="text-h5" style="font-weight: 700;">
            PCA Plot
          </h5>  
          <div class="ml-auto mr-5">
            <Dialog_plot :listen_plot_data="transfer_FullScreen_data" @toggle_tranfer_dialog_plot="close_dialog" ></Dialog_plot>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup>
  import Plotly from 'plotly.js-dist-min';
  import { dataService } from '../../service/data_service';
  import Dialog_plot from '../Dialog_Plot.vue';
  import { takeUntil, Subject } from 'rxjs';
  import { ref, watch } from 'vue';
  import {image_config, imageCapture} from '../../utils/image_download';
  const comSubject$ = new Subject();
  const transfer_FullScreen_data = ref({});
  const toogle_Plot_Screen = ref(false);
  const definedProps = defineProps(['plot_size']);
  const PCA_Data = {
    body:[],
    headers:[],
    sortOrder:[]
  };
  const layout = {
    xaxis:{title:{ text:'PCA1',font:{size:16,weight:'bold'}}},
    yaxis:{title:{text:'PCA2', font:{size:16,weight:'bold'}}},
    margin:{ t:30 },
    height:550
  };
  const plotConfig = {
    responsive:true, 
    displaylogo: false,
    modeBarButtonsToRemove: ['pan2d','select2d','lasso2d','zoom','toImage'],
    modeBarButtonsToAdd:[imageCapture],
    displayModeBar: true
  }
  const settingColor = ['#17becf','#1f77b4','#ff7f0e','#2ca02c','#d62728','#9467bd','#8c564b','#e377c2','#7f7f7f','#bcbd22'];
  // const settingColor = ['#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3', '#03A9F4',
  //   '#00BCD4', '#009688', '#4CAF50', '#8BC34A' , '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800','#FF5722'
  //   ,'#795548', '#607D8B'];
  const madePCA_plot = async() => {
    const tempData = [];
    const title = [];
    for(let i = 0 ; PCA_Data.body.length > i ; i++){
      if( i < 2 ){
        title.push(PCA_Data.body[i][0]);
        // 
        for(let j = 0; PCA_Data.body[i].length > j ; j++){
          if(j > 0){
            if(!tempData[ j - 1 ]) tempData[ j - 1 ] = [];
            const pca_data_number = Number(PCA_Data.body[i][j]);
            tempData[ j - 1 ].push(pca_data_number)
          }
        }
      }
    }
    const pca_plot_data = [];
    const headersTitle =  PCA_Data.headers.filter((item, index)=>{if(index > 0)return item});
    for(let i = 0 ; tempData.length > i ; i++){
      const drawMarkerColor = PCA_Data.sortOrder.filter((item)=>{ if(item.name === headersTitle[i])return item.color})[0];
      // const drawMarkerColor = PCA_Data.sortOrder.filter((item)=>{ if(item.name === PCA_Data.headers[ i + 1 ])return item.color})[0];
      pca_plot_data.push({
        x:[ tempData[i][0] ],
        y:[ tempData[i][1] ],
        mode: 'markers',
        type: 'scatter',
        hoverlabel:{
          namelength:50
        },
        marker:{
          size: 32,
          color: drawMarkerColor.color,
          line:{
            width:1,
            color:'black'
          }
        },
        name: PCA_Data.headers[ i + 1 ],
      }) 
    }
    for( let i = 0 ; title.length > i ; i++ ){
      const layoutTextSplit = title[i].split(/^([^\s]+)\s*\(([\d.]+%)\)$/);
      const layoutAxisTitle = layoutTextSplit[2].substring(0,5);
      if(i === 0){
        // layout.xaxis.title = `${layoutTextSplit[1]} (${layoutAxisTitle}%)`
        layout.xaxis.title.text = `${layoutTextSplit[1]} (${layoutAxisTitle}%)`;
      }else if(i === 1){
        // layout.yaxis.title = `${layoutTextSplit[1]} (${layoutAxisTitle}%)`
        layout.yaxis.title.text = `${layoutTextSplit[1]} (${layoutAxisTitle}%)`;
      }
    }
    const pca_plot_data_order = [];
    for(let i = 0 ; PCA_Data.sortOrder.length > i ; i++){
      const orderIndex = pca_plot_data.filter((item)=>{if(item.name === PCA_Data.sortOrder[i].name) return item})[0];
      pca_plot_data_order.push(orderIndex)
    }
    const full_screen_layout = {
      xaxis:{
        // title:layout.xaxis.title,
        title:{ text:layout.xaxis.title.text, font:{ size:20, weight:'bold' } }
      },
      yaxis:{
        // title:layout.yaxis.title
        title:{ text:layout.yaxis.title.text, font:{ size:20, weight:'bold' }}}
    }
    image_config.filename = `Visualization_PCA_plot`;
    setTimeout(() => {
      transfer_FullScreen_data.value = {
        data:pca_plot_data_order,
        layout:full_screen_layout,
        plotConfig
      };
      Plotly.newPlot('PCA_plot', pca_plot_data_order, layout, plotConfig);
    }, 200);
  }
  dataService.CPM_PCA_Info$.pipe(takeUntil(comSubject$)).subscribe(async(data)=>{
    if(!data.body)return;
    for(let i = 0; data.body.length > i ; i++){
      PCA_Data.body.push(data.body[i])
    };
    const conditionColor = [];
    const orderNameOrder = [];
    for(let i = 0 ; data.sortOrder.length > i ; i++){
      const orderNumIndex = orderNameOrder.indexOf(data.sortOrder[i].order);
      if(orderNumIndex === -1){
        orderNameOrder.push(data.sortOrder[i].order);
        const reminder = orderNameOrder.length % 18;//color number
        conditionColor.push({
          condition:data.sortOrder[i].order,
          color: settingColor[reminder]
        })
      };
    }
    PCA_Data.headers = data.headers;
    PCA_Data.sortOrder = data.sortOrder;
    for(let i = 0 ; PCA_Data.sortOrder.length > i ; i++){
      conditionColor.forEach((item)=>{
        if(item.condition === PCA_Data.sortOrder[i].order){
          PCA_Data.sortOrder[i].color = item.color;
        }
      })
    }
    await madePCA_plot();
  });
  const close_dialog = (val) => toogle_Plot_Screen.value = val;
  watch(definedProps.plot_size, (newVal)=>{
    layout.height = newVal.height;
    madePCA_plot()
  })
</script>