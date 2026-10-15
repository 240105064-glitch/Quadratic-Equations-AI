exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  if (!process.env.GROQ_API_KEY) {
    return {
      statusCode: 503,
      body: JSON.stringify({
        error: 'Set GROQ_API_KEY in Netlify environment variables'
      })
    };
  }

  try {
    if ((event.body || '').length > 2000) {
      throw Error('Request too large');
    }

    const { kind, level, a, b, c, roots } =
      JSON.parse(event.body || '{}');

    if (
      !['hint', 'solution'].includes(kind) ||
      !['foundation', 'standard', 'advanced'].includes(level) ||
      ![a, b, c].every(
        x => Number.isInteger(x) && Math.abs(x) <= 500
      ) ||
      a === 0 ||
      !Array.isArray(roots) ||
      roots.length !== 2 ||
      roots.some(x => !Number.isFinite(x))
    ) {
      throw Error('Invalid input');
    }

    const discriminant = b * b - 4 * a * c;

    if (discriminant < 0) {
      throw Error('Invalid input: equation has no real roots');
    }

    const correctRoots = [
      (-b + Math.sqrt(discriminant)) / (2 * a),
      (-b - Math.sqrt(discriminant)) / (2 * a)
    ];

    if (
      roots.some(
        r => !correctRoots.some(t => Math.abs(t - r) < 0.00001)
      )
    ) {
      throw Error('Inconsistent equation');
    }

    const instructions = {
      foundation:
        'Explain slowly using simple vocabulary, clear direct hints, and small steps. Prefer factoring.',
      standard:
        'Use curriculum-level reasoning and factoring or the quadratic formula. Explain why each step works.',
      advanced:
        'Use multi-step reasoning, the discriminant, exact radical forms, and mathematical verification.'
    };

    const prompt = `You are a patient educational math tutor.
Learner level: ${level}.
${instructions[level]}

Equation: ${a}x^2 + (${b})x + (${c}) = 0.
Verified roots: ${correctRoots.join(', ')}.

${
  kind === 'hint'
    ? 'Give ONE useful hint without revealing the final roots. Use fewer than 85 words.'
    : 'Give a mathematically correct step-by-step explanation. Check both roots and show exact forms where possible. Use fewer than 220 words.'
}

Do not change the equation. Use plain text, no markdown tables.`;

    const response = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'openai/gpt-oss-20b',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: kind === 'hint' ? 150 : 500
        })
      }
    );

    if (!response.ok) {
      const details = await response.text();

      console.error('Groq API error:', response.status, details);

      throw Error(`Groq API request failed (${response.status})`);
    }

    const data = await response.json();
const message = data.choices?.[0]?.message;
const text = message?.content || message?.reasoning;

if (!text) {
  console.error('Groq response:', JSON.stringify(data));
  throw Error('Groq returned no text. Check function logs.');
}

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      },
      body: JSON.stringify({ text })
    };

  } catch (e) {
    console.error('Tutor function error:', e.message);

    const bad =
      /Invalid|Inconsistent|too large/.test(e.message);

    return {
      statusCode: bad ? 400 : 502,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      },
      body: JSON.stringify({
        error: bad
          ? e.message
          : 'AI request failed. Check the Netlify function logs.'
      })
    };
  }
};
