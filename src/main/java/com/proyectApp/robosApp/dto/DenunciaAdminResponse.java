package com.proyectApp.robosApp.dto;

import java.time.LocalDateTime;

import com.proyectApp.robosApp.entity.Denuncia;
import com.proyectApp.robosApp.entity.MotivoDenuncia;

public record DenunciaAdminResponse(
		Long id,
		MotivoDenuncia motivo,
		String comentario,
		LocalDateTime fechaDenuncia,
		Long denuncianteId) {

	public static DenunciaAdminResponse desde(Denuncia denuncia) {
		return new DenunciaAdminResponse(
				denuncia.getId(),
				denuncia.getMotivo(),
				denuncia.getComentario(),
				denuncia.getFechaDenuncia(),
				denuncia.getUsuarioDenunciante().getId());
	}

}
