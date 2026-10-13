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
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "denuncias",
		// un usuario puede denunciar un mismo posteo una sola vez
		uniqueConstraints = @UniqueConstraint(name = "uk_denuncias_posteo_usuario",
				columnNames = { "posteo_id", "usuario_denunciante_id" }),
		// el listado admin y el auto-ocultamiento cuentan denuncias pendientes por posteo
		indexes = @Index(name = "idx_denuncias_estado_posteo", columnList = "estado, posteo_id"))
@Getter
@Setter
@NoArgsConstructor
public class Denuncia {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "posteo_id", nullable = false)
	private Posteo posteo;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "usuario_denunciante_id", nullable = false)
	private Usuario usuarioDenunciante;

	@Enumerated(EnumType.STRING)
	@JdbcTypeCode(SqlTypes.VARCHAR)
	@Column(nullable = false, length = 20)
	private MotivoDenuncia motivo;

	@Column(length = 280)
	private String comentario;

	@Enumerated(EnumType.STRING)
	@JdbcTypeCode(SqlTypes.VARCHAR)
	@Column(nullable = false, length = 20)
	private EstadoDenuncia estado = EstadoDenuncia.PENDIENTE;

	// null mientras la denuncia está pendiente
	@Enumerated(EnumType.STRING)
	@JdbcTypeCode(SqlTypes.VARCHAR)
	@Column(length = 20)
	private ResolucionDenuncia resolucion;

	@CreationTimestamp
	@Column(name = "fecha_denuncia", nullable = false, updatable = false)
	private LocalDateTime fechaDenuncia;

	@Column(name = "fecha_resolucion")
	private LocalDateTime fechaResolucion;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "admin_resolvio_id")
	private Usuario adminResolvio;

}
