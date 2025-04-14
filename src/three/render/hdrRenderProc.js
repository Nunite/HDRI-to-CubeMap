import { Vector3 as V3 } from 'three'
import { hdrProcRenderer, hdrRenderTarget, procCamera, hdrScene } from '../components/process'
import { mainCamera } from '../components/base';
import { updateMaterial } from '../materials/sphereMat';
import { hdrConverterEmmisive } from '../../converters/hdrConverterEmissive';
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
  const width = hdrRenderTarget.width;
  const height = hdrRenderTarget.height;
  const rgbeBuffer = new Uint8Array(width * height * 4);
  hdrProcRenderer.readRenderTargetPixels(hdrRenderTarget, 0, 0, width, height, rgbeBuffer);
  console.log('PixelDataTest', rgbeBuffer)
  hdrConverterEmmisive(width, height, rgbeBuffer).then(blob => {
    renderCatch.blobs.push(blob);
    renderCatch.names.push(`${name}.hdr`)
    renderCatch.progNow++;
    const { progNow, progTotal } = renderCatch;
    progress({ progNow, progTotal })
    console.log('blob', blob)
    if (renderCatch.blobs.length === 6) {
      packBlobsSep(callback, progress);
    }
  })
}

// 添加一个旋转HDR图像数据的函数
const rotateHdrBuffer = (width, height, buffer, direction) => {
  // 创建新的缓冲区
  const newBuffer = new Uint8Array(width * height * 4);
  
  // 对每个像素进行旋转
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let newX, newY;
      
      // 计算旋转后的坐标
      if (direction === 'left') { // 逆时针旋转90度
        newX = height - 1 - y;
        newY = x;
      } else if (direction === 'right') { // 顺时针旋转90度
        newX = y;
        newY = width - 1 - x;
      } else {
        newX = x;
        newY = y;
      }
      
      // 复制像素数据
      const srcIdx = (y * width + x) * 4;
      const destIdx = (newY * width + newX) * 4;
      
      newBuffer[destIdx] = buffer[srcIdx];       // R
      newBuffer[destIdx + 1] = buffer[srcIdx + 1]; // G
      newBuffer[destIdx + 2] = buffer[srcIdx + 2]; // B
      newBuffer[destIdx + 3] = buffer[srcIdx + 3]; // A/E
    }
  }
  
  return newBuffer;
}

// 添加一个专门处理旋转HDR图像的storeBlobsSep变种
const storeRotatedHdrBlobsSep = (name, direction, callback = href => { }, progress = prog => { }) => {
  const width = hdrRenderTarget.width;
  const height = hdrRenderTarget.height;
  const rgbeBuffer = new Uint8Array(width * height * 4);
  hdrProcRenderer.readRenderTargetPixels(hdrRenderTarget, 0, 0, width, height, rgbeBuffer);
  
  // 如果需要旋转，对buffer进行旋转处理
  let processedBuffer = rgbeBuffer;
  if (direction) {
    processedBuffer = rotateHdrBuffer(width, height, rgbeBuffer, direction);
  }
  
  console.log('PixelDataTest', processedBuffer);
  hdrConverterEmmisive(width, height, processedBuffer).then(blob => {
    renderCatch.blobs.push(blob);
    renderCatch.names.push(`${name}.hdr`);
    renderCatch.progNow++;
    const { progNow, progTotal } = renderCatch;
    progress({ progNow, progTotal });
    console.log('blob', blob);
    if (renderCatch.blobs.length === 6) {
      packBlobsSep(callback, progress);
    }
  });
}

