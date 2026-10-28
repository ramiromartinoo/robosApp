package com.proyectApp.robosApp.dto;

import java.util.List;

import com.proyectApp.robosApp.entity.EstadoUsuario;
import com.proyectApp.robosApp.entity.Usuario;

// Otras cuentas que publicaron desde el mismo teléfono o la misma conexión que un usuario.
// Sirve para detectar a alguien que usa varias cuentas para publicar reportes falsos.
public record CuentasRelacionadasResponse(
		// indicio fuerte: el mismo teléfono (la misma instalación de la app)
		List<CuentaRelacionada> mismoTelefono,
		// indicio débil: la misma IP. Pasa también con familias o vecinos que comparten wifi,
		// y con compañías de celular que reparten una misma IP entre muchos clientes.
		List<CuentaRelacionada> mismaConexion) {

	public record CuentaRelacionada(Long id, String nombreVisible, EstadoUsuario estado) {

		public static CuentaRelacionada desde(Usuario usuario) {
			return new CuentaRelacionada(usuario.getId(), usuario.getNombreVisible(), usuario.getEstado());
		}

	}

}
