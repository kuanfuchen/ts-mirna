let scale = 2;//放大倍数
let showZoomArea = true;// 移除滑動圖片
let offsetX = 0;
let offsetY = 0;
const zoomImgMouseMove = (e) => {
  offsetX = e.offsetX;
  offsetY = e.offsetY;
}
const zoomImgMouseEnter= () => {
  showZoomArea = true;
}
const zoomImgMouseleave= () =>{
  showZoomArea = false;
}
const mangificant_glass = (target, zoomArea) => {
  target.addEventListener('mousemove', zoomImgMouseMove, false);
  target.addEventListener('mouseenter', zoomImgMouseEnter, false);
  target.addEventListener('mouseleave', zoomImgMouseleave, false);
  // 放大顯示區域
  // 設置放大背景圖
  zoomArea.style.backgroundImage = 'url('+target.getAttribute('src')+')';
  // 圖片加載至背景
  let targetRect = target.getBoundingClientRect();
  let targetWidth = targetRect.width;
  let targetHeight = targetRect.height;
  zoomArea.style.backgroundSize = (targetWidth * scale)+'px '+(targetHeight * scale)+'px';
  let zoomRect = zoomArea.getBoundingClientRect();
  let widthHalf = zoomRect.width / 2;
  let heightHalf = zoomRect.height / 2;
  setInterval(function(){
    zoomArea.style.backgroundPosition = -(offsetX * scale - widthHalf)+'px '+(-(offsetY * scale - heightHalf))+'px';
    // 放大镜在右下角
    if((offsetX + zoomRect.width) > window.innerWidth){
      zoomArea.style.left = (offsetX - zoomRect.width) + 'px';
    }else{
      zoomArea.style.left = offsetX + 'px';
    }

    if((offsetY + zoomRect.height) > window.innerHeight){
      zoomArea.style.top = (offsetY - zoomRect.height) + 'px';
    }else{
      zoomArea.style.top = offsetY + 'px';
    }

    setZoomArea();
  }, 100)
  function setZoomArea(){
    if(showZoomArea)
      zoomArea.style.transform = 'scale(1)';
    else
      zoomArea.style.transform = 'scale(0)';
  }
  setZoomArea();
  
}
export  { mangificant_glass }
