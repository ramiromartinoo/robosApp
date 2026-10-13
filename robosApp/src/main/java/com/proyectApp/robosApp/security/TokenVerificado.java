package com.proyectApp.robosApp.security;

// Datos que se obtienen de un token válido
public record TokenVerificado(String uid, String email, String nombre) {
}
