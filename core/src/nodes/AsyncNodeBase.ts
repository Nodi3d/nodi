import { DataAccess } from '../data/DataAccess';
import { NodeBase } from './NodeBase';

export abstract class AsyncNodeBase extends NodeBase {
  public get async (): boolean {
    return true;
  }

  public abstract solve(access: DataAccess): Promise<void>;
}
