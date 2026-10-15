# Quadratic Buddy AI

An interactive educational website for **AI for Differentiated Learning**. It teaches one topic—quadratic equations—at three levels: **Foundation**, **Standard**, and **Advanced**.

## Features
- Generate a new quadratic equation at each difficulty level.
- Check two submitted roots immediately using deterministic math logic.
- Request a level-adapted **AI hint** or **AI explanation** through Google Gemini.
- Responsive interface for mobile and desktop.

## Differentiation
| Level | Problem type | AI support |
| --- | --- | --- |
| Foundation | Monic quadratics with small positive integer roots | Direct hints and guided factoring |
| Standard | Non-monic quadratics with integer roots | Factoring and quadratic formula explanations |
| Advanced | Quadratics with irrational roots | Discriminant, radical forms and multi-step reasoning |

## Technology
HTML, CSS, JavaScript; Netlify Functions (Node.js); Google Gemini API.

## Setup
1. Create a free GitHub repository and upload all files **including the `netlify/functions` folder**.
2. Import that repository into [Netlify](https://app.netlify.com/). Set publish directory to `.` and functions directory to `netlify/functions` (already in `netlify.toml`).
3. Obtain your own Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
4. In Netlify, open **Site configuration → Environment variables** and add `GEMINI_API_KEY` with your key. Do not put the key in GitHub or frontend code.
5. Optionally set `GEMINI_MODEL` to a model supported by your account (default is `gemini-2.0-flash`; if unavailable, change to an available model).
6. Trigger a new deploy. Test the three levels and the AI hint/solution buttons.

For local development: `npm install`, create a private `.env` file based on `.env.example`, then run `npm run dev`.

**Note:** The UI and math checking work without an API key, but AI hints and explanations require a valid Gemini key and quota.

## Testing checklist
- Foundation: 2 roots, factoring guidance.
- Standard: 2 roots, non-unit leading coefficient.
- Advanced: decimal roots rounded to 2 digits accepted.
- Wrong answers produce constructive feedback.
- AI hints do not reveal answers; solutions explain all steps.
- Mobile layout works; API key is not committed.

## Academic integrity
This is a starter implementation. The student should review, test, personalize, and be able to explain the source code, prompts, and mathematical logic before submitting it as their own work.
