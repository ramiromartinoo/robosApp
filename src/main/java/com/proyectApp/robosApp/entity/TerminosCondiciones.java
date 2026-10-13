package com.proyectApp.robosApp.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// Cada fila es una versión publicada. La vigente es la de fecha de publicación más reciente.
@Entity
@Table(name = "terminos_condiciones")
@Getter
@Setter
@NoArgsConstructor
public class TerminosCondiciones {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, unique = true, length = 30)
	private String version;

	@Column(nullable = false, columnDefinition = "MEDIUMTEXT")
	private String texto;

	@CreationTimestamp
	@Column(name = "fecha_publicacion", nullable = false, updatable = false)
	private LocalDateTime fechaPublicacion;

}
