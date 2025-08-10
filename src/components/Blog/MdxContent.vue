<template>
  <div class="mdx-content">
    <div v-html="safeHtml"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import MarkdownIt from 'markdown-it'
import DOMPurify from 'dompurify'

function slugifyHeadline(text: string): string {
  return (text || '')
    .toString()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

const md = new MarkdownIt({
  html: false,
  linkify: true,
  breaks: true,
  typographer: true
})

function transformHtml(html: string): string {
  // Sanitize first
  const clean = DOMPurify.sanitize(html, { USE_PROFILES: { html: true } })
  const container = document.createElement('div')
  container.innerHTML = clean

  // Headings: add id and classes
  ;(['H1', 'H2', 'H3', 'H4', 'H5', 'H6'] as const).forEach(tag => {
    container.querySelectorAll(tag).forEach((el) => {
      const element = el as HTMLElement
      const text = element.textContent || ''
      const id = slugifyHeadline(text)
      element.id = id
      const baseClassMap: Record<string, string> = {
        H1: 'mb-6 font-bold text-4xl',
        H2: 'mb-4 font-bold text-2xl',
        H3: 'mb-4 font-bold text-xl',
        H4: 'mb-4 font-bold text-lg',
        H5: 'mb-4 font-bold text-base',
        H6: 'mb-4 font-bold text-sm'
      }
      element.className = [element.className, baseClassMap[tag]].filter(Boolean).join(' ')
    })
  })

  // Paragraphs and lists classes
  container.querySelectorAll('p').forEach(p => {
    const el = p as HTMLElement
    el.className = [el.className, 'mb-6 text-foreground/60 leading-relaxed'].filter(Boolean).join(' ')
  })
  container.querySelectorAll('ul').forEach(ul => {
    const el = ul as HTMLElement
    el.className = [el.className, 'mb-6 list-inside list-disc space-y-2 pl-4'].filter(Boolean).join(' ')
  })
  container.querySelectorAll('ol').forEach(ol => {
    const el = ol as HTMLElement
    el.className = [el.className, 'mb-6 list-inside list-decimal space-y-2 pl-4'].filter(Boolean).join(' ')
  })

  // Images: lazy, responsive, classes
  container.querySelectorAll('img').forEach(img => {
    const el = img as HTMLImageElement
    el.loading = 'lazy'
    el.style.width = '100%'
    el.style.height = 'auto'
    el.className = [el.className, 'rounded-lg shadow'].filter(Boolean).join(' ')
  })

  // Links: external handling
  container.querySelectorAll('a').forEach(a => {
    const el = a as HTMLAnchorElement
    const href = el.getAttribute('href') || '#'
    const isInternal = href.startsWith('/') || href.startsWith('#')
    if (!isInternal) {
      el.target = '_blank'
      el.rel = 'noopener noreferrer'
    }
  })

  return container.innerHTML
}

export default defineComponent({
  name: 'MdxContent',
  props: {
    markdown: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const safeHtml = computed(() => {
      const raw = props.markdown || ''
      const rendered = md.render(raw)
      return transformHtml(rendered)
    })

    return { safeHtml }
  }
})
</script>

<style scoped>
.mdx-content :deep(img) {
  display: block;
}
</style> 