
export default interface IResolutionResponsible {
  setResolution(w: number, h: number, zoom: number): void;
}

export function isResolutionResponsible (o: any): o is IResolutionResponsible {
  return 'setResolution' in o;
}
