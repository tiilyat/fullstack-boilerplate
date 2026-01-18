# Common Pitfalls and Troubleshooting

This reference provides guidance on common mistakes to avoid when using the nuxt-ui-docs skill.

## Anti-patterns: What NOT to Do

### ❌ Don't Assume API Details from Older Versions

**Problem**: Nuxt UI evolves between versions with breaking changes and new features.

**Solution**: Always fetch current documentation from ui.nuxt.com rather than relying on memory or outdated information.

**Example**: V2 to V3 migration changed many component APIs. Always verify current prop names and types.

---

### ❌ Don't Fetch `/llms-full.txt` by Default

**Problem**: The full documentation file is significantly larger and contains extensive details that are usually unnecessary.

**Solution**: Start with `/llms.txt` to locate relevant pages, then fetch specific component or guide pages as needed.

**When to use `/llms-full.txt`**: Only when the user explicitly requests comprehensive documentation or when `/llms.txt` doesn't contain enough information to identify the right pages.

---

### ❌ Don't Provide Generic Nuxt/Vue Answers

**Problem**: Nuxt UI has specific patterns, components, and conventions that differ from vanilla Nuxt or Vue.

**Solution**: When users ask about UI functionality, check if Nuxt UI provides a dedicated component or pattern before suggesting generic solutions.

**Example**: Instead of recommending a custom toast implementation with Vue's composition API, use Nuxt UI's `useToast` composable.

---

### ❌ Don't Recommend Alternatives Without Checking First

**Problem**: Suggesting third-party libraries or custom solutions when Nuxt UI already has a built-in solution.

**Solution**: Search the component library first using `/llms.txt`. Nuxt UI includes 125+ components covering most common UI needs.

**Example**: Before recommending a separate modal library, verify that Nuxt UI's `Modal` component doesn't meet the requirements.

---

## Best Practices: What TO Do

### ✅ Always Start with `/llms.txt` Index

**Why**: Provides a structured overview of all available documentation without overwhelming the context window.

**Workflow**:
1. Fetch `https://ui.nuxt.com/llms.txt`
2. Locate relevant component or guide sections
3. Fetch 1-3 specific pages with targeted prompts

---

### ✅ Fetch 1-3 Specific Pages with Targeted Prompts

**Why**: Focused fetches provide exactly the information needed without excess context.

**Good prompts**:
- "Explain all props, slots, and events for the Button component"
- "Show how to customize colors using CSS variables"
- "List all methods and options for useToast composable"

**Bad prompts**:
- "Tell me about this page" (too vague)
- "Explain everything" (too broad)

---

### ✅ Show Realistic Code Examples

**Why**: Users learn best from practical, copy-paste ready examples from the official documentation.

**Include**:
- Complete component usage with `<script setup>` and template
- TypeScript types when available
- Configuration examples (nuxt.config.ts, app.config.ts)
- Import statements

**Example**:
```vue
<script setup>
import { ref } from 'vue'

const isOpen = ref(false)
</script>

<template>
  <UModal v-model="isOpen">
    <p>Modal content</p>
  </UModal>
</template>
```

---

### ✅ Mention Version-Specific Features

**Why**: Helps users understand if they need to upgrade or if features are available in their version.

**When relevant**:
- New features added in recent versions
- Breaking changes between major versions
- Deprecated APIs with migration paths

**Example**: "The `color` prop was added in v3.0. If using v2.x, refer to the migration guide."

---

## Debugging Documentation Fetches

### Issue: Can't Find Component in `/llms.txt`

**Check**:
1. Verify component name spelling (case-sensitive)
2. Check if it's a composable under `/composables/` instead
3. Look in "Getting Started" section for installation/config topics

---

### Issue: Fetched Page Lacks Detail

**Solution**:
1. Check if there's a more specific sub-page (e.g., `/getting-started/theme/customization`)
2. Look for related pages in `/llms.txt` that might have additional info
3. If truly missing, acknowledge and suggest checking GitHub issues or official docs

---

### Issue: Conflicting Information Between Pages

**Resolution**:
1. Prioritize information from component-specific pages over general guides
2. Check page URLs - more specific paths usually have more accurate details
3. Note version numbers if mentioned
4. When in doubt, provide both sources and let user verify

---

## Progressive Disclosure Guidelines

### Load Documentation Strategically

**Tier 1 (Always)**: Skill metadata and SKILL.md body (~1,500 words)

**Tier 2 (When needed)**: Specific component or guide pages from ui.nuxt.com

**Tier 3 (Rarely)**: Full documentation dump or multiple comprehensive guides

### Context Management

**Efficient approach**:
```
1. Fetch /llms.txt (concise overview)
2. Identify relevant pages: /components/button, /composables/use-toast
3. Fetch only those 1-2 pages
4. Answer user question
```

**Inefficient approach**:
```
1. Fetch /llms-full.txt (massive)
2. Search through everything
3. Answer question with excessive context loaded
```

---

## Common User Questions by Category

### Components
- "How do I use [Component]?"
- "What props does [Component] accept?"
- "Can I customize [Component]'s appearance?"

**Response pattern**: Fetch component page → list props/slots/events → show usage example

---

### Theming
- "How to customize colors/fonts/spacing?"
- "Can I use Tailwind classes?"
- "How does dark mode work?"

**Response pattern**: Fetch theme guide → show CSS variable overrides → provide config examples

---

### Installation & Setup
- "How to install Nuxt UI?"
- "How to migrate from v2 to v3?"
- "What are the prerequisites?"

**Response pattern**: Fetch installation/migration guide → provide step-by-step instructions → link to full docs

---

### Composables
- "How to show notifications/toasts?"
- "How do keyboard shortcuts work?"
- "What utilities are available?"

**Response pattern**: Fetch composable page → explain API methods → show practical example

---

## URL Patterns Reference

Understanding Nuxt UI documentation URL structure:

- **Components**: `https://ui.nuxt.com/components/[component-name]`
  - Example: `/components/button`, `/components/modal`

- **Composables**: `https://ui.nuxt.com/composables/[composable-name]`
  - Example: `/composables/use-toast`, `/composables/use-shortcuts`

- **Getting Started**: `https://ui.nuxt.com/getting-started/[topic]`
  - Example: `/getting-started/installation`, `/getting-started/theme`

- **Migration**: `https://ui.nuxt.com/getting-started/migration/[version-range]`
  - Example: `/getting-started/migration/v2-v3`

---

## When to Escalate to User

Acknowledge limitations and suggest user verification when:

1. **Documentation is genuinely missing**: Feature not documented in fetched pages
2. **Question requires project-specific context**: User's custom configuration or specific use case
3. **Version uncertainty**: User hasn't specified version and answer differs significantly between versions
4. **Conflicting requirements**: User's constraints conflict with Nuxt UI's architecture

**Example**: "The documentation doesn't specify support for this edge case. You may want to check the GitHub issues or ask in the Nuxt UI Discord for clarification."
