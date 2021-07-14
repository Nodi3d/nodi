
export enum DataTypes {
  NONE = 0,
  STRING = 1 << 0,
  BOOLEAN = 1 << 1,
  NUMBER = 1 << 2,
  DOMAIN = 1 << 3,
  VECTOR = 1 << 4,
  // MATRIX = 1 << 5,
  POINT = 1 << 6,
  PLANE = 1 << 7,
  CURVE = 1 << 9,
  SURFACE = 1 << 10,
  BOX = 1 << 11,
  FACE = 1 << 12,
  MESH = 1 << 13,
  GROUP = 1 << 15,
  COMPLEX = 1 << 16,
  // FREP = 1 << 17,
  ANY = ~0
}

const GeometryDataTypes: DataTypes = DataTypes.POINT | DataTypes.PLANE | DataTypes.CURVE | DataTypes.SURFACE | DataTypes.BOX | DataTypes.MESH; // | DataTypes.FREP;

const Colors: { [index: string]: string } = Object.freeze({
  STRING: 'rgb(228, 87, 86)',
  BOOLEAN: 'rgb(245, 133, 24)',
  NUMBER: 'rgb(76, 120, 168)',
  COMPLEX: 'rgb(51, 102, 255)',
  DOMAIN: 'rgb(0, 70, 145)',
  VECTOR: 'rgb(114, 183, 178)',
  POINT: 'rgb(84, 162, 75)',
  PLANE: 'rgb(84, 162, 75)',
  CURVE: 'rgb(201, 161, 0)',
  SURFACE: 'rgb(178, 121, 162)',
  BOX: 'rgb(178, 121, 162)',
  MESH: 'rgb(255, 157, 166)',
  FACE: 'rgb(255, 157, 166)',
  // FREP: 'rgb(252, 205, 229)',
  GROUP: 'rgb(204, 204, 204)',
  ANY: 'rgb(204, 204, 204)'
});

const toPascalCase = (key: string) => {
  let pascal = key.charAt(0);
  for (let i = 1, n = key.length; i < n; i++) {
    pascal += key.charAt(i).toLowerCase();
  }
  return pascal;
};

const TypeKeys = Object.keys(DataTypes) as string[];
const TypePascalKeys = TypeKeys.map((key) => {
  return toPascalCase(key);
});
const TypeValues = Object.values(DataTypes) as number[];

const getTypeNames = (type: DataTypes): string[] => {
  const indices = [];
  if (type !== DataTypes.ANY) {
    TypeValues.forEach((v, i) => {
      if (v !== DataTypes.ANY && (type & v) !== 0) {
        indices.push(i);
      }
    });
  } else {
    indices.push(TypeValues.indexOf(DataTypes.ANY));
  }

  return indices.map((idx) => {
    return TypePascalKeys[idx];
  });
};

export {
  GeometryDataTypes,
  Colors,
  getTypeNames
};
