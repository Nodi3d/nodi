<template>
  <div class="">
    <ul>
      <li class="border-0 px-0 py-1">
        <div>
          <label for="custom-name">Name</label>
          <input
            id="custom-name"
            :value="customName"
            class="form-control input-sm input-block"
            type="text"
            name="custom-name"
            @change="onChangeName($event)"
          >
        </div>
      </li>
      <li v-if="input" class="border-0 px-0 py-1">
        <h4 class="f6 pb-1">
          Inputs
        </h4>
        <ul class="">
          <li v-for="(dataType, idx) in inDataTypes" :key="`input-${idx}`" class="d-flex border-0 px-0 pt-0 pb-1">
            <select class="form-select select-sm mr-1 flex-auto" :value="dataType" :disabled="DataTypeKeys.length <= 1" @change="onChangeInputType($event, idx)">
              <option v-for="(dataTypeName, index) in DataTypeKeys" :key="dataTypeName" :value="DataTypeValues[index]" v-text="toPascalCase(dataTypeName)" />
            </select>
            <select class="form-select select-sm mr-1 flex-auto" :value="inAccessTypes[idx]" @change="onChangeInputAccess($event, idx)">
              <option v-for="(value, key) in AccessTypes" :key="value" :value="key" v-text="toPascalCase(value)" />
            </select>
            <button class="btn btn-sm dark-theme f4" style="flex-basis: 60px;" @click="onRemoveInput(idx)">
              -
            </button>
          </li>
          <li class="border-0 p-0">
            <button class="btn btn-sm btn-block dark-theme f4" @click="onAddInput">
              +
            </button>
          </li>
        </ul>
      </li>
      <li v-if="output" class="border-0 px-0 py-1">
        <h4 class="f6 pb-1">
          Outputs
        </h4>
        <ul class="">
          <li v-for="(dataType, idx) in outDataTypes" :key="`output-${idx}`" class="d-flex px-0 pt-0 pb-1 border-0">
            <select class="form-select select-sm flex-auto mr-2" :value="dataType" :disabled="DataTypeKeys.length <= 1" @change="onChangeOutputType($event, idx)">
              <option v-for="(dataTypeName, index) in DataTypeKeys" :key="dataTypeName" :value="DataTypeValues[index]" v-text="toPascalCase(dataTypeName)" />
            </select>
            <select class="form-select select-sm mr-1 flex-auto" :value="outAccessTypes[idx]" @change="onChangeOutputAccess($event, idx)">
              <option v-for="(value, key) in AccessTypes" :key="value" :value="key" v-text="toPascalCase(value)" />
            </select>
            <button class="btn btn-sm dark-theme f4" style="flex-basis: 60px;" @click="onRemoveOutput(idx)">
              -
            </button>
          </li>
          <li class="border-0 p-0">
            <button class="btn btn-sm btn-block dark-theme f4" @click="onAddOutput">
              +
            </button>
          </li>
        </ul>
      </li>
      <li class="p-0 border-1">
        <form>
          <textarea ref="CodeEditor" name="code" />
        </form>
      </li>
    </ul>
  </div>
</template>

<script lang='ts'>

import CodeMirror from 'codemirror';
import 'codemirror/mode/javascript/javascript.js';
import 'codemirror/mode/clike/clike.js';

import { Vue, Prop, Component, Watch } from 'nuxt-property-decorator';
import { AccessTypes, DataTypes, CustomPayloadType, AccessType } from '@nodi/core';

@Component({})
export default class CustomInspector extends Vue {
  $refs!: {
    CodeEditor: HTMLTextAreaElement;
  };

  @Prop({ type: String, required: false, default: 'javascript' })
  mode!: string;

  @Prop({ type: String, required: true })
  customName!: string;

  @Prop({ type: Boolean, required: false, default: true })
  input!: boolean;

  @Prop({ type: Boolean, required: false, default: true })
  output!: boolean;

  @Prop({ type: Array, required: false, default: () => [] })
  inDataTypes!: number[];

