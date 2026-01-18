# Example: Toast Notification Query

## User Question

"How do I create a toast notification in Nuxt UI?"

## Workflow Steps

1. **Fetch index**: Access `https://ui.nuxt.com/llms.txt` to find toast-related documentation
2. **Identify relevant page**: Locate `/composables/use-toast` in the composables section
3. **Fetch specific documentation**: `https://ui.nuxt.com/composables/use-toast` with targeted prompt
   - Prompt: "Explain how to use useToast composable, including all methods and options"
4. **Provide comprehensive answer**: Include code examples, methods, and configuration options

## Expected Response Format

### Code Example

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

### Available Methods

- `toast.add(notification)` - Show a notification
- `toast.remove(id)` - Remove a specific notification
- `toast.clear()` - Clear all notifications

### Notification Options

- `title` - Notification title (required)
- `description` - Optional description text
- `color` - UI color theme (default, primary, red, green, etc.)
- `icon` - Optional icon name
- `timeout` - Auto-dismiss duration in milliseconds
- `actions` - Array of action buttons

### Documentation Link

Include link to official documentation: `https://ui.nuxt.com/composables/use-toast`

## Key Takeaway

Composables are found under the `/composables/` path in the documentation. Always include practical code examples along with API reference information.
