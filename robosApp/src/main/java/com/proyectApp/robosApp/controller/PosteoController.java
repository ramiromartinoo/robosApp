package com.proyectApp.robosApp.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.proyectApp.robosApp.dto.ConfirmacionesResponse;
import com.proyectApp.robosApp.dto.ConfirmarRequest;
import com.proyectApp.robosApp.dto.CrearPosteoRequest;
import com.proyectApp.robosApp.dto.DenunciaResponse;
import com.proyectApp.robosApp.dto.DenunciarRequest;
import com.proyectApp.robosApp.dto.EditarPosteoRequest;
import com.proyectApp.robosApp.dto.MiPosteoResponse;
import com.proyectApp.robosApp.dto.PaginaResponse;
import com.proyectApp.robosApp.dto.PosteoResponse;
import com.proyectApp.robosApp.dto.PuntoHeatmapResponse;
import com.proyectApp.robosApp.entity.Categoria;
import com.proyectApp.robosApp.service.ConfirmacionService;
import com.proyectApp.robosApp.service.DenunciaService;
import com.proyectApp.robosApp.service.PosteoService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/reportes")
@RequiredArgsConstructor
public class PosteoController {

	private final PosteoService posteoService;
	private final DenunciaService denunciaService;
	private final ConfirmacionService confirmacionService;

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public PosteoResponse crear(@Valid @RequestBody CrearPosteoRequest request) {
		return posteoService.crear(request);
	}

	// Los reportes de quien hace la petición
	@GetMapping("/mios")
	public PaginaResponse<MiPosteoResponse> mios(
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "20") int size) {
		return posteoService.mios(page, size);
	}

	// Solo el autor, y solo durante los primeros minutos. La ubicación no se edita.
	@PutMapping("/{id}")
	public MiPosteoResponse editar(@PathVariable Long id, @Valid @RequestBody EditarPosteoRequest request) {
		return posteoService.editar(id, request);
	}

	// Solo el autor
	@DeleteMapping("/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void eliminar(@PathVariable Long id) {
		posteoService.eliminar(id);
	}

	@PostMapping("/{id}/denunciar")
	@ResponseStatus(HttpStatus.CREATED)
	public DenunciaResponse denunciar(@PathVariable Long id, @Valid @RequestBody DenunciarRequest request) {
		return denunciaService.denunciar(id, request);
	}

	@PostMapping("/{id}/confirmar")
	public ConfirmacionesResponse confirmar(@PathVariable Long id, @Valid @RequestBody ConfirmarRequest request) {
		return confirmacionService.votar(id, request.tipo());
	}

	// Anula el voto propio
	@DeleteMapping("/{id}/confirmar")
	public ConfirmacionesResponse quitarVoto(@PathVariable Long id) {
		return confirmacionService.quitarVoto(id);
	}

	@GetMapping
	public PaginaResponse<PosteoResponse> feed(
			@RequestParam(required = false) Categoria categoria,
			@RequestParam(required = false) Double lat,
			@RequestParam(required = false) Double lng,
			// en kilómetros
			@RequestParam(required = false) Double radio,
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "20") int size) {
		return posteoService.feed(categoria, lat, lng, radio, page, size);
	}

	@GetMapping("/heatmap")
	public List<PuntoHeatmapResponse> heatmap(
			@RequestParam(defaultValue = "30") int dias,
			// alternativa a "dias" para períodos cortos (ej. ?horas=3)
			@RequestParam(required = false) Integer horas,
			@RequestParam(required = false) Categoria categoria) {
		return posteoService.heatmap(dias, horas, categoria);
	}

}
