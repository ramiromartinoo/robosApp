package com.proyectApp.robosApp.dto;

import java.time.LocalDateTime;

import com.proyectApp.robosApp.entity.Denuncia;
import com.proyectApp.robosApp.entity.EstadoDenuncia;
import com.proyectApp.robosApp.entity.MotivoDenuncia;

public record DenunciaResponse(
		Long id,
		Long posteoId,
		MotivoDenuncia motivo,
		String comentario,
		EstadoDenuncia estado,
		LocalDateTime fechaDenuncia) {

	public static DenunciaResponse desde(Denuncia denuncia) {
		return new DenunciaResponse(
				denuncia.getId(),
				denuncia.getPosteo().getId(),
				denuncia.getMotivo(),
				denuncia.getComentario(),
				denuncia.getEstado(),
				denuncia.getFechaDenuncia());
	}

}
