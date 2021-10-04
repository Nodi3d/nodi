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
      <li class="border-0 px-0 py-1">
        <h4 class="f6 pb-1">
          Inputs
        </h4>
        <ul class="">
          <li v-for="(dataType, idx) in inDataTypes" :key="idx" class="d-flex border-0 px-0 pt-0 pb-1">
            <select class="form-select select-sm mr-1 flex-auto" :value="dataType" @change="onChangeInputType($event, idx)">
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
      <li class="border-0 px-0 py-1">
        <h4 class="f6 pb-1">
          Outputs
        </h4>
        <ul class="">
          <li v-for="(dataType, idx) in outDataTypes" :key="idx" class="d-flex px-0 pt-0 pb-1 border-0">
            <select class="form-select select-sm flex-auto mr-2" :value="dataType" @change="onChangeOutputType($event, idx)">
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

import { Vue, Prop, Component } from 'nuxt-property-decorator';
import { AccessTypes } from '~/assets/scripts/core/data/AccessTypes';
import DataAccess from '~/assets/scripts/core/data/DataAccess';
import { DataTypes } from '~/assets/scripts/core/data/DataTypes';
import { CustomPayloadType } from '~/assets/scripts/core/nodes/plugins/Custom';

const keys = Object.keys(DataTypes).filter(k => typeof DataTypes[k as any] === 'number');
const values = keys.map(k => DataTypes[k as any] as unknown) as number[];

@Component({})
export default class CustomInspector extends Vue {
  $refs!: {
    CodeEditor: HTMLTextAreaElement;
  };

  @Prop({ type: String, required: true })
  customName!: string;

  @Prop({ type: Array, required: true })
  inDataTypes!: number[];

  @Prop({ type: Array, required: true })
  inAccessTypes!: number[];

  @Prop({ type: Array, required: true })
  outDataTypes!: number[];

  @Prop({ type: Array, required: true })
  outAccessTypes!: number[];

  @Prop({ type: String, required: true })
  customProgram!: string;

  DataTypes: any = DataTypes;
  DataTypeKeys: string[] = keys;
  DataTypeValues: number[] = values;
  AccessTypes: { [index: number]: string } = { [AccessTypes.ITEM]: 'ITEM', [AccessTypes.LIST]: 'LIST' };

  mounted () {
    this.$nextTick(() => {
      const editor = CodeMirror.fromTextArea(this.$refs.CodeEditor, {
        lineNumbers: true,
        mode: 'javascript'
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
    this.inAccessTypes[index] = Number(value);
    this.notify();
  }

  onChangeOutputType ($e: Event, index: number) {
    const value = ($e.target as HTMLSelectElement).value;
    this.outDataTypes[index] = Number(value);
    this.notify();
  }

  onChangeOutputAccess ($e: Event, index: number) {
    const value = ($e.target as HTMLSelectElement).value;
    this.outAccessTypes[index] = Number(value);
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
