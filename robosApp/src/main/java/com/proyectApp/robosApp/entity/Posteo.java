package com.proyectApp.robosApp.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "posteos", indexes = {
		// el feed y el heatmap filtran por estado y ordenan por la hora real del hecho
		@Index(name = "idx_posteos_estado_incidente", columnList = "estado, fecha_hora_incidente"),
		@Index(name = "idx_posteos_lat_lng", columnList = "latitud, longitud")
})
@Getter
@Setter
@NoArgsConstructor
public class Posteo {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "usuario_id", nullable = false)
	private Usuario usuario;

	@Column(nullable = false, length = 280)
	private String descripcion;

	// VARCHAR en vez de ENUM nativo de MySQL: permite agregar categorías sin alterar la tabla
	@Enumerated(EnumType.STRING)
	@JdbcTypeCode(SqlTypes.VARCHAR)
	@Column(nullable = false, length = 20)
	private Categoria categoria;

	// Ubicación exacta: uso interno, nunca se expone tal cual en la API
	@Column(nullable = false)
	private Double latitud;

	@Column(nullable = false)
	private Double longitud;

	// Referencia aproximada en texto para mostrar en el feed (ej. "Av. Colón al 2300"). Puede faltar.
	@Column(length = 80)
	private String zona;

	// Cuándo ocurrió el hecho (lo carga el usuario)
	@Column(name = "fecha_hora_incidente", nullable = false)
	private LocalDateTime fechaHoraIncidente;

	// Cuándo se publicó (automática)
	@CreationTimestamp
	@Column(name = "fecha_hora_publicacion", nullable = false, updatable = false)
	private LocalDateTime fechaHoraPublicacion;

	@Enumerated(EnumType.STRING)
	@JdbcTypeCode(SqlTypes.VARCHAR)
	@Column(nullable = false, length = 20)
	private EstadoPosteo estado = EstadoPosteo.ACTIVO;

}
