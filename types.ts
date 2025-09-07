
export interface CraftedElement {
  id: string;
  title: string;
  description: string;
  imageB64: string;
  mimeType: string;
  parents: [string, string] | null;
}

export interface WorkspaceElement {
  instanceId: string;
  elementId: string;
  x: number;
  y: number;
  width: number;
  height: number;
}