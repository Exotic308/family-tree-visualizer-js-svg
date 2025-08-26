# Family Tree Visualizer JS SVG

A comprehensive, interactive family tree visualization tool built with vanilla JavaScript and SVG. Features a responsive design with a hamburger menu, interactive person details, pan/zoom functionality, and full localization support.

## 🎯 Core Functionality
- **Draw Family Tree**: Draw family tree from JSON data
- **Interactive Family Tree**: Click on any person to view detailed information
- **Pan & Zoom:** Navigate through large family trees with mouse/touch controls
- **Modal:** Show modal with detailed family info
- **SVG Export:** Download the family tree as an SVG file
- **Reset View:** Center and reset the tree view
- **Compatibility:** Works seamlessly on desktop and mobile devices
- **Customizable:** Leave any field empty and HTML object will be ommited
- **Localization:** Handled in same JSON as family tree
- **Dependencies:** No external libraries required, Pure JavaScript and SVG
- **License:** This project is open source and available under the [MIT License](LICENSE).

## 🏗️ Architecture
- **`family_tree_drawer.js`**: Core SVG rendering and tree layout logic
- **`family_tree_manager.js`**: UI management and event handling
- **`styles.css`**: Responsive design and visual styling
- **`index.html`**: Main application structure
- **`family_tree_ignjic.json`**: Data for family tree

```javascript
{
    "title": "Породица Игњић",                     // Main family title (required)
    "downloadSvg": "Преузми SVG",                  // SVG download button text (optional)
    "resetView": "Центрирај",                      // Reset view button text (optional)
    "subtitle": "О породици",                      // Subtitle below main title (optional)
    "instructions": "Користите зум и ..",          // User instructions (optional)
    "description": "Породица Игњић један..",       // Family description (optional)
    "modal": {                                     // Family history modal config (optional)
        "title": "Игњићи",                         // Modal header title
        "content": [                               // Array of modal paragraphs
            "У наставку доносимо одломак....",
            "Ово је, такође, један од најстар..."
        ]
    },
    "openText": "Отвори текст",                    // Modal open button text (optional)
    "labels": {                                    // Localization labels (required)
        "born": "Рођен",                           // Birth date label
        "died": "Преминуо",                        // Death date label
        "gender": "Пол",                           // Gender label
        "male": "Мушко",                           // Male text
        "female": "Женско",                        // Female text
        "maiden": "Дјевојачко",                    // Maiden name label
        "father": "Отац",                          // Father label
        "mother": "Мајка",                         // Mother label
        "husband": "Супруг",                       // Husband label
        "wife": "Супруга",                         // Wife label
        "children": "Дјеца",                       // Children label
        "backToFamily": "← Назад на породицу"      // Back button text
    },
    "root": 62,                                    // Root person ID to start tree (required)
    "nodes": [                                     // Array of family members (required)
        {
            "id": 1,                               // Unique person ID (required)
            "mid": 8,                              // Mother's ID (optional)
            "fid": 9,                              // Father's ID (optional)
            "pid": 2,                              // Partner/Spouse ID (optional)
            "gender": "male",                      // Gender: "male" or "female" (required)
            "name": "Перо",                        // Person's full name (required)
            "born": "1968",                        // Birth year/date (optional)
            "died": "",                            // Death year/date (optional, empty = alive)
            "maiden": ""                           // Maiden name for women (optional)
        }
    ]
}
```

## 🚀 Running the Project
Since this project uses `fetch()` to load data, you need a local web server:
```bash
# From your project directory
python3 -m http.server 8000
```
Then open `http://localhost:8000` in your browser.

You can also view the family tree live at: **https://ignjic.org**

<img width="1197" height="1016" alt="image" src="https://github.com/user-attachments/assets/1bbdda36-0e5c-4318-a97e-17d9198afeb0" />