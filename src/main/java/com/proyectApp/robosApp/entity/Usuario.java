package com.proyectApp.robosApp.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "usuarios")
@Getter
@Setter
@NoArgsConstructor
public class Usuario {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	// UID que devuelve Firebase Authentication al loguearse con Google
	@Column(name = "firebase_uid", nullable = false, unique = true, length = 128)
	private String firebaseUid;

	@Column(nullable = false, unique = true)
	private String email;

	@Column(name = "nombre_visible", nullable = false, length = 50)
	private String nombreVisible;

	// VARCHAR en vez de ENUM nativo de MySQL: permite agregar valores sin alterar la tabla
	@Enumerated(EnumType.STRING)
	@JdbcTypeCode(SqlTypes.VARCHAR)
	@Column(nullable = false, length = 20)
	private Rol rol = Rol.CLIENTE;

	@Enumerated(EnumType.STRING)
	@JdbcTypeCode(SqlTypes.VARCHAR)
	@Column(nullable = false, length = 20)
	private EstadoUsuario estado = EstadoUsuario.ACTIVO;

	// cuántas veces un admin lo advirtió al resolver denuncias
	@Column(nullable = false, columnDefinition = "int not null default 0")
	private int advertencias;

	@CreationTimestamp
	@Column(name = "fecha_registro", nullable = false, updatable = false)
	private LocalDateTime fechaRegistro;

}
