# Keyboard Block Detection System

This document describes the implementation of conditional keyboard event handling based on the presence of keyboard blocks in the Blockly workspace.

## Overview

The system automatically adds keyboard event listeners to the window only when keyboard blocks are present in the Blockly workspace. When all keyboard blocks are removed, the listeners are automatically removed to prevent unnecessary event handling. The system sends key press events and includes the `stop_all` command on key release for motor control. The firmware code execution stopping mechanism has been completely removed, and the system always shows play/load buttons for running code.

## Components

### 1. Keyboard Block Detector Utility (`utils/keyboardBlockDetector.ts`)

Provides utility functions to detect keyboard blocks in a Blockly workspace:

- `detectKeyboardBlocks(workspace)`: Returns detailed information about keyboard blocks
- `hasKeyboardBlocks(workspace)`: Returns boolean indicating presence of keyboard blocks
- `getKeyboardBlockCount(workspace)`: Returns count of keyboard blocks

**Supported keyboard block types:**
- `keyboard_when_key_pressed` - Arrow key blocks
- `keyboard_when_custom_key_pressed` - Custom key blocks

### 2. Modified Playground Page (`app/playground/page.tsx`)

- Added state tracking for keyboard blocks presence
- Modified keyboard event listener useEffect to conditionally add listeners
- Added callback to BlocklyComponent for workspace change notifications
- Event listeners are only added when `hasKeyboardBlocksPresent` is true

### 3. Modified Missions Page (`app/missions/[id]/page.tsx`)

- Added similar conditional keyboard handling
- Missions typically don't have keyboard blocks by default
- Prepared for future expansion if missions include keyboard blocks

### 4. Enhanced BlocklyComponent (`components/Blockly/BlocklyComponent.jsx`)

- Added `onWorkspaceChange` prop to notify parent components of workspace changes
- Calls the callback whenever blocks are created, moved, or changed
- Enables real-time detection of keyboard block additions/removals

## How It Works

1. **Initial Detection**: When a page loads, the system checks for existing keyboard blocks
2. **Real-time Monitoring**: The BlocklyComponent notifies parent components of workspace changes
3. **Conditional Listeners**: Keyboard event listeners are only added when keyboard blocks exist
4. **Automatic Cleanup**: Listeners are removed when no keyboard blocks remain
5. **Performance**: No unnecessary event handling when keyboard blocks aren't present

## Benefits

- **Performance**: Eliminates unnecessary keyboard event processing when not needed
- **User Experience**: Prevents accidental key presses from interfering with normal operation
- **Maintainability**: Centralized logic for keyboard block detection
- **Scalability**: Easy to extend for new keyboard block types
- **Simplified Handling**: Only sends key press events without complex stopping mechanisms

## Usage Example

```typescript
import { hasKeyboardBlocks } from '@/utils/keyboardBlockDetector';

// Check if workspace has keyboard blocks
const hasBlocks = hasKeyboardBlocks(workspace);

// Conditionally add keyboard handlers
if (hasBlocks) {
  // Add keyboard event listeners
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);
}
```

## Implementation Details

### Key Handling

The system handles both key press and release events:

- **Key Down**: Sends the key action to the connected device
- **Key Up**: Marks the key as released for repeat prevention and sends `stop_all` command for motor control
- **Motor Control**: The `stop_all` command is sent on key release to stop motor movement
- **Python Code**: Includes the `key_stop_all_pressed()` function for proper motor control

### Removed Firmware Stopping

The firmware code execution stopping mechanism has been completely removed:

- **No Stop Button**: Removed the pause/stop functionality from the UI
- **No Stop Commands**: No more `{ mode: "stop" }` JSON commands sent to firmware
- **Simplified State**: Removed `isRunning` state and related logic
- **Cleaner Interface**: Header component no longer includes stop/pause functionality
- **Always Show Play/Load**: The system always displays play and load buttons for running code
- **No Status Tracking**: Removed periodic status checks and device state monitoring

### Event Listener Management

The system uses React's useEffect hook with dependencies on both `connectionStatus` and `hasKeyboardBlocksPresent`:

```typescript
useEffect(() => {
  if (!hasKeyboardBlocksPresent) {
    return; // Skip adding listeners
  }
  
  // Add event listeners
  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);
  
  return () => {
    // Cleanup listeners
    window.removeEventListener("keydown", handleKeyDown);
    window.removeEventListener("keyup", handleKeyUp);
  };
}, [connectionStatus, hasKeyboardBlocksPresent]);
```

### Workspace Change Detection

The BlocklyComponent automatically detects workspace changes and notifies parent components:

```typescript
workspace.addChangeListener((event) => {
  if (event.type === "create" || event.type === "move" || event.type === "change") {
    // ... existing logic ...
    
    // Notify parent component about workspace changes
    if (onWorkspaceChange) {
      onWorkspaceChange();
    }
  }
});
```

## Future Enhancements

- Add support for more keyboard block types
- Implement keyboard block validation
- Add keyboard block analytics/tracking
- Support for conditional keyboard blocks based on other factors

## Testing

A test file is provided (`utils/keyboardBlockDetector.test.ts`) to verify the detection logic works correctly with various workspace configurations.
