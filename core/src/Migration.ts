import { DataTypes } from './data/DataTypes';
import { GraphJSONType, GraphJSONVersion } from './Graph';
import { GroupJSONType } from './GroupElement';
import { ImporterNodeJSONType } from './nodes/importer/ImporterNodeBase';
import { ExpressionJSONType } from './nodes/math/Expression';
import { NodeJSONType } from './nodes/NodeBase';
import { UIGraphMapperJSONType } from './nodes/params/ui/UIGraphMapper';
import { UINumberJSONType } from './nodes/params/ui/UINumber';
import { UIToggleJSONType } from './nodes/params/ui/UIToggle';
import { UIValueListJSONType } from './nodes/params/ui/UIValueList';
import { CommentJSONType } from './nodes/params/utils/Comment';
import { CustomJSONType } from './nodes/plugins/Custom';
import { BoundingBoxJSONType } from './nodes/surface/primitive/BoundingBox';
import { VariableInputNodeJSONType } from './nodes/VariableInputNodeBase';
import { VariableOutputNodeJSONType } from './nodes/VariableOutputNodeBase';

export type EdgeJSONTypeV0 = {
  inGUID: string;
  inIndex: number;
  outGUID: string;
  outIndex: number;
};

export type NodeJSONTypeV0 = {
  name: string;
  guid: string;
  position: { x: number, y: number };
  defaults: any[];
  inputs: DataTypes[];
  outputs: DataTypes[];
  edges: EdgeJSONTypeV0[];
  enabled: boolean;
  preview: boolean;
  count?: number;
  label?: string;
  number?: number;
  numberType?: number;
  valueListKeys?: string[];
  checked?: boolean;
  min?: number;
  max?: number;
  fileName?: string;
  fileUrl?: string;
  isUnionBoundingBox?: boolean;
  expression?: string;
  customName?: string;
  customProgram?: string;
  text?: string;
  link?: string;
  styles?: { [index: string]: string };
  graphMapType?: string;
  graphMapControls?: { x: number; y: number }[];
};

export type GroupJSONTypeV0 = {
  guid: string;
  nodeIDs: string[];
};

export type GraphJSONTypeV0 = {
  nodes: NodeJSONTypeV0[];
  groups: GroupJSONTypeV0[];
};

const convertNodeJSON = function (json: NodeJSONTypeV0):
  NodeJSONType |
  VariableInputNodeJSONType |
  VariableOutputNodeJSONType |
  UINumberJSONType |
  UIValueListJSONType |
  UIToggleJSONType |
  UIGraphMapperJSONType |
  ImporterNodeJSONType |
  BoundingBoxJSONType |
  CommentJSONType |
  ExpressionJSONType |
  CustomJSONType {
  const inputs: EdgeJSONTypeV0[] = [];
  const outputs: EdgeJSONTypeV0[] = [];

  const guid = json.guid;

  json.edges.forEach((edge) => {
    if (edge.inGUID === guid) {
      outputs.push(edge);
    } else {
      inputs.push(edge);
    }
  });

  return {
    name: json.name,
    uuid: json.guid,
    position: json.position,
    enabled: json.enabled,
    visible: json.preview,
    inputs: json.inputs.map((type, index) => {
      const def = json.defaults[index];
      return {
        dataType: type,
        connections: inputs.filter(e => e.outIndex === index).map((e) => {
          return {
            uuid: e.inGUID,
            index: e.inIndex
          };
        }),
        default: (def !== null && def.branches.length > 0)
          ? {
              branches: [
                {
                  path: def.branches[0].path.indices,
                  value: def.branches[0].value
                }
              ]
            }
          : undefined
      };
    }),
    outputs: json.outputs.map((type, index) => {
      return {
        dataType: type,
        connections: outputs.filter(e => e.inIndex === index).map((e) => {
          return {
            uuid: e.outGUID,
            index: e.outIndex
          };
        })
      };
    }),
    inputCount: json.count,
    outputCount: json.count,
    label: json.label,
    min: json.min,
    max: json.max,
    value: json.number,
    checked: json.checked,
    // CAUTION: v1 number type is reversed
    numberType: (json.numberType !== undefined) ? (1 - json.numberType) : undefined,
    valueListKeys: json.valueListKeys,
    prev: json.number,
    graphMapType: json.graphMapType,
    graphMapControlPoints: json.graphMapControls,
    fileName: json.fileName,
    fileUrl: json.fileUrl,
    union: json.isUnionBoundingBox,
    expression: json.expression,
    customName: json.customName,
    customProgram: json.customProgram,
    commentText: json.text,
    commentLink: json.link,
    commentStyle: json.styles
  };
};

const convertGroupJSON = function (json: GroupJSONTypeV0): GroupJSONType {
  return {
    uuid: json.guid,
    nodes: json.nodeIDs
  };
};

export function migrate (json: GraphJSONTypeV0): GraphJSONType {
  return {
    version: GraphJSONVersion,
    nodes: json.nodes.map(node => convertNodeJSON(node)),
    groups: (json.groups ?? []).map(grp => convertGroupJSON(grp))
  };
}
