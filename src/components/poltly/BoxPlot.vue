<template>
  <div class="">
    <div class="d-flex justify-end">
      <div class="download_xlsx" @click="toogle_Plot_Screen = true">
        <v-icon icon="fa:fas fa-expand mr-5"></v-icon>
      </div>
    </div>
    <div id="Boxplot_visualization"></div>
    <!--  -->
    <v-dialog v-model="toogle_Plot_Screen"  width="90vw" >
      <v-card class="bg-white" style="overflow-y: hidden;">
        <v-card-text >
          <h5 class="text-h5" style="font-weight: 700;">
            Box Plot
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
  import { takeUntil, Subject, debounceTime } from 'rxjs';
  import { ref, watch } from 'vue';
  import {image_config, imageCapture} from '../../utils/image_download';
  import Dialog_plot from '../Dialog_Plot.vue';
  const definedProps = defineProps(['plot_size']);
  const transfer_FullScreen_data = ref([]);
  const comSubject$ = new Subject();
  const toogle_Plot_Screen = ref(false)
  let boxPlot_Info = {
    headers:[],
    info:[]
  };
  const y0 = [];
  const y1 = [];
  for (let i = 0; i < 50; i ++) {
    y0[i] = Math.random();
    y1[i] = Math.random() + 1;
  }
  const layout = {
    height:definedProps.plot_size.height,
    xaxis: { title: {text:'Sample', font:{ size:16, weight:'bold' }}, automargin:'height' },
    yaxis:{title:{ text:`log<span style="font-size:12px">10</span>(miRNA CPM)`, font:{ size:16, weight:'bold' }} },
    font:{ size:12}, 
    margin:{ t:70,},
    title:'miRNA CPM distribution of sample'
  };
  const plotConfig = {
    responsive: true, 
    displaylogo: false,
    modeBarButtonsToRemove: ['pan2d','select2d','lasso2d','zoom', 'toImage'],
    modeBarButtonsToAdd:[imageCapture],
    displayModeBar: true
  }
  // const drawGraphBoxplot_visualization = () =>{
  // const boxplot_visualization = document.getElementById('Boxplot_visualization');
  //   Plotly.newPlot(boxplot_visualization, boxdata, layout);
  // }
  const handleBoxPlotInfo = () => {
    if(boxPlot_Info.headers.length === 0 && boxPlot_Info.info.length === 0) return;
    const Boxplot_visualization = document.getElementById('Boxplot_visualization');
    Plotly.purge(Boxplot_visualization);
    const traceData = [];
    for(let i = 0 ; boxPlot_Info.headers.length > i ; i++){
      traceData[i] = {
        name:boxPlot_Info.headers[i],
        boxpoints: 'Outliers',
        type: 'box',
        y:[]
      };
      for( let j = 0 ; boxPlot_Info.info.length > j ; j++){
        // traceData[i].y.push(boxPlot_Info.info[j][i])
        if(boxPlot_Info.info[j][i] > 0){
          traceData[i].y.push(boxPlot_Info.info[j][i])
        }
      }
    } 
    const dataOrder = [];
    for(let i = 0 ; boxPlot_Info.sortOrder.length > i ; i++){
      const orderIndex = traceData.filter((item)=>{if( boxPlot_Info.sortOrder[i].name === item.name)return item})[0];
      dataOrder.push(orderIndex)
    }
    // 
    // Plotly.newPlot(Boxplot_visualization, sortTraceData, layout, { responsive: true });
    // drawGraphBoxplot_visualization(Boxplot_visualization, traceData)
    image_config.filename = `Visualization_box_plot`;
    transfer_FullScreen_data.value = {
      data:dataOrder,
      layout:{
        xaxis: { title: {text:'Sample', font:{ size:20, weight:'bold' }}, automargin:'height' },
        yaxis:{title:{ text:'miRNA CPM(log<span style="font-size:12px;">10</span>)', font:{ size:20, weight:'bold' }} },
        font:{ size:12}, margin:{ t:50,}
      },
      plotConfig
    }
    setTimeout(()=>{
      Plotly.newPlot(Boxplot_visualization, dataOrder, layout, plotConfig);
    })
  };
  dataService.visualization_Plot$.pipe(takeUntil(comSubject$),debounceTime(300)).subscribe(async(visualization_info)=>{
    if(visualization_info.info.length === 0) return;
    boxPlot_Info = visualization_info;
    await handleBoxPlotInfo();
  });
  watch(definedProps.plot_size, (newVal)=>{
    layout.height = newVal.height;
    handleBoxPlotInfo()
  })
  const close_dialog = (val) => toogle_Plot_Screen.value = val;
</script>