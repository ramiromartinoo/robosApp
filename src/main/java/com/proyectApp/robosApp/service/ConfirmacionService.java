package com.proyectApp.robosApp.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.proyectApp.robosApp.dto.ConfirmacionesResponse;
import com.proyectApp.robosApp.entity.Confirmacion;
import com.proyectApp.robosApp.entity.EstadoPosteo;
import com.proyectApp.robosApp.entity.Posteo;
import com.proyectApp.robosApp.entity.TipoConfirmacion;
import com.proyectApp.robosApp.entity.Usuario;
import com.proyectApp.robosApp.exception.ConflictoException;
import com.proyectApp.robosApp.exception.RecursoNoEncontradoException;
import com.proyectApp.robosApp.repository.ConfirmacionRepository;
import com.proyectApp.robosApp.repository.ConteoConfirmaciones;
import com.proyectApp.robosApp.repository.PosteoRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ConfirmacionService {

	private final ConfirmacionRepository confirmacionRepository;
	private final PosteoRepository posteoRepository;
	private final UsuarioActualService usuarioActualService;

	// Un voto por usuario y por posteo: votar de nuevo cambia el voto, no suma otro
	@Transactional
	public ConfirmacionesResponse votar(Long posteoId, TipoConfirmacion tipo) {
		Posteo posteo = buscarVisible(posteoId);
		Usuario usuario = usuarioActualService.obtener();
		if (posteo.getUsuario().getId().equals(usuario.getId())) {
			throw new ConflictoException("No podés confirmar ni negar tu propio posteo");
		}

		Confirmacion confirmacion = confirmacionRepository.findByPosteoIdAndUsuarioId(posteoId, usuario.getId())
				.orElseGet(() -> {
					Confirmacion nueva = new Confirmacion();
					nueva.setPosteo(posteo);
					nueva.setUsuario(usuario);
					return nueva;
				});
		confirmacion.setTipo(tipo);
		confirmacion.setFecha(LocalDateTime.now());
		confirmacionRepository.saveAndFlush(confirmacion);
		return conteos(posteoId, tipo);
	}

	// Anula el voto propio (por ejemplo, si se tocó sin querer). Si no había voto, no hace nada.
	@Transactional
	public ConfirmacionesResponse quitarVoto(Long posteoId) {
		buscarVisible(posteoId);
		confirmacionRepository.findByPosteoIdAndUsuarioId(posteoId, usuarioActualService.obtener().getId())
				.ifPresent(confirmacion -> {
					confirmacionRepository.delete(confirmacion);
					confirmacionRepository.flush();
				});
		return conteos(posteoId, null);
	}

	// solo se votan posteos visibles en el feed
	private Posteo buscarVisible(Long posteoId) {
		return posteoRepository.findById(posteoId)
				.filter(p -> p.getEstado() == EstadoPosteo.ACTIVO)
				.orElseThrow(() -> new RecursoNoEncontradoException("El posteo no existe"));
	}

	private ConfirmacionesResponse conteos(Long posteoId, TipoConfirmacion miVoto) {
		long confirmaciones = 0;
		long negaciones = 0;
		for (ConteoConfirmaciones conteo : confirmacionRepository.contarPorPosteo(List.of(posteoId))) {
			if (conteo.tipo() == TipoConfirmacion.CONFIRMA) {
				confirmaciones = conteo.cantidad();
			} else {
				negaciones = conteo.cantidad();
			}
		}
		return new ConfirmacionesResponse(posteoId, confirmaciones, negaciones, miVoto);
	}

}
