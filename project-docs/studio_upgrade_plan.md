# ImageStudioLab "Pro Studio" Upgrade Plan

## Objective
Transform the MVP "Photoshoot" page into a comprehensive **"Pro Product Studio"** that offers granular control over the final output, ensuring high-value results that brands will pay for.

## 1. UI Upgrade: "The Casting & Set Director"
We will introduce a new **"Studio Configuration"** section in the sidebar with the following professional controls:

### A. Subject Mode (The "Model" Toggle)
*   **Product Only (Still Life)**: Focus purely on the item (current behavior).
*   **On Model (Lifestyle)**: The product is worn or held by a realistic AI model.
    *   *Why this sells:* Brands need to show scale and fit without hiring expensive models.

### B. Model Casting (If "On Model" is selected)
*   **Gender**: Female, Male, Non-binary.
*   **Ethnicity**: Diverse options to match target demographics.
*   **Framing**: "Full Body", "Portrait/Face", "Hands/Detail".

### C. Advanced Lighting & Camera
*   **Lighting**: "Soft Studio", "Hard Flash", "Golden Hour", "Neon".
*   **Camera Angle**: Override the defaults if needed (e.g., "Low Angle Hero").

## 2. Backend Engine Upgrade: "Dynamic Power 5"
The generation engine will adapt the "Power 5" shot list based on the Subject Mode:

| Mode | Angle 1 (Hero) | Angle 2 (Side) | Angle 3 (Context) | Angle 4 (Detail) |
| :--- | :--- | :--- | :--- | :--- |
| **Product Only** | Eye-Level Centered | 45° Depth Shot | Creative Flatlay | Macro Texture |
| **On Model** | Model Posing (Front) | Model Walking/Side | Lifestyle/In-Situ | Detail on Body |

## 3. Aesthetic Polish: "Editorial Quality"
*   **Prompt Engineering**: Inject keywords for "Cinematic", "Depth of Field", and "Editorial Color Grading" to banish the "flat" look.
*   **Output**: Ensure the grid layout clearly labels these new dynamic angles.

## Execution Steps
1.  **Frontend**: Add the `ModelSelector` component to `PhotoshootInterface`.
2.  **Backend**: Update `route.ts` to handle `mode` logic and generate dynamic prompts.
3.  **Refinement**: Test with `gemini-3-pro` to ensure the model looks realistic, not uncanny.
