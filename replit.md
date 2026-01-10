# SEFAES - Sentiment and Emotion Free Assessment and Evaluation System

## Overview

SEFAES is an AI-powered essay evaluation system designed to grade handwritten student responses objectively. The application captures handwritten documents via camera or file upload, performs OCR to extract text, and grades responses against predefined marking schemes using semantic analysis.

The system aims to eliminate emotional bias in grading by using AI-driven evaluation that compares student responses to reference answers based on keywords, structure, and content quality.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 19 with TypeScript
- **Styling**: Tailwind CSS (loaded via CDN)
- **Build Tool**: Vite with React plugin
- **Routing**: State-based navigation using React useState (no router library)
- **Charts**: Recharts for data visualization (score pie charts)
- **Icons**: Lucide React for UI icons
- **Text Comparison**: diff library for showing changes between raw and augmented text

### Application State Management
- Simple React useState at the App component level
- No external state management library (Redux, Zustand, etc.)
- State includes: current page, marking schemes, and assessment results

### Page Structure
1. **Dashboard** - Landing page with feature overview
2. **Assessment** - Camera/file upload for document capture, OCR processing, and grading
3. **Results** - Score display with matched/missed keywords and feedback
4. **Admin** - Create and manage marking schemes with custom grading rules

### AI Integration
- **Provider**: Google Gemini API via @google/genai SDK
- **OCR**: Gemini 1.5 Flash model for handwriting recognition
- **Grading**: AI-powered semantic comparison against reference answers
- **Text Augmentation**: Optional spelling/grammar correction of OCR output

### Data Models
- **MarkingScheme**: Contains question, reference answer, keywords, max score, and custom rules
- **AssessmentResult**: Stores OCR text, scores, matched keywords, and AI feedback
- **CustomRules**: Grading modifiers like strict grammar, repetition penalties, structure requirements

### Backend (Planned/Partial)
- Python FastAPI backend defined in requirements.txt but not fully implemented
- Intended for PaddleOCR integration as alternative to Gemini OCR
- Dependencies include: PaddleOCR, sentence-transformers, scikit-learn

## External Dependencies

### AI/ML Services
- **Google Gemini API**: Primary AI service for OCR and grading (requires GEMINI_API_KEY environment variable)

### Frontend Libraries
- @google/genai: Gemini SDK for AI operations
- react/react-dom: UI framework
- recharts: Chart visualization
- lucide-react: Icon library
- diff: Text comparison utility

### Environment Configuration
- API key stored in `.env.local` as `GEMINI_API_KEY`
- Vite exposes key via `process.env.API_KEY` and `process.env.GEMINI_API_KEY`

### Development Tools
- Vite dev server runs on port 5000
- TypeScript with bundler module resolution
- Path alias configured: `@/*` maps to project root