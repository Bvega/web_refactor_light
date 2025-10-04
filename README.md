# Web Refactor Light

A lightweight system for ingesting HTML templates and generating MERN (MongoDB, Express, React, Node) starter kits.

## 🚀 Features

- **Template Previewer**: Browse and preview HTML templates with multiple variants
- **CLI Tool**: Ingest ZIP files and generate full-stack MERN projects
- **Auto-Detection**: Automatically detects template variants and pages
- **jQuery Plugin Stubs**: Auto-generates missing jQuery plugin stubs

## 📁 Project Structure
web_refactor_light/
├── previewer/          # Vite+React preview app (port 5173)
├── refactor-cli/       # CLI tool for ingest & generate
├── kits/              # Generated MERN kits
└── .tmp/              # Temporary extraction folder
## 🛠️ Setup

### Prerequisites
- Node.js >= 22
- npm (latest)
- Git

### Installation

1. **Clone the repository**
```bash
   git clone https://github.com/YOUR_USERNAME/web_refactor_light.git
   cd web_refactor_light