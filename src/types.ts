// Define a single point in 3D space
export interface Keypoint {
    x: number;
    y: number;
    z: number;
    visibility: number;
  }
  
  // HAR-Cloud uses 33 keypoints from MediaPipe
  export type Skeleton = Keypoint[];