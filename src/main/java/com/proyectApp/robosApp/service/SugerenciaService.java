package com.proyectApp.robosApp.service;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.proyectApp.robosApp.dto.PaginaResponse;
import com.proyectApp.robosApp.dto.SugerenciaResponse;
import com.proyectApp.robosApp.entity.EstadoSugerencia;
import com.proyectApp.robosApp.entity.Sugerencia;
import com.proyectApp.robosApp.exception.RecursoNoEncontradoException;
import com.proyectApp.robosApp.repository.SugerenciaRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SugerenciaService {

	private final SugerenciaRepository sugerenciaRepository;
	private final UsuarioActualService usuarioActualService;

	@Transactional
	public SugerenciaResponse crear(String texto) {
		Sugerencia sugerencia = new Sugerencia();
		sugerencia.setUsuario(usuarioActualService.obtener());
		sugerencia.setTexto(texto.trim());
		return SugerenciaResponse.desde(sugerenciaRepository.save(sugerencia));
	}

	// Las del propio usuario, para que pueda ver si le respondieron
	@Transactional(readOnly = true)
	public PaginaResponse<SugerenciaResponse> mias(int pagina, int tamanio) {
		return PaginaResponse.desde(sugerenciaRepository
				.findByUsuarioId(usuarioActualService.obtener().getId(),
						Paginacion.masRecientesPrimero(pagina, tamanio, "fecha"))
				.map(SugerenciaResponse::desde));
	}

	// Panel admin: estado es opcional
	@Transactional(readOnly = true)
	public PaginaResponse<SugerenciaResponse> listar(EstadoSugerencia estado, int pagina, int tamanio) {
		return PaginaResponse.desde(sugerenciaRepository
				.buscar(estado, Paginacion.masRecientesPrimero(pagina, tamanio, "fecha"))
				.map(SugerenciaResponse::desde));
	}

	// Responder de nuevo reemplaza la respuesta anterior
	@Transactional
	public SugerenciaResponse responder(Long id, String respuesta) {
		Sugerencia sugerencia = sugerenciaRepository.findById(id)
				.orElseThrow(() -> new RecursoNoEncontradoException("La sugerencia no existe"));
		sugerencia.setRespuesta(respuesta.trim());
		sugerencia.setEstado(EstadoSugerencia.RESPONDIDA);
		sugerencia.setFechaRespuesta(LocalDateTime.now());
		return SugerenciaResponse.desde(sugerencia);
	}

}
