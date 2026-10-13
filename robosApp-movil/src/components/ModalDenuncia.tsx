import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MotivoDenuncia } from '../api/tipos';
import { colores } from '../utils/tema';

const MOTIVOS: { valor: MotivoDenuncia; nombre: string }[] = [
  { valor: 'INFORMACION_FALSA', nombre: 'Es información falsa' },
  { valor: 'DATOS_PERSONALES', nombre: 'Muestra datos personales' },
  { valor: 'CONTENIDO_OFENSIVO', nombre: 'Es ofensivo' },
  { valor: 'SPAM', nombre: 'Es spam o publicidad' },
  { valor: 'OTRO', nombre: 'Otro motivo' },
];

type Props = {
  visible: boolean;
  onElegir: (motivo: MotivoDenuncia) => void;
  onCerrar: () => void;
};

// Hoja que sube desde abajo para elegir por qué se denuncia un reporte
export function ModalDenuncia({ visible, onElegir, onCerrar }: Props) {
  const margenes = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCerrar}>
      {/* tocar fuera de la hoja la cierra */}
      <Pressable style={styles.fondo} onPress={onCerrar}>
        <Pressable style={[styles.hoja, { paddingBottom: margenes.bottom + 16 }]} onPress={() => {}}>
          <Text style={styles.titulo}>¿Por qué denunciás este reporte?</Text>

          {MOTIVOS.map((motivo) => (
            <Pressable key={motivo.valor} style={styles.opcion} onPress={() => onElegir(motivo.valor)}>
              <Text style={styles.opcionTexto}>{motivo.nombre}</Text>
            </Pressable>
          ))}

          <Pressable style={styles.cancelar} onPress={onCerrar}>
            <Text style={styles.cancelarTexto}>Cancelar</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fondo: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
  },
  hoja: {
    backgroundColor: colores.superficie,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingHorizontal: 16,
    paddingTop: 20,
    gap: 10,
  },
  titulo: {
    fontSize: 19,
    fontWeight: '700',
    color: colores.texto,
    marginBottom: 6,
  },
  opcion: {
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 14,
  },
  opcionTexto: {
    fontSize: 17,
    color: colores.texto,
  },
  cancelar: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelarTexto: {
    fontSize: 17,
    fontWeight: '600',
    color: colores.textoSuave,
  },
});
