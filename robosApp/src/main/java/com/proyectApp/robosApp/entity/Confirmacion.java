package com.proyectApp.robosApp.entity;

import java.time.LocalDateTime;

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
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// Voto de un usuario sobre un posteo ajeno: confirma o niega que el hecho ocurrió
@Entity
@Table(name = "confirmaciones",
		// un usuario, un voto por posteo (puede cambiarlo, pero no sumar otro)
		uniqueConstraints = @UniqueConstraint(name = "uk_confirmaciones_posteo_usuario",
				columnNames = { "posteo_id", "usuario_id" }))
@Getter
@Setter
@NoArgsConstructor
public class Confirmacion {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "posteo_id", nullable = false)
	private Posteo posteo;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "usuario_id", nullable = false)
	private Usuario usuario;

	@Enumerated(EnumType.STRING)
	@JdbcTypeCode(SqlTypes.VARCHAR)
	@Column(nullable = false, length = 20)
	private TipoConfirmacion tipo;

	// fecha del último voto (se actualiza si el usuario lo cambia)
	@Column(nullable = false)
	private LocalDateTime fecha;

}
