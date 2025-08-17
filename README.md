# Family Tree Ignjic - SVG Family Tree Drawer

## Overview
A custom SVG-based family tree visualization tool. This tool creates a horizontal, multi-generational family tree layout with clean lines and minimalist design.

### Family Tree Data Format
The family tree data is stored in `family_tree_ignjic.json` with the following structure:

```javascript
var data = {
    root: 62,  // ID of the root person (earliest ancestor)
    nodes: [   // Array of all persons in the family tree
        {
            id: 1,           // Unique identifier for this person
            mid: 8,          // Mother ID (mother's person ID)
            fid: 9,          // Father ID (father's person ID)
            pids: [2],       // Partner IDs (array of spouse/partner IDs)
            gender: 'male',   // Gender: 'male' or 'female'
            name: 'Pero',    // Person's name
            born: '1968',    // Birth year
            died: ''     // Death year (optional, empty string if alive)
        }
        // ... more persons
    ]
};
```

## Technical Implementation

### SVG Approach Benefits
- **Scalable**: Maintains quality at any zoom level
- **Interactive**: Easy to add click events, tooltips, and navigation
- **Accessible**: Text can be read by screen readers
- **Performance**: Efficient rendering for large family trees
- **Printability**: Easy to export and print

## Usage

### Basic Setup
1. Include the family tree data file
2. Create an SVG container in your HTML
3. Initialize the FamilyTreeDrawer with your data
4. Call the render method

### Example
```html
<div id="family-tree-container">
    <svg id="family-tree-svg" width="100%" height="100%"></svg>
</div>

<script>
    const drawer = new FamilyTreeDrawer('#family-tree-svg', data);
    drawer.render();
</script>
```

## Dependencies
- No external libraries required
- Pure JavaScript and SVG
- CSS for styling (optional)