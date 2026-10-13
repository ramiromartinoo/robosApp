package com.proyectApp.robosApp.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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

// Constancia de que un usuario aceptó una versión puntual de los términos
@Entity
@Table(name = "aceptacion_terminos",
		uniqueConstraints = @UniqueConstraint(name = "uk_aceptacion_usuario_terminos",
				columnNames = { "usuario_id", "terminos_id" }))
@Getter
@Setter
@NoArgsConstructor
public class AceptacionTerminos {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "usuario_id", nullable = false)
	private Usuario usuario;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "terminos_id", nullable = false)
	private TerminosCondiciones terminos;

	@CreationTimestamp
	@Column(name = "fecha_aceptacion", nullable = false, updatable = false)
	private LocalDateTime fechaAceptacion;

	// 45 caracteres alcanza para una dirección IPv6
	@Column(name = "ip_address", length = 45)
	private String ipAddress;

}
