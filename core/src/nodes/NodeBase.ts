
import { IDisposable } from '../misc/IDisposable';
import { IOJSONType, IO } from '../io/IO';
import { InputManager } from '../io/InputManager';
import { OutputManager } from '../io/OutputManager';
import { InputJSONType, Input } from '../io/Input';
import { Output } from '../io/Output';
import { DataAccessor } from '../data/DataAccessor';
import { ElementBase } from '../ElementBase';
import { DataAccess } from '../data/DataAccess';
import { DataTree } from '../data/DataTree';
import { DataPath } from '../data/DataPath';
import { GeometryDataTypes } from '../data/DataTypes';
import { ISelectable } from '../misc/ISelectable';
import { TypedEvent } from '../misc/TypedEvent';
import { AccessTypes } from '../data/AccessTypes';

export type NodeJSONType = {
  name: string;
  uuid: string;
  position: { x:number; y: number };
  inputs: InputJSONType[],
  outputs: IOJSONType[],
  enabled: boolean;
  visible: boolean;
};

class NodeEvent extends TypedEvent<{
  node: NodeBase
}> {}

class NodeConnectEvent extends TypedEvent<{
  source: NodeBase;
  output: Output;
  destination: NodeBase;
  input: Input;
}> {}

export abstract class NodeBase extends ElementBase implements IDisposable, ISelectable {
  selected: boolean = false;
  enabled: boolean = true;
  visible: boolean = true;

  private _hasChanged: boolean = false;
  protected _previewable: boolean = false;
  private _executionTime: number = 0;
  private _processing: boolean = false;
  private _processed: boolean = false;

  errorMessage: string | null = null;

  inputManager: InputManager;
  outputManager: OutputManager;

  onValueChanged: NodeEvent = new NodeEvent(); // fire if needs graph recomputed.
  onStateChanged: NodeEvent = new NodeEvent(); // fire if a flag changed. (selected, preview)
  onConnect: NodeConnectEvent = new NodeConnectEvent();
  onDisconnect: NodeConnectEvent = new NodeConnectEvent();

  public abstract get displayName(): string;
  public get async (): boolean {
    return false;
  }

  // #region GUI

  public get minHeight (): number {
    return 40;
  }

  public get flowable (): boolean {
    return true;
  }

  public get previewable (): boolean {
    return this._previewable;
  }

  public get executionTime (): number {
    return this._executionTime;
  }

  public get experimental (): boolean {
    return false;
  }

  public get processing (): boolean {
    return this._processing;
  }

  public get processed (): boolean {
    return this._processed;
  }

  public set processing (v: boolean) {
    this._processing = v;
    this.notifyStateChanged();
  }

  // #endregion

  public abstract registerInputs(manager: InputManager): void;
  public abstract registerOutputs(manager: OutputManager): void;
  public abstract solve(access: DataAccess): void;

  constructor (uuid: string) {
    super(uuid);
    this.inputManager = new InputManager(this);
    this.outputManager = new OutputManager(this);
    this.registerInputs(this.inputManager);
    this.registerOutputs(this.outputManager);
    this._previewable = this.outputManager.outputs.map(o => o.getDataType()).some(d => (d & GeometryDataTypes) !== 0);
  }

  // Customize UI in NodeView by overriding this method.
  public setupViewElement (container: HTMLDivElement): void {
    const span = document.createElement('span');
    span.textContent = this.displayName;
    container.appendChild(span);
  }

  // Customize Inspector in NodeView by overriding this method.
  public setupInspectorElement (container: HTMLDivElement): void {
    // do nothing
  }

  public notifyValueChanged (): void {
    this.onValueChanged.emit({ node: this });
  }

  public notifyStateChanged (): void {
    this.onStateChanged.emit({ node: this });
  }

  public select (): void {
    this.selected = true;
    this.notifyStateChanged();
  }

  public unselect (): void {
    this.selected = false;
    this.notifyStateChanged();
  }

  public enable (notify: boolean = true): void {
    const prev = this.enabled;
    this.enabled = true;
    this.notifyStateChanged();
    if (prev !== this.enabled && notify) {
      this.notifyValueChanged();
    }
  }

