package com.proyectApp.robosApp.config;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.proyectApp.robosApp.entity.Categoria;
import com.proyectApp.robosApp.entity.Confirmacion;
import com.proyectApp.robosApp.entity.Denuncia;
import com.proyectApp.robosApp.entity.MotivoDenuncia;
import com.proyectApp.robosApp.entity.Posteo;
import com.proyectApp.robosApp.entity.TipoConfirmacion;
import com.proyectApp.robosApp.entity.Usuario;
import com.proyectApp.robosApp.repository.ConfirmacionRepository;
import com.proyectApp.robosApp.repository.DenunciaRepository;
import com.proyectApp.robosApp.repository.PosteoRepository;
import com.proyectApp.robosApp.repository.UsuarioRepository;

import lombok.RequiredArgsConstructor;

// SOLO DESARROLLO: reemplaza todos los reportes por un conjunto de ejemplo creíble, para mostrar la app.
// Existe únicamente con robosapp.seguridad.tokens-de-prueba=true (application-local.yaml).
// Todo lo que carga es inventado: no describe hechos reales.
@Service
@ConditionalOnProperty(name = "robosapp.seguridad.tokens-de-prueba", havingValue = "true")
@RequiredArgsConstructor
public class DatosDeEjemplo {

	// Vecinos inventados que figuran como autores (no pueden iniciar sesión: no tienen token)
	private static final List<String> VECINOS = List.of(
			"Marcela R.", "Jorge P.", "Lucía F.", "Daniel M.", "Carolina S.", "Hernán G.");

	private final UsuarioRepository usuarioRepository;
	private final PosteoRepository posteoRepository;
	private final ConfirmacionRepository confirmacionRepository;
	private final DenunciaRepository denunciaRepository;

	// autor: índice en VECINOS, o -1 para el usuario de prueba dev-cliente-2 (así "Mis reportes" no queda vacío)
	private record Ejemplo(int autor, Categoria categoria, String descripcion, String zona,
			double latitud, double longitud, int minutosAtras, int confirman, int niegan) {
	}

	// Repartidos por barrios de Mar del Plata y por antigüedad, para que el feed, los filtros
	// y el mapa de calor (3 horas, 1 día, 7 días) tengan algo que mostrar
	private static final List<Ejemplo> EJEMPLOS = List.of(
			new Ejemplo(0, Categoria.ARREBATO,
					"Dos personas en una moto negra me arrebataron el celular mientras esperaba el colectivo. Los dos con casco y campera oscura. Se fueron hacia la costa.",
					"Av. Luro al 3200, Centro", -38.0004, -57.5546, 25, 5, 0),
			new Ejemplo(1, Categoria.HURTO,
					"En un local de la peatonal sacaron un celular del mostrador mientras atendían. Era un hombre solo, de gorra roja y mochila gris.",
					"San Martín al 2500, Centro", -37.9990, -57.5490, 70, 0, 0),
			new Ejemplo(2, Categoria.ROBO_AUTO,
					"Tres encapuchados vestidos de negro se llevaron una camioneta blanca que estaba estacionada. Uno se quedó vigilando en la esquina.",
					"Alem al 3600, Playa Grande", -38.0262, -57.5368, 140, 5, 0),
			new Ejemplo(-1, Categoria.ARREBATO,
					"A una señora le sacaron la cartera de un tirón al salir del supermercado. Era un chico joven, de buzo gris con capucha, que escapó corriendo.",
					"Güemes al 2900, Güemes", -38.0152, -57.5441, 300, 3, 0),
			new Ejemplo(3, Categoria.ROBO_DOMICILIO,
					"Entraron a una casa por el fondo mientras los dueños no estaban. Los vecinos vieron a dos hombres con ropa de trabajo saliendo con bolsos.",
					"Rodríguez Peña al 4100, Los Troncos", -38.0211, -57.5573, 420, 4, 1),
			new Ejemplo(4, Categoria.HURTO,
					"Rompieron el vidrio de un auto estacionado y se llevaron una mochila del asiento de atrás. Nadie llegó a ver quién fue.",
					"Av. Colón al 2300, Centro", -38.0042, -57.5521, 600, 2, 0),
			new Ejemplo(5, Categoria.ARREBATO,
					"Me sacaron la bicicleta entre dos en la bicisenda. Uno con camiseta de fútbol celeste y el otro con campera verde militar.",
					"Av. Patricio Peralta Ramos al 5200, Varese", -38.0178, -57.5330, 900, 4, 0),
			new Ejemplo(0, Categoria.ROBO_AUTO,
					"Se llevaron un auto gris chico de la puerta de un edificio. Las cámaras muestran a una sola persona, alta, con campera inflable azul.",
					"Av. Independencia al 1800, La Perla", -37.9921, -57.5512, 1300, 1, 0),
			new Ejemplo(1, Categoria.HURTO,
					"En la parada del colectivo le abrieron la mochila a un estudiante y le sacaron la billetera. Eran dos mujeres que subieron enseguida a otro colectivo.",
					"Av. Juan B. Justo al 3000, Puerto", -38.0331, -57.5560, 1700, 0, 2),
			new Ejemplo(2, Categoria.ROBO_DOMICILIO,
					"Forzaron la puerta de un departamento en planta baja durante la madrugada. Se llevaron un televisor y herramientas.",
					"Av. Constitución al 5600, Constitución", -37.9702, -57.5586, 2300, 3, 0),
			new Ejemplo(3, Categoria.ARREBATO,
					"Un motochorro de casco blanco y campera roja le arrebató el celular a una chica que caminaba hablando por teléfono.",
					"Av. Luro al 3300, Centro", -38.0001, -57.5552, 2900, 5, 0),
			new Ejemplo(-1, Categoria.OTRO,
					"Hay dos personas probando las puertas de los autos estacionados en la cuadra. Uno de buzo naranja y otro de campera negra.",
					"Av. Edison al 800, Punta Mogotes", -38.0655, -57.5501, 3600, 2, 1),
			new Ejemplo(4, Categoria.ROBO_AUTO,
					"Robaron una moto roja que estaba atada a un poste. Los vieron cargarla en una camioneta blanca con caja.",
					"Av. Champagnat al 1500, Don Bosco", -37.9840, -57.5800, 4400, 4, 0),
			new Ejemplo(5, Categoria.HURTO,
					"Sacaron una notebook de una mesa de la vereda de un café en un descuido. Hombre de unos 40 años, de camisa a cuadros.",
					"Olavarría al 2800, Güemes", -38.0161, -57.5425, 5300, 1, 0),
			new Ejemplo(0, Categoria.ROBO_DOMICILIO,
					"Intentaron entrar por una ventana y se fueron cuando sonó la alarma. Eran tres, todos con gorra y ropa oscura.",
					"Formosa al 600, Chauvin", -38.0105, -57.5648, 6200, 5, 0),
			new Ejemplo(1, Categoria.ARREBATO,
					"A un repartidor le sacaron el celular del soporte de la moto en un semáforo. Dos en otra moto, sin patente visible.",
					"Av. Jara al 1200, San Juan", -37.9935, -57.5702, 7400, 3, 0),
			new Ejemplo(2, Categoria.HURTO,
					"Se llevaron dos bicicletas del palier de un edificio. La puerta de entrada había quedado mal cerrada.",
					"Bolívar al 3400, Centro", -38.0031, -57.5568, 8600, 0, 0),
			new Ejemplo(3, Categoria.OTRO,
					"Están ofreciendo de casa en casa una supuesta revisión del gas y piden entrar. No tienen identificación de ninguna empresa.",
					"Av. Fortunato de la Plaza al 4500, Peralta Ramos Oeste", -38.0352, -57.5842, 9500, 3, 2));

