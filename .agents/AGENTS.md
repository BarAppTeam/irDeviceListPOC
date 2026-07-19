# BeamBase IR Device Collector - Agent Rules & Guidelines

Welcome to the BeamBase development workspace. This document outlines general instructions, coding styles, and behavior rules for AI assistants and developers contributing to this codebase.

---

## 🛠️ Codebase Overview

- **Framework**: React 19 (Vite Single Page Application).
- **Styling**: Tailwind CSS v4 (configured directly in `src/index.css` via `@theme`).
- **Icons**: Lucide React.
- **Language Rules**: TypeScript with strict typing. `verbatimModuleSyntax` is enabled in `tsconfig.json`, meaning all type imports must use `import type { ... }` syntax.

---

## 🎨 Design System & CSS Guidelines

- Use rich, vibrant gradients and glassmorphism. Dark-theme first.
- Keep hover actions hidden on desktop (`sm:opacity-0 sm:group-hover:opacity-100`) but always visible on mobile/touch screen environments (`opacity-100`) to guarantee phone friendliness.
- Maintain at least `p-2` or equivalent touch target buffers on mobile layouts.
- Do not add complex layout CSS files; declare utility modifications inside Tailwind layers or inline classes.

---

## 📦 Data Architecture Constraints

- All local configurations must serialize cleanly through the schema interfaces in `src/types.ts`.
- Changes must persist to `localStorage` immediately upon creation, modification, or deletion.
- Verify changes compile cleanly via `npm run build` after modifications.

---

## 🔮 Specific Development Skills

For detailed specifications regarding future architectural expansion phases, refer to the following skills in the `.agents/skills/` directory:

- **IR Device Upgrades**: Guidance on database migration schemas, hardware transmitter protocols (ESP32/Broadlink Blaster REST APIs), and IR code timing validations. Refer to [SKILL.md](file:///Users/bar/Documents/GitHub/irDeviceListPOC/.agents/skills/ir-device-upgrades/SKILL.md).
