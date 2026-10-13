import Ionicons from '@expo/vector-icons/Ionicons';
import { ComponentProps } from 'react';

import { Categoria } from '../api/tipos';

type InfoDeCategoria = {
  nombre: string;
  // versión corta para los botones de la grilla al publicar
  nombreCorto: string;
  // color del texto de la etiqueta
  color: string;
  // fondo clarito de la etiqueta
  fondo: string;
  icono: ComponentProps<typeof Ionicons>['name'];
};

// En el orden en que se muestran al publicar
export const CATEGORIAS: Record<Categoria, InfoDeCategoria> = {
  ROBO_AUTO: {
    nombre: 'Robo de auto',
    nombreCorto: 'Robo de auto',
    color: '#1d5fa8',
    fondo: '#dceafb',
    icono: 'car-outline',
  },
  HURTO: { nombre: 'Hurto', nombreCorto: 'Hurto', color: '#6d4bc3', fondo: '#e9e3fb', icono: 'bag-handle-outline' },
  ARREBATO: { nombre: 'Arrebato', nombreCorto: 'Arrebato', color: '#c0392b', fondo: '#fde2e2', icono: 'flash-outline' },
  ROBO_DOMICILIO: {
    nombre: 'Robo a domicilio',
    nombreCorto: 'Domicilio',
    color: '#b4530a',
    fondo: '#fde9d3',
    icono: 'home-outline',
  },
  OTRO: { nombre: 'Otro', nombreCorto: 'Otro', color: '#4a5f57', fondo: '#e3ece8', icono: 'ellipsis-horizontal' },
};

export const LISTA_DE_CATEGORIAS = Object.keys(CATEGORIAS) as Categoria[];
