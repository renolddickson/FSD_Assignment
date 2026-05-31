# Insight.IO - Robotic Mission Control Dashboard

---

## Submission Metadata
* **Full Name**: Antony Renold Dickson K
* **Contact Number**: +91 9361956434
* **Email ID**: antonyrenolddickson@gmail.com

---

Welcome to **Insight.IO**, a self-hosted robotic mission control dashboard built for **ERIC Robotics**. This system delivers a unified, high-fidelity HUD layout that integrates live telemetry, camera feeds, and 3D point cloud scanner telemetry in a fully responsive, client-side web application.

---

## Key Features & Custom Implementations

### 1. High-Performance 3D Map View
* **Zero-Dependency Native WebGL**: Renders point cloud matrices using raw WebGL shaders compiled from scratch, bypassing heavy external libraries like Three.js. This maintains fast bundle loads and high FPS.
* **Robust Client-Side PCD Parser**: Supports **ASCII**, **Binary**, and **LZF Compressed Binary** Point Cloud Data (`.pcd`) files out-of-the-box (updated to support advanced headers, width/height scaling, and color channels).
* **Auto-Scaling & Normalization**: Automatically centers point clouds at the origin `(0, 0, 0)` and scales coordinate sets to align gracefully within the viewport grids.

### Extra Implementations (PCD View & Telemetry)
* **Dynamic Local PCD File Uploader**: Added an interactive uploader widget. Instead of only rendering hardcoded public files, evaluators can upload **any custom `.pcd` model** (e.g., Stanford bunny, industrial scans, or KITTI frames) from their machine to see it processed and rendered live.
* **3D View Orientation Controls**: Added a direct model-coordinate transform toolbar. Allows manipulating the active point cloud orientation via **Pitch 90°**, **Yaw 90°**, **Roll 90°**, vertical **Flip**, and **Reset Pose** buttons.
* **Bidirectional Zoom Slider Binding**: Routed the main dashboard's camera zoom slider directly to the WebGL rendering camera distance matrix. In addition, **scrolling the mouse wheel** inside the 3D grid updates the WebGL distance, calculates the inverse zoom value, and synchronizes the global slider and camera viewport indicators automatically.
* **Collapsible Stack Card Layout**: Repositioned panels in a stacked flex layout at `top-[160px]` to eliminate overlapping with `QuickActions` pills. Tapping the headers collapses cards using animated chevrons (`▲`/`▼`), letting users recover maximum screen real estate.

### 2. Compliant Camera View
* **Dynamic Webcam Streaming**: Streams live footage from the browser camera via `getUserMedia`.
* **Looping Fallback Stream**: Automatically loops high-quality autonomous driving footage from a CC Blender source if camera access is denied or if the device lacks a camera.
* **Collapsible Source Switcher**: Toggle manually between Live Webcam and Demo Video. Panel collapses to maximize viewport viewing size.

### 3. Responsive Design & Mobile Adaptability
* **Dynamic Sidebar Layout**: Fits comfortably alongside a fixed Sidenav (desktop) and wraps into a responsive bottom container on touch screens.
* **Glassmorphic Bottom Sheet Controls**: Mobile devices automatically hide bulky desktop panels and show a glassmorphic bottom sheet panel. It nests inline symmetrical lens zoom sliders, touch-adapted D-pads, and Quick Action locks.

---

## Tech Stack & Architecture

* **Core Framework**: React 19 + Vite (for high-speed Hot Module Replacement).
* **Language**: TypeScript (enforcing strong compile-time type safety).
* **Styling**: Tailwind CSS 4 + custom modern glassmorphic classes.
* **Rendering Engine**: Low-level HTML5 WebGL context for lightweight point drawing pipelines.
* **Offline Resiliency**: 100% compliant self-hosted architecture. The PCD parser, sample assets, and WebGL rendering engine require **zero internet dependencies** or external CDNs to run.

---

## Local Setup Instructions

Ensure you have [Node.js](https://nodejs.org/) (v18 or higher) installed on your system.

### 1. Clone or Download the Repository
```bash
git clone https://github.com/renolddickson/FSD_Assignment.git
cd FSD_Assignment
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser. The server will hot-reload automatically on any local changes.

### 4. Build for Production
Verify typescript compilation and compile static assets:
```bash
npm run build
```
Vite will output the production bundle into the `dist/` directory, completely pre-compiled.

---

## Architecture Decisions

* **Why raw WebGL over Three.js?** Three.js adds several megabytes of code. For a streamlined telemetry dashboard, a lightweight WebGL script renders thousands of points in real-time with virtually zero memory overhead.
* **Collapsible Stack Layout**: Repositioned stacked absolute flex-panels to sit at `top-[160px]`, well clear of `QuickActions` pills. Collapsing panels slides elements smoothly, preventing overlaps.
* **Math-based Zoom Mapping**: Mapped WebGL camera distance linearly to the slider scale, providing bidirectional binding between mouse scrolling and UI widgets.
