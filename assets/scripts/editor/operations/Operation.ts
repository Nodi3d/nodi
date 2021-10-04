import Editor from '../Editor';

export default interface Operation {

  do(editor: Editor): void;
  undo(editor: Editor): void;

}
