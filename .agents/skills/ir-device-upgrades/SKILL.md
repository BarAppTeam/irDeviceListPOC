---
name: ir-device-upgrades
description: Guidance on how to perform future upgrades to the Infrared (IR) Device Collector application, such as migrating to a database, adding protocol validation, or writing mock APIs.
---

# IR Device Collector - Future Upgrade Guidelines

This skill provides guidelines and patterns for implementing future upgrades to the IR Device Collector application. When developers or AI assistants plan upgrades, they must reference this file to maintain architectural alignment.

---

## 💾 1. Backend Database Migration

Currently, devices are managed locally via [storage.ts](file:///Users/bar/Documents/GitHub/irDeviceListPOC/src/utils/storage.ts). When migrating to a backend server:

### Database Schema Recommendation
* **SQL (PostgreSQL)**:
  * `devices` table: `id` (UUID, primary key), `device_name` (VARCHAR), `created_at` (TIMESTAMP).
  * `commands` table: `id` (UUID, primary key), `device_id` (UUID, foreign key referencing `devices.id` ON DELETE CASCADE), `key` (VARCHAR), `value` (VARCHAR).
* **NoSQL (MongoDB)**:
  * Store devices directly as documents. Ensure validation rules match the TypeScript schema in [types.ts](file:///Users/bar/Documents/GitHub/irDeviceListPOC/src/types.ts).

### API Integration Plan
1. Create a service client module (`src/utils/api.ts`) to wrap database transactions.
2. Replace [storage.ts](file:///Users/bar/Documents/GitHub/irDeviceListPOC/src/utils/storage.ts) calls in [App.tsx](file:///Users/bar/Documents/GitHub/irDeviceListPOC/src/App.tsx) with endpoints:
   - `GET /api/devices`: List all devices.
   - `POST /api/devices`: Create a new device (and its nested commands).
   - `PUT /api/devices/:id`: Update device metadata and commands.
   - `DELETE /api/devices/:id`: Remove device.

---

## 📡 2. IR Signal Transmitting & Hardware Blaster Integration

To convert BeamBase from a passive collector into an active remote controller:

1. **Add Transmit Trigger**:
   - Add a "Transmit" or "Blast" button (with a Wi-Fi or transmitter icon) inside [DeviceCard.tsx](file:///Users/bar/Documents/GitHub/irDeviceListPOC/src/components/DeviceCard.tsx) next to each command's "Copy" button.
2. **Local API integration (ESP32 / Broadlink)**:
   - Create a local server or ESP32 endpoint configuration panel.
   - When clicked, trigger a background HTTP POST to the local transmitter:
     ```typescript
     await fetch('http://<transmitter-ip>/api/transmit', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ code: cmd.value })
     });
     ```
   - Throw a visual success or error toast indicating if the blaster responded.

---

## 🔍 3. IR Code Protocol Validation

To ensure users insert correct IR codes into the input fields:

1. **Implement validation helper** in `src/utils/validation.ts`:
   - Validate hex lengths and prefixes (e.g. NEC protocol codes are commonly 32-bit hex values represented by 8 hex characters, optionally starting with `0x`).
   - Validate raw buffer strings (e.g. comma-separated timing values like `3400, 1700, 450, 450...`).
2. **Validation Hook**:
   - Run validation inside [DeviceModal.tsx](file:///Users/bar/Documents/GitHub/irDeviceListPOC/src/components/DeviceModal.tsx) on input change.
   - Display a warning badge if the code formatting looks suspect (e.g. non-hex characters in hex mode), without necessarily blocking submission to allow flexibility.
