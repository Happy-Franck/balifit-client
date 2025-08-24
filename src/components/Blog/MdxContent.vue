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

  // Headings: add id, classes, and numbering
  const allHeadings = container.querySelectorAll('H1, H2, H3, H4, H5, H6')
  let mainCounter = 0
  let subCounter = 0
  let firstHeadingLevel = 0

  allHeadings.forEach((el) => {
    const element = el as HTMLElement
    const tag = element.tagName
    const level = parseInt(tag.substring(1))
    const text = element.textContent || ''
    const id = slugifyHeadline(text)
    element.id = id
    
    const baseClassMap: Record<string, string> = {
      H1: 'article-h1',
      H2: 'article-h2',
      H3: 'article-h3',
      H4: 'article-h4',
      H5: 'article-h5',
      H6: 'article-h6'
    }
    element.className = [element.className, baseClassMap[tag]].filter(Boolean).join(' ')

    // Numbering logic
    let number = ''
    if (['H1', 'H2', 'H3'].includes(tag)) {
      if (firstHeadingLevel === 0) {
        // First heading encountered
        firstHeadingLevel = level
        mainCounter = 1
        subCounter = 0
        number = mainCounter.toString()
      } else if (level === firstHeadingLevel) {
        // Same level as first heading - this shouldn't happen in your case
        mainCounter++
        subCounter = 0
        number = mainCounter.toString()
      } else if (level > firstHeadingLevel) {
        // Sub-heading
        subCounter++
        number = `${mainCounter}.${subCounter}`
      }

      if (number) {
        element.innerHTML = `<span class="heading-number">${number}.</span> ${text}`
      }
    }
  })

  // Paragraphs
  container.querySelectorAll('p').forEach(p => {
    const el = p as HTMLElement
    el.className = [el.className, 'article-paragraph'].filter(Boolean).join(' ')
  })

  // Lists
  container.querySelectorAll('ul').forEach(ul => {
    const el = ul as HTMLElement
    el.className = [el.className, 'article-ul'].filter(Boolean).join(' ')
  })
  container.querySelectorAll('ol').forEach(ol => {
    const el = ol as HTMLElement
    el.className = [el.className, 'article-ol'].filter(Boolean).join(' ')
  })
  container.querySelectorAll('li').forEach(li => {
    const el = li as HTMLElement
    el.className = [el.className, 'article-li'].filter(Boolean).join(' ')
  })

  // Code blocks and inline code
  container.querySelectorAll('pre').forEach(pre => {
    const el = pre as HTMLElement
    el.className = [el.className, 'article-pre'].filter(Boolean).join(' ')
  })
  container.querySelectorAll('code').forEach(code => {
    const el = code as HTMLElement
    const isInline = !el.parentElement || el.parentElement.tagName !== 'PRE'
    el.className = [el.className, isInline ? 'article-code-inline' : 'article-code-block'].filter(Boolean).join(' ')
  })

  // Blockquotes
  container.querySelectorAll('blockquote').forEach(blockquote => {
    const el = blockquote as HTMLElement
    el.className = [el.className, 'article-blockquote'].filter(Boolean).join(' ')
  })

  // Tables
  container.querySelectorAll('table').forEach(table => {
    const el = table as HTMLElement
    el.className = [el.className, 'article-table'].filter(Boolean).join(' ')
  })

  // Images: lazy, responsive, classes
  container.querySelectorAll('img').forEach(img => {
    const el = img as HTMLImageElement
    el.loading = 'lazy'
    el.className = [el.className, 'article-image'].filter(Boolean).join(' ')
  })

  // Links: external handling
  container.querySelectorAll('a').forEach(a => {
    const el = a as HTMLAnchorElement
    const href = el.getAttribute('href') || '#'
    const isInternal = href.startsWith('/') || href.startsWith('#')
    el.className = [el.className, 'article-link'].filter(Boolean).join(' ')
    if (!isInternal) {
      el.target = '_blank'
      el.rel = 'noopener noreferrer'
    }
  })

  // Horizontal rules
  container.querySelectorAll('hr').forEach(hr => {
    const el = hr as HTMLElement
    el.className = [el.className, 'article-hr'].filter(Boolean).join(' ')
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
  emits: ['headings-extracted'],
  setup(props, { emit }) {
    const safeHtml = computed(() => {
      const raw = props.markdown || ''
      const rendered = md.render(raw)
      const transformed = transformHtml(rendered)
      
      // Extract headings for table of contents
      extractHeadings(raw)
      
      return transformed
    })

    const extractHeadings = (markdown: string) => {
      const headingRegex = /^(#{1,3})\s+(.+)$/gm
      const headings: any[] = []
      let match
      let mainCounter = 0
      let subCounter = 0
      let firstHeadingLevel = 0

      while ((match = headingRegex.exec(markdown)) !== null) {
        const level = match[1].length
        const text = match[2].trim()
        const id = slugifyHeadline(text)
        
        let number = ''
        if (firstHeadingLevel === 0) {
          // First heading encountered
          firstHeadingLevel = level
          mainCounter = 1
          subCounter = 0
          number = mainCounter.toString()
        } else if (level === firstHeadingLevel) {
          // Same level as first heading - this shouldn't happen in your case
          mainCounter++
          subCounter = 0
          number = mainCounter.toString()
        } else if (level > firstHeadingLevel) {
          // Sub-heading
          subCounter++
          number = `${mainCounter}.${subCounter}`
        }

        headings.push({
          level,
          text,
          id,
          number
        })
      }

      emit('headings-extracted', headings)
    }

    return { safeHtml }
  }
})
</script>

<style scoped>
.mdx-content {
  line-height: 1.7;
  font-size: 1.1rem;
  color: rgb(var(--v-theme-on-surface));
}

/* Typography Hierarchy */
.mdx-content :deep(.article-h1) {
  font-size: 2.5rem;
  font-weight: 800;
  line-height: 1.2;
  margin: 3rem 0 1.5rem 0;
  color: rgb(var(--v-theme-primary));
  position: relative;
  padding-bottom: 1rem;
}

.mdx-content :deep(.article-h1::after) {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, rgb(var(--v-theme-primary)), rgba(var(--v-theme-primary), 0.3));
  border-radius: 2px;
}