  public disable (notify: boolean = true): void {
    const prev = this.enabled;
    this.enabled = false;
    this.notifyStateChanged();
    if (prev !== this.enabled && notify) {
      this.notifyValueChanged();
    }
  }

  public show (): void {
    this.setVisibility(true);
  }

  public hide (): void {
    this.setVisibility(false);
  }

  public setVisibility (visible: boolean): void {
    this.visible = visible;
    this.notifyStateChanged();
  }

  public toggleVisibility (): void {
    this.setVisibility(!this.visible);
  }

  public dispose (): void {
    this.onValueChanged.dispose();
    this.onStateChanged.dispose();
    this.onConnect.dispose();
    this.onDisconnect.dispose();
  }

  public markChanged (): void {
    this._hasChanged = true;
  }

  public markUnchanged (): void {
    this._hasChanged = false;
  }

  public hasChanged (): boolean {
    return this._hasChanged;
  }

  public getNexts (): NodeBase[] {
    const nexts: NodeBase[] = [];
    this.outputManager.outputs.forEach((o) => {
      const cands = o.getConnectedNodes();
      cands.forEach((n) => {
        if (!nexts.includes(n)) { nexts.push(n); }
      });
    });
    return nexts;
  }

  public isSteppable (): boolean {
    const count = this.inputManager.getIOCount();
    for (let i = 0; i < count; i++) {
      const input = this.inputManager.getInput(i);
      const hasSource = input.hasSource();
      if (hasSource && input.source?.isEmpty()) {
        // 空のSourceを持つ場合はstepさせない
        return false;
      }
      if (!hasSource && !input.hasDefault() && !input.isOptional()) { return false; }
    }

    return true;
  }

  public async step (): Promise<void> {
    this.markChanged();
    this.processing = true;

    const t0 = performance.now();

    const inputs = this.inputManager.inputs;
    const inAccessTypes = inputs.map(io => io.getAccessType());
    const hasListInput = inAccessTypes.includes(AccessTypes.LIST);

    const outputs = this.outputManager.outputs;
    outputs.forEach(output => output.clearData());

    const da = new DataAccessor(this.inputManager, this.outputManager);
    await da.solve(this);

    const accesses = da.getResult();

    accesses.forEach((access, _) => {
      const path = access.getPath();
      const values = access.getOutValues();
      outputs.forEach((output, oi) => {
        const oAccessType = output.getAccessType();
        const oData = output.getData() as DataTree;
        const value = values[oi];
        switch (oAccessType) {
          case AccessTypes.TREE: {
            oData.copy(value);
            break;
          }
          case AccessTypes.LIST: {
            const index = access.getIndex();
            if (hasListInput) {
              this.nested(oData, value, path);
            } else {
              this.nested(oData, value, path.append(index));
            }
            // this.nested(oData, value, path.append(index));
            break;
          }
          case AccessTypes.ITEM: {
            const branches = oData.branches;
            const found = branches.find(br => br.getPath().equals(path));
            if (found !== undefined) {
              found.getValue().push(value);
            } else {
              oData.add([value], path);
            }
            break;
          }
        }
      });
    });

    const t1 = performance.now();
    const units = 1000;
    this._executionTime = Math.floor((t1 - t0) * units) / units;

    this.processing = false;
    this._processed = true;
    this.outputManager.outputs.forEach(o => o.notifyDataChanged());

    return Promise.resolve();
  }

  // Add nested array to {path} in a tree
  protected nested (tree: DataTree, array: any[], path: DataPath): void {
    if (array.length <= 0) {
      tree.add(array, path);
      return;
    }

    const items = array.filter(item => !(Array.isArray(item)));
    if (items.length > 0) {
      tree.add(items, path);
    }

    const children = array.filter(item => Array.isArray(item));
    children.forEach((child, i) => {
      const npath = path.append(i);
      this.nested(tree, child, npath);
    });
  }

  public kill (): void {
  }

  public safe (): void {
    this.errorMessage = null;
    this.notifyStateChanged();
  }

