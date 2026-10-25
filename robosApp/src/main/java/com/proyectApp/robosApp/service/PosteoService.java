package com.proyectApp.robosApp.service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.EnumMap;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.proyectApp.robosApp.dto.CrearPosteoRequest;
import com.proyectApp.robosApp.dto.EditarPosteoRequest;
import com.proyectApp.robosApp.dto.MiPosteoResponse;
import com.proyectApp.robosApp.dto.PaginaResponse;
import com.proyectApp.robosApp.dto.PosteoResponse;
import com.proyectApp.robosApp.dto.PuntoHeatmapResponse;
import com.proyectApp.robosApp.entity.Categoria;
import com.proyectApp.robosApp.entity.EstadoPosteo;
import com.proyectApp.robosApp.entity.NivelDeConfianza;
import com.proyectApp.robosApp.entity.Posteo;
import com.proyectApp.robosApp.entity.TipoConfirmacion;
import com.proyectApp.robosApp.entity.Usuario;
import com.proyectApp.robosApp.exception.AccesoDenegadoException;
import com.proyectApp.robosApp.exception.ConflictoException;
import com.proyectApp.robosApp.exception.DemasiadasPeticionesException;
import com.proyectApp.robosApp.exception.PeticionInvalidaException;
import com.proyectApp.robosApp.exception.RecursoNoEncontradoException;
import com.proyectApp.robosApp.repository.ConfirmacionRepository;
import com.proyectApp.robosApp.repository.ConteoConfirmaciones;
import com.proyectApp.robosApp.repository.PosteoRepository;
import com.proyectApp.robosApp.service.ReputacionService.Reputacion;

@Service
public class PosteoService {

	private static final int DIAS_MAXIMOS_HEATMAP = 365;
	// radio mínimo: con radios muy chicos se podría ir acotando la ubicación de un reporte
	private static final double RADIO_MINIMO_KM = 0.5;
	private static final double RADIO_MAXIMO_KM = 50;
	private static final double KM_POR_GRADO = 111.0;
	private static final double MARGEN_GRADOS = 0.001;
	// identificador de dispositivo que genera la app: letras, números y guiones
	private static final Pattern FORMATO_DE_DISPOSITIVO = Pattern.compile("[A-Za-z0-9-]{8,64}");

	private final PosteoRepository posteoRepository;
	private final ConfirmacionRepository confirmacionRepository;
	private final UsuarioActualService usuarioActualService;
	private final ReputacionService reputacionService;
	private final int maximoPorHora;
	private final int minutosParaEditar;

	public PosteoService(PosteoRepository posteoRepository, ConfirmacionRepository confirmacionRepository,
			UsuarioActualService usuarioActualService, ReputacionService reputacionService,
			@Value("${robosapp.posteos.maximo-por-hora:5}") int maximoPorHora,
			@Value("${robosapp.posteos.minutos-para-editar:10}") int minutosParaEditar) {
		this.posteoRepository = posteoRepository;
		this.confirmacionRepository = confirmacionRepository;
		this.usuarioActualService = usuarioActualService;
		this.reputacionService = reputacionService;
		this.maximoPorHora = maximoPorHora;
		this.minutosParaEditar = minutosParaEditar;
	}

	@Transactional
	// ip y dispositivo son datos internos para detectar abuso: se guardan pero nunca se devuelven en el feed
	public PosteoResponse crear(CrearPosteoRequest request, String ip, String dispositivo) {
		Usuario usuario = usuarioActualService.obtener();
		// cuenta también los eliminados: borrar y volver a publicar no esquiva el límite
		long recientes = posteoRepository.countByUsuarioIdAndFechaHoraPublicacionAfter(
				usuario.getId(), LocalDateTime.now().minusHours(1));
		if (recientes >= maximoPorHora) {
			throw new DemasiadasPeticionesException(
					"Llegaste al máximo de " + maximoPorHora + " publicaciones por hora. Probá de nuevo más tarde");
		}

		Posteo posteo = new Posteo();
		posteo.setUsuario(usuario);
		copiarDatos(request, posteo);
		posteo.setIpPublicacion(ip);
		posteo.setDispositivoId(dispositivoValido(dispositivo));
		posteo.setDistanciaAlLugarM(request.distanciaAlLugarM());
		Posteo guardado = posteoRepository.save(posteo);
		NivelDeConfianza confianza = reputacionService.deUsuarios(List.of(usuario.getId()))
				.get(usuario.getId()).nivelPublico();
		return PosteoResponse.desde(guardado, 0, 0, null, true, confianza);
	}

