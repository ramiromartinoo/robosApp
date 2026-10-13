package com.proyectApp.robosApp.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.proyectApp.robosApp.dto.DenunciaResponse;
import com.proyectApp.robosApp.dto.DenunciarRequest;
import com.proyectApp.robosApp.entity.Denuncia;
import com.proyectApp.robosApp.entity.EstadoDenuncia;
import com.proyectApp.robosApp.entity.EstadoPosteo;
import com.proyectApp.robosApp.entity.Posteo;
import com.proyectApp.robosApp.entity.Usuario;
import com.proyectApp.robosApp.exception.ConflictoException;
import com.proyectApp.robosApp.exception.RecursoNoEncontradoException;
import com.proyectApp.robosApp.repository.DenunciaRepository;
import com.proyectApp.robosApp.repository.PosteoRepository;

@Service
public class DenunciaService {

	private final DenunciaRepository denunciaRepository;
	private final PosteoRepository posteoRepository;
	private final UsuarioActualService usuarioActualService;
	private final int umbralAutoOcultamiento;

	public DenunciaService(DenunciaRepository denunciaRepository, PosteoRepository posteoRepository,
			UsuarioActualService usuarioActualService,
			@Value("${robosapp.denuncias.umbral-auto-ocultamiento:5}") int umbralAutoOcultamiento) {
		this.denunciaRepository = denunciaRepository;
		this.posteoRepository = posteoRepository;
		this.usuarioActualService = usuarioActualService;
		this.umbralAutoOcultamiento = umbralAutoOcultamiento;
	}

	@Transactional
	public DenunciaResponse denunciar(Long posteoId, DenunciarRequest request) {
		Posteo posteo = posteoRepository.findById(posteoId)
				.filter(p -> p.getEstado() != EstadoPosteo.ELIMINADO)
				.orElseThrow(() -> new RecursoNoEncontradoException("El posteo no existe"));

		Usuario denunciante = usuarioActualService.obtener();
		if (posteo.getUsuario().getId().equals(denunciante.getId())) {
			throw new ConflictoException("No podés denunciar tu propio posteo");
		}
		if (denunciaRepository.existsByPosteoIdAndUsuarioDenuncianteId(posteoId, denunciante.getId())) {
			throw new ConflictoException("Ya denunciaste este posteo");
		}

		Denuncia denuncia = new Denuncia();
		denuncia.setPosteo(posteo);
		denuncia.setUsuarioDenunciante(denunciante);
		denuncia.setMotivo(request.motivo());
		denuncia.setComentario(comentarioLimpio(request.comentario()));
		denunciaRepository.save(denuncia);

		ocultarSiSuperaElUmbral(posteo);
		return DenunciaResponse.desde(denuncia);
	}

	// Auto-ocultamiento: con N denuncias pendientes el posteo sale del feed hasta que un admin lo revise
	private void ocultarSiSuperaElUmbral(Posteo posteo) {
		if (posteo.getEstado() != EstadoPosteo.ACTIVO) {
			return;
		}
		long pendientes = denunciaRepository.countByPosteoIdAndEstado(posteo.getId(), EstadoDenuncia.PENDIENTE);
		if (pendientes >= umbralAutoOcultamiento) {
			posteo.setEstado(EstadoPosteo.EN_REVISION);
		}
	}

	private String comentarioLimpio(String comentario) {
		return comentario == null || comentario.isBlank() ? null : comentario.trim();
	}

}
