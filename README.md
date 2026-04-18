# eNote - Smart Note-Taking App

## About
eNote is a modern note-taking application I built for anyone who needs to organize their thoughts, code snippets, and ideas in one place. It's designed to be fast, clean, and actually useful for real work.

## What it does
- Clean interface with light and dark themes
- Markdown note editor with auto-generated titles
- Multiple font families and sizes
- Search across all your notes
- Tag-based filtering (project, coding, college, personal, ideas, etc.)
- Image-to-text (OCR) for pulling text out of screenshots
- Auto-save so you never lose work
- Customizable settings

## Built with
- React and TypeScript
- Tailwind CSS
- Supabase (Postgres + Google OAuth)
- Zustand for state
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

## Environment variables

Create a `.env` file at the project root with your Supabase credentials:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Screenshots
![eNote](public/assets/images/lightmodelanding.png)

## Why I built this
I wanted a note-taking app that didn't feel bloated or slow. Most apps either lack features or are too complex. eNote tries to strike the right balance - powerful enough for serious work but simple enough to actually enjoy using.

## What's next
I'm planning to add:
- Real-time collaboration

## License
MIT License - use it however you want. 