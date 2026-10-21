package com.proyectApp.robosApp.service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.proyectApp.robosApp.entity.EstadoPosteo;
import com.proyectApp.robosApp.entity.NivelDeConfianza;
import com.proyectApp.robosApp.entity.ResolucionDenuncia;
import com.proyectApp.robosApp.entity.TipoConfirmacion;
import com.proyectApp.robosApp.entity.Usuario;
import com.proyectApp.robosApp.repository.ConfirmacionRepository;
import com.proyectApp.robosApp.repository.ConteoPorUsuario;
import com.proyectApp.robosApp.repository.DenunciaRepository;
import com.proyectApp.robosApp.repository.PosteoRepository;
import com.proyectApp.robosApp.repository.UsuarioRepository;
import com.proyectApp.robosApp.repository.VotosPorUsuario;

// Calcula la reputación de los usuarios a partir de cómo recibieron los vecinos sus reportes.
//
// Puntos = confirmaciones recibidas − negaciones recibidas
//          − 5 por cada reporte que la moderación eliminó − 3 por cada advertencia
//
// Nivel:
//   DUDOSO     si los puntos son negativos
//   NUEVO      si la cuenta tiene menos de 7 días o menos de 3 reportes vigentes
//   CONFIABLE  si suma 10 puntos o más
//   NORMAL     en cualquier otro caso
//
// Los valores se pueden ajustar en application.yaml (robosapp.reputacion).
@Service
public class ReputacionService {

	private static final int PENALIDAD_POR_REPORTE_ELIMINADO = 5;
	private static final int PENALIDAD_POR_ADVERTENCIA = 3;

	private final UsuarioRepository usuarioRepository;
	private final PosteoRepository posteoRepository;
	private final ConfirmacionRepository confirmacionRepository;
	private final DenunciaRepository denunciaRepository;
	private final int diasDeCuentaNueva;
	private final int reportesMinimos;
	private final int puntosParaConfiable;

	public ReputacionService(UsuarioRepository usuarioRepository, PosteoRepository posteoRepository,
			ConfirmacionRepository confirmacionRepository, DenunciaRepository denunciaRepository,
			@Value("${robosapp.reputacion.dias-de-cuenta-nueva:7}") int diasDeCuentaNueva,
			@Value("${robosapp.reputacion.reportes-minimos:3}") int reportesMinimos,
			@Value("${robosapp.reputacion.puntos-para-confiable:10}") int puntosParaConfiable) {
		this.usuarioRepository = usuarioRepository;
		this.posteoRepository = posteoRepository;
		this.confirmacionRepository = confirmacionRepository;
		this.denunciaRepository = denunciaRepository;
		this.diasDeCuentaNueva = diasDeCuentaNueva;
		this.reportesMinimos = reportesMinimos;
		this.puntosParaConfiable = puntosParaConfiable;
	}

	public record Reputacion(NivelDeConfianza nivel, int puntos) {

		// Lo que se muestra en el feed: a un usuario DUDOSO no se lo señala en público
		public NivelDeConfianza nivelPublico() {
			return nivel == NivelDeConfianza.DUDOSO ? NivelDeConfianza.NORMAL : nivel;
		}

	}

	// Reputación de varios usuarios a la vez, con tres consultas en total (no tres por usuario)
	@Transactional(readOnly = true)
	public Map<Long, Reputacion> deUsuarios(Collection<Long> usuarioIds) {
		Map<Long, Reputacion> resultado = new HashMap<>();
		if (usuarioIds.isEmpty()) {
			return resultado;
		}

		Map<Long, Long> reportes = aMapa(posteoRepository.contarReportesPorUsuario(usuarioIds, EstadoPosteo.ELIMINADO));
		Map<Long, Long> eliminados = aMapa(
				denunciaRepository.contarReportesEliminadosPorUsuario(usuarioIds, ResolucionDenuncia.ELIMINADO));
		Map<Long, Long> votosAFavor = new HashMap<>();
		Map<Long, Long> votosEnContra = new HashMap<>();
		for (VotosPorUsuario votos : confirmacionRepository.votosRecibidosPorUsuario(usuarioIds,
				EstadoPosteo.ELIMINADO)) {
			(votos.tipo() == TipoConfirmacion.CONFIRMA ? votosAFavor : votosEnContra)
					.put(votos.usuarioId(), votos.cantidad());
		}

		LocalDateTime ahora = LocalDateTime.now();
		for (Usuario usuario : usuarioRepository.findAllById(usuarioIds)) {
			Long id = usuario.getId();
			int puntos = (int) (votosAFavor.getOrDefault(id, 0L) - votosEnContra.getOrDefault(id, 0L)
					- PENALIDAD_POR_REPORTE_ELIMINADO * eliminados.getOrDefault(id, 0L)
					- (long) PENALIDAD_POR_ADVERTENCIA * usuario.getAdvertencias());
			long diasDeAntiguedad = Duration.between(usuario.getFechaRegistro(), ahora).toDays();
			resultado.put(id, new Reputacion(nivel(puntos, diasDeAntiguedad, reportes.getOrDefault(id, 0L)), puntos));
		}
		return resultado;
	}

	private NivelDeConfianza nivel(int puntos, long diasDeAntiguedad, long reportesVigentes) {
		if (puntos < 0) {
			return NivelDeConfianza.DUDOSO;
		}
		if (diasDeAntiguedad < diasDeCuentaNueva || reportesVigentes < reportesMinimos) {
			return NivelDeConfianza.NUEVO;
		}
		return puntos >= puntosParaConfiable ? NivelDeConfianza.CONFIABLE : NivelDeConfianza.NORMAL;
	}

	private static Map<Long, Long> aMapa(Iterable<ConteoPorUsuario> conteos) {
		Map<Long, Long> mapa = new HashMap<>();
		conteos.forEach(conteo -> mapa.put(conteo.usuarioId(), conteo.cantidad()));
		return mapa;
	}

}
