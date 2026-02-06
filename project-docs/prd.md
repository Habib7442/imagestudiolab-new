# Product Requirements Document (PRD)

## Product Overview
**Product Name**: DiagramAI (on imagestudiolab.com/diagramai)  
**Tagline**: "Paste notes, get exam-ready Anki decks. Save 150 hours per semester."  
**Target Users**: Indian MBBS students (1st-4th year), NEET-PG aspirants, medical college groups  
**Core Value Prop**: Automates the entire "notes → diagrams → Anki flashcards → study" workflow, eliminating 95% of manual work while ensuring MBBS/NEET exam accuracy.  
**Pricing**: Freemium → ₹299/mo (Paid), ₹599/mo (Premium)  
**Success Metric**: 20 paying beta users @ ₹149/mo within 30 days; 40% MoM growth via deck sharing.

## Problem Statement
Medical students spend 5-10 hours/week manually creating Anki flashcards from lecture notes:  
- Read verbose textbooks → Google diagrams (wrong styles/labels) → Screenshot → Manual Anki import with image occlusion → Tag by topic → Repeat 200x/semester  
- **Total**: 150+ hours/semester wasted on formatting, not studying  
- **Free AI fails**: ChatGPT/Gemini gives inconsistent diagrams; no Anki export, no curriculum tagging, no bulk processing  
**Pain Quote**: "Drawing brachial plexus 20 times to memorize it is hell. ChatGPT drawings are artistic garbage for exams." [r/indianmedschool]

## Solution & Key Features
Transform raw notes/PDFs into production-ready Anki decks with medical-grade diagrams.

### MVP Features (Phase 1 - 2 weeks)
| Feature | Description | User Flow | Tech |
|---------|-------------|-----------|------|
| **Notes Input** | Paste text, upload PDF/images, or type topic | Drag-drop → "Process Notes" | Gemini 3 extracts key anatomy/pathology terms |
| **AI Diagrams** | Generate labeled, exam-style diagrams | Auto-prompts Nano Banana: "Medical diagram of [structure], labeled, Netter's style" | Nano Banana Pro (batch mode) |
| **Anki Export** | One-click .apkg file with image occlusion cards | "Export to Anki" → Instant download | HTML/CSS occlusion + ZIP packaging |
| **Basic Library** | Save/reuse past diagrams | Search by topic/body system | Supabase storage |

### Paid Tier Features (Phase 2 - Week 3-4)
| Feature | Description | Value Add |
|---------|-------------|-----------|
| **Bulk Generation** | Process entire lecture notes → 50+ diagrams | 2min vs 50hrs manual |
| **Image Occlusion** | Auto-create cloze cards (hide labels) | Core Anki medical workflow |
| **MBBS Tagging** | Auto-tag: "1st Year Anatomy", "NEET-PG High-Yield" | Exam organization |
| **Quiz Generator** | 5 MCQs per diagram | Active recall built-in |

### Premium Tier (Month 2+)
- Study analytics (mastery heatmaps)
- Spaced repetition scheduler
- Collaborative decks (share with study group)
- Mobile PWA + offline mode
- Custom styles (professor preferences)

## User Journey
```
1. Student pastes lecture notes: "Describe coronary arteries and their branches"
2. AI extracts: ["LAD", "RCA", "Circumflex", "anastomoses"]
3. Generates 5 diagrams: [normal, CAD variants, angiogram views]
4. Creates 20 Anki cards: [occlusion, labeling, MCQs]
5. Tags: "Cardiology, 2nd Year, NEET-PG"
6. One-click .apkg → Import to Anki → Study
Time: 2 minutes vs 2 hours manual
```

## Technical Architecture
```
Frontend: Next.js 15 + Tailwind + Uploadthing
Backend: Supabase (Auth, Storage, Edge Functions)
AI Pipeline:
├── Gemini 3: Text extraction, quiz generation, tagging
├── Nano Banana Pro: Medical diagrams (batch API)
├── Anki Formatter: HTML/CSS occlusion → .apkg
Storage: Supabase Vector (searchable diagram library)
Workflow: Supabase Edge Functions (upload → trigger pipeline)
```

