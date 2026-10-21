package com.proyectApp.robosApp;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class DenunciasTest extends PruebaDeIntegracion {

	private static final String DENUNCIA = "{\"motivo\":\"INFORMACION_FALSA\"}";

	private String estadoDe(long posteoId) {
		return jdbc.queryForObject("select estado from posteos where id = ?", String.class, posteoId);
	}

	@Test
	@DisplayName("Al llegar al umbral de denuncias pendientes, el reporte sale del feed")
	void autoOcultamiento() throws Exception {
		long id = publicar(CLIENTE);

		// en el perfil de pruebas el umbral es 2
		pedirConJson(post("/reportes/" + id + "/denunciar"), CLIENTE_2, DENUNCIA).andExpect(status().isCreated());
		assertThat(estadoDe(id)).isEqualTo("ACTIVO");
		pedir(get("/reportes"), CLIENTE_2).andExpect(jsonPath("$.contenido[*].id", hasItem((int) id)));

		pedirConJson(post("/reportes/" + id + "/denunciar"), CLIENTE_3, DENUNCIA).andExpect(status().isCreated());
		assertThat(estadoDe(id)).isEqualTo("EN_REVISION");
		pedir(get("/reportes"), CLIENTE_2).andExpect(jsonPath("$.contenido[*].id", not(hasItem((int) id))));
	}

	@Test
	@DisplayName("No se puede denunciar el reporte propio ni denunciar dos veces el mismo")
	void denunciasRepetidasOPropias() throws Exception {
		long id = publicar(CLIENTE);

		pedirConJson(post("/reportes/" + id + "/denunciar"), CLIENTE, DENUNCIA).andExpect(status().isConflict());
		pedirConJson(post("/reportes/" + id + "/denunciar"), CLIENTE_2, DENUNCIA).andExpect(status().isCreated());
		pedirConJson(post("/reportes/" + id + "/denunciar"), CLIENTE_2, DENUNCIA).andExpect(status().isConflict());
	}

	@Test
	@DisplayName("Descartar las denuncias devuelve al feed un reporte que estaba oculto")
	void descartarDenuncias() throws Exception {
		long id = publicar(CLIENTE);
		pedirConJson(post("/reportes/" + id + "/denunciar"), CLIENTE_2, DENUNCIA);
		pedirConJson(post("/reportes/" + id + "/denunciar"), CLIENTE_3, DENUNCIA);
		assertThat(estadoDe(id)).isEqualTo("EN_REVISION");

		pedirConJson(post("/admin/reportes/" + id + "/denuncias/resolver"), ADMIN, "{\"resolucion\":\"DESCARTADA\"}")
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.denunciasResueltas").value(2))
				.andExpect(jsonPath("$.estadoPosteo").value("ACTIVO"));

		pedir(get("/reportes"), CLIENTE_2).andExpect(jsonPath("$.contenido[*].id", hasItem((int) id)));
		// ya no quedan denuncias pendientes para resolver
		pedirConJson(post("/admin/reportes/" + id + "/denuncias/resolver"), ADMIN, "{\"resolucion\":\"DESCARTADA\"}")
				.andExpect(status().isConflict());
	}

	@Test
	@DisplayName("Advertir al autor le suma una advertencia; eliminar saca el reporte del feed")
	void advertirYEliminar() throws Exception {
		long advertido = publicar(CLIENTE);
		pedirConJson(post("/reportes/" + advertido + "/denunciar"), CLIENTE_2, DENUNCIA);
		pedirConJson(post("/admin/reportes/" + advertido + "/denuncias/resolver"), ADMIN,
				"{\"resolucion\":\"ADVERTENCIA\"}").andExpect(status().isOk());
		Integer advertencias = jdbc.queryForObject("select advertencias from usuarios where firebase_uid = ?",
				Integer.class, "dev-usuario-prueba");
		assertThat(advertencias).isEqualTo(1);

		long eliminado = publicar(CLIENTE);
		pedirConJson(post("/reportes/" + eliminado + "/denunciar"), CLIENTE_2, DENUNCIA);
		pedirConJson(post("/admin/reportes/" + eliminado + "/denuncias/resolver"), ADMIN,
				"{\"resolucion\":\"ELIMINADO\"}").andExpect(jsonPath("$.estadoPosteo").value("ELIMINADO"));
		pedir(get("/reportes"), CLIENTE_2).andExpect(jsonPath("$.contenido[*].id", not(hasItem((int) eliminado))));
	}

}
