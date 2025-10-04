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

## 🎯 Working Example

This repository includes a working example with the **Helios template**:

### Quick Test Drive

1. **Start the previewer:**
```bash
   cd previewer
   npm install
   npm run dev

   Visit http://localhost:5173 to browse templates

Generate a kit:

bash   refactor generate --slug px-helios-html --variant cyan --out my-helios-app

Run the generated app:

bash   # Terminal 1 - API Server
   cd kits/my-helios-app/server
   npm install
   npm run dev  # Runs on :5050

   # Terminal 2 - Client
   cd kits/my-helios-app/client
   npm install
   npm run dev  # Runs on :5174
Available Templates

px-helios-html: 3 variants (cyan, green, orange)


Then commit this update:
```bash
git add README.md
git commit -m "docs: Update README with working Helios example"
git push

### Prerequisites
- Node.js >= 22
- npm (latest)
- Git

### Installation

1. **Clone the repository**
```bash
   git clone https://github.com/YOUR_USERNAME/web_refactor_light.git
   cd web_refactor_light