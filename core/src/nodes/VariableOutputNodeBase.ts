
import { OutputManager } from '../io/OutputManager';
import { NodeJSONType, NodeBase } from './NodeBase';

export type VariableOutputNodeJSONType = NodeJSONType & {
  outputCount?: number;
};

export abstract class VariableOutputNodeBase extends NodeBase {
  private outputCount: number | undefined = undefined;

  public getOutputCount (): number {
    if (this.outputCount === undefined) {
      return this.getDefaultOutputCount();
    }
    return this.outputCount;
  }

  public setOutputCount (count: number) {
    const prev = this.getOutputCount();
    this.outputCount = count;
    const diff = count - prev;
    const adiff = Math.abs(diff);

    if (diff > 0) {
      for (let i = 0; i < diff; i++) {
        this.createOutput(this.outputManager, i + this.outputManager.getIOCount());
      }
    } else {
      for (let i = 0; i < adiff; i++) {
        const n = this.outputManager.getIOCount();
        const last = this.outputManager.getIO(n - 1);
        this.outputManager.removeIO(last);
      }
    }

    if (adiff !== 0) {
      this.notifyValueChanged();
    }
  }

  protected abstract createOutput(manager: OutputManager, index: number): void;
  protected abstract getDefaultOutputCount(): number;
  public abstract getMinOutputCount(): number;
  public abstract getMaxOutputCount(): number;

  public toJSON (): VariableOutputNodeJSONType {
    return {
      ...super.toJSON(),
      ...{
        outputCount: this.getOutputCount()
      }
    };
  }

  public fromJSON (json: VariableOutputNodeJSONType): void {
    this.setOutputCount(json.outputCount ?? this.getOutputCount());
    super.fromJSON(json);
  }
}
