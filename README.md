# Books N Bites — Website

Standalone marketing website for Books N Bites cafe (Melbourne), with an embedded AI chat
assistant.

## Structure
```
Books-N-Bites-Website/
├── index.html        # Landing page (menu, loyalty, hours, contact)
├── styles.css        # Site styling
└── widget/
    ├── chat-widget.js   # Embeddable chat assistant
    └── chat-widget.css
```

## Running locally
Just open `index.html` in a browser, or serve the folder:
```
npx serve .
```

## Chat Assistant
The chat bubble in the bottom-right corner is powered by a separate chatbot backend
(an n8n workflow + LLM). To connect it:

1. Get the chatbot webhook URL from your chatbot provider.
2. In `index.html`, replace the placeholder in the `<script src="widget/chat-widget.js">`
   tag's `data-webhook-url` attribute:
   ```html
   data-webhook-url="https://<your-n8n-host>/webhook/business-agent/chat/books-n-bites"
   ```
3. Reload the page — the assistant will now answer questions about the menu, hours,
   pricing, loyalty program, and capture booking/catering/complaint enquiries.

You can also customize:
- `data-business-name` — name shown in the chat header
- `data-greeting` — first message shown when the chat opens
- `data-color` — accent color (matches your brand)

## Updating Content
Edit `index.html` directly for menu items, hours, and contact details. The chat assistant's
knowledge is managed separately by your chatbot provider — let them know whenever pricing,
hours, or policies change so the assistant stays accurate.
