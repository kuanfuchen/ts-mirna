<template>
  <v-row>
    <v-col cols="12">
      <div class="d-flex justify-end mb-3">
        <v-btn density="comfortable" rounded="lg" color="red-darken-1" variant="outlined" @click="cancel_Dialog(false)"
        icon="$close">
        </v-btn>
      </div>
      <div id="dialog_poltly" class="plotLayout mx-auto"></div>
    </v-col>
  </v-row>
</template>
<script setup>
  import { onMounted } from 'vue';
  // const dialog = ref(false);
  import Plotly from 'plotly.js-dist-min';
  const props = defineProps(['listen_plot_data']); 
  const emit = defineEmits(['toggle_tranfer_dialog_plot']);
  const cancel_Dialog = (val) => emit('toggle_tranfer_dialog_plot', val);
  onMounted(() => {
    const plot_info = props.listen_plot_data;
    Plotly.newPlot('dialog_poltly', plot_info.data, plot_info.layout, plot_info.plotConfig);
  });
</script>
<style lang="scss">
  .plotLayout{
    width: 80vw;
    height:80vh;
  }
</style>