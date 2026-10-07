"""LLM-powered root-cause agent. Falls back to templated prose without an API key."""
from __future__ import annotations

import os


def explain(campaign: str, date, factors: dict) -> str:
    top = [(k, v) for k, v in factors.items() if k != "roas_delta"][:3]
    lines = [f"{k}: {v:+.0%}" for k, v in top]
    facts = "; ".join(lines)
    prompt = (
        f"Campaign {campaign} on {date} shifted with roas_delta {factors.get('roas_delta', 0):+.0%}. "
        f"Top contributing factors: {facts}. Write a 2-sentence executive diagnosis."
    )
    api_key = os.environ.get("ANTHROPIC_API_KEY") or os.environ.get("OPENAI_API_KEY")
    if not api_key:
        return _template(campaign, date, factors)
    try:
        if os.environ.get("ANTHROPIC_API_KEY"):
            import anthropic

            client = anthropic.Anthropic()
            msg = client.messages.create(
                model="claude-sonnet-4-5",
                max_tokens=200,
                messages=[{"role": "user", "content": prompt}],
            )
            return msg.content[0].text
        import openai

        client = openai.OpenAI()
        resp = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
        )
        return resp.choices[0].message.content
    except Exception:
        return _template(campaign, date, factors)


def _template(campaign: str, date, factors: dict) -> str:
    bits = []
    if factors.get("inventory_stockout"):
        bits.append("SKU stocked out (conversions collapsed)")
    if abs(factors.get("cpm", 0)) > 0.2:
        bits.append(f"CPM moved {factors['cpm']:+.0%}")
    if abs(factors.get("cvr", 0)) > 0.2:
        bits.append(f"conversion rate moved {factors['cvr']:+.0%}")
    cause = "; ".join(bits) or "no single dominant driver"
    return (
        f"Campaign {campaign} on {date}: ROAS moved {factors.get('roas_delta', 0):+.0%}. "
        f"Primary drivers: {cause}."
    )
