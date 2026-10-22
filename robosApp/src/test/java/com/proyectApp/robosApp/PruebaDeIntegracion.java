package com.proyectApp.robosApp;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import com.jayway.jsonpath.JsonPath;

// Base de las pruebas de punta a punta: levanta el backend completo (con la seguridad) contra la base
// robosapp_test, y le hace pedidos HTTP como lo haría la app. Antes de cada prueba deja la base limpia.
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public abstract class PruebaDeIntegracion {

	// los usuarios de prueba que crea DatosDePrueba al arrancar
	protected static final String CLIENTE = "dev-cliente";
	protected static final String CLIENTE_2 = "dev-cliente-2";
	protected static final String CLIENTE_3 = "dev-cliente-3";
	protected static final String ADMIN = "dev-admin";

	private static final DateTimeFormatter FORMATO = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");

	@Autowired
	protected MockMvc mvc;

	@Autowired
	protected JdbcTemplate jdbc;

	@BeforeEach
	void dejarLaBaseLimpia() throws Exception {
		// primero lo que depende de los reportes; los usuarios y los términos se conservan
		jdbc.update("delete from confirmaciones");
		jdbc.update("delete from denuncias");
		jdbc.update("delete from posteos");
		jdbc.update("delete from sugerencias");
		jdbc.update("delete from aceptacion_terminos");
		// todas las cuentas de prueba activas, sin sanciones y recién registradas
		jdbc.update("update usuarios set estado = 'ACTIVO', advertencias = 0, fecha_registro = now()");
		for (String cliente : List.of(CLIENTE, CLIENTE_2, CLIENTE_3)) {
			aceptarTerminos(cliente);
		}
	}

	// Un pedido con el token del usuario, como lo manda la app
	protected ResultActions pedir(MockHttpServletRequestBuilder pedido, String token) throws Exception {
		return mvc.perform(pedido.header("Authorization", "Bearer " + token));
	}

	protected ResultActions pedirConJson(MockHttpServletRequestBuilder pedido, String token, String json)
			throws Exception {
		return pedir(pedido.contentType(MediaType.APPLICATION_JSON).content(json), token);
	}

	protected void aceptarTerminos(String token) throws Exception {
		Long vigentes = jdbc.queryForObject(
				"select id from terminos_condiciones order by fecha_publicacion desc, id desc limit 1", Long.class);
		pedirConJson(post("/terminos/aceptar"), token, "{\"terminosId\":" + vigentes + "}")
				.andExpect(status().isOk());
	}

	// Publica un reporte válido y devuelve su id
	protected long publicar(String token) throws Exception {
		String respuesta = pedirConJson(post("/reportes"), token, reporte("Me sacaron el celular en la parada"))
				.andExpect(status().isCreated())
				.andReturn().getResponse().getContentAsString();
		return idDe(respuesta);
	}

	protected String reporte(String descripcion) {
		return """
				{"descripcion":"%s","categoria":"ARREBATO","latitud":-38.00021,"longitud":-57.55512,
				 "fechaHoraIncidente":"%s"}
				""".formatted(descripcion, LocalDateTime.now().minusMinutes(5).format(FORMATO));
	}

	protected String fechaDeHaceUnRato() {
		return LocalDateTime.now().minusMinutes(5).format(FORMATO);
	}

	protected long idDe(String json) {
		return ((Number) JsonPath.read(json, "$.id")).longValue();
	}

	protected long idDeUsuario(String token) throws Exception {
		String sesion = mvc.perform(post("/auth/google").contentType(MediaType.APPLICATION_JSON)
				.content("{\"idToken\":\"" + token + "\"}"))
				.andReturn().getResponse().getContentAsString();
		return idDe(sesion);
	}

}
