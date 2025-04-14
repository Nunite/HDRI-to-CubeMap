import { Vector3 as V3 } from 'three'
import { procRenderer, procCamera } from '../components/process'
import { mainScene, mainCamera, renderer } from '../components/base';
import { updateMaterial } from '../materials/sphereMat'
const renderCatch = {
  blobs: [],
  names: [],
  packed: [],
  zipping: false,
  progNow: 0,
  progTotal: 0,
  canvas: document.createElement('canvas'),
}


const calcAngle = () => {
  const direction = new V3
  mainCamera.getWorldDirection(direction);
  const angle = direction.multiply(new V3(1, 0, 1)).angleTo(new V3(0, 0, -1));
  if (direction.x < 0) {
    return angle;
  } else {
    return -angle;
  }
}
const packBlobsSep = (callback = href => { }, progress = prog => { }) => {
  const { names, blobs, } = renderCatch;
  renderCatch.packed = [false, false, false, false, false, false];
  console.log(blobs);

  zip.createWriter(new zip.BlobWriter(), writer => {
    const nester = (startIndex = 0, endIndex = 5, callback = () => { }) => {
      console.log('startIndex0:', startIndex);
      writer.add(names[startIndex], new zip.BlobReader(blobs[startIndex]), () => {
        renderCatch.packed[startIndex] = true;
        console.log('startIndex:', startIndex);

        renderCatch.progNow++;
        const { progNow, progTotal } = renderCatch
        progress({ progNow, progTotal });

        if (startIndex >= endIndex) {
          callback();
        } else {
          nester(startIndex + 1, endIndex, callback);
        }
      });
    }
    nester(0, 5, () => {
      console.log(renderCatch.packed);
      writer.close(blob => {
        callback(URL.createObjectURL(blob));
      });
    });
  });
}



const storeBlobsSep = (name, callback = href => { }, progress = prog => { }) => {
  procRenderer.domElement.toBlob(blob => {
    renderCatch.blobs.push(blob);
    renderCatch.names.push(`${name}.png`)
    renderCatch.progNow++;
    const { progNow, progTotal } = renderCatch;
    progress({ progNow, progTotal })
    console.log('blob', blob)
    if (renderCatch.blobs.length === 6) {
      packBlobsSep(callback, progress);
    }
  });
}

// 转换为TGA格式的函数（GoldSrc引擎使用TGA格式）
const convertToTGA = (canvas, callback) => {
  // 这里只是模拟TGA转换，实际项目中需要实现真正的PNG到TGA转换
  // 由于浏览器不支持直接生成TGA，这里仍然使用PNG格式
  canvas.toBlob(callback);
}

const storeGoldSrcBlobs = (name, callback = href => { }, progress = prog => { }) => {
  // 为GoldSrc创建一个临时画布以便转换为TGA
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = procRenderer.domElement.width;
  tempCanvas.height = procRenderer.domElement.height;
  const ctx = tempCanvas.getContext('2d');
  ctx.drawImage(procRenderer.domElement, 0, 0);
  
  convertToTGA(tempCanvas, blob => {
    renderCatch.blobs.push(blob);
    renderCatch.names.push(`${name}.tga`) // 使用TGA扩展名
    renderCatch.progNow++;
    const { progNow, progTotal } = renderCatch;
    progress({ progNow, progTotal })
    console.log('blob', blob)
    if (renderCatch.blobs.length === 6) {
      packBlobsSep(callback, progress);
    }
  });
}

// 添加一个旋转图片的函数
const rotateImage = (canvas, direction) => {
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = canvas.width;
  tempCanvas.height = canvas.height;
  const ctx = tempCanvas.getContext('2d');
  
  // 保存原始图像
  ctx.drawImage(canvas, 0, 0);
  
  // 清除原始画布
  const originalCtx = canvas.getContext('2d');
  originalCtx.clearRect(0, 0, canvas.width, canvas.height);
  
  // 旋转并绘制
  originalCtx.save();
  originalCtx.translate(canvas.width/2, canvas.height/2);
  
  // direction: 'left' 表示向左旋转90度，'right' 表示向右旋转90度
  if (direction === 'left') {
    originalCtx.rotate(-Math.PI/2); // 逆时针旋转90度
  } else if (direction === 'right') {
    originalCtx.rotate(Math.PI/2); // 顺时针旋转90度
  }
  
  originalCtx.drawImage(tempCanvas, -canvas.width/2, -canvas.height/2);
  originalCtx.restore();
  
  return canvas;
}

