import { NodeBase } from '../NodeBase';

export abstract class FrepNodeBase extends NodeBase {
  public get previewable (): boolean {
    return true;
  }
}
