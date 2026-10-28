package com.proyectApp.robosApp.service;

import java.util.Collection;
import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.proyectApp.robosApp.entity.EstadoPosteo;
import com.proyectApp.robosApp.entity.ResolucionDenuncia;
import com.proyectApp.robosApp.entity.Usuario;
import com.proyectApp.robosApp.repository.ConteoPorUsuario;
import com.proyectApp.robosApp.repository.DenunciaRepository;
import com.proyectApp.robosApp.repository.PosteoRepository;
import com.proyectApp.robosApp.repository.UsuarioRepository;

import lombok.RequiredArgsConstructor;

// Antecedentes de cada usuario para el panel admin: cuántos reportes tiene publicados, cuántos le
// eliminó la moderación por denuncias y cuántas advertencias recibió. Sirven para decidir si
// suspender o eliminar una cuenta que publica cosas que no son robos. No se muestran en el feed.
@Service
@RequiredArgsConstructor
public class AntecedentesService {

	private final UsuarioRepository usuarioRepository;
	private final PosteoRepository posteoRepository;
	private final DenunciaRepository denunciaRepository;

	public record Antecedentes(long reportesVigentes, long reportesEliminados, int advertencias) {
	}

	// Antecedentes de varios usuarios a la vez, con tres consultas en total (no tres por usuario)
	@Transactional(readOnly = true)
	public Map<Long, Antecedentes> deUsuarios(Collection<Long> usuarioIds) {
		Map<Long, Antecedentes> resultado = new HashMap<>();
		if (usuarioIds.isEmpty()) {
			return resultado;
		}

		Map<Long, Long> vigentes = aMapa(posteoRepository.contarReportesPorUsuario(usuarioIds, EstadoPosteo.ELIMINADO));
		Map<Long, Long> eliminados = aMapa(
				denunciaRepository.contarReportesEliminadosPorUsuario(usuarioIds, ResolucionDenuncia.ELIMINADO));
		for (Usuario usuario : usuarioRepository.findAllById(usuarioIds)) {
			Long id = usuario.getId();
			resultado.put(id, new Antecedentes(vigentes.getOrDefault(id, 0L), eliminados.getOrDefault(id, 0L),
					usuario.getAdvertencias()));
		}
		return resultado;
	}

	private static Map<Long, Long> aMapa(Iterable<ConteoPorUsuario> conteos) {
		Map<Long, Long> mapa = new HashMap<>();
		conteos.forEach(conteo -> mapa.put(conteo.usuarioId(), conteo.cantidad()));
		return mapa;
	}

}
