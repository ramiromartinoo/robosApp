package com.proyectApp.robosApp.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.proyectApp.robosApp.dto.ConteoCategoriaResponse;
import com.proyectApp.robosApp.dto.EstadisticasResponse;
import com.proyectApp.robosApp.entity.EstadoPosteo;
import com.proyectApp.robosApp.repository.PosteoRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EstadisticasService {

	private static final int DIAS_MAXIMOS = 365;
	private static final int ZONAS_A_MOSTRAR = 20;

	private final PosteoRepository posteoRepository;

	@Transactional(readOnly = true)
	public EstadisticasResponse resumen(int dias) {
		LocalDateTime desde = LocalDateTime.now().minusDays(Math.clamp(dias, 1, DIAS_MAXIMOS));
		List<ConteoCategoriaResponse> porCategoria = posteoRepository
				.contarPorCategoria(EstadoPosteo.ELIMINADO, desde);
		long total = porCategoria.stream().mapToLong(ConteoCategoriaResponse::cantidad).sum();
		return new EstadisticasResponse(desde, total, porCategoria,
				posteoRepository.contarPorZona(EstadoPosteo.ELIMINADO, desde, PageRequest.of(0, ZONAS_A_MOSTRAR)));
	}

}
