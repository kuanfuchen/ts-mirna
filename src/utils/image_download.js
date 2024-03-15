import Plotly from 'plotly.js-dist-min';
const image_config = {
  filename:'plot',
  format:'png',
  width:1920,
  height:1080, 
  scale:2, 
}
const imageCapture = {
  name:'Download Image',
  icon:Plotly.Icons.camera,
  direction:'up',
  click: async(gd)=>{
    await Plotly.toImage(gd,image_config).then((url)=>{
      const aElement = document.createElement('a');
      aElement.href = url;
      aElement.download = image_config.filename;
      aElement.click();
    })
  }
};
export {
  image_config,
  imageCapture,
}