import NodeBase from '../NodeBase';

export default abstract class FrepNodeBase extends NodeBase {

  public get previewable(): boolean {
    return true;
  }

}
