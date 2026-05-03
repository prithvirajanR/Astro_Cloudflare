import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const requiredSlugs = [
  'breast-cancer-epigenetic-aging-immune-multiomics',
  'esm-protein-language-models-app-variant-effects',
  'stratadock-molecular-docking-workstation',
  'bactoflow-wgs-bacterial-genome-workflow',
];

const expectedDates = {
  'breast-cancer-epigenetic-aging-immune-multiomics': '2024-06-18',
  'esm-protein-language-models-app-variant-effects': '2024-11-12',
  'stratadock-molecular-docking-workstation': '2025-05-01',
  'bactoflow-wgs-bacterial-genome-workflow': '2024-04-09',
};

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
assert(contentConfig.includes('heroImage: z.string()'), 'blog collection should require heroImage');
assert(contentConfig.includes('heroAlt: z.string()'), 'blog collection should require heroAlt');

const header = readFileSync(join(root, 'src/components/Header.astro'), 'utf8');
assert(header.includes('href="/blog"'), 'header does not link to /blog');

const blogIndex = readFileSync(join(root, 'src/pages/blog.astro'), 'utf8');
assert(blogIndex.includes('BlogCard'), 'blog index does not render BlogCard components');
assert(blogIndex.includes('heroImage={post.data.heroImage}'), 'blog index does not pass hero images to cards');

const blogDetail = readFileSync(join(root, 'src/pages/blog/[slug].astro'), 'utf8');
assert(blogDetail.includes("import { getCollection, render } from 'astro:content'"), 'blog detail route should import Astro content render helper');
assert(blogDetail.includes('render(post)'), 'blog detail route should render content entries with render(post)');
assert(blogDetail.includes('post.data.heroImage'), 'blog detail route does not render hero images');

const posts = readdirSync(join(root, 'src/content/blog')).filter((file) => file.endsWith('.mdx'));
assert(posts.length === 4, `expected 4 blog posts, found ${posts.length}`);

for (const slug of requiredSlugs) {
  const filename = `${slug}.mdx`;
  const filepath = join(root, 'src/content/blog', filename);
  assert(existsSync(filepath), `missing post ${filename}`);

  const content = readFileSync(filepath, 'utf8');
  assert(content.includes('github:'), `${filename} is missing a GitHub URL in frontmatter`);
  assert(content.includes('heroImage:'), `${filename} is missing a hero image in frontmatter`);
  assert(content.includes('heroAlt:'), `${filename} is missing hero alt text in frontmatter`);
  assert(content.includes(`date: ${expectedDates[slug]}`), `${filename} has the wrong post date`);
  assert(content.includes('results') || content.includes('validation') || content.includes('report'), `${filename} should discuss results, validation, or reports`);
}

console.log('Blog verification passed: 4 cards/posts/routes are present.');
