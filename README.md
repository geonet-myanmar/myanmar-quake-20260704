# Myanmar Seismicity & Tectonic Web Map

An interactive, responsive web map application that visualizes the **July 4, 2026, Magnitude 3.5 Htantabin (Yangon) Earthquake** and overlays it onto Myanmar's tectonic plate boundary faults and lineaments.

Renders high-fidelity geospatial data directly in the browser with **zero dependencies** and **zero build steps**—optimized for offline loading, lightning-fast rendering, and minimal storage requirements (ideal for devices with tight disk limits).

---

## 🚀 Live Preview (GitHub Pages)

You can view the live interactive map at:
👉 **`https://<your-username>.github.io/<your-repo-name>/`** *(Update this link after publishing)*

Alternatively, you can just download the files and double-click **`index.html`** to open the map instantly in your browser.

---

## 🗺️ Key Features

*   **Pulsing Epicenter Core**: A custom-animated CSS marker centered at `16.98° N, 96.01° E` (Htantabin, Yangon Region).
*   **Distance Decay Buffers**: Toggleable impact circles showing the **10 km**, **25 km**, and **50 km** radii around the epicenter.
*   **Tectonic fault Web**: Visualizes all fault structures from the 2011 Myanmar Tectonic Map. Active strike-slip faults are highlighted in glowing coral, named faults in cyan, and unnamed structures in translucent blue.
*   **Proximity & Spatial Querying**: 
    *   Finds the nearest fault lines to the epicenter dynamically using the **Haversine formula**.
    *   Clicking any fault segment displays its ID, segment boundary, classification, and proximity to the epicenter in a floating information card.
*   **Fault Registry Search**: A sidebar index of all named fault zones in Myanmar (e.g., Momeik, Shweli, Kyaukkyan, Nam Ma). Clicking a registry row pans and zooms the map to fit that fault segment.
*   **Basemap Styles**: Switch on-the-fly between **Dark Matter** (best contrast), **Satellite Imagery**, and **Light Carto** maps.
*   **Collapsible Official Source**: Expand and view the original announcement graphic from the Department of Meteorology and Hydrology (DMH) inside the event card.

---

## 📈 Proximity Analysis Results

| Analysis | Value | Tectonic Significance |
| :--- | :--- | :--- |
| **Epicenter Coordinates** | `16.98° N, 96.01° E` | Approx. 3 miles S-SE of Htantabin, Yangon. |
| **Nearest Lineament** | **9.43 km** | Index Feature `#517` (a major N-S shear structure passing Yangon). |
| **Nearest Named Fault** | **488.70 km** | **Mong Hpyak Fault** (Eastern Shan State). |

*Note: The epicenter is situated in the Ayeyarwady Deltaic Basin, which lies directly in the active tectonic shadow zone of the **Sagaing Fault** system (Bago segment).*

---

## 📂 Project Repository Structure

*   `index.html` - Main HTML layout with sidebar dashboard, layers control, and modal templates.
*   `style.css` - Custom styles featuring dark mode theme, glassmorphism, responsive styles, and custom map icons.
*   `app.js` - Map controller, Leaflet bindings, Haversine computations, and sidebar registry actions.
*   `tectonic-data.js` - Contains the GeoJSON payload pre-wrapped into a JavaScript module. This permits local offline execution (`file:///`) and avoids CORS fetch blockages.
*   `quake_info.jpg` - Original DMH seismology divisional announcement image.
*   `server.js` - A tiny, zero-dependency Node.js HTTP server.
*   `package.json` - Configured with a `start` script to quickly boot `server.js`.

---

## 🛠️ How to Deploy on GitHub Pages (3-Step Guide)

Deploying this map is incredibly straightforward because it's a completely static site:

1.  **Push the Code**: Commit and push all files in this directory to a new public or private GitHub repository.
2.  **Navigate to Settings**: 
    *   Go to your GitHub repository page in the browser.
    *   Click on the **Settings** tab.
    *   Under the left-hand sidebar, click on **Pages**.
3.  **Deploy from Branch**:
    *   Under **Build and deployment**, set the Source to **Deploy from a branch**.
    *   Under **Branch**, select `main` (or `master`) and folder `/ (root)`.
    *   Click **Save**.

Within a couple of minutes, GitHub will build and host your map. Your live URL will appear at the top of the Pages settings page!

---

## 💻 Local Offline Development

If you'd like to test the site locally using a server:
1.  Open your terminal in this directory.
2.  Launch the Node server:
    ```bash
    npm start
    ```
3.  Navigate to [http://localhost:3000](http://localhost:3000) in your web browser.
