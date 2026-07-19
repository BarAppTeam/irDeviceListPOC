# BeamBase - Infrared (IR) Device Code Collector PoC

BeamBase is a modern, responsive, client-side Infrared (IR) Device Code database application. It is designed as a developer utility to aggregate, search, and manage IR commands (buttons and hex codes) in local storage, serving as a frontend proof of concept (PoC) that compiles into a static website compatible with **GitHub Pages**.

---

## 🚀 Key Features

* **Device Management Dashboard**: View, add, and update device profiles (e.g. Sony TV, Daikin AC).
* **Dynamic IR Commands**: Add unlimited button keys and IR code strings to any device.
* **Responsive Layout**: Designed with stacked form cards on mobile screens for easy input and comfortable touch targets (Edit/Delete).
* **Global Deep Search**: Instantly filters devices by name, command name, or IR hex code values (Press `/` to focus).
* **Database Backup & Recovery**: Export all configurations to a JSON file and restore them at any time.
* **Persistent Storage**: Changes are automatically written to the browser's `localStorage` and persist through page reloads.

---

## 🛠️ Tech Stack

* **Framework**: React 19 (Vite SPA)
* **Styling**: Tailwind CSS v4 & PostCSS
* **Icons**: Lucide React
* **Language**: TypeScript

---

## 📦 Getting Started

### 1. Installation

Install project dependencies using your package manager:
```bash
npm install
```

### 2. Run Locally

Launch the Vite local dev server:
```bash
npm run dev
```
Open your browser to `http://localhost:5173`.

### 3. Production Build

Build the static site bundle:
```bash
npm run build
```
This outputs compiled HTML, CSS, and JS assets to the `dist/` directory.

---

## 🌍 GitHub Pages Deployment

The app is pre-configured with a relative base path (`base: './'`) in `vite.config.ts`. This allows assets to load correctly when hosted under GitHub Pages subdirectories (`username.github.io/repo-name/`).

To deploy:
1. Install the `gh-pages` helper package:
   ```bash
   npm install -D gh-pages
   ```
2. Add the following scripts to `package.json`:
   ```json
   "predeploy": "npm run build",
   "deploy": "gh-pages -d dist"
   ```
3. Run deployment command:
   ```bash
   npm run deploy
   ```

---

## 🔮 Future Architecture Upgrades

The application's data structure has been explicitly designed to map to a backend SQL/NoSQL database:
```json
[
  {
    "id": "tv-living-room",
    "deviceName": "Living Room TV",
    "commands": [
      { "key": "Volume Up", "value": "0x20DF40BF" },
      { "key": "Volume Down", "value": "0x20DFC03F" }
    ]
  }
]
```

Guidelines and instructions for upcoming development phases (e.g., database migration, API integration, and code validation) are stored in the workspace customizations folder. AI coding assistants loaded in this workspace will automatically reference these instructions to maintain design consistency. Refer to the development skill at [SKILL.md](file:///Users/bar/Documents/GitHub/irDeviceListPOC/.agents/skills/ir-device-upgrades/SKILL.md).
