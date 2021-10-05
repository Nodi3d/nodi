
import { InputManager } from '../io/InputManager';
import { NodeJSONType, NodeBase } from './NodeBase';

export type VariableInputNodeJSONType = NodeJSONType & {
  inputCount?: number;
};

export abstract class VariableInputNodeBase extends NodeBase {
  private inputCount: number | undefined = undefined;

  public getInputCount (): number {
    if (this.inputCount === undefined) {
      return this.getDefaultInputCount();
    }
    return this.inputCount;
  }

  public setInputCount (count: number) {
    const prev = this.getInputCount();
    this.inputCount = count;
    const diff = count - prev;
    const adiff = Math.abs(diff);

    if (diff > 0) {
      for (let i = 0; i < diff; i++) {
        this.createInput(this.inputManager, i + this.inputManager.getIOCount());
      }
    } else {
      for (let i = 0; i < adiff; i++) {
        const n = this.inputManager.getIOCount();
        const last = this.inputManager.getIO(n - 1);
        this.inputManager.removeIO(last);
      }
    }

    if (adiff !== 0) {
      this.notifyValueChanged();
    }
  }

  protected abstract createInput(manager: InputManager, index: number): void;
  protected abstract getDefaultInputCount(): number;
  public abstract getMinInputCount(): number;
  public abstract getMaxInputCount(): number;

  public toJSON (name: string): VariableInputNodeJSONType {
    return {
      ...super.toJSON(name),
      ...{
        inputCount: this.getInputCount()
      }
    };
  }

  public fromJSON (json: VariableInputNodeJSONType): void {
    this.setInputCount(json.inputCount ?? this.getInputCount());
    super.fromJSON(json);
  }
}
