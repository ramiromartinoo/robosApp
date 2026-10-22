package com.proyectApp.robosApp;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

// En el perfil de pruebas: hace falta 1 reporte vigente y 2 puntos para ser confiable; la cuenta, 7 días
class ReputacionTest extends PruebaDeIntegracion {

	private void registradoHaceUnMes(String token) throws Exception {
		jdbc.update("update usuarios set fecha_registro = now() - interval 30 day where id = ?", idDeUsuario(token));
	}

	private void votar(long posteoId, String token, String tipo) throws Exception {
		pedirConJson(post("/reportes/" + posteoId + "/confirmar"), token, "{\"tipo\":\"" + tipo + "\"}");
	}

	private String confianzaEnElFeed() throws Exception {
		return com.jayway.jsonpath.JsonPath.read(
				pedir(get("/reportes"), CLIENTE_2).andReturn().getResponse().getContentAsString(),
				"$.contenido[0].autorConfianza");
	}

	@Test
	@DisplayName("Una cuenta recién creada figura como nueva, aunque sus reportes estén confirmados")
	void cuentaNueva() throws Exception {
		long id = publicar(CLIENTE);
		votar(id, CLIENTE_2, "CONFIRMA");
		votar(id, CLIENTE_3, "CONFIRMA");

		pedir(get("/reportes"), CLIENTE_2).andExpect(jsonPath("$.contenido[0].autorConfianza").value("NUEVO"));
	}

	@Test
	@DisplayName("Con antigüedad y reportes confirmados, la cuenta pasa a ser confiable")
	void cuentaConfiable() throws Exception {
		registradoHaceUnMes(CLIENTE);
		long id = publicar(CLIENTE);
		votar(id, CLIENTE_2, "CONFIRMA");
		org.assertj.core.api.Assertions.assertThat(confianzaEnElFeed()).isEqualTo("NORMAL");

		votar(id, CLIENTE_3, "CONFIRMA");
		org.assertj.core.api.Assertions.assertThat(confianzaEnElFeed()).isEqualTo("CONFIABLE");
	}

	@Test
	@DisplayName("Una cuenta con reportes negados es dudosa para el administrador, pero el feed no la señala")
	void cuentaDudosa() throws Exception {
		registradoHaceUnMes(CLIENTE);
		long id = publicar(CLIENTE);
		votar(id, CLIENTE_2, "NIEGA");

		org.assertj.core.api.Assertions.assertThat(confianzaEnElFeed()).isEqualTo("NORMAL");
		pedir(get("/admin/reportes"), ADMIN).andExpect(jsonPath("$.contenido[0].autorConfianza").value("DUDOSO"));
		pedir(get("/admin/usuarios?size=50"), ADMIN)
				.andExpect(jsonPath("$.contenido[?(@.nombreVisible == 'Vecino de prueba')].confianza").value("DUDOSO"))
				.andExpect(jsonPath("$.contenido[?(@.nombreVisible == 'Vecino de prueba')].puntosDeConfianza").value(-1));
	}

	@Test
	@DisplayName("Que la moderación elimine un reporte resta puntos")
	void reporteEliminadoPorModeracion() throws Exception {
		registradoHaceUnMes(CLIENTE);
		long confirmado = publicar(CLIENTE);
		votar(confirmado, CLIENTE_2, "CONFIRMA");
		votar(confirmado, CLIENTE_3, "CONFIRMA");

		long denunciado = publicar(CLIENTE);
		pedirConJson(post("/reportes/" + denunciado + "/denunciar"), CLIENTE_2, "{\"motivo\":\"INFORMACION_FALSA\"}");
		pedirConJson(post("/admin/reportes/" + denunciado + "/denuncias/resolver"), ADMIN,
				"{\"resolucion\":\"ELIMINADO\"}");

		// 2 confirmaciones − 5 por el reporte eliminado = −3
		pedir(get("/admin/usuarios?size=50"), ADMIN)
				.andExpect(jsonPath("$.contenido[?(@.nombreVisible == 'Vecino de prueba')].puntosDeConfianza").value(-3));
	}

}
