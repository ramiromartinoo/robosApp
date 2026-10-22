package com.proyectApp.robosApp.repository;

import com.proyectApp.robosApp.entity.TipoConfirmacion;

// Cuántos votos de cada tipo recibieron los reportes de un usuario (ver ReputacionService)
public record VotosPorUsuario(Long usuarioId, TipoConfirmacion tipo, long cantidad) {
}
