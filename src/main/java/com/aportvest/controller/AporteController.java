package com.aportvest.controller;

import com.aportvest.model.Aporte;
import com.aportvest.model.enums.TipoInvestimento;
import com.aportvest.service.AporteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/aportes")
@RequiredArgsConstructor
public class AporteController {

    private final AporteService aporteService;

    @GetMapping
    public ResponseEntity<List<Aporte>> listarTodos() {
        return ResponseEntity.ok(aporteService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Aporte> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(aporteService.buscarPorId(id));
    }

    @GetMapping("/tipo/{tipo}")
    public ResponseEntity<List<Aporte>> buscarPorTipo(@PathVariable TipoInvestimento tipo) {
        return ResponseEntity.ok(aporteService.buscarPorTipo(tipo));
    }

    @GetMapping("/corretora/{corretora}")
    public ResponseEntity<List<Aporte>> buscarPorCorretora(@PathVariable String corretora) {
        return ResponseEntity.ok(aporteService.buscarPorCorretora(corretora));
    }

    @GetMapping("/periodo")
    public ResponseEntity<List<Aporte>> buscarPorPeriodo(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim) {
        return ResponseEntity.ok(aporteService.buscarPorPeriodo(inicio, fim));
    }

    @GetMapping("/busca")
    public ResponseEntity<List<Aporte>> buscarPorNome(@RequestParam String nome) {
        return ResponseEntity.ok(aporteService.buscarPorNome(nome));
    }

    @PostMapping
    public ResponseEntity<Aporte> criar(@Valid @RequestBody Aporte aporte) {
        return ResponseEntity.status(HttpStatus.CREATED).body(aporteService.salvar(aporte));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Aporte> atualizar(@PathVariable Long id, @Valid @RequestBody Aporte aporte) {
        return ResponseEntity.ok(aporteService.atualizar(id, aporte));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        aporteService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
