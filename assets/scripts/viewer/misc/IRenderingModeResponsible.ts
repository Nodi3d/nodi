import { RenderingMode } from './RenderingMode';

export default interface IRenderingModeResponsible {

  setRenderingMode(mode: RenderingMode): void;

}

export function isRenderingModeResponsible (o: any): o is IRenderingModeResponsible {
  return 'setRenderingMode' in o;
}