// 为GoldSrc添加一个特殊的处理函数，处理up和down面的旋转
const storeGoldSrcRotatedBlobs = (name, direction, callback = href => { }, progress = prog => { }) => {
  // 创建临时画布
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = procRenderer.domElement.width;
  tempCanvas.height = procRenderer.domElement.height;
  const ctx = tempCanvas.getContext('2d');
  
  // 复制渲染器的图像到临时画布
  ctx.drawImage(procRenderer.domElement, 0, 0);
  
  // 如果是up或dn，则进行旋转
  if (direction) {
    rotateImage(tempCanvas, direction);
  }
  
  // 转换为blob并存储
  tempCanvas.toBlob(blob => {
    renderCatch.blobs.push(blob);
    renderCatch.names.push(`${name}.png`)
    renderCatch.progNow++;
    const { progNow, progTotal } = renderCatch;
    progress({ progNow, progTotal })
    console.log('blob', blob)
    if (renderCatch.blobs.length === 6) {
      packBlobsSep(callback, progress);
    }
  });
}

const procRenderSep = (size = 64, callback = (href) => { }, progress = prog => { }, prefix = 'CubeMap', isGoldSrc = false, isGoldSrcPng = false) => {
  renderCatch.blobs = [];
  renderCatch.names = [];
  renderCatch.progNow = 0;
  renderCatch.progTotal = 12;
  procRenderer.setSize(size, size);
  procCamera.rotation.set(0, 0, 0);

  const angle = calcAngle();
  procCamera.rotateY(angle);

  // 选择命名格式
  let baseName = prefix || 'CubeMap';
  
  // 用户提供的GoldSrc对应关系有一些混淆
  // nx->lf, bk->pz, rt->px, ft->pz, up->py, dn->ny
  // 注意：bk和ft不能同时对应pz，这是不可能的
  
  // 标准对应关系
  const goldSrcMapping = {
    'px': 'rt', 
    'nx': 'lf', 
    'py': 'up',  
    'ny': 'dn',  
    'pz': 'ft',  
    'nz': 'bk'  
  };
  
  // 选择存储方法和命名格式
  let storeMethod = storeBlobsSep;
  let useGoldSrcNaming = false;
  
  if (isGoldSrc) {
    storeMethod = storeGoldSrcBlobs;
    useGoldSrcNaming = true;
  } else if (isGoldSrcPng) {
    storeMethod = storeBlobsSep;
    useGoldSrcNaming = true;
  }

  //+x (右侧)
  updateMaterial();
  procCamera.rotateY(-Math.PI / 2);
  procRenderer.render(mainScene, procCamera);
  if (useGoldSrcNaming) {
    storeMethod(`${baseName}_${goldSrcMapping['px']}`, callback, progress);
  } else {
    storeMethod(`${baseName}_px`, callback, progress);
  }
  
  //-x (左侧)
  updateMaterial();
  procCamera.rotateY(Math.PI);
  procRenderer.render(mainScene, procCamera);
  if (useGoldSrcNaming) {
    storeMethod(`${baseName}_${goldSrcMapping['nx']}`, callback, progress);
  } else {
    storeMethod(`${baseName}_nx`, callback, progress);
  }
  
  //+y (顶部)
  updateMaterial();
  procCamera.rotateY(-Math.PI / 2);
  procCamera.rotateX(Math.PI / 2);
  procRenderer.render(mainScene, procCamera);
  if (useGoldSrcNaming) {
    storeMethod(`${baseName}_${goldSrcMapping['py']}`, callback, progress);
  } else {
    storeMethod(`${baseName}_py`, callback, progress);
  }
  
  //-y (底部)
  updateMaterial();
  procCamera.rotateX(-Math.PI);
  procRenderer.render(mainScene, procCamera);
  if (useGoldSrcNaming) {
    storeMethod(`${baseName}_${goldSrcMapping['ny']}`, callback, progress);
  } else {
    storeMethod(`${baseName}_ny`, callback, progress);
  }
  
  //+z (前面)
  updateMaterial();
  procCamera.rotateX(Math.PI / 2);
  procRenderer.render(mainScene, procCamera);
  if (useGoldSrcNaming) {
    storeMethod(`${baseName}_${goldSrcMapping['pz']}`, callback, progress);
  } else {
    storeMethod(`${baseName}_pz`, callback, progress);
  }
  
  //-z (后面)
  updateMaterial();
  procCamera.rotateY(Math.PI);
  procRenderer.render(mainScene, procCamera);
  if (useGoldSrcNaming) {
    storeMethod(`${baseName}_${goldSrcMapping['nz']}`, callback, progress);
  } else {
    storeMethod(`${baseName}_nz`, callback, progress);
  }
}
const procRenderUnity = (size = 64, callback = href => { }, progress = prog => { }, prefix = 'CubeMap') => {
  renderCatch.progNow = 0;
  renderCatch.progTotal = 4;
  const { canvas } = renderCatch;
  canvas.width = size * 4;
  canvas.height = size * 3;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  procRenderer.setSize(size, size);
  procCamera.rotation.set(0, 0, 0);

  const angle = calcAngle();
  procCamera.rotateY(angle);

  updateMaterial();
  procRenderer.render(mainScene, procCamera);
  ctx.drawImage(procRenderer.domElement, size, size);

  updateMaterial();
  procCamera.rotateY(-Math.PI / 2);
  procRenderer.render(mainScene, procCamera);
  ctx.drawImage(procRenderer.domElement, size * 2, size);

  updateMaterial();
  procCamera.rotateY(-Math.PI / 2);
  procRenderer.render(mainScene, procCamera);
  ctx.drawImage(procRenderer.domElement, size * 3, size);

  updateMaterial();
  procCamera.rotateY(-Math.PI / 2);
  procRenderer.render(mainScene, procCamera);
  ctx.drawImage(procRenderer.domElement, 0, size);

  updateMaterial();
  procCamera.rotateY(-Math.PI / 2);
  procCamera.rotateX(Math.PI / 2);
  procRenderer.render(mainScene, procCamera);
  ctx.drawImage(procRenderer.domElement, size, 0);

  updateMaterial();
  procCamera.rotateX(-Math.PI);
  procRenderer.render(mainScene, procCamera);
  ctx.drawImage(procRenderer.domElement, size, size * 2);

  renderCatch.progNow++
  progress({ progNow: renderCatch.progNow, progTotal: renderCatch.progTotal });

  // 使用前缀命名文件
  const fileName = `${prefix || 'CubeMap'}.png`;

  console.log('zip start')
  canvas.toBlob(blob => {
    console.log('blob created')
    renderCatch.progNow++
    progress({ progNow: renderCatch.progNow, progTotal: renderCatch.progTotal });
  
    zip.createWriter(new zip.BlobWriter(), writer => {
      writer.add(fileName, new zip.BlobReader(blob), () => {
        renderCatch.progNow++
        progress({ progNow: renderCatch.progNow, progTotal: renderCatch.progTotal });
      
        writer.close(blob => {
          console.log('zip end')
          renderCatch.progNow++
          progress({ progNow: renderCatch.progNow, progTotal: renderCatch.progTotal });
        
          callback(URL.createObjectURL(blob));
        });
      });
    });
  });
}
const procRenderUE4 = (size = 64, callback = href => { }, progress = prog => { }, prefix = 'CubeMap') => {
  renderCatch.progNow = 0;
  renderCatch.progTotal = 4;
  const { canvas } = renderCatch;
  canvas.width = size * 6;
  canvas.height = size * 1;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  procRenderer.setSize(size, size);
  procCamera.rotation.set(0, 0, 0);

  const angle = calcAngle();
  procCamera.rotateY(angle);
  //+z
  updateMaterial();
  procRenderer.render(mainScene, procCamera);
  ctx.drawImage(procRenderer.domElement, 3 * size, 0);
  //+x
  procCamera.rotateY(-Math.PI / 2);
  procCamera.rotateZ(-Math.PI / 2);
  updateMaterial();
  procRenderer.render(mainScene, procCamera);
  ctx.drawImage(procRenderer.domElement, 0, 0);
  //-z
  procCamera.rotateZ(Math.PI / 2);
  procCamera.rotateY(-Math.PI / 2);
  procCamera.rotateZ(Math.PI);
  updateMaterial();
  procRenderer.render(mainScene, procCamera);
  ctx.drawImage(procRenderer.domElement, 2 * size, 0);
  //-x
  procCamera.rotateZ(-Math.PI);
  procCamera.rotateY(-Math.PI / 2);
  procCamera.rotateZ(Math.PI / 2);
  updateMaterial();
  procRenderer.render(mainScene, procCamera);
  ctx.drawImage(procRenderer.domElement, 1 * size, 0);
  //+y
  procCamera.rotateZ(-Math.PI / 2);
  procCamera.rotateY(-Math.PI / 2);
  procCamera.rotateX(Math.PI / 2);
  updateMaterial();
  procRenderer.render(mainScene, procCamera);
  ctx.drawImage(procRenderer.domElement, 4 * size, 0);
  //-y
  procCamera.rotateX(-Math.PI);
  procCamera.rotateZ(Math.PI);
  updateMaterial();
  procRenderer.render(mainScene, procCamera);
  ctx.drawImage(procRenderer.domElement, 5 * size, 0);

  renderCatch.progNow++
  progress({ progNow: renderCatch.progNow, progTotal: renderCatch.progTotal });

  // 使用前缀命名文件
  const fileName = `${prefix || 'CubeMap'}.png`;

  console.log('zip start')
  canvas.toBlob(blob => {
    console.log('blob created')
    renderCatch.progNow++
    progress({ progNow: renderCatch.progNow, progTotal: renderCatch.progTotal });
  
    zip.createWriter(new zip.BlobWriter(), writer => {
      writer.add(fileName, new zip.BlobReader(blob), () => {
        renderCatch.progNow++
        progress({ progNow: renderCatch.progNow, progTotal: renderCatch.progTotal });
      
        writer.close(blob => {
          console.log('zip end')
          renderCatch.progNow++
          progress({ progNow: renderCatch.progNow, progTotal: renderCatch.progTotal });
        
          callback(URL.createObjectURL(blob));
        });
      });
    });
  });
}

