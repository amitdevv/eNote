# eNote - Smart Note-Taking App

## About
eNote is a modern note-taking application I built for anyone who needs to organize their thoughts, code snippets, and ideas in one place. It's designed to be fast, clean, and actually useful for real work.

## What it does
- Clean interface with light and dark themes
- Rich text editor with slash commands for quick formatting
- Built-in code editor with syntax highlighting
- Focus mode for distraction-free writing
- Multiple font families to choose from
- Real-time text statistics and word count
- Folder organization system
- Search through all your notes
- Auto-save so you never lose work
- Keyboard shortcuts for faster navigation
- Customizable settings and themes
- **AI Assistant powered by Google Gemini** for note generation, summarization, and planning

## Built with
- React and TypeScript for the frontend
- Tailwind CSS for styling
- TipTap as the text editor
- Supabase for backend services
- Vite for fast development

## Getting started

Clone the repo:
```bash
git clone https://github.com/amitdevv/eNote.git
```

Install dependencies:
```bash
npm install
```

Run the development server:
```bash
npm run dev
```

That's it. The app will be running at `http://localhost:5173`

## AI Assistant Configuration

### Option 1: Provide Default API Key (Recommended)
Add your Google Gemini API key to your environment variables:

```bash
# Create .env file
cp .env.example .env

# Add your API key
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

With this setup, all users will have AI features available immediately.

### Option 2: Let Users Configure Their Own
Users can click the AI button (✨) and configure their own API key through the settings dialog.

### Getting a Gemini API Key
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy and use it in your configuration

### Recommended Model
The app uses `gemini-1.5-flash` by default - it's fast, cost-effective, and perfect for note-taking tasks.

## Screenshots
Light mode:
![Light Mode](public/assets/images/lightmodelanding.png)

Dark mode:
![Dark Mode](public/assets/images/darkmodelanding.png)

## Why I built this
I wanted a note-taking app that didn't feel bloated or slow. Most apps either lack features or are too complex. eNote tries to strike the right balance - powerful enough for serious work but simple enough to actually enjoy using.

## What's next
I'm planning to add:
- Real-time collaboration
- Maybe some AI features if they actually make sense

## License
MIT License - use it however you want. 