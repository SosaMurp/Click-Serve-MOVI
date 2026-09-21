import { api } from '../components/context/AuthContext';

export type Service = {
  id: string;
  technicianName: string;
  specialty: string;
  category: string;
  rating: number;
  completedJobs: number;
  baseRate: number;
  location: string;
  avatar?: string;
  description: string;
};

export const fallbackServices: Service[] = [
  {
    id: 'tech-001',
    technicianName: 'Roberto García',
    specialty: 'Soporte y Hardware',
    category: 'TECH',
    rating: 4.9,
    completedJobs: 120,
    baseRate: 350,
    location: 'Centro, Lázaro Cárdenas',
    description: 'Diagnóstico, mantenimiento y reparación de computadoras, redes domésticas y equipo de oficina.',
  },
  {
    id: 'tech-002',
    technicianName: 'María Hernández',
    specialty: 'Instalaciones eléctricas',
    category: 'LUZ',
    rating: 4.8,
    completedJobs: 86,
    baseRate: 420,
    location: 'Las Guacamayas, Lázaro Cárdenas',
    description: 'Instalaciones, revisión de circuitos, iluminación y solución de fallas eléctricas residenciales.',
  },
  {
    id: 'tech-003',
    technicianName: 'Carlos Méndez',
    specialty: 'Mantenimiento del hogar',
    category: 'HOGAR',
    rating: 4.7,
    completedJobs: 64,
    baseRate: 300,
    location: 'La Orilla, Lázaro Cárdenas',
    description: 'Reparaciones generales, plomería básica, pintura y mantenimiento preventivo para el hogar.',
  },
  {
    id: 'tech-004',
    technicianName: 'Ana Martínez',
    specialty: 'Servicios especializados',
    category: 'OTROS',
    rating: 4.6,
    completedJobs: 48,
    baseRate: 280,
    location: 'Centro, Lázaro Cárdenas',
    description: 'Apoyo técnico personalizado para necesidades específicas y proyectos pequeños.',
  },
];

export async function getServices(category?: string, search?: string): Promise<Service[]> {
  const params = new URLSearchParams();
  if (category) params.set('categoria', category);
  if (search) params.set('buscar', search);

  try {
    const response = await api.get(`/api/servicios${params.toString() ? `?${params.toString()}` : ''}`);
    return response.data.servicios || response.data;
  } catch {
    const normalizedCategory = category?.toLowerCase();
    const normalizedSearch = search?.toLowerCase();
    return fallbackServices.filter(service =>
      (!normalizedCategory || service.category.toLowerCase() === normalizedCategory) &&
      (!normalizedSearch || `${service.technicianName} ${service.specialty} ${service.category}`.toLowerCase().includes(normalizedSearch)),
    );
  }
}

export async function getServiceById(id: string): Promise<Service | null> {
  try {
    const response = await api.get(`/api/servicios/${id}`);
    return response.data.servicio || response.data;
  } catch {
    return fallbackServices.find(service => service.id === id) || null;
  }
}
