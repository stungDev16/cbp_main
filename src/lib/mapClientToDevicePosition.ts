interface Position {  
  x: number  
  y: number  
}  
  
interface DeviceInfo {  
  width: number  
  height: number  
  rotation: number  
}  
  
export const mapClientToDevicePosition = (  
  clientPos: Position,  
  deviceInfo: DeviceInfo,  
  containerElement: HTMLElement  
): Position => {  
  const rect = containerElement.getBoundingClientRect()  
  const scaleX = deviceInfo.width / rect.width  
  const scaleY = deviceInfo.height / rect.height  
    
  let deviceX = (clientPos.x - rect.left) * scaleX  
  let deviceY = (clientPos.y - rect.top) * scaleY  
    
  // Handle rotation  
  switch (deviceInfo.rotation) {  
    case 90:  
      [deviceX, deviceY] = [deviceY, deviceInfo.width - deviceX]  
      break  
    case 180:  
      deviceX = deviceInfo.width - deviceX  
      deviceY = deviceInfo.height - deviceY  
      break  
    case 270:  
      [deviceX, deviceY] = [deviceInfo.height - deviceY, deviceX]  
      break  
  }  
    
  return {  
    x: Math.round(deviceX),  
    y: Math.round(deviceY)  
  }  
}