	// Qué reporte de la lista recibe denuncias de ejemplo, para que el panel admin tenga algo que resolver
	private static final int EJEMPLO_DENUNCIADO = 8;

	@Transactional
	public Map<String, Integer> reiniciar() {
		// primero lo que depende de los reportes
		confirmacionRepository.deleteAllInBatch();
		denunciaRepository.deleteAllInBatch();
		posteoRepository.deleteAllInBatch();

		List<Usuario> vecinos = new ArrayList<>();
		for (int i = 0; i < VECINOS.size(); i++) {
			vecinos.add(vecino("ejemplo-" + (i + 1), "ejemplo" + (i + 1) + "@robosapp.local", VECINOS.get(i)));
		}
		Usuario usuarioDePrueba = usuarioRepository.findByFirebaseUid(DatosDePrueba.UID_CLIENTE_2).orElseThrow();

		LocalDateTime ahora = LocalDateTime.now();
		int confirmaciones = 0;
		List<Posteo> posteos = new ArrayList<>();
		for (Ejemplo ejemplo : EJEMPLOS) {
			Usuario autor = ejemplo.autor() < 0 ? usuarioDePrueba : vecinos.get(ejemplo.autor());
			Posteo posteo = new Posteo();
			posteo.setUsuario(autor);
			posteo.setCategoria(ejemplo.categoria());
			posteo.setDescripcion(ejemplo.descripcion());
			posteo.setZona(ejemplo.zona());
			posteo.setLatitud(ejemplo.latitud());
			posteo.setLongitud(ejemplo.longitud());
			posteo.setFechaHoraIncidente(ahora.minusMinutes(ejemplo.minutosAtras()));
			posteos.add(posteoRepository.save(posteo));

			// votan los demás vecinos: primero los que confirman, después los que niegan
			List<Usuario> votantes = vecinos.stream().filter(vecino -> !vecino.equals(autor)).toList();
			for (int i = 0; i < Math.min(ejemplo.confirman() + ejemplo.niegan(), votantes.size()); i++) {
				Confirmacion voto = new Confirmacion();
				voto.setPosteo(posteo);
				voto.setUsuario(votantes.get(i));
				voto.setTipo(i < ejemplo.confirman() ? TipoConfirmacion.CONFIRMA : TipoConfirmacion.NIEGA);
				voto.setFecha(ahora);
				confirmacionRepository.save(voto);
				confirmaciones++;
			}
		}

		Posteo denunciado = posteos.get(EJEMPLO_DENUNCIADO);
		denunciar(denunciado, vecinos.get(3), MotivoDenuncia.INFORMACION_FALSA, "Estuve ahí a esa hora y no pasó nada.");
		denunciar(denunciado, vecinos.get(4), MotivoDenuncia.DATOS_PERSONALES, null);

		return Map.of("usuariosDeEjemplo", vecinos.size(), "reportes", posteos.size(),
				"votos", confirmaciones, "denuncias", 2);
	}

	private Usuario vecino(String uid, String email, String nombre) {
		return usuarioRepository.findByFirebaseUid(uid).orElseGet(() -> {
			Usuario usuario = new Usuario();
			usuario.setFirebaseUid(uid);
			usuario.setEmail(email);
			usuario.setNombreVisible(nombre);
			return usuarioRepository.save(usuario);
		});
	}

	private void denunciar(Posteo posteo, Usuario denunciante, MotivoDenuncia motivo, String comentario) {
		Denuncia denuncia = new Denuncia();
		denuncia.setPosteo(posteo);
		denuncia.setUsuarioDenunciante(denunciante);
		denuncia.setMotivo(motivo);
		denuncia.setComentario(comentario);
		denunciaRepository.save(denuncia);
	}

}