const hdrProcRenderSep = (size = 64, callback = (href) => { }, progress = prog => { }, prefix = 'CubeMap') => {
  renderCatch.blobs = [];
  renderCatch.names = [];
  renderCatch.progNow = 0;
  renderCatch.progTotal = 12;
  hdrProcRenderer.setSize(size, size);
  hdrRenderTarget.setSize(size, size);
  procCamera.rotation.set(0, 0, 0);

  const angle = calcAngle();
  procCamera.rotateY(angle);

  // 使用前缀命名文件
  const baseName = prefix || 'CubeMap';

  //+x
  updateMaterial();
  procCamera.rotateY(-Math.PI / 2);
  hdrProcRenderer.render(hdrScene, procCamera);
  hdrProcRenderer.render(hdrScene, procCamera, hdrRenderTarget);
  storeBlobsSep(`${baseName}_px`, callback, progress);
  //-x
  updateMaterial();
  procCamera.rotateY(Math.PI);
  hdrProcRenderer.render(hdrScene, procCamera);
  hdrProcRenderer.render(hdrScene, procCamera, hdrRenderTarget);
  storeBlobsSep(`${baseName}_nx`, callback, progress);
  //+y
  updateMaterial();
  procCamera.rotateY(-Math.PI / 2);
  procCamera.rotateX(Math.PI / 2);
  hdrProcRenderer.render(hdrScene, procCamera);
  hdrProcRenderer.render(hdrScene, procCamera, hdrRenderTarget);
  storeBlobsSep(`${baseName}_py`, callback, progress);
  //-y
  updateMaterial();
  procCamera.rotateX(-Math.PI);
  hdrProcRenderer.render(hdrScene, procCamera);
  hdrProcRenderer.render(hdrScene, procCamera, hdrRenderTarget);
  storeBlobsSep(`${baseName}_ny`, callback, progress);
  //+z
  updateMaterial();
  procCamera.rotateX(Math.PI / 2);
  hdrProcRenderer.render(hdrScene, procCamera);
  hdrProcRenderer.render(hdrScene, procCamera, hdrRenderTarget);
  storeBlobsSep(`${baseName}_pz`, callback, progress);
  //-z
  updateMaterial();
  procCamera.rotateY(Math.PI);
  hdrProcRenderer.render(hdrScene, procCamera);
  hdrProcRenderer.render(hdrScene, procCamera, hdrRenderTarget);
  storeBlobsSep(`${baseName}_nz`, callback, progress);
}
const hdrProcRenderUnity = (size = 64, callback = href => { }, progress = prog => { }, prefix = 'CubeMap') => {
  renderCatch.progNow = 0;
  renderCatch.progTotal = 4;
  const { canvas } = renderCatch;
  canvas.width = size * 4;
  canvas.height = size * 3;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  hdrProcRenderer.setSize(size, size);
  procCamera.rotation.set(0, 0, 0);

  const angle = calcAngle();
  procCamera.rotateY(angle);

  updateMaterial();
  hdrProcRenderer.render(hdrScene, procCamera);
  ctx.drawImage(hdrProcRenderer.domElement, size, size);

  updateMaterial();
  procCamera.rotateY(-Math.PI / 2);
  hdrProcRenderer.render(hdrScene, procCamera);
  ctx.drawImage(hdrProcRenderer.domElement, size * 2, size);

  updateMaterial();
  procCamera.rotateY(-Math.PI / 2);
  hdrProcRenderer.render(hdrScene, procCamera);
  ctx.drawImage(hdrProcRenderer.domElement, size * 3, size);

  updateMaterial();
  procCamera.rotateY(-Math.PI / 2);
  hdrProcRenderer.render(hdrScene, procCamera);
  ctx.drawImage(hdrProcRenderer.domElement, 0, size);

  updateMaterial();
  procCamera.rotateY(-Math.PI / 2);
  procCamera.rotateX(Math.PI / 2);
  hdrProcRenderer.render(hdrScene, procCamera);
  ctx.drawImage(hdrProcRenderer.domElement, size, 0);

  updateMaterial();
  procCamera.rotateX(-Math.PI);
  hdrProcRenderer.render(hdrScene, procCamera);
  ctx.drawImage(hdrProcRenderer.domElement, size, size * 2);

  renderCatch.progNow++
  progress({ progNow: renderCatch.progNow, progTotal: renderCatch.progTotal });

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  // 使用前缀命名文件
  const fileName = `${prefix || 'CubeMap'}.hdr`;

  hdrConverterEmmisive(canvas.width, canvas.height, imageData.data, false).then(blob => {
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
  })
}
const hdrProcRenderUE4 = (size = 64, callback = href => { }, progress = prog => { }, prefix = 'CubeMap') => {
  renderCatch.progNow = 0;
  renderCatch.progTotal = 4;
  const { canvas } = renderCatch;
  canvas.width = size * 6;
  canvas.height = size * 1;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  hdrProcRenderer.setSize(size, size);
  procCamera.rotation.set(0, 0, 0);

  const angle = calcAngle();
  procCamera.rotateY(angle);
  //+z
  updateMaterial();
  hdrProcRenderer.render(hdrScene, procCamera);
  ctx.drawImage(hdrProcRenderer.domElement, 3 * size, 0);
  //+x
  procCamera.rotateY(-Math.PI / 2);
  procCamera.rotateZ(-Math.PI / 2);
  updateMaterial();
  hdrProcRenderer.render(hdrScene, procCamera);
  ctx.drawImage(hdrProcRenderer.domElement, 0, 0);
  //-z
  procCamera.rotateZ(Math.PI / 2);
  procCamera.rotateY(-Math.PI / 2);
  procCamera.rotateZ(Math.PI);
  updateMaterial();
  hdrProcRenderer.render(hdrScene, procCamera);
  ctx.drawImage(hdrProcRenderer.domElement, 2 * size, 0);
  //-x
  procCamera.rotateZ(-Math.PI);
  procCamera.rotateY(-Math.PI / 2);
  procCamera.rotateZ(Math.PI / 2);
  updateMaterial();
  hdrProcRenderer.render(hdrScene, procCamera);
  ctx.drawImage(hdrProcRenderer.domElement, 1 * size, 0);
  //+y
  procCamera.rotateZ(-Math.PI / 2);
  procCamera.rotateY(-Math.PI / 2);
  procCamera.rotateX(Math.PI / 2);
  updateMaterial();
  hdrProcRenderer.render(hdrScene, procCamera);
  ctx.drawImage(hdrProcRenderer.domElement, 4 * size, 0);
  //-y
  procCamera.rotateX(-Math.PI);
  procCamera.rotateZ(Math.PI);
  updateMaterial();
  hdrProcRenderer.render(hdrScene, procCamera);
  ctx.drawImage(hdrProcRenderer.domElement, 5 * size, 0);

  renderCatch.progNow++
  progress({ progNow: renderCatch.progNow, progTotal: renderCatch.progTotal });

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  console.log('zip start')

  // 使用前缀命名文件
  const fileName = `${prefix || 'CubeMap'}.hdr`;

  hdrConverterEmmisive(canvas.width, canvas.height, imageData.data, false).then(blob => {
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
  })

  // console.log('zip start')
  // canvas.toBlob(blob => {
  //   console.log('blob created')
  //   renderCatch.progNow++
  //   progress({ progNow: renderCatch.progNow, progTotal: renderCatch.progTotal });

  //   zip.createWriter(new zip.BlobWriter(), writer => {
  //     writer.add('StandardCubeMap.hdr', new zip.BlobReader(blob), () => {
  //       renderCatch.progNow++
  //       progress({ progNow: renderCatch.progNow, progTotal: renderCatch.progTotal });

  //       writer.close(blob => {
  //         console.log('zip end')
  //         renderCatch.progNow++
  //         progress({ progNow: renderCatch.progNow, progTotal: renderCatch.progTotal });

  //         callback(URL.createObjectURL(blob));
  //       });
  //     });
  //   });
  // });
}
const hdrProcRenderSourceCross = (size = 64, callback = href => { }, progress = prog => { }, prefix = 'CubeMap', isGoldSrc = false) => {
  renderCatch.blobs = [];
  renderCatch.names = [];
  renderCatch.progNow = 0;
  renderCatch.progTotal = 12;
  hdrProcRenderer.setSize(size, size);
  hdrRenderTarget.setSize(size, size);
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
  
  const useGoldSrcNaming = isGoldSrc;
  
  // 渲染U (up) - +y
  updateMaterial();
  procCamera.rotation.set(Math.PI / 2, 0, 0);
  hdrProcRenderer.render(hdrScene, procCamera);
  hdrProcRenderer.render(hdrScene, procCamera, hdrRenderTarget);
  // 对up图像向左旋转90度
  if (useGoldSrcNaming) {
    storeRotatedHdrBlobsSep(`${baseName}_${goldSrcMapping['py']}`, 'left', callback, progress);
  } else {
    storeRotatedHdrBlobsSep(`${baseName}_py`, 'left', callback, progress);
  }
  
  // 渲染L (left) - -x
  updateMaterial();
  procCamera.rotation.set(0, -Math.PI / 2, 0);
  hdrProcRenderer.render(hdrScene, procCamera);
  hdrProcRenderer.render(hdrScene, procCamera, hdrRenderTarget);
  if (useGoldSrcNaming) {
    storeBlobsSep(`${baseName}_${goldSrcMapping['nx']}`, callback, progress);
  } else {
    storeBlobsSep(`${baseName}_nx`, callback, progress);
  }
  
  // 渲染F (front) - +z - 调整为第三个渲染，符合GoldSrc布局
  updateMaterial();
  procCamera.rotation.set(0, 0, 0);
  hdrProcRenderer.render(hdrScene, procCamera);
  hdrProcRenderer.render(hdrScene, procCamera, hdrRenderTarget);
  if (useGoldSrcNaming) {
    storeBlobsSep(`${baseName}_${goldSrcMapping['pz']}`, callback, progress);
  } else {
    storeBlobsSep(`${baseName}_pz`, callback, progress);
  }
  
  // 渲染R (right) - +x
  updateMaterial();
  procCamera.rotation.set(0, Math.PI / 2, 0);
  hdrProcRenderer.render(hdrScene, procCamera);
  hdrProcRenderer.render(hdrScene, procCamera, hdrRenderTarget);
  if (useGoldSrcNaming) {
    storeBlobsSep(`${baseName}_${goldSrcMapping['px']}`, callback, progress);
  } else {
    storeBlobsSep(`${baseName}_px`, callback, progress);
  }
  
  // 渲染B (back) - -z - 调整为第五个渲染，符合GoldSrc布局
  updateMaterial();
  procCamera.rotation.set(0, Math.PI, 0);
  hdrProcRenderer.render(hdrScene, procCamera);
  hdrProcRenderer.render(hdrScene, procCamera, hdrRenderTarget);
  if (useGoldSrcNaming) {
    storeBlobsSep(`${baseName}_${goldSrcMapping['nz']}`, callback, progress);
  } else {
    storeBlobsSep(`${baseName}_nz`, callback, progress);
  }
  
  // 渲染D (down) - -y
  updateMaterial();
  procCamera.rotation.set(-Math.PI / 2, 0, 0);
  hdrProcRenderer.render(hdrScene, procCamera);
  hdrProcRenderer.render(hdrScene, procCamera, hdrRenderTarget);
  // 对down图像向右旋转90度
  if (useGoldSrcNaming) {
    storeRotatedHdrBlobsSep(`${baseName}_${goldSrcMapping['ny']}`, 'right', callback, progress);
  } else {
    storeRotatedHdrBlobsSep(`${baseName}_ny`, 'right', callback, progress);
  }
}


export { hdrProcRenderSep, hdrProcRenderUnity, hdrProcRenderUE4, hdrProcRenderSourceCross }

