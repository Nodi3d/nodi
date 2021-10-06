import { Color } from 'three';

const PreviewColors = {
  ambient: new Color(0x808080),
  defaultStandard: new Color(0xC0C0C0),
  selectedStandard: new Color(0x27DE60),
} as const;

export {
  PreviewColors
};
