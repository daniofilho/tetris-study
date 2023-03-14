declare interface IObjectProps {
  context: CanvasRenderingContext2D;
}

// * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

declare interface IRenderObjectProps {
  deltaTime: number;
}

declare interface IObject {
  render: (data: IRenderObjectProps) => void;
}