.mdx-content :deep(.article-h2) {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1.3;
  margin: 2.5rem 0 1rem 0;
  color: rgb(var(--v-theme-on-surface));
  position: relative;
  padding-bottom: 0.75rem;
}

.mdx-content :deep(.article-h2::after) {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 80%;
  height: 3px;
  background: linear-gradient(90deg, rgb(var(--v-theme-primary)), rgba(var(--v-theme-primary), 0.4));
  border-radius: 2px;
}

.mdx-content :deep(.article-h3) {
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 1.4;
  margin: 2rem 0 0.75rem 0;
  color: rgb(var(--v-theme-on-surface));
  position: relative;
  padding-bottom: 0.5rem;
}

.mdx-content :deep(.article-h3::after) {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 60%;
  height: 2px;
  background: linear-gradient(90deg, rgb(var(--v-theme-primary)), rgba(var(--v-theme-primary), 0.5));
  border-radius: 1px;
}

.mdx-content :deep(.article-h4) {
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.4;
  margin: 1.5rem 0 0.5rem 0;
  color: rgb(var(--v-theme-on-surface));
}

.mdx-content :deep(.article-h4) {
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.4;
  margin: 1.5rem 0 0.5rem 0;
  color: rgb(var(--v-theme-on-surface));
}

.mdx-content :deep(.article-h5),
.mdx-content :deep(.article-h6) {
  font-size: 1.1rem;
  font-weight: 600;
  line-height: 1.4;
  margin: 1rem 0 0.5rem 0;
  color: rgb(var(--v-theme-on-surface));
}

/* Heading Numbers */
.mdx-content :deep(.heading-number) {
  color: rgb(var(--v-theme-primary));
  font-weight: 900;
  margin-right: 0.5rem;
  display: inline-block;
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)), rgba(var(--v-theme-primary), 0.8));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 2px 4px rgba(var(--v-theme-primary), 0.2);
}

/* Paragraphs */
.mdx-content :deep(.article-paragraph) {
  margin-bottom: 1.5rem;
  line-height: 1.8;
  color: rgba(var(--v-theme-on-surface), 0.8);
}