  @Prop({ type: Array, required: false, default: () => [] })
  inAccessTypes!: AccessType[];

  @Prop({ type: Array, required: false, default: () => [] })
  outDataTypes!: number[];

  @Prop({ type: Array, required: false, default: () => [] })
  outAccessTypes!: AccessType[];

  @Prop({ type: String, required: true })
  customProgram!: string;

  @Prop({ type: Array, required: false, default: () => [] })
  availableDataTypes!: number[];

  DataTypes: any = DataTypes;
  DataTypeKeys: string[] = [];
  DataTypeValues: number[] = [];
  AccessTypes: { [index: number]: string } = { [AccessTypes.ITEM]: 'ITEM', [AccessTypes.LIST]: 'LIST' };

  beforeMount () {
    const keys = Object.keys(DataTypes).filter((k) => {
      const t = DataTypes[k as any];
      return (typeof t === 'number') && this.availableDataTypes.includes(t);
    });
    const values = keys.map(k => DataTypes[k as any] as unknown) as number[];
    this.DataTypeKeys = keys;
    this.DataTypeValues = values;
  }

  mounted () {
    this.$nextTick(() => {
      const editor = CodeMirror.fromTextArea(this.$refs.CodeEditor, {
        lineNumbers: true,
        // mode: 'javascript'
        mode: this.mode
      });
      editor.setSize(520, 320);
      editor.setValue(this.customProgram);
      editor.on('change', (_, e) => {
        const doc = _.getDoc();
        const program = doc.getValue();
        this.onChangeProgram(program);
      });

      // Fix a style collapsion bug in CodeMirror
      this.$nextTick(() => {
        editor.refresh();
      });
    });
  }

  toPascalCase (key: string): string {
    let pascal = key.charAt(0);
    for (let i = 1, n = key.length; i < n; i++) {
      pascal += key.charAt(i).toLowerCase();
    }
    return pascal;
  }

  notify () {
    const payload: CustomPayloadType = {
      customName: this.customName,
      inDataTypes: this.inDataTypes,
      inAccessTypes: this.inAccessTypes,
      outDataTypes: this.outDataTypes,
      outAccessTypes: this.outAccessTypes,
      customProgram: this.customProgram
    };
    this.$emit('change', payload);
  }

  onChangeName ($e: Event): void {
    const value = ($e.target as HTMLSelectElement).value;
    this.customName = value;
    this.notify();
  }

  onChangeInputType ($e: Event, index: number) {
    const value = ($e.target as HTMLSelectElement).value;
    this.inDataTypes[index] = Number(value);
    this.notify();
  }

  onChangeInputAccess ($e: Event, index: number) {
    const value = ($e.target as HTMLSelectElement).value;
    this.inAccessTypes[index] = Number(value) as AccessType;
    this.notify();
  }

  onChangeOutputType ($e: Event, index: number) {
    const value = ($e.target as HTMLSelectElement).value;
    this.outDataTypes[index] = Number(value);
    this.notify();
  }

  onChangeOutputAccess ($e: Event, index: number) {
    const value = ($e.target as HTMLSelectElement).value;
    this.outAccessTypes[index] = Number(value) as AccessType;
    this.notify();
  }

  onAddInput () {
    this.inDataTypes.push(DataTypes.NUMBER);
    this.inAccessTypes.push(AccessTypes.ITEM);
    this.notify();
  }

  onRemoveInput (idx: number) {
    this.inDataTypes.splice(idx, 1);
    this.inAccessTypes.splice(idx, 1);
    this.notify();
  }

  onAddOutput () {
    this.outDataTypes.push(DataTypes.NUMBER);
    this.outAccessTypes.push(AccessTypes.ITEM);
    this.notify();
  }

  onRemoveOutput (idx: number) {
    this.outDataTypes.splice(idx, 1);
    this.outAccessTypes.splice(idx, 1);
    this.notify();
  }

  onChangeProgram (program: string) {
    this.customProgram = program;
    this.notify();
  }
}

</script>

<style lang='scss'>

@import 'codemirror/lib/codemirror.css';

</style>
