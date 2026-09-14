# Lalu Clading — Premium Architectural Catalogue Website

## Problem Statement
Premium, luxury product-catalogue-only website for Lalu Clading (architectural cladding brand).
NO cart, checkout, quotation, invoice or pricing. Discover → Explore → Product Details → Download Catalogue → Contact.

## Company
- Phone: 8088791219 · WhatsApp: 918088791219
- Email: laluclading45@gmail.com · Site: laluclading.com

## Tech Stack
- FastAPI + MongoDB + Emergent Object Storage (images/PDFs/GLB models)
- React 19 + React Router + Tailwind + Shadcn UI + Sonner toasts
- JWT auth (single admin, bcrypt, 7-day tokens, cookie + Bearer)

## Personas
- Public visitor: browses collections, product detail, downloads brochure, contacts
- Admin: laluclading45@gmail.com — full CRUD over catalogue

## Implemented (Feb 2026)
- Public pages: Home (slider hero, categories grid, featured products, why-us, projects, CTA), About, Products (category filter), Product Detail (gallery, specs, brochure, Call/WhatsApp/Contact), Applications, Projects, Contact (form + direct channels)
- Admin (/admin): Dashboard stats, Products, Categories, Slides, Projects, Catalogues (PDF), Media Library, Website Content editor, Enquiries
- File upload: images/PDFs/GLB via /api/upload → served via /api/files/{path}
- Seed: 6 categories, 12 products, 3 slides, 4 projects, full site content
- Design: Luxury bronze/gold on obsidian black, Cormorant Garamond serif + Manrope + JetBrains Mono

## Backlog (P1/P2)
- P1: Interactive 3D panel viewer (three.js) for products with model_3d_url
- P1: Multi-lang (EN/HI) toggle
- P2: SEO meta injection per-page from content collection
- P2: Enquiry auto-forward via Resend integration
- P2: Public catalogue download page listing all published PDFs