  public error (err: string) {
    this.errorMessage = err;
    this.notifyStateChanged();
  }

  public getErrorMessage (): string | null {
    return this.errorMessage;
  }

  public clear (dispose = true): void {
    this.outputManager.clear();
    this._executionTime = 0;
    this._processing = false;
    this._processed = false;
    this.notifyStateChanged();
  }

  public reset (): NodeBase[] {
    this.safe();
    this.clear();
    this.markChanged();
    return this.getNexts();
  }

  protected connect (output: Output, dstNode: NodeBase, input: Input): boolean {
    if (input.hasSource()) {
      return false;
    }

    this.outputManager.connectDestination(output, dstNode, input);
    dstNode.inputManager.connectSource(input, this, output);

    this.onConnect.emit({
      source: this,
      output,
      destination: dstNode,
      input
    });

    return true;
  }

  public isConnected (target: NodeBase, toInputDirection: boolean): boolean {
    const manager = toInputDirection ? this.inputManager : this.outputManager;

    const count = manager.getIOCount();

    if (count <= 0) {
      return false;
    }

    for (let idx = 0; idx < count; idx++) {
      const io = manager.getIO(idx);
      const cands = io.getConnectedNodes();
      for (let i = 0, n = cands.length; i < n; i++) {
        const cand = cands[i];
        if (cand === target) { return true; }
        if (cand.isConnected(target, toInputDirection)) {
          return true;
        }
      }
    }

    return false;
  }

  public existIO (oI: number, dstN: NodeBase, iI: number): boolean {
    const output = this.outputManager.getOutput(oI);
    const input = dstN.inputManager.getInput(iI);
    return output.isConnected(input);
  }

  public connectIO (oI: number, dstN: NodeBase, iI: number): boolean {
    const output = this.outputManager.getOutput(oI);
    const input = dstN.inputManager.getInput(iI);
    if (!output.match(input)) {
      // console.warn('input type is not matched to output type', this, dstN, input, output);
      return false;
    }

    this.connect(output, dstN, input);
    return true;
  }

  public disconnectIO (oI: number, dstN: NodeBase, iI: number): boolean {
    const output = this.outputManager.getOutput(oI);
    const input = dstN.inputManager.getInput(iI);
    output.disconnect(input);
    input.disconnect(output);
    this.onDisconnect.emit({
      source: this,
      output,
      destination: dstN,
      input
    });
    return true;
  }

  protected disconnectSource (input: Input): void {
    const source = input.source;
    if (source === undefined) {
      throw new Error(`${this} doesn't have source for ${input}`);
    }
    input.disconnect(source);
    this.onDisconnect.emit({
      source: source.getParent(),
      output: source,
      destination: this,
      input
    });
  }

  public disconnectAllIO (): void {
    {
      // disconnect All sources
      const n = this.inputManager.getIOCount();
      for (let dstI = 0; dstI < n; dstI++) {
        const input = this.inputManager.getInput(dstI);
        this.inputManager.disconnectSources(input);
      }
    }

    {
      // disconnect All destinations
      const n = this.outputManager.getIOCount();
      for (let srcO = 0; srcO < n; srcO++) {
        const output = this.outputManager.getOutput(srcO);
        this.outputManager.disconnectDestinations(output);
      }
    }
  }

  public hasIO (io: IO): boolean {
    return this.inputManager.hasIO(io) || this.outputManager.hasIO(io);
  }

  public toJSON (name: string): NodeJSONType {
    return {
      // name: this.constructor.name,
      name,
      uuid: this.uuid,
      position: this.position,
      inputs: this.inputManager.toJSON(),
      outputs: this.outputManager.toJSON(),
      enabled: this.enabled,
      visible: this.visible
    };
  }

  public fromJSON (json: NodeJSONType): void {
    this.moveTo(json.position.x, json.position.y);
    this.enabled = json.enabled;
    this.visible = json.visible;
    this.inputManager.fromJSON(json.inputs);
    this.outputManager.fromJSON(json.outputs);
    this.notifyStateChanged();
    this.notifyValueChanged();
  }
}
