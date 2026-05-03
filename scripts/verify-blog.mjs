import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const requiredSlugs = [
  'breast-cancer-epigenetic-aging-immune-multiomics',
  'esm-protein-language-models-app-variant-effects',
  'stratadock-molecular-docking-workstation',
  'bactoflow-wgs-bacterial-genome-workflow',
];

const requiredFiles = [
  'src/components/BlogCard.astro',
  'src/pages/blog.astro',
  'src/pages/blog/[slug].astro',
  'src/content/blog',
];

function assert(condition, message) {
  if (!condition) {
    console.error(`Blog verification failed: ${message}`);
    process.exit(1);
  }
}

for (const file of requiredFiles) {
  assert(existsSync(join(root, file)), `missing ${file}`);
}

const contentConfig = readFileSync(join(root, 'src/content.config.ts'), 'utf8');
assert(contentConfig.includes('const blog = defineCollection'), 'blog content collection is not configured');
assert(contentConfig.includes('export const collections = { publications, projects, blog }'), 'blog collection is not exported');

const header = readFileSync(join(root, 'src/components/Header.astro'), 'utf8');
assert(header.includes('href="/blog"'), 'header does not link to /blog');

const blogIndex = readFileSync(join(root, 'src/pages/blog.astro'), 'utf8');
assert(blogIndex.includes('BlogCard'), 'blog index does not render BlogCard components');

const blogDetail = readFileSync(join(root, 'src/pages/blog/[slug].astro'), 'utf8');
assert(blogDetail.includes("import { getCollection, render } from 'astro:content'"), 'blog detail route should import Astro content render helper');
assert(blogDetail.includes('render(post)'), 'blog detail route should render content entries with render(post)');

const posts = readdirSync(join(root, 'src/content/blog')).filter((file) => file.endsWith('.mdx'));
assert(posts.length === 4, `expected 4 blog posts, found ${posts.length}`);

for (const slug of requiredSlugs) {
  const filename = `${slug}.mdx`;
  const filepath = join(root, 'src/content/blog', filename);
  assert(existsSync(filepath), `missing post ${filename}`);

  const content = readFileSync(filepath, 'utf8');
  assert(content.includes('github:'), `${filename} is missing a GitHub URL in frontmatter`);
  assert(content.includes('results') || content.includes('validation') || content.includes('report'), `${filename} should discuss results, validation, or reports`);
}

console.log('Blog verification passed: 4 cards/posts/routes are present.');
