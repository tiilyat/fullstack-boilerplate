---
name: nuxt-ui-docs
description: This skill should be used when the user asks about Nuxt UI components ("How do I use Button?", "What props does Card accept?"), theming ("How to customize colors?"), composables ("How does useToast work?"), installation, or best practices. Fetches up-to-date documentation from ui.nuxt.com using llms.txt format.
version: 1.0.0
allowed-tools: ["WebFetch"]
metadata:
  category: "documentation"
  library: "nuxt-ui"
---

# Nuxt UI Documentation

## Overview

This skill fetches current Nuxt UI documentation directly from ui.nuxt.com using their LLMs.txt format. It provides accurate, up-to-date information about Nuxt UI's 125+ components, theming system, composables, and integrations.

## When to Use

This skill provides access to specific component APIs, theming system configuration, composables usage, and integration guides when users ask about Nuxt UI functionality.

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

After identifying 1-3 relevant pages, fetch them with targeted prompts:

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

## Quick Start Example

For a complete workflow example, see **[examples/toast-notification.md](examples/toast-notification.md)** which demonstrates how to handle the question: "How do I create a toast notification in Nuxt UI?"

## Progressive Disclosure Strategy

Nuxt UI provides two documentation levels:

- **`/llms.txt`** - Concise overview with component summaries and links
- **`/llms-full.txt`** - Comprehensive details with all examples (significantly larger)

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

## Additional Resources

### Troubleshooting and Best Practices

For detailed guidance on common pitfalls and best practices, consult:
- **[references/troubleshooting.md](references/troubleshooting.md)** - Common mistakes, anti-patterns, debugging tips

### Working Examples

Practical examples demonstrating the skill workflow:
- **[examples/component-props.md](examples/component-props.md)** - Querying component API details
- **[examples/theming-customization.md](examples/theming-customization.md)** - Customizing colors and theme
- **[examples/migration-guide.md](examples/migration-guide.md)** - Handling version migration questions
- **[examples/toast-notification.md](examples/toast-notification.md)** - Complete workflow example

## Reference

- Official documentation: https://ui.nuxt.com
- LLMs.txt index: https://ui.nuxt.com/llms.txt
- Full documentation: https://ui.nuxt.com/llms-full.txt
- GitHub repository: https://github.com/nuxt/ui
