<template>
  <div style="display: block;">
    <div class="d-flex justify-end" style="height:21px;margin-bottom: 9.5px;">
      <!-- <div class="pr-5 btn-icon" @click="downloadHeatmapImage">
          <v-icon icon="fa:fas fa-download"></v-icon>
      </div> -->
      <div class="btn-icon"  @click="showHeatmap()">
        <v-icon icon="fa:fas fa-expand mr-5"></v-icon>
      </div>
    </div>
    <!-- zoomist-container -->
    <div class="zoomist-container" >
      <div class="zoomist-wrapper">
        <div class="zoomist-image">
          <img :src="getHeatmapImg()" id="heatmapPicture" :style="{ height:heatmapHight }" />
        </div>
      </div>
    </div>
  </div>
  <v-dialog v-model="toggle_Heatmap"  width="95vw" >
    <v-card class="bg-white" style="height: 92vh;">
      <v-card-text>
        <div class="d-flex justify-space-between align-center py-2">
        <h5 class="text-h5 ml-2" style="font-weight: 700;">
          Heatmap Plot
        </h5>  
        <div class="d-flex align-center mr-3">
          <v-btn density="comfortable" rounded="lg" color="red-darken-1" variant="outlined" @click="toggle_Heatmap = false"
            icon="$close">
          </v-btn>
        </div>
      </div>
      </v-card-text>
      <v-card-text>
        <div class="zoomist-dialogContainer" >
          <div class="zoomist-wrapper">
            <div class="zoomist-image">
              <img :src="getHeatmapImg()" :style="{width:`${dialogHeatmapWidth}%`,height:`${dialogHeatmapHight}vh`}" />
            </div>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
<style scope>
 @import "zoomist/css";
  .heatmapStyle{
    width:100%;
    /* height: 544.5px; */
    /* height:100%; */
  }
  .btn-icon{
    cursor: pointer;
  }
  .heatmapDialogStyle{
    width: 100%;
    height: 80vh;
  }
.v-input .v-input__details{
  display: none;
}
.zoomist-container {
  width: 100%;
}

.zoomist-image {
  width: 100%;
  /* aspect-ratio: 16 / 9; */
}

.zoomist-image img {
  width: 100%;
  /* height: 544.5px; */
  /* object-fit: cover;
  object-position: center; */
}
</style>
<script setup>
  import { ref, watch, onMounted } from 'vue';
  import Zoomist from 'zoomist'; 
  import html2canvas from 'html2canvas';
  const toggle_Heatmap = ref(false);
  const definedProps = defineProps(['heatmapHeight']);
  import { saveAs } from 'file-saver';
  const heatmapHight = ref('535px');
  const dialogHeatmapHight = ref(80);
  const dialogHeatmapWidth = ref(100);

  const getHeatmapImg = ()=> new URL('@/assets/miRNA-seq/Bowtie2/heatmap.png', import.meta.url).href;
  const downloadHeatmapImage = () => {
    try{
      // method 1 
      // const heatmapPicture = document.querySelector('.heatmapPicture');
      // const imgsrc = heatmapPicture.src;
      // const img = new Image();
      // img.setAttribute('crossOrigin','anonymous');
      // img.onload = ()=>{
      //   const canvas = document.createElement('canvas');
      //   canvas.width = img.width;
      //   canvas.height = img.height;
      //   const context = canvas.getContext('2d');
      //   context.drawImage(img, 0, 0, img.width, img.height);
      //   const url = canvas.toDataURL('image/png');
      //   const a = document.createElement('a');
      //   const event = new MouseEvent('click');
      //   a.download = 'heatmap';
      //   a.href = url;
      //   a.dispatchEvent(event);
      // }
      // img.src = imgsrc
    // method 2
    // const href = new URL('@/assets/miRNA-seq/Bowtie2/heatmap.png', import.meta.url).href;
    // fetch(src).then(async(res)=>{
    //   const blob = await res.blob();
    //   console.log(blob)
    //   const blobUrl = URL.createObjectURL(blob);
    //   const link =document.createElement('a');
    //   link.href = blobUrl;
    //   link.download = 'heatmap';
    //   link.innerHTML = '下載文件';
    //   link.click()
    // })
    // method 3
    const href = new URL('@/assets/miRNA-seq/Bowtie2/heatmap.png', import.meta.url).href;
    console.log(href,'href');
    saveAs(href, 'heatmap.png')
    //method 4 
    // const heatmapPicture = document.getElementById('heatmapPicture');
    // html2canvas(heatmapPicture).then((canvas)=>{
    //   const link = document.createElement('a');
    //   link.href = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    //   link.download = 'screenshot.png';
    //   link.click();
    //   })
    }catch(err){
      console.log(err)
    }
  };
  const showHeatmap = async()=>{
    toggle_Heatmap.value = true;
    setTimeout(() => {
      new Zoomist('.zoomist-dialogContainer', {
        maxScale: 6,
        bounds: true,
        // slider: true,
        zoomer: true
      })
    },50);
  }
  watch(definedProps.heatmapHeight, (newVal)=>{
    if(newVal.height === 550){
      heatmapHight.value = '535px';
    }else{
      heatmapHight.value = '100%'
    }
  });
  const openZoomist = ()=>{
    new Zoomist('.zoomist-container', {
      maxScale: 6,
      bounds: true,
      // slider: true,
      zoomer: true
    })
  }
  onMounted(async() => {
    await openZoomist()
  })
</script>
