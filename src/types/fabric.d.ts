// src/types/fabric.d.ts
/* eslint-disable @typescript-eslint/no-explicit-any */

declare module "fabric" {
  export const fabric: any;
}

// 필요하면 여기 더 추가 가능
declare module "fabric/fabric-impl" {
  export type Canvas = any;
  export type Textbox = any;
  export type Rect = any;
  export type Image = any;
}
