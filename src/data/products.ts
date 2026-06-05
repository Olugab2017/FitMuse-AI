/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product } from '../types';

export const PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Obsidian Oversized Hooded Bomber',
    brand: 'NEXUS CLAN',
    category: 'outerwear',
    price: 189,
    image: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?q=80&w=600&auto=format&fit=crop',
    rating: 4.9,
    description: 'A heavyweight, drop-shoulder bomber jacket featuring premium double-lined cotton-fleece and customized obsidian zippers. Water-resistant outer shell with matte black hardware.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Jet Black', 'Slate', 'Charcoal'],
    tags: ['Minimalist Streetwear', 'Relaxed Fit', 'Dark Aesthetics'],
    alignment: {
      fitMatch: 98,
      colorCompatibility: 'Deep charcoal pairs perfectly with cool slate tones and matches neutral skin tones flawlessly.',
      styleExplanation: 'Supports a loose, architectural silhouette, reinforcing a relaxed yet highly-structured modern aesthetic.'
    },
    inventory: 15
  },
  {
    id: 'prod-2',
    name: 'Asymmetric Tailored Trench Coat',
    brand: 'ATELIER MONO',
    category: 'outerwear',
    price: 345,
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=600&auto=format&fit=crop',
    rating: 4.8,
    description: 'An unstructured trench coat designed with a fluid weave drape, custom gunmetal buckles, and double-breasted closure. Versatile for formal or layered high-street fits.',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Taupe', 'Warm Gray', 'Sand'],
    tags: ['Luxury Minimalist', 'Tailored Fit', 'Classic Tones'],
    alignment: {
      fitMatch: 94,
      colorCompatibility: 'Warm sand tones provide sophisticated contrasts to dark slate and deep forest elements.',
      styleExplanation: 'Elongates backlines and emphasizes shoulder drops, fitting both athletic and slender body silhouettes.'
    },
    inventory: 8
  },
  {
    id: 'prod-3',
    name: 'Stealth Drop-Crotch Joggers',
    brand: 'NEXUS CLAN',
    category: 'bottoms',
    price: 120,
    image: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=600&auto=format&fit=crop',
    rating: 4.7,
    description: 'Relaxed drop-crotch joggers crafted from high-density organic combed loopback cotton. Tapered calflined fit with double-stitched cargo compartments and elasticized metal-tip drawstring.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Jet Black', 'Carbon Gray'],
    tags: ['Minimalist Streetwear', 'Relaxed Fit', 'Tapered Utility'],
    alignment: {
      fitMatch: 92,
      colorCompatibility: 'Carbon black layers seamlessly under any monochromatic or experimental upper pieces.',
      styleExplanation: 'Accommodating low-hip waistlines paired with tight tailored ankle cuffs for active luxury.'
    },
    inventory: 24
  },
  {
    id: 'prod-4',
    name: 'Raw Heavyweight Crewneck Tee',
    brand: 'ATELIER MONO',
    category: 'tops',
    price: 65,
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600&auto=format&fit=crop',
    rating: 4.6,
    description: 'A structured, boxy cut tee in 320GSM raw organic combed cotton slub. Mock-neck collar detail and double-reinforced flatlock seams. Retains structural architecture wash after wash.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Chalk White', 'Alabaster', 'Washed Obsidian'],
    tags: ['Luxury Minimalist', 'Relaxed Fit', 'Essential Base'],
    alignment: {
      fitMatch: 95,
      colorCompatibility: 'Alabaster and chalk white act as a crucial midtone, highlighting skin undertones without flashing.',
      styleExplanation: 'Wider box shoulder drops structure the neck frame and elevate essential layering options.'
    },
    inventory: 40
  },
  {
    id: 'prod-5',
    name: 'Architectural Sole High-Tops',
    brand: 'KINETIC LABS',
    category: 'footwear',
    price: 260,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop',
    rating: 4.9,
    description: 'Sculpted high-top luxury sneakers featuring premium Italian full-grain leather, dual magnetic side-buckles, and a lightweight geometric high-traction sole.',
    sizes: ['40', '41', '42', '43', '44'],
    colors: ['Monochrome Black', 'Optic White'],
    tags: ['Active Luxury', 'Bold Statement', 'Modern Tech'],
    alignment: {
      fitMatch: 91,
      colorCompatibility: 'A commanding dark sole anchor provides a strong weight distribution visually to light clothing ensembles.',
      styleExplanation: 'Engineered high-ankle brace adds structure to drop-crotch joggers and tailored crop trousers.'
    },
    inventory: 6
  },
  {
    id: 'prod-6',
    name: 'Pivotal Symmetrical Cargo Pants',
    brand: 'KINETIC LABS',
    category: 'bottoms',
    price: 145,
    image: 'https://images.unsplash.com/photo-1517423568366-8b83523034fd?q=80&w=600&auto=format&fit=crop',
    rating: 4.5,
    description: 'Techwear cargo trousers with articulated knee darts, dual buckle straps, and 6-pocket modular grid configuration. Made from aerospace grade synthetic micro-ripstop Nylon.',
    sizes: ['28', '30', '32', '34'],
    colors: ['Olive Drab', 'Slate Black'],
    tags: ['Modern Tech', 'Relaxed Fit', 'Tapered Utility'],
    alignment: {
      fitMatch: 88,
      colorCompatibility: 'Earthy Olive Drab complements warm-toned outerwear and muted sand/taupe bases.',
      styleExplanation: 'Tactical modular design adds interesting textures and contours to streetwear fits.'
    },
    inventory: 11
  },
  {
    id: 'prod-7',
    name: 'Ultraviolet Cyber-Knit Tee',
    brand: 'KINETIC LABS',
    category: 'tops',
    price: 78,
    image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=600&auto=format&fit=crop',
    rating: 4.8,
    description: 'Breathable, futuristic neon-threaded mesh knit made using 100% recycled nylon and intelligent thermoregulation weave. Reflective accent piping on shoulders.',
    sizes: ['S', 'M', 'L'],
    colors: ['Neon Cyber', 'Deep Ultraviolet'],
    tags: ['Modern Tech', 'Tailored Fit', 'Bold Statement'],
    alignment: {
      fitMatch: 90,
      colorCompatibility: 'High visibility cyber threads offer a gorgeous contrasting highlight when paired underneath deep dark shells.',
      styleExplanation: 'Athletic, body-mapping stretch construct that emphasizes torso definition effortlessly.'
    },
    inventory: 18
  },
  {
    id: 'prod-8',
    name: 'Premium Leather Moto Shell',
    brand: 'ATELIER MONO',
    category: 'outerwear',
    price: 480,
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=600&auto=format&fit=crop',
    rating: 4.9,
    description: 'A structured, semi-cropped jacket in full-grain calfskin leather, hand-burnished for a subtle, luxurious matte patina. Ribbed elbow paneling and customizable collar snappings.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Obsidian Black', 'Cognac Gold'],
    tags: ['Luxury Minimalist', 'Tailored Fit', 'Bold Statement'],
    alignment: {
      fitMatch: 97,
      colorCompatibility: 'Sleek luxury black frames both dark inner styling components and deep high-saturation accent panels.',
      styleExplanation: 'Sleek cropped silhouette emphasizing long legs and straight structural shoulder cuts.'
    },
    inventory: 4
  }
];
