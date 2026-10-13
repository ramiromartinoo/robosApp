package com.proyectApp.robosApp.dto;

// Un punto del mapa de calor: coordenada aproximada y cuántos reportes cayeron ahí
public record PuntoHeatmapResponse(Double latitud, Double longitud, long peso) {
}
