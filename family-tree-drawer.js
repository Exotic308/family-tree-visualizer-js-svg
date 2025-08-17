class FamilyTreeDrawer {
    constructor(selector, data) {
        this.container = document.querySelector(selector);
        this.data = data;

        this.header = 78;
        this.verticalSpacing = 16;
        this.horizontalSpacing = 16;

        this.lineThickness = 0.8;
        this.spouseDistance = 16;
        this.nameWidth = 100;
        this.afterAscendantSpacing = 20;
        this.beforeDescendantSpacing = 20;
        this.siblingDistance = 0;
        
        // Clear any existing content
        this.container.innerHTML = '';
        
        // Add CSS styles to SVG
        this.addSVGStyles();
        
        // Make SVG responsive to window size
        this.updateSVGSize();
        window.addEventListener('resize', () => this.updateSVGSize());
        
        // Add pan and zoom event listeners
        this.panZoom = {
            scale: 1,
            translateX: 0,
            translateY: 0,
            isDragging: false,
            isPinching: false,
            lastX: 0,
            lastY: 0,
            initialDistance: 0,
            initialScale: 1,
            initialCenter: { x: 0, y: 0 }
        };
        this.setupPanZoom();
    }

    getSVGStyles() {
        return `
            .person-text { font-size: 16px; font-family: Arial, sans-serif; text-anchor: start; fill: black; }
            .person-name { font-weight: bold; dominant-baseline: hanging; }
            .person-years { font-weight: normal; dominant-baseline: hanging; }
            .connection-line { stroke: black; stroke-width: 0.8; fill: none; }
            .shape-outline { fill: none; stroke: black; stroke-width: 1; }
            .person-text:hover { fill: #007bff; cursor: pointer; }
            .connection-line:hover { stroke: #007bff; stroke-width: 1.2; }
        `;
    }

    createStyleDefs() {
        // Create a defs element for styles
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        
        // Create style element
        const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
        style.setAttribute('type', 'text/css');
        
        // Add CSS content from single source
        style.textContent = this.getSVGStyles();
        
        defs.appendChild(style);
        return defs;
    }

    addSVGStyles() {
        const defs = this.createStyleDefs();
        this.container.appendChild(defs);
    }

    updateSVGSize() {
        const container = this.container.parentElement;
        const containerRect = container.getBoundingClientRect();
        
        // Set SVG dimensions to fill available space
        this.container.setAttribute('width', containerRect.width);
        this.container.setAttribute('height', containerRect.height); // Ensure minimum height for all content
        
        // Set viewBox to match dimensions
        this.container.setAttribute('viewBox', `0 0 ${containerRect.width} ${containerRect.height}`);
    }

    setupPanZoom() {
        // Mouse wheel zoom
        this.container.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? 0.9 : 1.1;
            const rect = this.container.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            this.zoomAtPoint(delta, mouseX, mouseY);
        });

        // Mouse down - start panning
        this.container.addEventListener('mousedown', (e) => {
            if (e.button === 0) { // Left mouse button only
                this.panZoom.isDragging = true;
                this.panZoom.lastX = e.clientX;
                this.panZoom.lastY = e.clientY;
                this.container.style.cursor = 'grabbing';
            }
        });

        // Mouse move - panning
        this.container.addEventListener('mousemove', (e) => {
            if (this.panZoom.isDragging) {
                const deltaX = e.clientX - this.panZoom.lastX;
                const deltaY = e.clientY - this.panZoom.lastY;
                
                this.panZoom.translateX += deltaX;
                this.panZoom.translateY += deltaY;
                
                this.panZoom.lastX = e.clientX;
                this.panZoom.lastY = e.clientY;
                
                this.applyTransform();
            }
        });

        // Mouse up - stop panning
        this.container.addEventListener('mouseup', () => {
            this.panZoom.isDragging = false;
            this.container.style.cursor = 'grab';
        });

        // Mouse leave - stop panning
        this.container.addEventListener('mouseleave', () => {
            this.panZoom.isDragging = false;
            this.container.style.cursor = 'grab';
        });

        // Touch events for mobile devices
        this.container.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (e.touches.length === 1) {
                // Single touch - start panning
                this.panZoom.isDragging = true;
                this.panZoom.lastX = e.touches[0].clientX;
                this.panZoom.lastY = e.touches[0].clientY;
            } else if (e.touches.length === 2) {
                // Two touches - start pinch zoom
                this.panZoom.isPinching = true;
                this.panZoom.initialDistance = this.getTouchDistance(e.touches[0], e.touches[1]);
                this.panZoom.initialScale = this.panZoom.scale;
                this.panZoom.initialCenter = this.getTouchCenter(e.touches[0], e.touches[1]);
            }
        });

        this.container.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (e.touches.length === 1 && this.panZoom.isDragging) {
                // Single touch - panning
                const deltaX = e.touches[0].clientX - this.panZoom.lastX;
                const deltaY = e.touches[0].clientY - this.panZoom.lastY;
                
                this.panZoom.translateX += deltaX;
                this.panZoom.translateY += deltaY;
                
                this.panZoom.lastX = e.touches[0].clientX;
                this.panZoom.lastY = e.touches[0].clientY;
                
                this.applyTransform();
            } else if (e.touches.length === 2 && this.panZoom.isPinching) {
                // Two touches - pinch zoom
                const currentDistance = this.getTouchDistance(e.touches[0], e.touches[1]);
                const currentCenter = this.getTouchCenter(e.touches[0], e.touches[1]);
                
                const scaleFactor = currentDistance / this.panZoom.initialDistance;
                const newScale = Math.max(0.1, Math.min(5, this.panZoom.initialScale * scaleFactor));
                
                this.zoomAtPoint(newScale / this.panZoom.scale, currentCenter.x, currentCenter.y);
            }
        });

        this.container.addEventListener('touchend', (e) => {
            if (e.touches.length === 0) {
                // All touches ended
                this.panZoom.isDragging = false;
                this.panZoom.isPinching = false;
            } else if (e.touches.length === 1) {
                // One touch ended, switch to panning mode
                this.panZoom.isPinching = false;
                this.panZoom.isDragging = true;
                this.panZoom.lastX = e.touches[0].clientX;
                this.panZoom.lastY = e.touches[0].clientY;
            }
        });

        // Set initial cursor
        this.container.style.cursor = 'grab';
    }

    getTouchDistance(touch1, touch2) {
        const dx = touch1.clientX - touch2.clientX;
        const dy = touch1.clientY - touch2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    getTouchCenter(touch1, touch2) {
        return {
            x: (touch1.clientX + touch2.clientX) / 2,
            y: (touch1.clientY + touch2.clientY) / 2
        };
    }

    zoomAtPoint(scaleFactor, x, y) {
        const oldScale = this.panZoom.scale;
        const newScale = Math.max(0.1, Math.min(5, this.panZoom.scale * scaleFactor));
        
        // Calculate zoom center point
        const zoomCenterX = (x - this.panZoom.translateX) / oldScale;
        const zoomCenterY = (y - this.panZoom.translateY) / oldScale;
        
        // Update scale
        this.panZoom.scale = newScale;
        
        // Adjust translation to zoom at the mouse point
        this.panZoom.translateX = x - zoomCenterX * newScale;
        this.panZoom.translateY = y - zoomCenterY * newScale;
        
        this.applyTransform();
    }

    applyTransform() {
        const transform = `translate(${this.panZoom.translateX}px, ${this.panZoom.translateY}px) scale(${this.panZoom.scale})`;
        
        // Apply transform to all SVG elements
        const allElements = this.container.querySelectorAll('*');
        allElements.forEach(element => {
            element.style.transform = transform;
            element.style.transformOrigin = '0 0';
        });
    }

    resetView() {
        this.panZoom.scale = 1;
        this.panZoom.translateX = 0;
        this.panZoom.translateY = 0;
        this.applyTransform();
    }

    downloadSVG() {
        // Create a clone of the SVG for export
        const svgClone = this.container.cloneNode(true);
        
        // Remove any existing transforms from the clone
        const allElements = svgClone.querySelectorAll('*');
        allElements.forEach(element => {
            element.style.transform = '';
            element.style.transformOrigin = '';
        });
        
        // Ensure styles are preserved in the downloaded SVG
        const defs = svgClone.querySelector('defs');
        if (!defs) {
            // If no defs, add the styles back using shared method
            const newDefs = this.createStyleDefs();
            svgClone.insertBefore(newDefs, svgClone.firstChild);
        }
        
        // Set the SVG dimensions to the current viewport size
        const containerRect = this.container.parentElement.getBoundingClientRect();
        
        // Set SVG dimensions to fill available space
        svgClone.setAttribute('width', containerRect.width);
        svgClone.setAttribute('height', containerRect.height);

        // Set viewBox to match dimensions
        svgClone.setAttribute('viewBox', `0 0 ${containerRect.width} ${containerRect.height}`);
        
        // Convert SVG to string
        const svgData = new XMLSerializer().serializeToString(svgClone);
        
        // Create blob and download link
        const blob = new Blob([svgData], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        
        // Create download link
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = 'family_tree_ignjic.svg';
        
        // Trigger download
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        // Clean up
        URL.revokeObjectURL(url);
    }

    render() {
        // Find the root person
        const rootPerson = this.data.nodes.find(node => node.id === this.data.root);
        if (!rootPerson) {
            console.error('Root person not found');
            return;
        }
        
        // 78 is header
        this.renderPerson(rootPerson, this.horizontalSpacing, this.header + this.verticalSpacing);
    }

    renderPerson(person, startX, startY, totalHeight) {

        // Find the root person's partner and children
        const partner = this.findPartner(person);
        const children = this.findChildren(person, partner);

        // Draw person
        var personSvg = this.drawPerson(person, startX, startY);
        var personBox = personSvg.getBBox();
        
        var height = personBox.height;
        var width = personBox.width;

        if (partner) {
            // Draw partner
            var partnerSvg = this.drawPerson(partner, startX, startY + personBox.height + this.spouseDistance);
            var partnerBox = partnerSvg.getBBox();
            
            height += this.spouseDistance + partnerBox.height;
            width = width > partnerBox.width ? width : partnerBox.width;

            this.drawLine(startX + width/2, startY + height/2 - 3, startX + width + this.afterAscendantSpacing, startY + height/2 - 3);
        }else{
            personSvg.setAttribute('y', startY + personBox.height);
            personBox = personSvg.getBBox();
            startY -= personBox.height - this.spouseDistance;
            height += this.spouseDistance + personBox.height;
            
        }

        if(children.length > 0)
            this.drawCircle(startX + width + this.afterAscendantSpacing, startY + height / 2, 3);

        // Debugging
        //this.drawRect(personBox.x, personBox.y, personBox.width, personBox.height);

        // Draw children below if they exist
        if(children.length == 0){
            return height;
        }

        var childrenHeight = 0;
        var isFirstChild = true;
        for(var child of children){
            if(!isFirstChild){
                childrenHeight += this.siblingDistance;
            }
            isFirstChild = false;

            var currentChildHeight = this.renderPerson(child, startX + width + this.beforeDescendantSpacing + this.afterAscendantSpacing, startY + childrenHeight, totalHeight);
            this.drawCornerLine(startX + width + this.afterAscendantSpacing, startY + height / 2 - 3, startX + width + this.afterAscendantSpacing+ this.beforeDescendantSpacing, startY + height / 2 - 3 + childrenHeight);
            childrenHeight += currentChildHeight;
        }

        return height > childrenHeight ? height : childrenHeight;
    }

    //#region Family Tree Utility
    findPartner(person) {
        if (!person.pids || person.pids.length === 0) {
            return null;
        }
        
        // Get the first partner (assuming monogamous relationships for now)
        const partnerId = person.pids[0];
        return this.data.nodes.find(node => node.id === partnerId);
    }

    findChildren(person1, person2) {
        const children = [];
        
        // Find all nodes that have person1 or person2 as parents
        this.data.nodes.forEach(node => {
            if (person2) {
                // Both parents exist
                if ((node.fid === person1.id && node.mid === person2.id) || 
                    (node.fid === person2.id && node.mid === person1.id)) {
                    children.push(node);
                }
            } else {
                // Only one parent exists (single parent)
                if (node.fid === person1.id || node.mid === person1.id) {
                    children.push(node);
                }
            }
        });
        
        // Sort children by ID for consistent ordering
        children.sort((a, b) => a.id - b.id);
        
        console.log('Found children:', children);
        return children;
    }

    //#endregion

    //#region Draw Functions
    drawPerson(person, x, y) {
        console.log('Drawing person:', person.name, 'at', x, y);
    
        // Single text element with CSS classes
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', x);
        text.setAttribute('y', y);
        text.classList.add('person-text');

        // Bold name with CSS class
        const nameSpan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
        nameSpan.classList.add('person-name');
        nameSpan.textContent = person.name;
        
        text.appendChild(nameSpan);
    
        // Years (non-bold) if available
        if (person.born || person.died) {
            const yearsSpan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
            yearsSpan.classList.add('person-years');
            let years = ' ';
            if (person.born) years += person.born;
            if (person.died) years += ' ' + person.died;
            yearsSpan.textContent = years;
            text.appendChild(yearsSpan);
        }
    
        this.container.appendChild(text);
    
        return text;
    }

    drawCircle(x, y, r) {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', x);
        // -3 because for some reason the circle is not centered on the y axis
        circle.setAttribute('cy', y - 3);
        circle.setAttribute('r', r);
        circle.classList.add('shape-outline');
        this.container.appendChild(circle);
    }

    drawRect(x, y, w, h) {
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', x);
        rect.setAttribute('y', y);
        rect.setAttribute('width', w);
        rect.setAttribute('height', h);
        rect.classList.add('shape-outline');
        this.container.appendChild(rect);
    }

    drawLine(x1, y1, x2, y2) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        line.classList.add('connection-line');
        this.container.appendChild(line);
    }

    drawCornerLine(x1, y1, x2, y2) {
        // First vertical line (x stays, y moves)
        const vLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        vLine.setAttribute('x1', x1);
        vLine.setAttribute('y1', y1);
        vLine.setAttribute('x2', x1);
        vLine.setAttribute('y2', y2);
        vLine.classList.add('connection-line');
        this.container.appendChild(vLine);

        // Then horizontal line (y stays, x moves)
        const hLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        hLine.setAttribute('x1', x1);
        hLine.setAttribute('y1', y2);
        hLine.setAttribute('x2', x2);
        hLine.setAttribute('y2', y2);
        hLine.classList.add('connection-line');
        this.container.appendChild(hLine);
    }
    //#endregion
}
