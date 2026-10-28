package com.proyectApp.robosApp;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class AntecedentesTest extends PruebaDeIntegracion {

	private void resolverDenuncia(long posteoId, String resolucion) throws Exception {
		pedirConJson(post("/reportes/" + posteoId + "/denunciar"), CLIENTE_2, "{\"motivo\":\"INFORMACION_FALSA\"}");
		pedirConJson(post("/admin/reportes/" + posteoId + "/denuncias/resolver"), ADMIN,
				"{\"resolucion\":\"" + resolucion + "\"}");
	}

	@Test
	@DisplayName("El administrador ve cuántos reportes le eliminó la moderación a cada usuario y sus advertencias")
	void antecedentesEnElPanel() throws Exception {
		publicar(CLIENTE);
		resolverDenuncia(publicar(CLIENTE), "ELIMINADO");
		resolverDenuncia(publicar(CLIENTE), "ADVERTENCIA");

		String vecino = "$.contenido[?(@.nombreVisible == 'Vecino de prueba')]";
		pedir(get("/admin/usuarios?size=50"), ADMIN)
				.andExpect(jsonPath(vecino + ".reportesVigentes").value(2))
				.andExpect(jsonPath(vecino + ".reportesEliminados").value(1))
				.andExpect(jsonPath(vecino + ".advertencias").value(1));
		pedir(get("/admin/reportes"), ADMIN)
				.andExpect(jsonPath("$.contenido[0].antecedentesDelAutor.reportesEliminados").value(1))
				.andExpect(jsonPath("$.contenido[0].antecedentesDelAutor.advertencias").value(1));
	}

	@Test
	@DisplayName("En el feed no aparecen antecedentes ni votos de nadie")
	void elFeedNoMuestraAntecedentes() throws Exception {
		publicar(CLIENTE);

		pedir(get("/reportes"), CLIENTE_2)
				.andExpect(jsonPath("$.contenido[0].antecedentesDelAutor").doesNotExist())
				.andExpect(jsonPath("$.contenido[0].confirmaciones").doesNotExist())
				.andExpect(jsonPath("$.contenido[0].autorConfianza").doesNotExist());
	}

}
