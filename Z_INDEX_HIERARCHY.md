# Z-Index Hierarchy for SideNavbar Component

## Overview
This document outlines the z-index hierarchy used in the SideNavbar component to ensure proper layering and prevent UI elements from overlapping incorrectly.

## Z-Index Values

### Base Elements (Lowest Priority)
- **Rounded corner fillers**: `z-index: 1`
  - Used for decorative corner elements
  - Lowest priority to stay behind other elements

### Navigation Elements
- **Logo and Navigation**: `z-index: 2`
  - Main navigation items
  - Help button and navigation links

### Interactive Elements (Medium Priority)
- **Collapse/Expand Handle**: `z-index: 150`
  - Button to collapse/expand sidebar
  - Should be above navigation but below dropdowns

### Dropdown Menus (High Priority)
- **Help Dropdown Menu**: `z-index: 200`
  - FAQ and Contact Us options
  - Should appear above sidebar content

- **Profile Dropdown Menu**: `z-index: 200`
  - Settings and Logout options
  - Same priority as help dropdown

### Sidebar Container (High Priority)
- **Main Sidebar**: `z-index: 100`
  - The entire sidebar container
  - Should be above main content but below modals

### Modal Overlays (Highest Priority)
- **Contact Support Modal**: `z-index: 9999`
  - Modal backdrop and container
  - Should appear above everything else

- **Contact Support Card**: `z-index: 10000`
  - The actual modal content
  - Highest priority to ensure it's always visible

## Layering Order (Bottom to Top)

```
1. Rounded corner fillers (z-index: 1)
2. Logo and Navigation (z-index: 2)
3. Main Sidebar (z-index: 100)
4. Collapse/Expand Handle (z-index: 150)
5. Dropdown Menus (z-index: 200)
6. Contact Support Modal (z-index: 9999)
7. Contact Support Card (z-index: 10000)
```

## Best Practices

### 1. **Use Semantic Z-Index Values**
- Base elements: 1-10
- Navigation: 10-50
- Sidebar: 100-150
- Dropdowns: 200-300
- Modals: 9999+

### 2. **Avoid Arbitrary Values**
- Don't use random z-index numbers
- Stick to the established hierarchy
- Use increments of 50 or 100 for major sections

### 3. **Test Layering**
- Always test with different screen sizes
- Verify dropdowns appear above other content
- Ensure modals are always on top

### 4. **Document Changes**
- Update this file when adding new z-index values
- Explain why specific values were chosen
- Note any special layering requirements

## Common Issues and Solutions

### Issue: Dropdown appears behind other elements
**Solution**: Increase z-index to 200 or higher

### Issue: Modal not appearing on top
**Solution**: Use z-index 9999+ for modal containers

### Issue: Sidebar elements overlapping
**Solution**: Ensure proper z-index hierarchy within sidebar

### Issue: Content appearing above sidebar
**Solution**: Increase sidebar z-index to 100+

## Future Considerations

### 1. **Responsive Design**
- Z-index values should work across all screen sizes
- Consider mobile-specific layering needs

### 2. **Accessibility**
- Ensure proper focus management with z-index
- Screen readers should follow logical order

### 3. **Performance**
- Avoid excessive z-index stacking
- Use CSS transforms when possible instead of high z-index values

## Testing Checklist

- [ ] Sidebar appears above main content
- [ ] Dropdown menus appear above sidebar
- [ ] Contact modal appears above everything
- [ ] No elements overlap unexpectedly
- [ ] Works correctly on mobile devices
- [ ] No z-index conflicts in browser console

## Files Modified

- ✅ `components/SideNavbar.tsx` - Updated z-index values
- ✅ `Z_INDEX_HIERARCHY.md` - This documentation

## Status
**RESOLVED** ✅ - Z-index hierarchy properly established for all SideNavbar elements
