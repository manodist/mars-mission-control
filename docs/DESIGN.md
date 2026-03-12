# 디자인 시스템 가이드 (DESIGN.md)

## 🎨 Color Palette

| Name | Hex | Usage |
| :--- | :--- | :--- |
| Mars Orange | `#FF4D00` | Game Tab Primary, Start Buttons, Rocket Glow |
| Space Blue | `#00D1FF` | Archive Tab Primary, Status Highlights, Text Glow |
| Terminal BG | `#0A0A0B` | Application Main Background |
| Status Green | `#22C55E` | Operational Objectives Tab, Success Indicators |
| Comms Purple | `#A855F7` | Central HQ Tab, Sidebar Active state |

## Typography
- **Heading**: 'Space Grotesk', sans-serif (tracking-tighter)
- **Mono**: 'JetBrains Mono', monospace

## 🚀 Space Runner (Game) Theme
- **Theme Color**: Red-Orange (`#FF4D00`)
- **Key Elements**:
  - Start Mission Button: `glossy-glass-orange` with `animate-shine`
  - Rocket Icon: `text-orange-500` with `glow-text-orange`
  - Start Panel: `border-orange-500/30` with `shadow-[0_0_50px_rgba(255,77,0,0.15)]`

## ✨ Premium UI Effects
- **Glossy Glass**: `backdrop-blur-md` + semi-transparent gradients (`rgba(255, 77, 0, 0.4)`) + subtle white border.
- **Dynamic Shine**: `@keyframes shine` that moves a white gradient highlight across components on hover.

## 📊 Operational Objectives (Status) Theme
- **Theme Color**: Green (`#22C55E`)
- **Key Elements**:
  - Active Tab: `bg-green-500`
  - Status Icons: `text-green-500`
  - Info Box: `bg-green-500/5`

## 📡 Central HQ (Comms) Theme
- **Theme Color**: Purple (`#A855F7`)
- **Key Elements**:
  - Active Tab: `bg-purple-500`
  - Terminal Panel: `border-purple-500/30`

## 🏆 Mission Completion UI
- **Layout**: Clean, centered layout with high-resolution destination imagery.
- **Image Presentation**: `object-contain` on a `pure black (#000000)` background to prevent cropping and maintain cinematic feel.
- **Destination Branding**:
  - **Moon (Low)**: White/Silver glow (`border-white/40 shadow-white/10`)
  - **Mars (Mid)**: Red-Orange glow (`border-orange-500/40 shadow-orange-500/20`)
  - **Deep Space (High)**: Cyan glow (Default)
