package com.proyectApp.robosApp.repository;

import com.proyectApp.robosApp.entity.TipoConfirmacion;

// Resultado de ConfirmacionRepository.contarPorPosteo
public record ConteoConfirmaciones(Long posteoId, TipoConfirmacion tipo, long cantidad) {
}
