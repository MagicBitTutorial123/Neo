/**
 * Utility functions to detect keyboard blocks in Blockly workspace
 */

export interface KeyboardBlockInfo {
  hasKeyboardBlocks: boolean;
  keyboardBlockTypes: string[];
  totalKeyboardBlocks: number;
}

/**
 * Detects if there are any keyboard blocks in the current workspace
 * @param workspace - The Blockly workspace to check
 * @returns Object containing information about keyboard blocks
 */
export function detectKeyboardBlocks(workspace: any): KeyboardBlockInfo {
  if (!workspace) {
    return {
      hasKeyboardBlocks: false,
      keyboardBlockTypes: [],
      totalKeyboardBlocks: 0
    };
  }

  const keyboardBlockTypes = [
    'keyboard_when_key_pressed',
    'keyboard_when_custom_key_pressed'
  ];

  const blocks = workspace.getAllBlocks(false);
  const keyboardBlocks = blocks.filter((block: any) => 
    keyboardBlockTypes.includes(block.type)
  );

  return {
    hasKeyboardBlocks: keyboardBlocks.length > 0,
    keyboardBlockTypes: [...new Set(keyboardBlocks.map((block: any) => block.type as string))] as string[],
    totalKeyboardBlocks: keyboardBlocks.length
  };
}

/**
 * Checks if the current workspace has any keyboard blocks
 * @param workspace - The Blockly workspace to check
 * @returns True if there are keyboard blocks, false otherwise
 */
export function hasKeyboardBlocks(workspace: any): boolean {
  console.log("hasKeyboardBlocks called with workspace:", workspace);
  const result = detectKeyboardBlocks(workspace).hasKeyboardBlocks;
  console.log("hasKeyboardBlocks result:", result);
  return result;
}

/**
 * Gets the count of keyboard blocks in the workspace
 * @param workspace - The Blockly workspace to check
 * @returns Number of keyboard blocks
 */
export function getKeyboardBlockCount(workspace: any): number {
  return detectKeyboardBlocks(workspace).totalKeyboardBlocks;
}
