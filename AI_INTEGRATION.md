# AI Integration in Synthkit

## Overview

Synthkit now includes AI-powered business analysis directly integrated into the main demo page. This feature allows users to describe their business idea in natural language and receive intelligent scenario recommendations.

## Features

### 🤖 AI Business Analysis
- **Location**: Main demo page (`http://localhost:3001`)
- **Section**: "AI Business Analysis" - appears after the data sections
- **Input**: Text area for business description
- **Examples**: Pre-filled examples for quick testing
  - Fitness App
  - Craft Marketplace  
  - Project Management Tool

### 📊 Analysis Results
- **Business Context**: Type, stage, features, audience, monetization
- **Entities**: Data models with relationships and volume estimates
- **User Roles**: Identified user types for the business
- **Key Features**: Core functionality recommendations
- **Confidence Score**: AI's confidence in the analysis
- **Reasoning**: Explanation of the analysis logic

## Technical Implementation

### Frontend Components
- `examples/next-app/src/app/page.tsx`: Main demo page with integrated AI section
- `examples/next-app/src/app/components/AIComponents.tsx`: Reusable AI result components
- `examples/next-app/src/app/api/ai/*`: API routes for AI functionality

### AI Package
- `packages/synthkit-ai`: Core AI analysis functionality
- Uses Anthropic Claude API for natural language processing
- Supports analysis, matching, and generation operations

### Environment Setup
```bash
# Add to examples/next-app/.env.local
ANTHROPIC_API_KEY=your_api_key_here
```

## Usage

1. **Start the Demo**
   ```bash
   cd examples/next-app
   pnpm dev
   ```

2. **Navigate to AI Section**
   - Scroll down to "🤖 AI Business Analysis"
   - Enter a business description or use an example
   - Click "Analyze Business"

3. **View Results**
   - Results appear inline below the form
   - URL updates to include `?ai=true` parameter
   - Results persist on page refresh
   - Click "✕ Hide Results" to dismiss

## Integration Benefits

- **Unified Experience**: No separate pages or routes needed
- **Seamless Flow**: AI analysis complements manual configuration
- **Persistent State**: Results saved in URL parameters
- **Responsive Design**: Works on all screen sizes

## CLI Support

The AI functionality is also available via CLI:
```bash
synthkit ai analyze "Your business description"
synthkit ai match "Find similar scenarios"
synthkit ai generate "Create new scenario"
```

## Future Enhancements

- Real-time scenario switching based on AI recommendations
- Export AI-generated scenarios to pack files
- Integration with existing scenario activation system
- Custom persona generation based on business type
