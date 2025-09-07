# 🎨 Nano Craft - AI-Powered Visual Crafting Tool

<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

**Nano Craft** is an innovative visual crafting tool powered by Google's Gemini 2.5 Flash Image model. Transform and combine any images into entirely new visual concepts through AI-powered fusion, inspired by the creativity of "Infinite Craft" but for visual elements.

## ✨ Features

- 🖼️ **Smart Image Analysis**: AI automatically generates titles and descriptions for uploaded images
- 🔄 **Visual Fusion**: Combine any two images to create completely new, cohesive visual concepts  
- 🎯 **Intelligent Combination**: Advanced prompting ensures natural, believable results (no simple overlays)
- 💾 **Persistent Discovery**: All created elements are saved locally using IndexedDB
- 🎲 **Random Starting Elements**: Begin with random images or upload your own
- ⚙️ **Flexible Settings**: Change API keys without losing progress
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile

## 🚀 Live Demo

**[Try Nano Craft Live →](YOUR_DEPLOYED_URL_HERE)**

*No installation required - just bring your Gemini API key!*

## 🎬 Video Demo

**[Watch 2-minute Demo →](YOUR_VIDEO_URL_HERE)**

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Build Tool**: Vite
- **AI Model**: Google Gemini 2.5 Flash Image Preview
- **Storage**: IndexedDB for persistence, SessionStorage for state
- **Deployment**: Ready for AI Studio, Netlify, Vercel, or GitHub Pages

## 📦 Quick Start

### Prerequisites
- Node.js 16+
- A Gemini API key ([Get one here](https://ai.google.dev/))

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/nano-craft.git
   cd nano-craft
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:5173`

5. **Enter your Gemini API key** when prompted

### Building for Production

```bash
npm run build
npm run preview  # Test the production build
```

## 🎯 How It Works

1. **Start**: Enter your Gemini API key
2. **Initialize**: Choose starting images (upload your own or use random ones)
3. **Craft**: Drag elements into the workspace
4. **Combine**: Overlap two elements to trigger AI fusion
5. **Discover**: Watch as Gemini creates entirely new visual concepts
6. **Expand**: Use new creations to make even more combinations

## 🧠 AI Integration

Nano Craft leverages Gemini 2.5 Flash Image's advanced capabilities:

- **Multimodal Understanding**: Analyzes images to generate contextual metadata
- **Image-to-Image Generation**: Creates new visuals from multiple source images
- **Structured Output**: Uses JSON schemas for consistent data formatting
- **Advanced Prompting**: Ensures natural, cohesive fusion results

## 🔧 Configuration

### Environment Variables (Optional)
Create a `.env.local` file:
```
GEMINI_API_KEY=your_api_key_here
```

### Customization
- Modify `DEFAULT_IMAGE_URLS` in `InitialImageSetup.tsx` for different starting images
- Adjust combination prompts in `services/geminiService.ts`
- Customize UI themes in Tailwind classes

## 📁 Project Structure

```
nano-craft/
├── components/          # React components
│   ├── ApiKeySetup.tsx     # API key input
│   ├── CraftingInterface.tsx # Main crafting UI
│   ├── InitialImageSetup.tsx # Starting image selection
│   ├── SettingsModal.tsx    # Settings and configuration
│   └── ...
├── services/            # API and business logic
│   └── geminiService.ts    # Gemini API integration
├── utils/              # Utility functions
│   ├── db.ts              # IndexedDB operations
│   └── imageUtils.ts      # Image processing
├── hooks/              # Custom React hooks
└── types.ts            # TypeScript definitions
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🎊 Kaggle Competition

This project was created for the Kaggle Gemini API Developer Competition. It demonstrates innovative use of Gemini 2.5 Flash Image for creative applications.

---

Built with ❤️ using Google Gemini 2.5 Flash Image