**API Flow** (Edge Function):
```javascript
// Pseudo-code
export async function createStudyDeck({ notes, userId }) {
  const topics = await gemini.extractTopics(notes);
  const diagrams = await nanoBanana.batchGenerate(topics.map(t => medicalPrompt(t)));
  const cards = await gemini.createAnkiCards(diagrams);
  const apkg = anki.pack(cards, diagrams);
  await supabase.storage.from('decks').upload(`${userId}/${deckId}.apkg`, apkg);
  return deckUrl;
}
```

## Moats & Defensibility
1. **Anki Lock-in**: Once students have 200+ diagrams in your system, switching costs are huge
2. **MBBS Curriculum Knowledge**: Tags for "RUHS exams", "spotters", "viva priority"
3. **Consistent Medical Style**: Pre-tested prompts ensure Netter's/Gray's accuracy
4. **Viral Loop**: "Share deck" → Classmates sign up → Group subscriptions

## Monetization & Pricing
```
Free:     10 diagrams/mo, manual Anki export
Paid:     ₹299/mo - Unlimited + automation (80% users)
Premium:  ₹599/mo - Analytics + mobile (20% upsell)
Lifetime: ₹4,999 - Early adopters
Team:     ₹999/mo - 5 students (study groups)
```
**LTV Math**: ₹299 × 12mo avg × 30% retention = ₹3,588 LTV  
**CAC**: ₹0 (viral deck sharing) → 100% margins

## Success Metrics
| Metric | Week 4 Target | Month 3 Target |
|--------|---------------|----------------|
| Signups | 100 | 1,000 |
| Paying Users | 20 @ ₹149 beta | 100 @ ₹299 |
| Diagrams Generated | 2,000 | 20,000 |
| Churn | - | <10%/mo |
| NPS | 8+ | 9+ |

## Validation Plan
**Week 0: Pre-launch**
1. Post on r/indianmedschool: "MBBS students: How many hours/week making Anki cards?"
2. DM 20 students: "Would you pay ₹149/mo to automate this?"
3. Build landing page → 50 email signups

**Beta Success Criteria**: 20 paying users generating 100 decks = Product-Market Fit

## Launch Roadmap
```
Week 1: MVP (text → diagram → basic Anki)
Week 2: PDF upload + bulk processing
Week 3: Beta launch (₹149/mo, 50 users cap)
Week 4: Iterate based on feedback
Month 2: Premium features + mobile PWA
Month 3: NEET-PG season marketing push
```

## Risks & Mitigations
| Risk | Mitigation |
|------|------------|
| "ChatGPT is free" | Anki integration + curriculum tagging = 10x workflow |
| Nano Banana quality | Pre-built prompt library + human review queue |
| Low willingness-to-pay | Start ₹149 beta → Validate price |
| Tech complexity (.apkg) | Use `anki` npm package + test with real MBBS decks |

## Go-to-Market
1. **Organic**: r/indianmedschool, MBBS Telegram groups, Instagram Reels ("Anki decks in 2min")
2. **Paid**: ₹5k Instagram ads targeting "MBBS notes" (₹10 CPL)
3. **Partnerships**: Marrow/Prepladder affiliates, college WhatsApp groups
4. **Viral**: "Share deck → Get 5 free credits"

**Next Steps**:
1. Build landing page (imagestudiolab.com/diagramai) today
2. Run validation survey (aim: 5/10 students say "I'd pay")
3. Code MVP text→diagram→Anki pipeline (3 days)
4. Launch beta to first 50 signups

This PRD gives you Product-Market Fit in 30 days or clear failure signals to pivot. Build the Anki integration first—that's your unbeatable moat. [anvil](https://anvil.works/case-studies/ankibuddy)