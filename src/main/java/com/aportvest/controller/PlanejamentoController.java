package com.aportvest.controller;

import com.aportvest.dto.CategoriaPlanejamentoDTO;
import com.aportvest.dto.ItemPlanejamentoDTO;
import com.aportvest.dto.PlanejamentoResponseDTO;
import com.aportvest.dto.RendasDTO;
import com.aportvest.model.HistoricoMensal;
import com.aportvest.service.PlanejamentoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/planejamento")
@RequiredArgsConstructor
public class PlanejamentoController {

    private final PlanejamentoService planejamentoService;

    @GetMapping
    public ResponseEntity<PlanejamentoResponseDTO> obterPlanejamento(@RequestParam Long usuarioId) {
        return ResponseEntity.ok(planejamentoService.obterPlanejamento(usuarioId));
    }

    @PutMapping("/rendas")
    public ResponseEntity<RendasDTO> atualizarRendas(
            @RequestParam Long usuarioId,
            @RequestBody RendasDTO dto) {
        return ResponseEntity.ok(planejamentoService.atualizarRendas(usuarioId, dto));
    }

    @PostMapping("/zerar-extra")
    public ResponseEntity<RendasDTO> zerarRendaExtra(@RequestParam Long usuarioId) {
        return ResponseEntity.ok(planejamentoService.zerarRendaExtra(usuarioId));
    }

    @PostMapping("/categorias")
    public ResponseEntity<CategoriaPlanejamentoDTO> salvarCategoria(
            @RequestParam Long usuarioId,
            @RequestBody CategoriaPlanejamentoDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(planejamentoService.salvarCategoria(usuarioId, dto));
    }

    @DeleteMapping("/categorias/{id}")
    public ResponseEntity<Void> excluirCategoria(
            @PathVariable Long id,
            @RequestParam Long usuarioId) {
        planejamentoService.excluirCategoria(usuarioId, id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/itens")
    public ResponseEntity<ItemPlanejamentoDTO> salvarItem(
            @RequestParam Long usuarioId,
            @RequestBody ItemPlanejamentoDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(planejamentoService.salvarItem(usuarioId, dto));
    }

    @PatchMapping("/itens/{id}/status")
    public ResponseEntity<ItemPlanejamentoDTO> alternarStatusItem(
            @PathVariable Long id,
            @RequestParam Long usuarioId) {
        return ResponseEntity.ok(planejamentoService.alternarStatusItem(usuarioId, id));
    }

    @DeleteMapping("/itens/{id}")
    public ResponseEntity<Void> excluirItem(
            @PathVariable Long id,
            @RequestParam Long usuarioId) {
        planejamentoService.excluirItem(usuarioId, id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/historico")
    public ResponseEntity<List<HistoricoMensal>> listarHistoricos(@RequestParam Long usuarioId) {
        return ResponseEntity.ok(planejamentoService.listarHistoricos(usuarioId));
    }

    @PostMapping("/fechar-mes")
    public ResponseEntity<HistoricoMensal> fecharMes(
            @RequestParam Long usuarioId,
            @RequestParam String mesAno,
            @RequestParam String nomeMes) {
        return ResponseEntity.status(HttpStatus.CREATED).body(planejamentoService.fecharMes(usuarioId, mesAno, nomeMes));
    }

    @DeleteMapping("/historico/{id}")
    public ResponseEntity<Void> excluirHistorico(
            @PathVariable Long id,
            @RequestParam Long usuarioId) {
        planejamentoService.excluirHistorico(usuarioId, id);
        return ResponseEntity.noContent().build();
    }
}
