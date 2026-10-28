package com.proyectApp.robosApp.repository;

// Resultado de las consultas que cuentan algo por usuario (ver AntecedentesService)
public record ConteoPorUsuario(Long usuarioId, long cantidad) {
}
