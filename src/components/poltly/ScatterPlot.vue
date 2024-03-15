<template>
  <div>
    <div class="d-flex justify-end">
      <div class="download_xlsx" @click="toogle_Plot_Screen = true">
        <v-icon icon="fa:fas fa-expand mr-5"></v-icon>
      </div>
    </div>
    <div id="scatterplot_visualization"></div>
    <v-dialog v-model="toogle_Plot_Screen"  width="90vw" >
      <v-card class="bg-white" style="overflow-y: hidden;">
        <v-card-text >
          <h5 class="text-h5" style="font-weight: 700;">
            Scatter Plot
          </h5>  
          <div class="ml-auto mr-5">
            <Dialog_plot :listen_plot_data="transfer_FullScreen_data" @toggle_tranfer_dialog_plot="close_dialog" ></Dialog_plot>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup >
  import Plotly from 'plotly.js-dist-min';
  import { takeUntil, Subject, debounceTime } from 'rxjs';
  import { watch, ref } from 'vue';
  import { dataService } from '../../service/data_service';
  import Dialog_plot from '../Dialog_Plot.vue';
  import {image_config, imageCapture} from '../../utils/image_download';
  const comSubject$ = new Subject();
  const toogle_Plot_Screen = ref(false);
  const transfer_FullScreen_data = ref([]);
  const trace1 = {
    x: [],
    y: [],
    mode: 'markers',
    type: 'scatter',
    name: 'scatter',
    text: [],
    marker: { size: 6, color:'#00BCD4' }
  };
  const layout = {
    xaxis: { range: [] },
    yaxis: { range: [] },
    height:() => definedProps.plot_size.height - 100,
    minallowed:0,
    title:`log<span style='font-size:12px'>10</span> (miRNA CPM)`,
  };
  const plotConfig = {
    responsive:true, 
    displaylogo: false,
    modeBarButtonsToRemove: ['pan2d','select2d','lasso2d','zoom','toImage'/*resetScale2d','zoomOut2d'*/],
    modeBarButtonsToAdd:[imageCapture],
    displayModeBar: true
  };
  
  
  const data = [ trace1,/* trace2 */];
  const defineScatterGraphInfo = defineProps(['scatterGraphInfo','plot_size']);
  let scatter_Info = {
    headers:[],
    info:[],
    miRNA_title:[]
  };
  
  const handleScatterPlotInfo = () => {
    const infoTitle = defineScatterGraphInfo.scatterGraphInfo;
    if(scatter_Info.headers.length === 0 && scatter_Info.info.length === 0) return;
    if(infoTitle.length === 0) return;
    const scatterplot_visualizationDiv = document.getElementById('scatterplot_visualization');
    Plotly.purge(scatterplot_visualizationDiv);
    const scatter_Info_Index_Array = [];
    for( let i = 0 ; infoTitle.length > i ; i++){
      if(scatter_Info.headers.length === 0 ) return;
      const scatter_Info_Index = scatter_Info.headers.indexOf(infoTitle[i]);
      if(scatter_Info_Index !== -1) scatter_Info_Index_Array.push(scatter_Info_Index)
    }
    let maxVal = 0;
    let minVal = 0;
    const traceSite = [];
    trace1.x.length = 0;
    trace1.y.length = 0;
    trace1.text = [];
    for(let i = 0 ; scatter_Info_Index_Array.length > i ; i++){
      traceSite[i] = [];
      for(let j = 0 ; scatter_Info.info.length > j ;j++){
        traceSite[i].push(scatter_Info.info[j][scatter_Info_Index_Array[i]])
        if(scatter_Info.info[j][scatter_Info_Index_Array[i]] > maxVal) {
          maxVal = scatter_Info.info[j][scatter_Info_Index_Array[i]];
        }
        if(minVal > scatter_Info.info[j][scatter_Info_Index_Array[i]]) minVal = scatter_Info.info[j][scatter_Info_Index_Array[i]];
      }
    };
    maxVal = Math.ceil(maxVal);
    minVal = Math.floor(minVal - 1) < 0 ? -0.5 : Math.floor(minVal) - 0.5;
    trace1.x = traceSite[0];
    trace1.y = traceSite[1];
    trace1.text = scatter_Info;
    layout.xaxis = {
      range: [ minVal, maxVal],
      title: {text:infoTitle[0], font:{ size:16, weight:'bold' }}
    };
    
    layout.yaxis = {
      range:[ minVal, maxVal ],
      title: {text:infoTitle[1], font:{ size:16, weight:'bold' }}
      // title:infoTitle[1]
    };
    const fullScreen_layout = {
      xaxis:layout.xaxis,
      yaxis:layout.yaxis
    }
    transfer_FullScreen_data.value = {
      data: data,
      layout:fullScreen_layout,
      plotConfig
    };
    image_config.filename = `${infoTitle[0]}_vs_${infoTitle[1]}_scatter_plot`;
    drawGraphScatterPlot_visualization(scatterplot_visualizationDiv);
  };

  const drawGraphScatterPlot_visualization = (div) => {
    setTimeout(() => {
      Plotly.newPlot(div, data, layout, plotConfig/*{ responsive:true, displayModeBar: false }*/)
    });
  };
  
  dataService.visualization_Plot$.pipe(takeUntil(comSubject$),debounceTime(300)).subscribe(async(visualization_info)=>{
    if(visualization_info.info.length === 0) return;
    scatter_Info = visualization_info;
    await handleScatterPlotInfo();
  });
  watch(defineScatterGraphInfo.scatterGraphInfo,() => { handleScatterPlotInfo() });
  watch(defineScatterGraphInfo.plot_size, (newVal)=>{
    // layout.height = newVal.height;
    layout.height = newVal.height - 100;
    handleScatterPlotInfo();
  })
  const close_dialog = (val) => toogle_Plot_Screen.value = val;
</script>