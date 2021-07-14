
import NodeBase from './nodes/NodeBase';

export type NodeConstructorType = (new (uuid: string) => NodeBase);