const procRenderSourceCross = (size = 64, callback = href => { }, progress = prog => { }, prefix = 'CubeMap', isGoldSrc = false) => {
  renderCatch.blobs = [];
  renderCatch.names = [];
  renderCatch.progNow = 0;
  renderCatch.progTotal = 12;
  procRenderer.setSize(size, size);
  procCamera.rotation.set(0, 0, 0);

  const angle = calcAngle();
  procCamera.rotateY(angle);

  // 使用前缀命名
  const baseName = prefix || 'CubeMap';
  
  // GoldSrc命名映射
  const goldSrcMapping = {
    'px': 'rt', 
    'nx': 'lf', 
    'py': 'up',  
    'ny': 'dn',  
    'pz': 'ft',  
    'nz': 'bk'  
  };
  
  // 选择存储方法和命名格式
  let storeMethod = storeBlobsSep;
  let useGoldSrcNaming = isGoldSrc;
  
  // 渲染U (up) - +y
  // 调整相机角度
  updateMaterial();
  procCamera.rotation.set(Math.PI / 2, 0, 0);
  procRenderer.render(mainScene, procCamera);
  // 对up图像向左旋转90度
  if (useGoldSrcNaming) {
    storeGoldSrcRotatedBlobs(`${baseName}_${goldSrcMapping['py']}`, 'left', callback, progress);
  } else {
    storeGoldSrcRotatedBlobs(`${baseName}_py`, 'left', callback, progress);
  }
  
  // 渲染L (left) - -x
  updateMaterial();
  procCamera.rotation.set(0, -Math.PI / 2, 0);
  procRenderer.render(mainScene, procCamera);
  if (useGoldSrcNaming) {
    storeMethod(`${baseName}_${goldSrcMapping['nx']}`, callback, progress);
  } else {
    storeMethod(`${baseName}_nx`, callback, progress);
  }
  
  // 渲染F (front) - +z - 调整为第三个渲染，符合GoldSrc布局
  updateMaterial();
  procCamera.rotation.set(0, 0, 0);
  procRenderer.render(mainScene, procCamera);
  if (useGoldSrcNaming) {
    storeMethod(`${baseName}_${goldSrcMapping['pz']}`, callback, progress);
  } else {
    storeMethod(`${baseName}_pz`, callback, progress);
  }
  
  // 渲染R (right) - +x
  updateMaterial();
  procCamera.rotation.set(0, Math.PI / 2, 0);
  procRenderer.render(mainScene, procCamera);
  if (useGoldSrcNaming) {
    storeMethod(`${baseName}_${goldSrcMapping['px']}`, callback, progress);
  } else {
    storeMethod(`${baseName}_px`, callback, progress);
  }
  
  // 渲染B (back) - -z - 调整为第五个渲染，符合GoldSrc布局
  updateMaterial();
  procCamera.rotation.set(0, Math.PI, 0);
  procRenderer.render(mainScene, procCamera);
  if (useGoldSrcNaming) {
    storeMethod(`${baseName}_${goldSrcMapping['nz']}`, callback, progress);
  } else {
    storeMethod(`${baseName}_nz`, callback, progress);
  }
  
  // 渲染D (down) - -y
  updateMaterial();
  procCamera.rotation.set(-Math.PI / 2, 0, 0);
  procRenderer.render(mainScene, procCamera);
  // 对down图像向右旋转90度
  if (useGoldSrcNaming) {
    storeGoldSrcRotatedBlobs(`${baseName}_${goldSrcMapping['ny']}`, 'right', callback, progress);
  } else {
    storeGoldSrcRotatedBlobs(`${baseName}_ny`, 'right', callback, progress);
  }
}

// 修改导出以包含新函数
export { procRenderSep, procRenderUnity, procRenderUE4, procRenderSourceCross }

