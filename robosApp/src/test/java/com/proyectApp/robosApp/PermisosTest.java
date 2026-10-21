package com.proyectApp.robosApp;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

class PermisosTest extends PruebaDeIntegracion {

	@Test
	@DisplayName("Sin token o con un token inválido no se puede usar la API")
	void sinTokenValido() throws Exception {
		mvc.perform(get("/reportes")).andExpect(status().isUnauthorized());
		pedir(get("/reportes"), "cualquiera").andExpect(status().isUnauthorized());
		// los términos se pueden leer sin estar registrado
		mvc.perform(get("/terminos/vigentes")).andExpect(status().isOk());
	}

	@Test
	@DisplayName("El panel de administrador es solo para administradores")
	void panelSoloParaAdmin() throws Exception {
		pedir(get("/admin/usuarios"), CLIENTE).andExpect(status().isForbidden());
		pedir(get("/admin/denuncias"), CLIENTE).andExpect(status().isForbidden());
		pedirConJson(post("/admin/terminos"), CLIENTE, "{\"version\":\"x\",\"texto\":\"x\"}")
				.andExpect(status().isForbidden());

		pedir(get("/admin/usuarios"), ADMIN).andExpect(status().isOk());
	}

	@Test
	@DisplayName("A un administrador no se lo puede suspender ni eliminar")
	void administradoresProtegidos() throws Exception {
		long admin = idDeUsuario(ADMIN);
		pedirConJson(put("/admin/usuarios/" + admin + "/estado"), ADMIN, "{\"estado\":\"BANEADO\"}")
				.andExpect(status().isConflict());
	}

	@Test
	@DisplayName("Un cliente que no aceptó los términos vigentes recibe 428 en todo lo demás")
	void terminosPendientes() throws Exception {
		jdbc.update("delete from aceptacion_terminos where usuario_id = ?", idDeUsuario(CLIENTE_3));

		pedir(get("/reportes"), CLIENTE_3).andExpect(status().isPreconditionRequired());
		// lo que necesita para aceptarlos sigue disponible
		pedir(get("/terminos/vigentes"), CLIENTE_3).andExpect(status().isOk());

		aceptarTerminos(CLIENTE_3);
		pedir(get("/reportes"), CLIENTE_3).andExpect(status().isOk());
	}

	@Test
	@DisplayName("Una cuenta suspendida o baneada queda bloqueada, pero el inicio de sesión le dice su estado")
	void cuentasBloqueadas() throws Exception {
		long cliente = idDeUsuario(CLIENTE);

		for (String estado : new String[] { "SUSPENDIDO", "BANEADO" }) {
			pedirConJson(put("/admin/usuarios/" + cliente + "/estado"), ADMIN, "{\"estado\":\"" + estado + "\"}")
					.andExpect(status().isOk());

			pedir(get("/reportes"), CLIENTE)
					.andExpect(status().isForbidden())
					.andExpect(jsonPath("$.errores.cuenta").value(estado));

			// como lo pide la app al abrir: con el token también en el encabezado
			pedir(post("/auth/google").contentType(MediaType.APPLICATION_JSON)
					.content("{\"idToken\":\"" + CLIENTE + "\"}"), CLIENTE)
					.andExpect(status().isOk())
					.andExpect(jsonPath("$.estado").value(estado));
		}

		pedirConJson(put("/admin/usuarios/" + cliente + "/estado"), ADMIN, "{\"estado\":\"ACTIVO\"}");
		pedir(get("/reportes"), CLIENTE).andExpect(status().isOk());
	}

}
