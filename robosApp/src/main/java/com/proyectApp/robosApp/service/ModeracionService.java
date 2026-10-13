package com.proyectApp.robosApp.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.proyectApp.robosApp.dto.AdminPosteoResponse;
import com.proyectApp.robosApp.dto.DenunciaAdminResponse;
import com.proyectApp.robosApp.dto.DenunciasDePosteoResponse;
import com.proyectApp.robosApp.dto.PaginaResponse;
import com.proyectApp.robosApp.dto.ResolucionResponse;
import com.proyectApp.robosApp.entity.Denuncia;
import com.proyectApp.robosApp.entity.EstadoDenuncia;
import com.proyectApp.robosApp.entity.EstadoPosteo;
import com.proyectApp.robosApp.entity.Posteo;
import com.proyectApp.robosApp.entity.ResolucionDenuncia;
import com.proyectApp.robosApp.entity.Usuario;
import com.proyectApp.robosApp.exception.ConflictoException;
import com.proyectApp.robosApp.exception.RecursoNoEncontradoException;
import com.proyectApp.robosApp.repository.DenunciaRepository;
import com.proyectApp.robosApp.repository.PosteoRepository;

import lombok.RequiredArgsConstructor;

// Acciones del panel admin sobre posteos y denuncias
@Service
@RequiredArgsConstructor
public class ModeracionService {

	private final PosteoRepository posteoRepository;
	private final DenunciaRepository denunciaRepository;
	private final UsuarioActualService usuarioActualService;

	// usuarioId y estado son filtros opcionales
	@Transactional(readOnly = true)
	public PaginaResponse<AdminPosteoResponse> listarPosteos(Long usuarioId, EstadoPosteo estado,
			int pagina, int tamanio) {
		return PaginaResponse.desde(posteoRepository
				.buscarParaAdmin(usuarioId, estado,
						Paginacion.masRecientesPrimero(pagina, tamanio, "fechaHoraPublicacion"))
				.map(AdminPosteoResponse::desde));
	}

	// Eliminar un posteo también cierra sus denuncias pendientes, para que no queden en la cola
	@Transactional
	public void eliminarPosteo(Long posteoId) {
		Posteo posteo = buscarPosteo(posteoId);
		cerrarDenuncias(denunciaRepository.findByPosteoIdAndEstado(posteoId, EstadoDenuncia.PENDIENTE),
				ResolucionDenuncia.ELIMINADO);
		posteo.setEstado(EstadoPosteo.ELIMINADO);
	}

	// Posteos con denuncias pendientes, primero los más denunciados
	@Transactional(readOnly = true)
	public PaginaResponse<DenunciasDePosteoResponse> denunciasPendientes(int pagina, int tamanio) {
		Pageable pageable = Paginacion.de(pagina, tamanio, Sort.unsorted());
		Page<Long> posteoIds = denunciaRepository.posteosMasDenunciados(EstadoDenuncia.PENDIENTE, pageable);
		if (posteoIds.isEmpty()) {
			return PaginaResponse.desde(new PageImpl<>(List.of(), pageable, posteoIds.getTotalElements()));
		}

		// LinkedHashMap con los ids ya cargados: conserva el orden "más denunciados primero"
		Map<Long, List<Denuncia>> porPosteo = new LinkedHashMap<>();
		posteoIds.forEach(id -> porPosteo.put(id, new ArrayList<>()));
		denunciaRepository.buscarConPosteo(EstadoDenuncia.PENDIENTE, posteoIds.getContent())
				.forEach(denuncia -> porPosteo.get(denuncia.getPosteo().getId()).add(denuncia));

		List<DenunciasDePosteoResponse> contenido = porPosteo.values().stream()
				.map(denuncias -> new DenunciasDePosteoResponse(
						AdminPosteoResponse.desde(denuncias.get(0).getPosteo()),
						denuncias.size(),
						denuncias.stream().map(DenunciaAdminResponse::desde).toList()))
				.toList();
		return PaginaResponse.desde(new PageImpl<>(contenido, pageable, posteoIds.getTotalElements()));
	}

	// Resuelve de una vez todas las denuncias pendientes de un posteo:
	// ELIMINADO   -> se elimina el posteo
	// ADVERTENCIA -> el posteo queda visible y al autor se le suma una advertencia
	// DESCARTADA  -> el posteo queda visible, sin consecuencias
	@Transactional
	public ResolucionResponse resolverDenuncias(Long posteoId, ResolucionDenuncia resolucion) {
		Posteo posteo = buscarPosteo(posteoId);
		List<Denuncia> pendientes = denunciaRepository.findByPosteoIdAndEstado(posteoId, EstadoDenuncia.PENDIENTE);
		if (pendientes.isEmpty()) {
			throw new ConflictoException("Ese posteo no tiene denuncias pendientes");
		}
		cerrarDenuncias(pendientes, resolucion);

		if (resolucion == ResolucionDenuncia.ELIMINADO) {
			posteo.setEstado(EstadoPosteo.ELIMINADO);
		} else {
			if (resolucion == ResolucionDenuncia.ADVERTENCIA) {
				Usuario autor = posteo.getUsuario();
				autor.setAdvertencias(autor.getAdvertencias() + 1);
			}
			// si estaba oculto por acumulación de denuncias, vuelve al feed
			if (posteo.getEstado() == EstadoPosteo.EN_REVISION) {
				posteo.setEstado(EstadoPosteo.ACTIVO);
			}
		}
		return new ResolucionResponse(posteoId, resolucion, pendientes.size(), posteo.getEstado());
	}

	private void cerrarDenuncias(List<Denuncia> denuncias, ResolucionDenuncia resolucion) {
		Usuario admin = usuarioActualService.obtener();
		LocalDateTime ahora = LocalDateTime.now();
		for (Denuncia denuncia : denuncias) {
			denuncia.setEstado(EstadoDenuncia.RESUELTA);
			denuncia.setResolucion(resolucion);
			denuncia.setFechaResolucion(ahora);
			denuncia.setAdminResolvio(admin);
		}
	}

	private Posteo buscarPosteo(Long posteoId) {
		return posteoRepository.findById(posteoId)
				.orElseThrow(() -> new RecursoNoEncontradoException("El posteo no existe"));
	}

}