	// Los posteos del usuario actual, incluidos los que están en revisión (los eliminados no)
	@Transactional(readOnly = true)
	public PaginaResponse<MiPosteoResponse> mios(int pagina, int tamanio) {
		Page<Posteo> posteos = posteoRepository.findByUsuarioIdAndEstadoNot(
				usuarioActualService.obtener().getId(), EstadoPosteo.ELIMINADO,
				Paginacion.masRecientesPrimero(pagina, tamanio, "fechaHoraPublicacion"));
		Map<Long, Map<TipoConfirmacion, Long>> conteos = conteosDe(posteos.getContent());
		return PaginaResponse.desde(posteos.map(posteo -> miPosteo(posteo, conteos)));
	}

	@Transactional
	public MiPosteoResponse editar(Long id, EditarPosteoRequest request) {
		Posteo posteo = buscarPropio(id);
		if (segundosParaEditar(posteo) == 0) {
			throw new ConflictoException(
					"Solo se puede editar durante los primeros " + minutosParaEditar + " minutos");
		}
		posteo.setDescripcion(request.descripcion().trim());
		posteo.setCategoria(request.categoria());
		posteo.setFechaHoraIncidente(request.fechaHoraIncidente());
		return miPosteo(posteo, conteosDe(List.of(posteo)));
	}

	private MiPosteoResponse miPosteo(Posteo posteo, Map<Long, Map<TipoConfirmacion, Long>> conteos) {
		Map<TipoConfirmacion, Long> delPosteo = conteos.getOrDefault(posteo.getId(), Map.of());
		return MiPosteoResponse.desde(posteo,
				delPosteo.getOrDefault(TipoConfirmacion.CONFIRMA, 0L),
				delPosteo.getOrDefault(TipoConfirmacion.NIEGA, 0L),
				segundosParaEditar(posteo));
	}

	// 0 si ya venció la ventana de edición
	private long segundosParaEditar(Posteo posteo) {
		LocalDateTime limite = posteo.getFechaHoraPublicacion().plusMinutes(minutosParaEditar);
		return Math.max(0, Duration.between(LocalDateTime.now(), limite).getSeconds());
	}

	// Borrado lógico: el posteo deja de verse pero queda en la base
	@Transactional
	public void eliminar(Long id) {
		buscarPropio(id).setEstado(EstadoPosteo.ELIMINADO);
	}

	private Posteo buscarPropio(Long id) {
		Posteo posteo = posteoRepository.findById(id)
				.filter(p -> p.getEstado() != EstadoPosteo.ELIMINADO)
				.orElseThrow(() -> new RecursoNoEncontradoException("El posteo no existe"));
		if (!posteo.getUsuario().getId().equals(usuarioActualService.obtener().getId())) {
			throw new AccesoDenegadoException("Solo podés modificar tus propias publicaciones");
		}
		return posteo;
	}

	// El identificador lo manda la app: si no tiene la forma esperada se descarta en vez de guardar cualquier cosa
	private String dispositivoValido(String dispositivo) {
		return dispositivo != null && FORMATO_DE_DISPOSITIVO.matcher(dispositivo).matches() ? dispositivo : null;
	}

	private void copiarDatos(CrearPosteoRequest request, Posteo posteo) {
		posteo.setDescripcion(request.descripcion().trim());
		posteo.setCategoria(request.categoria());
		posteo.setLatitud(request.latitud());
		posteo.setLongitud(request.longitud());
		posteo.setZona(request.zona() == null || request.zona().isBlank() ? null : request.zona().trim());
		posteo.setFechaHoraIncidente(request.fechaHoraIncidente());
	}

	// lat, lng y radioKm son opcionales, pero van los tres juntos o ninguno
	@Transactional(readOnly = true)
	public PaginaResponse<PosteoResponse> feed(Categoria categoria, Double lat, Double lng, Double radioKm,
			OrdenDelFeed orden, int pagina, int tamanio) {
		Pageable pageable = Paginacion.masRecientesPrimero(pagina, tamanio, orden.campoFecha());

		Page<Posteo> posteos;
		if (lat != null || lng != null || radioKm != null) {
			posteos = cercanos(categoria, lat, lng, radioKm, pageable);
		} else if (categoria != null) {
			posteos = posteoRepository.findByEstadoAndCategoria(EstadoPosteo.ACTIVO, categoria, pageable);
		} else {
			posteos = posteoRepository.findByEstado(EstadoPosteo.ACTIVO, pageable);
		}
		return PaginaResponse.desde(
				new PageImpl<>(conConteos(posteos.getContent()), pageable, posteos.getTotalElements()));
	}