.mdx-content :deep(.article-paragraph:first-of-type) {
  font-size: 1.2rem;
  font-weight: 400;
  color: rgba(var(--v-theme-on-surface), 0.9);
}

/* Lists */
.mdx-content :deep(.article-ul),
.mdx-content :deep(.article-ol) {
  margin: 1.5rem 0;
  padding-left: 1.5rem;
}

.mdx-content :deep(.article-ul) {
  list-style: none;
}

.mdx-content :deep(.article-ul .article-li) {
  position: relative;
  margin-bottom: 0.5rem;
  padding-left: 1.5rem;
}

.mdx-content :deep(.article-ul .article-li::before) {
  content: '•';
  position: absolute;
  left: 0;
  color: rgb(var(--v-theme-primary));
  font-weight: bold;
  font-size: 1.2rem;
}

.mdx-content :deep(.article-ol) {
  list-style: decimal;
}

.mdx-content :deep(.article-ol .article-li) {
  margin-bottom: 0.5rem;
  padding-left: 0.5rem;
}

/* Code */
.mdx-content :deep(.article-code-inline) {
  background: rgba(var(--v-theme-primary), 0.1);
  color: rgb(var(--v-theme-primary));
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.9em;
  font-weight: 500;
}

.mdx-content :deep(.article-pre) {
  background: rgb(var(--v-theme-surface-variant));
  border: 1px solid rgba(var(--v-theme-outline), 0.2);
  border-radius: 12px;
  padding: 1.5rem;
  margin: 2rem 0;
  overflow-x: auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.mdx-content :deep(.article-code-block) {
  background: transparent;
  color: rgb(var(--v-theme-on-surface-variant));
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.9rem;
  line-height: 1.6;
}

/* Blockquotes */
.mdx-content :deep(.article-blockquote) {
  background: rgba(var(--v-theme-primary), 0.05);
  border-left: 4px solid rgb(var(--v-theme-primary));
  margin: 2rem 0;
  padding: 1.5rem 2rem;
  border-radius: 0 8px 8px 0;
  font-style: italic;
  position: relative;
}

.mdx-content :deep(.article-blockquote::before) {
  content: '"';
  position: absolute;
  top: 0.5rem;
  left: 1rem;
  font-size: 3rem;
  color: rgba(var(--v-theme-primary), 0.3);
  font-family: serif;
}

.mdx-content :deep(.article-blockquote p) {
  margin: 0;
  color: rgba(var(--v-theme-on-surface), 0.9);
}

/* Images */
.mdx-content :deep(.article-image) {
  width: 100%;
  height: auto;
  border-radius: 12px;
  margin: 2rem 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.mdx-content :deep(.article-image:hover) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

/* Links */
.mdx-content :deep(.article-link) {
  color: rgb(var(--v-theme-primary));
  text-decoration: none;
  font-weight: 500;
  border-bottom: 1px solid transparent;
  transition: all 0.2s ease;
}

.mdx-content :deep(.article-link:hover) {
  border-bottom-color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.05);
  padding: 0 0.2rem;
  border-radius: 4px;
}

/* Tables */
.mdx-content :deep(.article-table) {
  width: 100%;
  border-collapse: collapse;
  margin: 2rem 0;
  background: rgb(var(--v-theme-surface));
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.mdx-content :deep(.article-table th) {
  background: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-on-primary));
  padding: 1rem;
  text-align: left;
  font-weight: 600;
}

.mdx-content :deep(.article-table td) {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid rgba(var(--v-theme-outline), 0.1);
}

.mdx-content :deep(.article-table tr:hover) {
  background: rgba(var(--v-theme-primary), 0.05);
}

/* Horizontal Rules */
.mdx-content :deep(.article-hr) {
  border: none;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgb(var(--v-theme-primary)), transparent);
  margin: 3rem 0;
  border-radius: 1px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .mdx-content {
    font-size: 1rem;
  }
  
  .mdx-content :deep(.article-h1) {
    font-size: 2rem;
  }
  
  .mdx-content :deep(.article-h2) {
    font-size: 1.5rem;
  }
  
  .mdx-content :deep(.article-pre) {
    padding: 1rem;
    font-size: 0.8rem;
  }
  
  .mdx-content :deep(.article-blockquote) {
    padding: 1rem 1.5rem;
  }
}
</style> 