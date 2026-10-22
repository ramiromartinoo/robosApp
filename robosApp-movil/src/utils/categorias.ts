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

// Cómo se muestra cada categoría del backend.
// ROBO_AUTO se presenta como "Robo de vehículo" para abarcar también motos y bicicletas:
// el nombre interno no cambia porque renombrarlo exige migrar la base de datos.
export const CATEGORIAS: Record<Categoria, InfoDeCategoria> = {
  ROBO_AUTO: {
    nombre: 'Robo de vehículo',
    nombreCorto: 'Robo de vehículo',
    color: '#1d5fa8',
    fondo: '#dceafb',
    icono: 'car-outline',
  },
  HURTO: { nombre: 'Hurto', nombreCorto: 'Hurto', color: '#6d4bc3', fondo: '#e9e3fb', icono: 'bag-handle-outline' },
  ARREBATO: { nombre: 'Arrebato', nombreCorto: 'Arrebato', color: '#c0392b', fondo: '#fde2e2', icono: 'flash-outline' },
  ROBO_DOMICILIO: {
    nombre: 'Robo a domicilio',
    nombreCorto: 'Robo a domicilio',
    color: '#b4530a',
    fondo: '#fde9d3',
    icono: 'home-outline',
  },
  ROBO_COMERCIO: {
    nombre: 'Robo a comercio',
    nombreCorto: 'Robo a comercio',
    color: '#0e7c86',
    fondo: '#d5f1f2',
    icono: 'storefront-outline',
  },
  // ya no se ofrece al publicar ni al filtrar; queda para mostrar los reportes viejos que la tienen
  OTRO: { nombre: 'Otro', nombreCorto: 'Otro', color: '#4a5f57', fondo: '#e3ece8', icono: 'ellipsis-horizontal' },
};

// Las que se pueden elegir al publicar, editar o filtrar, en el orden en que se muestran
export const LISTA_DE_CATEGORIAS: Categoria[] = ['ROBO_AUTO', 'HURTO', 'ARREBATO', 'ROBO_DOMICILIO', 'ROBO_COMERCIO'];