	private Page<Posteo> cercanos(Categoria categoria, Double lat, Double lng, Double radioKm, Pageable pageable) {
		if (lat == null || lng == null || radioKm == null) {
			throw new PeticionInvalidaException("Para filtrar por distancia hay que mandar lat, lng y radio");
		}
		if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
			throw new PeticionInvalidaException("La ubicación indicada no es válida");
		}
		if (radioKm < RADIO_MINIMO_KM || radioKm > RADIO_MAXIMO_KM) {
			throw new PeticionInvalidaException(
					"El radio tiene que estar entre " + RADIO_MINIMO_KM + " y " + RADIO_MAXIMO_KM + " km");
		}

		// rectángulo que contiene al círculo, con un pequeño margen por el redondeo de coordenadas
		double deltaLat = radioKm / KM_POR_GRADO + MARGEN_GRADOS;
		double deltaLng = radioKm / (KM_POR_GRADO * Math.cos(Math.toRadians(lat))) + MARGEN_GRADOS;
		return posteoRepository.buscarCercanos(EstadoPosteo.ACTIVO, categoria, lat, lng, radioKm,
				lat - deltaLat, lat + deltaLat, lng - deltaLng, lng + deltaLng, pageable);
	}

	// Suma a cada posteo cuántos lo confirmaron y cuántos lo negaron, y qué votó el usuario actual.
	// También la reputación de cada autor. Son pocas consultas para toda la lista, no varias por posteo.
	private List<PosteoResponse> conConteos(List<Posteo> posteos) {
		if (posteos.isEmpty()) {
			return List.of();
		}
		Long usuarioId = usuarioActualService.obtener().getId();
		List<Long> ids = posteos.stream().map(Posteo::getId).toList();

		Map<Long, Map<TipoConfirmacion, Long>> conteos = conteosDe(posteos);
		Map<Long, TipoConfirmacion> misVotos = new HashMap<>();
		confirmacionRepository.votosDelUsuario(usuarioId, ids)
				.forEach(voto -> misVotos.put(voto.getPosteo().getId(), voto.getTipo()));
		Map<Long, Reputacion> reputaciones = reputacionService
				.deUsuarios(posteos.stream().map(posteo -> posteo.getUsuario().getId()).distinct().toList());

		return posteos.stream().map(posteo -> {
			Map<TipoConfirmacion, Long> delPosteo = conteos.getOrDefault(posteo.getId(), Map.of());
			return PosteoResponse.desde(posteo,
					delPosteo.getOrDefault(TipoConfirmacion.CONFIRMA, 0L),
					delPosteo.getOrDefault(TipoConfirmacion.NIEGA, 0L),
					misVotos.get(posteo.getId()),
					posteo.getUsuario().getId().equals(usuarioId),
					reputaciones.get(posteo.getUsuario().getId()).nivelPublico());
		}).toList();
	}

	// Confirmaciones y negaciones de cada posteo de la lista, con una sola consulta
	private Map<Long, Map<TipoConfirmacion, Long>> conteosDe(List<Posteo> posteos) {
		Map<Long, Map<TipoConfirmacion, Long>> conteos = new HashMap<>();
		if (posteos.isEmpty()) {
			return conteos;
		}
		List<Long> ids = posteos.stream().map(Posteo::getId).toList();
		for (ConteoConfirmaciones conteo : confirmacionRepository.contarPorPosteo(ids)) {
			conteos.computeIfAbsent(conteo.posteoId(), id -> new EnumMap<>(TipoConfirmacion.class))
					.put(conteo.tipo(), conteo.cantidad());
		}
		return conteos;
	}

	// El período se puede pedir en horas o en días; si vienen los dos, mandan las horas
	@Transactional(readOnly = true)
	public List<PuntoHeatmapResponse> heatmap(int dias, Integer horas, Categoria categoria) {
		// igual que el feed: cuenta por la hora real del hecho
		LocalDateTime desde = horas != null
				? LocalDateTime.now().minusHours(Math.clamp(horas, 1, DIAS_MAXIMOS_HEATMAP * 24))
				: LocalDateTime.now().minusDays(Math.clamp(dias, 1, DIAS_MAXIMOS_HEATMAP));
		return posteoRepository.heatmap(EstadoPosteo.ACTIVO, desde, categoria);
	}

}
