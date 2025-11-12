---
name: nuxt-ui-docs
description: Fetch up-to-date Nuxt UI documentation using llms.txt format. Use when answering questions about Nuxt UI components, theming, composables, installation, or best practices.
allowed-tools: ["WebFetch"]
metadata:
  category: "documentation"
  library: "nuxt-ui"
---

# Nuxt UI Documentation

## Overview

This skill fetches current Nuxt UI documentation directly from ui.nuxt.com using their LLMs.txt format. It provides accurate, up-to-date information about Nuxt UI's 125+ components, theming system, composables, and integrations.

## When to Use

Invoke this skill when the user asks about:

- **Nuxt UI components** - "How do I use the Button component?", "What props does Card accept?"
- **Theming and customization** - "How to customize colors?", "Can I use custom CSS variables?"
- **Installation and setup** - "How to install Nuxt UI?", "How to migrate from v2?"
- **Composables** - "How does useToast work?", "What's the keyboard shortcut API?"
- **Integrations** - "How to use with i18n?", "Does it support dark mode?"
- **Best practices** - "When should I use Nuxt UI?", "What's the recommended approach for...?"

## Instructions

### Step 1: Fetch the Index

First, fetch the llms.txt index to understand available documentation:

```
WebFetch https://ui.nuxt.com/llms.txt
prompt: "List all available documentation sections and component pages"
```

This returns a structured index containing:
- Installation guides
- Getting started topics (migration, theming, integrations)
- All 125+ components alphabetically
- Composables and utilities
- Best practices and recommendations

### Step 2: Identify Relevant Pages

Analyze the user's question and map it to specific documentation sections:

**For component questions:**
- User asks: "How does the Button component work?"
- Relevant page: `https://ui.nuxt.com/components/button`

**For theming questions:**
- User asks: "How to customize colors?"
- Relevant pages: `https://ui.nuxt.com/getting-started/theme` and possibly `https://ui.nuxt.com/getting-started/theming`

**For installation questions:**
- User asks: "How to install in a Nuxt project?"
- Relevant page: `https://ui.nuxt.com/getting-started/installation/nuxt`

**For composables:**
- User asks: "How to show toast notifications?"
- Relevant page: `https://ui.nuxt.com/composables/use-toast`

### Step 3: Fetch Specific Documentation

Once you've identified 1-3 relevant pages, fetch them with targeted prompts:

```
WebFetch https://ui.nuxt.com/components/button
prompt: "Explain all props, slots, events, and usage examples for the Button component"
```

**Important:**
- Fetch only the pages directly relevant to the question (typically 1-3 pages max)
- Use specific prompts that extract exactly what the user needs
- If a question spans multiple areas, prioritize the most relevant pages

### Step 4: Provide Accurate Answer

Based on the fetched documentation:

1. **Answer directly** - Start with the specific answer to the user's question
2. **Show code examples** - Include realistic usage examples from the docs
3. **Reference component APIs** - List relevant props, slots, events, composables
4. **Link to docs** - Provide URLs for further reading
5. **Note version-specific details** - Mention if features are v4-specific or require migration

## Example Workflow

**User:** "How do I create a toast notification in Nuxt UI?"

**Claude:**

1. Fetches `https://ui.nuxt.com/llms.txt` to find toast-related documentation
2. Identifies relevant page: `/composables/use-toast`
3. Fetches `https://ui.nuxt.com/composables/use-toast` with prompt: "Explain how to use useToast composable, including all methods and options"
4. Responds with:

---

To create toast notifications in Nuxt UI, use the `useToast` composable:

```vue
<script setup>
const toast = useToast()

function showSuccess() {
  toast.add({
    title: 'Success!',
    description: 'Your changes have been saved.',
    color: 'green'
  })
}
</script>
```

**Available methods:**
- `toast.add(notification)` - Show a notification
- `toast.remove(id)` - Remove a specific notification
- `toast.clear()` - Clear all notifications

**Notification options:**
- `title` - Notification title
- `description` - Optional description
- `color` - UI color (default, primary, red, green, etc.)
- `icon` - Optional icon name
- `timeout` - Auto-dismiss duration (ms)
- `actions` - Array of action buttons

Learn more: https://ui.nuxt.com/composables/use-toast

---

## Progressive Disclosure Strategy

Nuxt UI provides two documentation levels:

- **`/llms.txt`** (~5K tokens) - Concise overview with component summaries and links
- **`/llms-full.txt`** (1M+ tokens) - Comprehensive details with all examples

**Recommended approach:**

1. **Always start with `/llms.txt`** - Use it to find relevant pages
2. **Fetch specific pages** - Get detailed info from individual component/guide URLs
3. **Only use `/llms-full.txt`** if the user explicitly asks for comprehensive documentation or if `/llms.txt` doesn't contain enough information to identify the right pages

This approach keeps context usage efficient while providing accurate answers.

## Key Features to Highlight

When relevant to the user's question, mention:

- **125+ components** - Comprehensive UI library for Vue/Nuxt
- **Tailwind CSS based** - Full theming and customization via CSS variables
- **Accessible** - Built with accessibility in mind (ARIA attributes, keyboard navigation)
- **TypeScript** - Full type safety with detailed prop types
- **Dark mode** - Built-in color mode support
- **i18n ready** - Internationalization support
- **SSR compatible** - Works with Nuxt server-side rendering
- **Tree-shakeable** - Only bundle components you use

## Constraints

- Always fetch from `ui.nuxt.com` URLs (official documentation)
- Prefer specific component/guide pages over full documentation dump
- Don't guess API details - always verify with WebFetch
- If documentation is unclear or missing, say so and suggest checking the official docs
- Use WebFetch tool exclusively for fetching documentation

## Common Pitfalls

**Don't:**
- Assume API details from older versions - always fetch current docs
- Fetch `/llms-full.txt` by default - it's 1M+ tokens and usually unnecessary
- Provide generic Nuxt/Vue answers when Nuxt UI has specific patterns
- Recommend alternatives without checking if Nuxt UI has a solution

**Do:**
- Start with `/llms.txt` to map questions to pages
- Fetch 1-3 specific pages with targeted prompts
- Show realistic code examples from the documentation
- Mention version-specific features when relevant

## Examples

### Example 1: Component Props

**User:** "What props does the Tooltip component accept?"

**Claude:**
1. Fetches `/llms.txt` → finds Tooltip component link
2. Fetches `https://ui.nuxt.com/components/tooltip` with prompt: "List all props, slots, and usage examples for Tooltip"
3. Provides comprehensive prop list with types and descriptions

### Example 2: Theming Question

**User:** "How do I customize the primary color?"

**Claude:**
1. Fetches `/llms.txt` → identifies theming documentation
2. Fetches `https://ui.nuxt.com/getting-started/theme` with prompt: "Explain how to customize colors using CSS variables"
3. Shows configuration example with color customization

### Example 3: Migration Help

**User:** "I'm migrating from v2 to v3, what changed?"

**Claude:**
1. Fetches `/llms.txt` → finds migration guide
2. Fetches `https://ui.nuxt.com/getting-started/migration/v2-v3` with prompt: "List all breaking changes and migration steps"
3. Provides step-by-step migration guide with code examples

## Reference

- Official documentation: https://ui.nuxt.com
- LLMs.txt index: https://ui.nuxt.com/llms.txt
- Full documentation: https://ui.nuxt.com/llms-full.txt
- GitHub repository: https://github.com/nuxt/ui
