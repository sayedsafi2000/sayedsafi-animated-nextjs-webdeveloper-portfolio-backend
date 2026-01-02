import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Blog from '../models/Blog.js';

// Load environment variables
dotenv.config();

// Blog posts data from frontend
const blogPosts = [
  {
    slug: 'building-modern-web-applications-with-nextjs-14',
    title: 'Building Modern Web Applications with Next.js 14: A Complete Guide',
    excerpt: 'Learn how to leverage the latest features of Next.js 14 including Server Components, App Router, and improved performance optimizations to build fast, scalable web applications.',
    content: `# Building Modern Web Applications with Next.js 14: A Complete Guide

Next.js 14 represents a significant leap forward in React framework development, introducing powerful features that make building modern web applications more efficient and performant. In this comprehensive guide, we'll explore the key features and best practices for building production-ready applications.

## Introduction to Next.js 14

Next.js 14 brings several groundbreaking features that enhance both developer experience and application performance. The framework continues to evolve, making it the go-to choice for building React applications at scale.

## Key Features

### Server Components

Server Components are one of the most significant additions in Next.js 14. They allow you to render components on the server, reducing the JavaScript bundle size sent to the client and improving initial page load times.

\`\`\`tsx
// app/components/ServerComponent.tsx
export default async function ServerComponent() {
  const data = await fetch('https://api.example.com/data')
  const result = await data.json()
  
  return (
    <div>
      <h1>{result.title}</h1>
      <p>{result.description}</p>
    </div>
  )
}
\`\`\`

### App Router

The App Router provides a more intuitive file-based routing system with support for layouts, loading states, and error boundaries. It's built on React Server Components, enabling better performance and developer experience.

### Improved Performance

Next.js 14 includes several performance optimizations:
- Automatic code splitting
- Image optimization with next/image
- Font optimization
- Built-in CSS support

## Best Practices

1. **Use Server Components by Default**: Start with Server Components and only use Client Components when you need interactivity.

2. **Optimize Images**: Always use the next/image component for automatic optimization.

3. **Implement Proper Caching**: Use Next.js caching strategies to improve performance.

4. **Code Splitting**: Leverage dynamic imports for code splitting.

## Conclusion

Next.js 14 provides developers with powerful tools to build modern, performant web applications. By understanding and implementing these features correctly, you can create applications that are both fast and maintainable.`,
    date: '2024-01-15',
    readTime: '8 min read',
    category: 'Web Development',
    image: '/api/placeholder/1200/630',
    link: '/blog/building-modern-web-applications-with-nextjs-14',
    tags: ['Next.js', 'React', 'Web Development', 'Server Components', 'App Router'],
    author: {
      name: 'Sayed Safi',
      bio: 'Full-Stack Web Developer specializing in modern web technologies',
      image: '/api/placeholder/100/100',
    },
  },
  {
    slug: 'mastering-typescript-for-better-code-quality',
    title: 'Mastering TypeScript for Better Code Quality: Advanced Patterns and Best Practices',
    excerpt: 'Discover advanced TypeScript patterns, type safety techniques, and best practices that will help you write more maintainable, scalable, and error-free code in your projects.',
    content: `# Mastering TypeScript for Better Code Quality: Advanced Patterns and Best Practices

TypeScript has become the standard for building large-scale JavaScript applications. This guide covers advanced patterns and best practices to help you write better, more maintainable code.

## Why TypeScript Matters

TypeScript provides static type checking, which helps catch errors at compile time rather than runtime. This leads to more reliable code and better developer experience.

## Advanced Type Patterns

### Utility Types

TypeScript provides several utility types that can help you manipulate types:

\`\`\`typescript
// Partial makes all properties optional
type PartialUser = Partial<User>

// Pick selects specific properties
type UserEmail = Pick<User, 'email' | 'name'>

// Omit removes specific properties
type UserWithoutId = Omit<User, 'id'>
\`\`\`

### Generic Constraints

Generics allow you to create reusable components:

\`\`\`typescript
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key]
}
\`\`\`

## Best Practices

1. **Strict Mode**: Always enable strict mode in tsconfig.json
2. **Avoid Any**: Use unknown instead of any when the type is truly unknown
3. **Type Guards**: Use type guards to narrow types safely
4. **Interface vs Type**: Use interfaces for object shapes, types for unions and intersections

## Conclusion

Mastering TypeScript requires understanding both its type system and best practices. By following these patterns, you can write more maintainable and type-safe code.`,
    date: '2024-01-10',
    readTime: '10 min read',
    category: 'Programming',
    image: '/api/placeholder/1200/630',
    link: '/blog/mastering-typescript-for-better-code-quality',
    tags: ['TypeScript', 'Programming', 'Best Practices', 'Type Safety', 'Code Quality'],
    author: {
      name: 'Sayed Safi',
      bio: 'Full-Stack Web Developer specializing in modern web technologies',
      image: '/api/placeholder/100/100',
    },
  },
  {
    slug: 'future-of-ecommerce-medusajs-deep-dive',
    title: 'The Future of E-commerce: A Deep Dive into MedusaJS Architecture',
    excerpt: 'Explore how MedusaJS is revolutionizing e-commerce development with its flexible, headless architecture, powerful customization options, and modern tech stack.',
    content: `# The Future of E-commerce: A Deep Dive into MedusaJS Architecture

MedusaJS is an open-source, headless e-commerce platform that provides developers with the flexibility to build custom e-commerce solutions. This article explores its architecture and capabilities.

## What is MedusaJS?

MedusaJS is a Node.js-based e-commerce framework that provides a robust backend for building modern e-commerce applications. It's designed to be headless, meaning the frontend and backend are decoupled.

## Key Features

### Headless Architecture

MedusaJS follows a headless architecture, allowing you to:
- Build custom frontends with any framework
- Integrate with multiple sales channels
- Maintain flexibility in design and user experience

### Powerful Admin Dashboard

The admin dashboard provides comprehensive tools for managing:
- Products and inventory
- Orders and customers
- Payment and shipping configurations
- Custom plugins and integrations

### Extensibility

MedusaJS is highly extensible through:
- Custom plugins
- API extensions
- Webhook integrations
- Custom workflows

## Implementation Example

\`\`\`typescript
// Creating a custom service in MedusaJS
import { BaseService } from "medusa-interfaces"

class CustomProductService extends BaseService {
  async getFeaturedProducts() {
    return await this.productRepository.find({
      where: { featured: true }
    })
  }
}
\`\`\`

## Best Practices

1. **Use Plugins**: Leverage the plugin system for custom functionality
2. **Optimize Queries**: Use proper indexing and query optimization
3. **Implement Caching**: Cache frequently accessed data
4. **Security**: Always validate and sanitize user inputs

## Conclusion

MedusaJS provides a powerful foundation for building modern e-commerce applications. Its headless architecture and extensibility make it an excellent choice for developers who need flexibility and control.`,
    date: '2024-01-05',
    readTime: '12 min read',
    category: 'E-commerce',
    image: '/api/placeholder/1200/630',
    link: '/blog/future-of-ecommerce-medusajs-deep-dive',
    tags: ['MedusaJS', 'E-commerce', 'Backend', 'Headless Commerce', 'Node.js'],
    author: {
      name: 'Sayed Safi',
      bio: 'Full-Stack Web Developer specializing in modern web technologies',
      image: '/api/placeholder/100/100',
    },
  },
  {
    slug: 'optimizing-react-performance-complete-guide',
    title: 'Optimizing React Performance: A Complete Guide to Faster Applications',
    excerpt: 'Comprehensive guide on React performance optimization techniques including memoization, code splitting, lazy loading, and advanced rendering strategies.',
    content: `# Optimizing React Performance: A Complete Guide to Faster Applications

React performance optimization is crucial for building fast, responsive applications. This guide covers essential techniques and best practices.

## Understanding React Rendering

React re-renders components when:
- State changes
- Props change
- Parent component re-renders
- Context values change

## Performance Optimization Techniques

### 1. React.memo

Use React.memo to prevent unnecessary re-renders:

\`\`\`tsx
const ExpensiveComponent = React.memo(({ data }) => {
  return <div>{/* expensive rendering */}</div>
}, (prevProps, nextProps) => {
  return prevProps.data.id === nextProps.data.id
})
\`\`\`

### 2. useMemo and useCallback

Memoize expensive calculations and functions:

\`\`\`tsx
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(a, b)
}, [a, b])

const handleClick = useCallback(() => {
  doSomething(id)
}, [id])
\`\`\`

### 3. Code Splitting

Split your code to reduce initial bundle size:

\`\`\`tsx
const LazyComponent = React.lazy(() => import('./LazyComponent'))

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LazyComponent />
    </Suspense>
  )
}
\`\`\`

### 4. Virtualization

Use virtualization for long lists:

\`\`\`tsx
import { FixedSizeList } from 'react-window'

function VirtualizedList({ items }) {
  return (
    <FixedSizeList
      height={600}
      itemCount={items.length}
      itemSize={50}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>{items[index]}</div>
      )}
    </FixedSizeList>
  )
}
\`\`\`

## Best Practices

1. **Profile First**: Use React DevTools Profiler to identify bottlenecks
2. **Avoid Premature Optimization**: Optimize only when needed
3. **Monitor Bundle Size**: Keep track of your bundle size
4. **Use Production Builds**: Always test with production builds

## Conclusion

React performance optimization requires understanding rendering behavior and applying appropriate techniques. Start with profiling, then apply optimizations where they matter most.`,
    date: '2023-12-28',
    readTime: '15 min read',
    category: 'React',
    image: '/api/placeholder/1200/630',
    link: '/blog/optimizing-react-performance-complete-guide',
    tags: ['React', 'Performance', 'Optimization', 'Memoization', 'Code Splitting'],
    author: {
      name: 'Sayed Safi',
      bio: 'Full-Stack Web Developer specializing in modern web technologies',
      image: '/api/placeholder/100/100',
    },
  },
  {
    slug: 'mongodb-best-practices-modern-applications',
    title: 'MongoDB Best Practices for Modern Web Applications',
    excerpt: 'Learn essential MongoDB best practices including schema design, indexing strategies, query optimization, and security measures for building scalable applications.',
    content: `# MongoDB Best Practices for Modern Web Applications

MongoDB is a powerful NoSQL database that's widely used in modern web applications. This guide covers essential best practices for working with MongoDB effectively.

## Schema Design

### Embedding vs Referencing

Choose between embedding and referencing based on your use case:

**Embedding** is good for:
- Small, related data
- Data that's frequently accessed together
- One-to-many relationships where the "many" side is small

**Referencing** is good for:
- Large documents
- Frequently updated data
- Many-to-many relationships

\`\`\`javascript
// Embedding example
{
  _id: ObjectId("..."),
  name: "John Doe",
  address: {
    street: "123 Main St",
    city: "New York"
  }
}

// Referencing example
{
  _id: ObjectId("..."),
  name: "John Doe",
  addressId: ObjectId("...")
}
\`\`\`

## Indexing Strategies

Proper indexing is crucial for query performance:

\`\`\`javascript
// Create indexes
db.users.createIndex({ email: 1 })
db.users.createIndex({ name: 1, email: 1 }) // Compound index

// Use explain to analyze queries
db.users.find({ email: "user@example.com" }).explain("executionStats")
\`\`\`

## Query Optimization

1. **Use Projection**: Only fetch fields you need
2. **Limit Results**: Use limit() to restrict result size
3. **Use Aggregation**: For complex queries, use aggregation pipeline
4. **Avoid Large Skips**: Use cursor-based pagination instead of skip()

\`\`\`javascript
// Good: Using projection
db.users.find({}, { name: 1, email: 1 })

// Good: Cursor-based pagination
db.users.find({ _id: { $gt: lastId } }).limit(20)

// Avoid: Large skips
db.users.find().skip(10000).limit(20) // Inefficient
\`\`\`

## Security Best Practices

1. **Authentication**: Always enable authentication
2. **Authorization**: Use role-based access control
3. **Encryption**: Encrypt sensitive data
4. **Input Validation**: Validate all inputs
5. **Regular Updates**: Keep MongoDB updated

## Performance Tips

1. **Connection Pooling**: Use connection pooling
2. **Read Preferences**: Configure read preferences for replica sets
3. **Write Concerns**: Set appropriate write concerns
4. **Monitoring**: Use MongoDB Atlas or monitoring tools

## Conclusion

Following MongoDB best practices helps you build scalable, performant applications. Focus on proper schema design, indexing, and query optimization for best results.`,
    date: '2023-12-20',
    readTime: '11 min read',
    category: 'Database',
    image: '/api/placeholder/1200/630',
    link: '/blog/mongodb-best-practices-modern-applications',
    tags: ['MongoDB', 'Database', 'NoSQL', 'Backend', 'Best Practices'],
    author: {
      name: 'Sayed Safi',
      bio: 'Full-Stack Web Developer specializing in modern web technologies',
      image: '/api/placeholder/100/100',
    },
  },
  {
    slug: 'wordpress-customization-advanced-techniques',
    title: 'WordPress Customization: Advanced Techniques for Developers',
    excerpt: 'Master advanced WordPress customization techniques including custom post types, theme development, plugin creation, and performance optimization for professional websites.',
    content: `# WordPress Customization: Advanced Techniques for Developers

WordPress remains one of the most popular CMS platforms. This guide covers advanced customization techniques for developers who want to build professional, custom WordPress solutions.

## Custom Post Types

Create custom post types for specialized content:

\`\`\`php
function register_custom_post_type() {
  register_post_type('portfolio', array(
    'labels' => array(
      'name' => 'Portfolio',
      'singular_name' => 'Portfolio Item'
    ),
    'public' => true,
    'has_archive' => true,
    'supports' => array('title', 'editor', 'thumbnail'),
    'menu_icon' => 'dashicons-portfolio'
  ));
}
add_action('init', 'register_custom_post_type');
\`\`\`

## Custom Taxonomies

Add custom taxonomies to organize content:

\`\`\`php
function register_custom_taxonomy() {
  register_taxonomy('project_category', 'portfolio', array(
    'labels' => array(
      'name' => 'Project Categories',
      'singular_name' => 'Project Category'
    ),
    'hierarchical' => true,
    'public' => true
  ));
}
add_action('init', 'register_custom_taxonomy');
\`\`\`

## Theme Development

### Creating a Child Theme

Always use child themes to preserve customizations:

\`\`\`php
// style.css
/*
Theme Name: My Child Theme
Template: parent-theme
*/

@import url("../parent-theme/style.css");
\`\`\`

### Custom Templates

Create custom page templates:

\`\`\`php
<?php
/*
Template Name: Custom Landing Page
*/
get_header();
?>
<div class="custom-landing">
  <?php while (have_posts()) : the_post(); ?>
    <h1><?php the_title(); ?></h1>
    <?php the_content(); ?>
  <?php endwhile; ?>
</div>
<?php get_footer(); ?>
\`\`\`

## Plugin Development

### Creating a Basic Plugin

\`\`\`php
<?php
/**
 * Plugin Name: My Custom Plugin
 * Description: A custom plugin for specific functionality
 * Version: 1.0.0
 */

function my_custom_function() {
  // Plugin functionality
}
add_action('init', 'my_custom_function');
\`\`\`

## Performance Optimization

1. **Caching**: Implement object caching
2. **Database Optimization**: Optimize database queries
3. **Image Optimization**: Compress and optimize images
4. **Minification**: Minify CSS and JavaScript
5. **CDN**: Use a CDN for static assets

## Security Best Practices

1. **Keep WordPress Updated**: Always use the latest version
2. **Use Strong Passwords**: Enforce strong password policies
3. **Limit Login Attempts**: Prevent brute force attacks
4. **Use Security Plugins**: Implement security measures
5. **Regular Backups**: Maintain regular backups

## Conclusion

WordPress customization requires understanding its architecture and best practices. By following these techniques, you can build powerful, custom WordPress solutions that meet specific business needs.`,
    date: '2023-12-15',
    readTime: '13 min read',
    category: 'WordPress',
    image: '/api/placeholder/1200/630',
    link: '/blog/wordpress-customization-advanced-techniques',
    tags: ['WordPress', 'CMS', 'PHP', 'Theme Development', 'Plugin Development'],
    author: {
      name: 'Sayed Safi',
      bio: 'Full-Stack Web Developer specializing in modern web technologies',
      image: '/api/placeholder/100/100',
    },
  },
];

async function migrateBlogs() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    let created = 0;
    let skipped = 0;

    // Insert each blog post
    for (const blogData of blogPosts) {
      try {
        // Check if blog with this slug already exists
        const existing = await Blog.findOne({ slug: blogData.slug });
        
        if (existing) {
          console.log(`⏭️  Skipping: ${blogData.title} (already exists)`);
          skipped++;
          continue;
        }

        // Create the blog post
        const blog = await Blog.create({
          ...blogData,
          date: new Date(blogData.date),
          published: true, // Set all as published
        });

        console.log(`✅ Created: ${blog.title}`);
        created++;
      } catch (error) {
        console.error(`❌ Error creating ${blogData.title}:`, error.message);
      }
    }

    console.log('\n📊 Migration Summary:');
    console.log(`   Created: ${created}`);
    console.log(`   Skipped: ${skipped}`);
    console.log(`   Total: ${blogPosts.length}`);

    // Close connection
    await mongoose.connection.close();
    console.log('\n✅ Migration completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
}

// Run migration
migrateBlogs();

