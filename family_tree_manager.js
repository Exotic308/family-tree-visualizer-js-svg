// Family Tree Application Script
document.addEventListener('DOMContentLoaded', function() {
  
    // Load the family tree data from JSON file
    fetch('family_tree_ignjic.json?v=1')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Initialize the family tree drawer
            const drawer = new FamilyTreeDrawer('#family-tree-svg', data);
            drawer.render();
            
            // Connect reset button
            document.getElementById('reset-view-btn').addEventListener('click', () => {
                drawer.resetView();
            });
            
            // Connect download button
            document.getElementById('download-svg-btn').addEventListener('click', () => {
                drawer.downloadSVG();
            });
            
            // Connect full text button
            document.getElementById('full-text-btn').addEventListener('click', () => {
                initializeModalContent();
                document.getElementById('full-text-modal').style.display = 'block';
            });
            
            // Connect close modal button
            document.getElementById('close-modal-btn').addEventListener('click', () => {
                document.getElementById('full-text-modal').style.display = 'none';
            });
            
            // Close modal when clicking outside
            document.getElementById('full-text-modal').addEventListener('click', (e) => {
                if (e.target.id === 'full-text-modal') {
                    e.target.style.display = 'none';
                }
            });

            
            // Update menu content from JSON data
            function updateMenuContent(id, data) {
                if(!data || data === ""){
                    document.getElementById(id).style.display = 'none';
                } else {
                    document.getElementById(id).textContent = data;
                }
            }
            updateMenuContent('menu-title', data.title);
            updateMenuContent('mobile-title', data.title);
            updateMenuContent('download-svg-btn', data.downloadSvg);
            updateMenuContent('reset-view-btn', data.resetView);
            updateMenuContent('full-text-btn', data.openText);
            updateMenuContent('family-info-title', data.subtitle);
            updateMenuContent('family-info-description', data.description);
            updateMenuContent('family-info-instructions', data.instructions);
            
            // Initialize modal content from JSON data
            function initializeModalContent() {
                document.getElementById('modal-title').textContent = data.modal.title;
                const modalBody = document.getElementById('modal-body');
                modalBody.innerHTML = '';
                data.modal.content.forEach(paragraph => {
                    const p = document.createElement('p');
                    p.textContent = paragraph;
                    modalBody.appendChild(p);
                });
            }
            
            // Initialize modal content on page load
            initializeModalContent();
            
            // Hamburger menu functionality
            const mobileHamburgerIcon = document.getElementById('mobile-hamburger-icon');
            const menuContent = document.getElementById('menu-content');
            const hamburgerMenu = document.getElementById('hamburger-menu');

            // Mobile hamburger

            mobileHamburgerIcon.addEventListener('click', () => {
                //menuContent.classList.toggle('active');
                hamburgerMenu.classList.toggle('active');
            });
            
            // Also add touch events for mobile
            mobileHamburgerIcon.addEventListener('touchstart', (e) => {
                e.preventDefault();
                //menuContent.classList.toggle('active');
                hamburgerMenu.classList.toggle('active');
            });
            
            function inlinePersonDetails(person){
                var text = person.name;
                if (person.born || person.died) {
                    text += " ";
                    if (person.born != null && person.born != "") text += person.born;
                    if (person.died != null && person.died != "") text += ' - ' + person.died;
                }
                return text;
            }

            // Function to show person details in modal
            function showPersonDetails(person) {

                document.getElementById('modal-title').textContent = inlinePersonDetails(person);
                
                // Create person details content
                let detailsHTML = `
                    <div class="person-details">
                        <div class="person-info">
                `;
    
                detailsHTML += `<p><strong>ID:</strong> ${person.id}</p>`;

                if (person.born) {
                    detailsHTML += `<p><strong>${data.labels.born}:</strong> ${person.born}</p>`;
                }
                if (person.died) {
                    detailsHTML += `<p><strong>${data.labels.died}:</strong> ${person.died}</p>`;
                }
                if (person.gender) {
                    const genderText = person.gender === 'male' ? data.labels.male : data.labels.female;
                    detailsHTML += `<p><strong>${data.labels.gender}:</strong> ${genderText}</p>`;
                }
                
                // Show maiden name for women
                if (person.gender === 'female' && person.maiden) {
                    detailsHTML += `<p><strong>${data.labels.maiden}:</strong> ${person.maiden}</p>`;
                }
                
                if (person.fid) {
                    const father = data.nodes.find(node => node.id === person.fid);
                    if (father) {
                        detailsHTML += `<p><strong>${data.labels.father}: </strong>`;
                        detailsHTML += inlinePersonDetails(father);
                        detailsHTML += `</p>`;
                    }
                }
                
                if (person.mid) {
                    const mother = data.nodes.find(node => node.id === person.mid);
                    if (mother) {
                        detailsHTML += `<p><strong>${data.labels.mother}: </strong>`;
                        detailsHTML += inlinePersonDetails(mother);
                        detailsHTML += `</p>`;
                    }
                }

                const children = data.nodes.filter(node => 
                    (node.fid === person.id) || 
                    (node.mid === person.id)
                );
                
                const partner = data.nodes.find(node => node.pid === person.id);
                if (partner) {
                    const partnerLabel = person.gender === 'male' ? data.labels.wife : data.labels.husband;
                    detailsHTML += `<p><strong>${partnerLabel}:</strong> ${inlinePersonDetails(partner)}</p>`;
                }
                
                if (children.length > 0) {
                    detailsHTML += `<p><strong>${data.labels.children}:</strong></p><ul>`;
                    children.forEach(child => {
                        detailsHTML += `<li>` + inlinePersonDetails(child) + `</li>`;
                    });
                    detailsHTML += `</ul>`;
                }
                
                detailsHTML += `
                        </div>
                    </div>
                `;
                
                // Show in modal
                const modal = document.getElementById('full-text-modal');
                const modalContent = modal.querySelector('.modal-content');
                const modalBody = modalContent.querySelector('.modal-body');
                
                modalBody.innerHTML = detailsHTML;
                modal.style.display = 'block';
            }
            
            // Add click and touch event listeners to person elements in the SVG
            function addPersonClickListeners() {
                const personElements = document.querySelectorAll('.person-text');
                personElements.forEach(element => {
                    // Click event for desktop
                    element.addEventListener('click', handlePersonClick);
                    
                    // Touch events for mobile with drag detection
                    element.addEventListener('touchstart', handleTouchStart, { passive: false });
                    element.addEventListener('touchend', handleTouchEnd, { passive: false });
                    
                    // Make element more touch-friendly
                    element.style.cursor = 'pointer';
                    element.style.touchAction = 'manipulation';
                });
            }
            
            // Handle person click events
            function handlePersonClick(e) {
                e.preventDefault();
                e.stopPropagation();
                
                let personId = e.target.getAttribute('data-person-id');
                if (!personId && e.target.parentElement) {
                    personId = e.target.parentElement.getAttribute('data-person-id');
                }
                
                if (personId) {
                    const person = data.nodes.find(node => node.id == personId);
                    if (person) {
                        showPersonDetails(person);
                    }
                }
            }
            
            // Touch tracking for drag detection
            let touchStartX = 0;
            let touchStartY = 0;
            let touchStartTime = 0;
            
            // Handle touch start to record initial position
            function handleTouchStart(e) {
                const touch = e.touches[0];
                touchStartX = touch.clientX;
                touchStartY = touch.clientY;
                touchStartTime = Date.now();
            }
            
            // Handle touch end with drag detection
            function handleTouchEnd(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const touch = e.changedTouches[0];
                const touchEndX = touch.clientX;
                const touchEndY = touch.clientY;
                const touchEndTime = Date.now();
                
                // Calculate distance moved
                const deltaX = Math.abs(touchEndX - touchStartX);
                const deltaY = Math.abs(touchEndY - touchStartY);
                const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                
                // Calculate time duration
                const duration = touchEndTime - touchStartTime;
                
                // Only open person details if it was a tap (small movement, short duration)
                const isTap = distance < 10 && duration < 300; // 10px threshold, 300ms threshold
                
                if (isTap) {
                    let personId = e.target.getAttribute('data-person-id');
                    if (!personId && e.target.parentElement) {
                        personId = e.target.parentElement.getAttribute('data-person-id');
                    }
                    
                    if (personId) {
                        const person = data.nodes.find(node => node.id == personId);
                        if (person) {
                            showPersonDetails(person);
                        }
                    }
                }
            }
            
            // Initial setup
            addPersonClickListeners();
            
            // Retry after a delay to catch any late-rendered elements
            setTimeout(addPersonClickListeners, 100);
            setTimeout(addPersonClickListeners, 500);
            setTimeout(addPersonClickListeners, 1000);
        })
        .catch(error => {
            console.error('Error loading data:', error);
            console.error('Error details:', error.message);
            document.getElementById('family-tree-svg').innerHTML = 
                `<text x="600" y="300" text-anchor="middle" fill="red" font-size="16">Error: ${error.message}</text>`;
        });
});
