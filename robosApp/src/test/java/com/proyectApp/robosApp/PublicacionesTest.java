package com.proyectApp.robosApp;

import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

class PublicacionesTest extends PruebaDeIntegracion {

	@Test
	@DisplayName("Pasado el máximo de publicaciones por hora, el siguiente reporte se rechaza con 429")
	void limiteDePublicacionesPorHora() throws Exception {
		// en el perfil de pruebas el máximo es 3
		for (int i = 0; i < 3; i++) {
			publicar(CLIENTE);
		}
		pedirConJson(post("/reportes"), CLIENTE, reporte("Uno de más"))
				.andExpect(status().isTooManyRequests());

		// el límite es por usuario: otro vecino puede seguir publicando
		publicar(CLIENTE_2);
	}

	@Test
	@DisplayName("Borrar un reporte no devuelve el cupo de publicaciones por hora")
	void borrarNoDevuelveElCupo() throws Exception {
		for (int i = 0; i < 3; i++) {
			long id = publicar(CLIENTE);
			pedir(delete("/reportes/" + id), CLIENTE).andExpect(status().isNoContent());
		}
		pedirConJson(post("/reportes"), CLIENTE, reporte("Otra vez")).andExpect(status().isTooManyRequests());
	}

	@Test
	@DisplayName("El feed muestra la ubicación aproximada y nunca los datos internos antiabuso")
	void elFeedNoExponeDatosInternos() throws Exception {
		pedir(post("/reportes").contentType(MediaType.APPLICATION_JSON)
				.header("X-Dispositivo", "telefono-de-prueba-1234")
				.content("""
						{"descripcion":"Reporte con datos internos","categoria":"HURTO",
						 "latitud":-38.00021,"longitud":-57.55512,"distanciaAlLugarM":120,
						 "fechaHoraIncidente":"%s"}
						""".formatted(fechaDeHaceUnRato())), CLIENTE)
				.andExpect(status().isCreated());

		pedir(get("/reportes"), CLIENTE_2)
				.andExpect(status().isOk())
				// redondeada a 3 decimales (unos 100 metros)
				.andExpect(jsonPath("$.contenido[0].latitud").value(-38.0))
				.andExpect(jsonPath("$.contenido[0].longitud").value(-57.555))
				.andExpect(jsonPath("$.contenido[0].ipPublicacion").doesNotExist())
				.andExpect(jsonPath("$.contenido[0].dispositivoId").doesNotExist())
				.andExpect(jsonPath("$.contenido[0].distanciaAlLugarM").doesNotExist());

		// el panel de administrador sí ve la distancia al lugar
		pedir(get("/admin/reportes"), ADMIN)
				.andExpect(jsonPath("$.contenido[0].distanciaAlLugarM").value(120));
	}

	@Test
	@DisplayName("Se puede publicar y filtrar un robo a comercio")
	void roboAComercio() throws Exception {
		pedirConJson(post("/reportes"), CLIENTE, """
				{"descripcion":"Asaltaron un kiosco","categoria":"ROBO_COMERCIO",
				 "latitud":-38.0,"longitud":-57.55,"fechaHoraIncidente":"%s"}
				""".formatted(fechaDeHaceUnRato()))
				.andExpect(status().isCreated());
		publicar(CLIENTE);

		pedir(get("/reportes").param("categoria", "ROBO_COMERCIO"), CLIENTE_2)
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.totalElementos").value(1))
				.andExpect(jsonPath("$.contenido[0].categoria").value("ROBO_COMERCIO"));
	}

	@Test
	@DisplayName("El feed se ordena por la hora del hecho o, si se pide, por la hora de publicación")
	void ordenDelFeed() throws Exception {
		long reciente = publicar(CLIENTE);
		// se publica después, pero el hecho ocurrió hace dos días
		String haceDosDias = LocalDateTime.now().minusDays(2).truncatedTo(ChronoUnit.SECONDS)
				.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
		String respuesta = pedirConJson(post("/reportes"), CLIENTE_2, """
				{"descripcion":"Lo reporto recién, pero pasó antes de ayer","categoria":"HURTO",
				 "latitud":-38.0,"longitud":-57.55,"fechaHoraIncidente":"%s"}
				""".formatted(haceDosDias))
				.andExpect(status().isCreated())
				.andReturn().getResponse().getContentAsString();
		long viejo = idDe(respuesta);

		// sin indicar el orden, manda la hora del hecho
		pedir(get("/reportes"), CLIENTE_3)
				.andExpect(jsonPath("$.contenido[0].id").value(reciente))
				.andExpect(jsonPath("$.contenido[1].id").value(viejo));
		pedir(get("/reportes").param("orden", "PUBLICACION"), CLIENTE_3)
				.andExpect(jsonPath("$.contenido[0].id").value(viejo))
				.andExpect(jsonPath("$.contenido[1].id").value(reciente));
		pedir(get("/reportes").param("orden", "CUALQUIERA"), CLIENTE_3)
				.andExpect(status().isBadRequest());
	}

	@Test
	@DisplayName("Un reporte con datos inválidos se rechaza con 400 y dice qué campo está mal")
	void datosInvalidos() throws Exception {
		pedirConJson(post("/reportes"), CLIENTE, """
				{"descripcion":"","categoria":"ARREBATO","latitud":-138,"longitud":-57.5,
				 "fechaHoraIncidente":"2099-01-01T00:00:00"}
				""")
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.errores.descripcion").exists())
				.andExpect(jsonPath("$.errores.latitud").exists())
				.andExpect(jsonPath("$.errores.fechaHoraIncidente").exists());
	}

	@Test
	@DisplayName("Solo el autor puede editar o eliminar su reporte")
	void soloElAutorEditaYElimina() throws Exception {
		long id = publicar(CLIENTE);
		String cambios = """
				{"descripcion":"Texto corregido","categoria":"HURTO","fechaHoraIncidente":"%s"}
				""".formatted(fechaDeHaceUnRato());

		pedirConJson(put("/reportes/" + id), CLIENTE_2, cambios).andExpect(status().isForbidden());
		pedir(delete("/reportes/" + id), CLIENTE_2).andExpect(status().isForbidden());

		pedirConJson(put("/reportes/" + id), CLIENTE, cambios)
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.descripcion").value("Texto corregido"));
		pedir(delete("/reportes/" + id), CLIENTE).andExpect(status().isNoContent());

		pedir(get("/reportes"), CLIENTE_2)
				.andExpect(jsonPath("$.contenido[*].id", not(hasItem((int) id))));
	}

	@Test
	@DisplayName("Nadie puede confirmar ni negar su propio reporte, y votar de nuevo lo anula")
	void votos() throws Exception {
		long id = publicar(CLIENTE);

		pedirConJson(post("/reportes/" + id + "/confirmar"), CLIENTE, "{\"tipo\":\"CONFIRMA\"}")
				.andExpect(status().isConflict());

		pedirConJson(post("/reportes/" + id + "/confirmar"), CLIENTE_2, "{\"tipo\":\"CONFIRMA\"}")
				.andExpect(jsonPath("$.confirmaciones").value(1));
		// cambiar el voto no suma otro
		pedirConJson(post("/reportes/" + id + "/confirmar"), CLIENTE_2, "{\"tipo\":\"NIEGA\"}")
				.andExpect(jsonPath("$.confirmaciones").value(0))
				.andExpect(jsonPath("$.negaciones").value(1));
		pedir(delete("/reportes/" + id + "/confirmar"), CLIENTE_2)
				.andExpect(jsonPath("$.negaciones").value(0))
				.andExpect(jsonPath("$.miVoto").doesNotExist());
	}

}
