
import type { ServiceCategory } from './types';

export const serviceCategories: ServiceCategory[] = [
  {
    id: 'knotless',
    name: 'Knotless',
    services: [
      { name: 'Small knotless shoulder', price: 15000 },
      { name: 'Medium knotless shoulder', price: 12000 },
      { name: 'Large knotless shoulder', price: 10000 },
      { name: 'Small knotless mid-back', price: 18000 },
      { name: 'Medium knotless mid-back', price: 15000 },
      { name: 'Large knotless mid-back', price: 12000 },
      { name: 'Small knotless waist', price: 23000 },
      { name: 'Medium knotless waist', price: 18000 },
      { name: 'Large knotless waist', price: 15000 },
      { name: 'Small knotless bum length', price: 30000 },
      { name: 'Medium knotless bum length', price: 25000 },
      { name: 'Large knotless bum length', price: 18000 },
      { name: 'Goddess braid shoulder', price: 17000 },
      { name: 'Goddess braid mid back', price: 20000 },
      { name: 'Goddess braid waist', price: 23000 },
      { name: 'Mermaid braids mid back', price: 17000 },
      { name: 'Mermaid braid waist', price: 20000 },
      { name: 'Small buss-down / boneless braid', price: 35000 },
      { name: 'Medium buss-down / boneless braid', price: 30000 },
    ],
  },
  {
    id: 'twist',
    name: 'Twist',
    services: [
      { name: 'Natural twist', price: 5000 },
      { name: 'Micro twist shoulder', price: 20000 },
      { name: 'Mini twist', price: 12000 },
      { name: 'Island twist shoulder', price: 14000 },
      { name: 'Island twist mid-back', price: 18000 },
      { name: 'Island twist waist', price: 21000 },
      { name: 'Island twist bum', price: 23000 },
    ],
  },
  {
    id: 'fulani-braids',
    name: 'Fulani Braids',
    services: [
      { name: 'Fulani shoulder length', price: 13000 },
      { name: 'Fulani mid-back', price: 17000 },
      { name: 'Fulani waist length', price: 20000 },
      { name: 'All back with extension', price: 10000 },
    ],
  },
  {
    id: 'french-curls',
    name: 'French Curls',
    services: [
      { name: 'French curls shoulder length', price: 14000 },
      { name: 'French curls mid-back', price: 18000 },
      { name: 'French curls waist', price: 25000 },
    ],
  },
  {
    id: 'extra',
    name: 'Extra',
    services: [
      { name: 'Extra small size', price: 3000 },
      { name: 'Boho/Goddess', price: 3000 },
      { name: 'Extra length', price: 3000 },
    ],
  },
  {
    id: 'extensions',
    name: 'Extensions',
    services: [
      { name: 'Big attachment', price: 6000 },
      { name: 'Small attachment', price: 4500 },
      { name: 'Boho curls', price: 5000 },
      { name: 'French curls', price: 7000 },
    ],
  },
];
