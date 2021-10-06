import { NMesh } from './NMesh';

class Edge {
  a: number;
  b: number;
  triIndex: number;

  constructor (a: number, b: number, triIndex: number) {
    this.a = a;
    this.b = b;
    this.triIndex = triIndex;
  }

  shared (other: Edge): boolean {
    return (this.a === other.a && this.b === other.b) || (this.b === other.a && this.a === other.b);
  }
}

const getMeshEdges = (mesh: NMesh): Edge[] => {
  const edges: Edge[] = [];

  mesh.faces.forEach((f, i) => {
    edges.push(new Edge(f.a, f.b, i));
    edges.push(new Edge(f.b, f.c, i));
    edges.push(new Edge(f.c, f.a, i));
  });

  return edges;
};

const sortEdges = (edges: Edge[]): Edge[] => {
  const result = edges.slice();

  for (let i = 0; i < result.length - 2; i++) {
    const e0 = result[i];
    for (let j = i + 1; j < result.length; j++) {
      const e1 = result[j];
      if (e0.b === e1.a) {
        // in this case they are already in order so just continoue with the next one
        if (j === i + 1) { break; }

        // if we found a match, swap them with the next one after "i"
        result[j] = result[i + 1];
        result[i + 1] = e1;
        break;
      }
    }
  }

  return result;
};

const findMeshBoundary = (mesh: NMesh): Edge[] => {
  const edges = getMeshEdges(mesh);

  for (let i = edges.length - 1; i >= 0; i--) {
    const e0 = edges[i];
    for (let j = i - 1; j >= 0; j--) {
      const e1 = edges[j];
      if (e0.shared(e1)) {
        edges.splice(i, 1);
        edges.splice(j, 1);
        i--;
        break;
      }
    }
  }

  return sortEdges(edges);
};

export {
  getMeshEdges, findMeshBoundary
};
