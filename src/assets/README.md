# Assets Folder

This folder contains static assets for the Notes app.

## Folder Structure

### `/src/assets/`
- **`images/`** - Images that need to be imported in components (processed by Vite)
- **`icons/`** - Custom SVG icons and other icon assets

### `/public/assets/`
- **`images/`** - Images that need direct URL access (not processed by Vite)

## Usage Examples

### Import from src/assets (Recommended for most images)
```typescript
import heroImage from '@/assets/images/hero-image.png';

// Use in component
<img src={heroImage} alt="Hero" />
```

### Access from public/assets (For direct URL access)
```typescript
// Use directly with path
<img src="/assets/images/logo.png" alt="Logo" />
```

## Image Guidelines

- **Landing page hero images**: Place in `src/assets/images/`
- **Logos and branding**: Place in `public/assets/images/` for easy access
- **Icons**: Place custom SVGs in `src/assets/icons/`
- **Optimize images** before adding (use tools like TinyPNG)
- **Use WebP format** when possible for better performance

## Naming Convention

- Use kebab-case: `hero-image.png`, `feature-screenshot.jpg`
- Be descriptive: `notes-app-dashboard.png` instead of `image1.png`
- Include size for multiple versions: `logo-small.png`, `logo-large.png` 