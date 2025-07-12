import os
from dotenv import load_dotenv
import openai

# Load environment variables from .env file
load_dotenv()

openai.api_key = os.getenv("OPENAI_API_KEY")

def summarize_symbol(symbol):
    content = f"""
You are a code documentation AI. Summarize the following {symbol['type']} named '{symbol['name']}'.

Code:
{symbol['code']}
"""

    response = openai.ChatCompletion.create(
        model="gpt-4-turbo",
        messages=[{"role": "user", "content": content}],
        temperature=0.3,
        max_tokens=300,
    )

    return response['choices'][0]['message']['content'].strip() 