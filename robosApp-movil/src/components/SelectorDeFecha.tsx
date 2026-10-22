import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { fechaLegible } from '../utils/fechas';
import { colores, esOscuro } from '../utils/tema';

type Props = {
  fecha: Date;
  onCambio: (fecha: Date) => void;
};

// Cuándo ocurrió el hecho. Nunca deja elegir una fecha futura.
// En los dos sistemas se ve igual: una burbuja con "Hoy 13:30 hs" que al tocarla abre el selector.
export function SelectorDeFecha({ fecha, onCambio }: Props) {
  const margenes = useSafeAreaInsets();
  // solo iOS: hoja con el selector y la fecha que se está eligiendo (se aplica recién al tocar "Listo")
  const [hojaAbierta, setHojaAbierta] = useState(false);
  const [provisoria, setProvisoria] = useState(fecha);

  // si eligió hoy y una hora que todavía no pasó, se queda en "ahora"
  const sinFuturo = (elegida: Date) => (elegida > new Date() ? new Date() : elegida);

  // Android no tiene selector combinado: se pide primero el día y después la hora
  const elegirEnAndroid = () => {
    DateTimePickerAndroid.open({
      value: fecha,
      mode: 'date',
      maximumDate: new Date(),
      onChange: (evento, dia) => {
        if (evento.type !== 'set' || !dia) {
          return;
        }
        DateTimePickerAndroid.open({
          value: dia,
          mode: 'time',
          is24Hour: true,
          onChange: (eventoHora, conHora) => {
            if (eventoHora.type === 'set' && conHora) {
              onCambio(sinFuturo(conHora));
            }
          },
        });
      },
    });
  };

  const abrir = () => {
    if (Platform.OS === 'ios') {
      setProvisoria(fecha);
      setHojaAbierta(true);
    } else {
      elegirEnAndroid();
    }
  };

  return (
    <>
      <Pressable style={styles.boton} onPress={abrir}>
        <Ionicons name="time-outline" size={22} color={colores.primarioTexto} />
        <Text style={styles.botonTexto}>{fechaLegible(fecha)}</Text>
        <Text style={styles.cambiar}>Cambiar</Text>
      </Pressable>

      {Platform.OS === 'ios' && (
        <Modal
          visible={hojaAbierta}
          transparent
          animationType="slide"
          onRequestClose={() => setHojaAbierta(false)}>
          <Pressable style={styles.fondo} onPress={() => setHojaAbierta(false)}>
            <Pressable style={[styles.hoja, { paddingBottom: margenes.bottom + 12 }]} onPress={() => {}}>
              <View style={styles.barra}>
                <Pressable onPress={() => setHojaAbierta(false)} hitSlop={10}>
                  <Text style={styles.cancelar}>Cancelar</Text>
                </Pressable>
                <Text style={styles.titulo}>{fechaLegible(provisoria)}</Text>
                <Pressable
                  onPress={() => {
                    onCambio(sinFuturo(provisoria));
                    setHojaAbierta(false);
                  }}
                  hitSlop={10}>
                  <Text style={styles.listo}>Listo</Text>
                </Pressable>
              </View>
              <DateTimePicker
                value={provisoria}
                mode="datetime"
                display="spinner"
                maximumDate={new Date()}
                // "es-ES" y no "es-AR" a propósito: si coincide con la región del teléfono, iOS aplica la
                // preferencia de 12/24 h del usuario; con otra región en español muestra siempre 24 h
                locale="es-ES"
                themeVariant={esOscuro ? 'dark' : 'light'}
                onChange={(_evento, elegida) => elegida && setProvisoria(elegida)}
              />
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  boton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: colores.borde,
    backgroundColor: colores.superficie,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  botonTexto: {
    flex: 1,
    color: colores.texto,
    fontSize: 17,
  },
  cambiar: {
    color: colores.primarioTexto,
    fontSize: 15,
    fontWeight: '600',
  },
  fondo: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: colores.velo,
  },
  hoja: {
    backgroundColor: colores.superficie,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  barra: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titulo: {
    fontSize: 17,
    fontWeight: '700',
    color: colores.texto,
  },
  cancelar: {
    fontSize: 17,
    color: colores.textoSuave,
  },
  listo: {
    fontSize: 17,
    fontWeight: '700',
    color: colores.primarioTexto,
  },
});
