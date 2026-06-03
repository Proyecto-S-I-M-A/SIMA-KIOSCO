/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Medication {
    id: string;
    name: string;
    dose: string;
    doctor: string;
    hospital: string;
    code: string;
    date: string;
    price: number;
    image: string;
    contact?: string;
    ruc?: string;
}

export const MEDICATIONS: Medication[] = [
    {
        id: '1',
        name: 'Amoxicilina 500mg',
        dose: 'Tratamiento de 7 días - 21 Cápsulas',
        doctor: 'Dr. Ricardo Espinoza',
        hospital: 'Hospital Metropolitano',
        code: 'RX-4410-L',
        date: '15 Oct 2024',
        price: 18.50,
        image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=400&h=400&auto=format&fit=crop',
        ruc: '1712458963001',
        contact: '+593 2-394-5600'
    },
    {
        id: '2',
        name: 'Ibuprofeno 600mg',
        dose: 'Uso según necesidad - 10 Tabletas',
        doctor: 'Dra. Maria Belén Ruiz',
        hospital: 'Clínica San Francisco',
        code: 'RX-8829-Z',
        date: '12 Oct 2024',
        price: 12.20,
        image: 'https://images.unsplash.com/photo-1576071804486-b8bc22106dbf?q=80&w=400&h=400&auto=format&fit=crop',
        ruc: '0918742531001',
        contact: 'm.ruiz@clinicasf.med'
    },
    {
        id: '3',
        name: 'Paracetamol 1g',
        dose: 'Dosis: SOS dolor',
        doctor: 'Dr. Pepe Ariaz',
        hospital: 'Clínica Central',
        code: 'RX-9901-K',
        date: '18 Oct 2024',
        price: 8.40,
        image: 'https://images.unsplash.com/photo-1471864190281-ad5f9f81ce4c?q=80&w=400&h=400&auto=format&fit=crop'
    }
];
