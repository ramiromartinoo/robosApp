import Ionicons from '@expo/vector-icons/Ionicons';
import { ComponentProps } from 'react';

import { Categoria } from '../api/tipos';
import { esOscuro } from './tema';

type InfoDeCategoria = {
  nombre: string;
  // versión corta para los botones de la grilla al publicar
  nombreCorto: string;
  // color del texto de la etiqueta
  color: string;
  // fondo de la etiqueta: clarito en el modo claro, oscuro en el oscuro
  fondo: string;
  icono: ComponentProps<typeof Ionicons>['name'];
};

// En el modo oscuro el texto va en un tono claro y el fondo en uno oscuro del mismo color
function tono(claro: string, oscuro: string): string {
  return esOscuro ? oscuro : claro;
}

// Cómo se muestra cada categoría del backend.
// ROBO_AUTO se presenta como "Robo de vehículo" para abarcar también motos y bicicletas:
// el nombre interno no cambia porque renombrarlo exige migrar la base de datos.
export const CATEGORIAS: Record<Categoria, InfoDeCategoria> = {
  ROBO_AUTO: {
    nombre: 'Robo de vehículo',
    nombreCorto: 'Robo de vehículo',
    color: tono('#1d5fa8', '#7fb3f0'),
    fondo: tono('#dceafb', '#1a2d45'),
    icono: 'car-outline',
  },
  HURTO: {
    nombre: 'Hurto',
    nombreCorto: 'Hurto',
    color: tono('#6d4bc3', '#b9a3f5'),
    fondo: tono('#e9e3fb', '#2a2245'),
    icono: 'bag-handle-outline',
  },
  ARREBATO: {
    nombre: 'Arrebato',
    nombreCorto: 'Arrebato',
    color: tono('#c0392b', '#f08a7e'),
    fondo: tono('#fde2e2', '#3d1f1c'),
    icono: 'flash-outline',
  },
  ROBO_DOMICILIO: {
    nombre: 'Robo a domicilio',
    nombreCorto: 'Robo a domicilio',
    color: tono('#b4530a', '#f2a463'),
    fondo: tono('#fde9d3', '#3d2814'),
    icono: 'home-outline',
  },
  ROBO_COMERCIO: {
    nombre: 'Robo a comercio',
    nombreCorto: 'Robo a comercio',
    color: tono('#0e7c86', '#6fd3dc'),
    fondo: tono('#d5f1f2', '#143538'),
    icono: 'storefront-outline',
  },
  // ya no se ofrece al publicar ni al filtrar; queda para mostrar los reportes viejos que la tienen
  OTRO: {
    nombre: 'Otro',
    nombreCorto: 'Otro',
    color: tono('#4a5f57', '#a9bdb5'),
    fondo: tono('#e3ece8', '#26332e'),
    icono: 'ellipsis-horizontal',
  },
};

// Las que se pueden elegir al publicar, editar o filtrar, en el orden en que se muestran
export const LISTA_DE_CATEGORIAS: Categoria[] = ['ROBO_AUTO', 'HURTO', 'ARREBATO', 'ROBO_DOMICILIO', 'ROBO_COMERCIO'];
