import { RenderingMode } from './RenderingMode';

export interface IRenderingModeResponsible {

  setRenderingMode(mode: RenderingMode): void;

}

export function isRenderingModeResponsible (o: any): o is IRenderingModeResponsible {
  return 'setRenderingMode' in o;
}
