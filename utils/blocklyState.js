export function getWorkspaceState(workspace) {
  return window.Blockly.serialization.workspaces.save(workspace);
}
